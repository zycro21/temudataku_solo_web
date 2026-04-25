import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { randomBytes } from "crypto";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const generateId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
};

type SectionType =
  | "PROGRAM_INFO"
  | "CHALLENGE"
  | "TARGET"
  | "DIFFERENTIATOR"
  | "BENEFIT"
  | "CLOSING";

const buildSectionContent = (type: SectionType, content: any) => {
  switch (type) {
    case "PROGRAM_INFO":
    case "CLOSING":
      return {
        text: content?.text || "",
      };

    case "CHALLENGE":
    case "TARGET":
    case "BENEFIT":
      return {
        items: Array.isArray(content?.items) ? content.items : [],
      };

    case "DIFFERENTIATOR":
      return {
        items: Array.isArray(content?.items)
          ? content.items.map((i: any) => ({
              title: i.title || "",
              desc: i.desc || "",
            }))
          : [],
      };

    default:
      return {};
  }
};

export class AyclService {
  static async createAycl(data: any) {
    return prisma.$transaction(async (tx) => {
      // ======================
      // 1. VALIDASI SLUG
      // ======================
      const existing = await tx.aYCLBatch.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new Error("Slug sudah digunakan");
      }

      // ======================
      // 🔥 2. HANDLE SINGLE ACTIVE
      // ======================
      if (data.isActive) {
        const activeCount = await tx.aYCLBatch.count({
          where: { isActive: true },
        });

        if (activeCount >= 2) {
          throw new Error("MAX_ACTIVE_BATCH_REACHED");
        }
      }
      // ======================
      // 3. CREATE BATCH
      // ======================
      const batchId = generateId("AYCL");

      const batch = await tx.aYCLBatch.create({
        data: {
          id: batchId,
          title: data.title,
          slug: data.slug,
          whatsappGroupLink: data.whatsappGroupLink,
          price: data.price,
          isActive: data.isActive,

          headline: data.headline,
          subHeadline: data.subHeadline,
          description: data.description,
        },
      });

      // ======================
      // 4. SECTIONS
      // ======================
      if (data.sections?.length) {
        let order = 1;

        for (const s of data.sections) {
          await tx.aYCLSection.create({
            data: {
              id: generateId("SEC"),
              batchId: batch.id,
              type: s.type,
              title: s.title,
              content: buildSectionContent(s.type, s.content),
              order: order++,
            },
          });
        }
      }

      // ======================
      // 5. MATERIALS
      // ======================
      if (data.materials?.length) {
        for (const m of data.materials) {
          await tx.aYCLMaterial.create({
            data: {
              id: generateId("MAT"),
              batchId: batch.id,
              title: m.title,
              description: m.description,
            },
          });
        }
      }

      // ======================
      // 6. SCHEDULES
      // ======================
      if (data.schedules?.length) {
        for (const s of data.schedules) {
          await tx.aYCLSchedule.create({
            data: {
              id: generateId("SCH"),
              batchId: batch.id,
              title: s.title || "",
              date: new Date(s.date),
              startTime: new Date(s.startTime),
              endTime: new Date(s.endTime),
              googleMeetLink: s.googleMeetLink,
              quota: s.quota,
            },
          });
        }
      }

      return batch;
    });
  }

  static async getAllAycl(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 1000;
    const skip = (page - 1) * limit;

    const where: any = {};

    // SEARCH
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // STATUS FILTER
    if (query.status === "active") where.isActive = true;
    if (query.status === "inactive") where.isActive = false;

    const batches = await prisma.aYCLBatch.findMany({
      where,
      include: {
        schedules: true,
      },
      skip,
      take: limit,
      orderBy: {
        [query.sortBy || "createdAt"]: query.sortOrder || "desc",
      },
    });

    // TRANSFORM DATA
    const transformed = batches.map((b) => {
      const sortedSchedules = [...b.schedules].sort(
        (a, c) => new Date(a.date).getTime() - new Date(c.date).getTime(),
      );

      const startDate = sortedSchedules[0]?.date || null;
      const endDate = sortedSchedules[sortedSchedules.length - 1]?.date || null;

      return {
        id: b.id,
        title: b.title,
        description: b.description,
        startDate,
        endDate,
        isActive: b.isActive,
      };
    });

    const total = await prisma.aYCLBatch.count({ where });

    return {
      data: transformed,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async deleteAycl(id: string) {
    return prisma.$transaction(async (tx) => {
      // ======================
      // 1. CEK EXIST
      // ======================
      const batch = await tx.aYCLBatch.findUnique({
        where: { id },
      });

      if (!batch) {
        throw new Error("AYCL tidak ditemukan");
      }

      // ======================
      // 2. CEK BOOKING
      // ======================
      const bookingCount = await tx.aYCLBooking.count({
        where: { batchId: id },
      });

      if (bookingCount > 0) {
        throw new Error(
          "Batch tidak dapat dihapus karena sudah memiliki booking",
        );
      }

      // ======================
      // 3. DELETE (CASCADE AUTO)
      // ======================
      await tx.aYCLBatch.delete({
        where: { id },
      });

      return true;
    });
  }

  static async updateAycl(id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.aYCLBatch.findUnique({
        where: { id },
        include: {
          sections: true,
          materials: true,
          schedules: true,
        },
      });

      if (!existing) throw new Error("AYCL tidak ditemukan");

      // ======================
      // 🔥 VALIDASI MAX 2 ACTIVE (UPDATE)
      // ======================
      if (data.isActive === true && !existing.isActive) {
        const activeCount = await tx.aYCLBatch.count({
          where: {
            isActive: true,
            NOT: { id }, // exclude dirinya sendiri
          },
        });

        if (activeCount >= 2) {
          throw new Error("MAX_ACTIVE_BATCH_REACHED");
        }
      }

      // ======================
      // 🔥 UPDATE BATCH (PARTIAL)
      // ======================
      const { sections, materials, schedules, ...batchData } = data;

      await tx.aYCLBatch.update({
        where: { id },
        data: {
          ...batchData,
        },
      });

      // ======================
      // 🔥 SECTIONS SYNC
      // ======================
      if (data.sections) {
        const incomingIds = data.sections
          .filter((s: any) => s.id)
          .map((s: any) => s.id);

        // delete removed
        await tx.aYCLSection.deleteMany({
          where: {
            batchId: id,
            id: { notIn: incomingIds },
          },
        });

        // upsert
        for (const s of data.sections) {
          if (s.id) {
            await tx.aYCLSection.update({
              where: { id: s.id },
              data: {
                title: s.title,
                type: s.type,
                content: buildSectionContent(s.type, s.content),
                order: s.order,
              },
            });
          } else {
            await tx.aYCLSection.create({
              data: {
                id: generateId("SEC"),
                batchId: id,
                title: s.title,
                type: s.type,
                content: buildSectionContent(s.type, s.content),
                order: s.order,
              },
            });
          }
        }
      }

      // ======================
      // 🔥 MATERIALS SYNC
      // ======================
      if (data.materials) {
        const incomingIds = data.materials
          .filter((m: any) => m.id)
          .map((m: any) => m.id);

        await tx.aYCLMaterial.deleteMany({
          where: {
            batchId: id,
            id: { notIn: incomingIds },
          },
        });

        for (const m of data.materials) {
          if (m.id) {
            await tx.aYCLMaterial.update({
              where: { id: m.id },
              data: {
                title: m.title,
                description: m.description,
              },
            });
          } else {
            await tx.aYCLMaterial.create({
              data: {
                id: generateId("MAT"),
                batchId: id,
                title: m.title,
                description: m.description,
              },
            });
          }
        }
      }

      // ======================
      // 🔥 SCHEDULE SYNC
      // ======================
      if (data.schedules) {
        const incomingIds = data.schedules
          .filter((s: any) => s.id)
          .map((s: any) => s.id);

        await tx.aYCLSchedule.deleteMany({
          where: {
            batchId: id,
            id: { notIn: incomingIds },
          },
        });

        for (const s of data.schedules) {
          if (s.id) {
            await tx.aYCLSchedule.update({
              where: { id: s.id },
              data: {
                title: s.title || "",
                date: new Date(s.date),
                startTime: new Date(s.startTime),
                endTime: new Date(s.endTime),
                googleMeetLink: s.googleMeetLink,
                quota: s.quota,
              },
            });
          } else {
            await tx.aYCLSchedule.create({
              data: {
                id: generateId("SCH"),
                batchId: id,
                title: s.title || "",
                date: new Date(s.date),
                startTime: new Date(s.startTime),
                endTime: new Date(s.endTime),
                googleMeetLink: s.googleMeetLink,
                quota: s.quota,
              },
            });
          }
        }
      }

      return await tx.aYCLBatch.findUnique({
        where: { id },
        include: {
          sections: true,
          materials: true,
          schedules: true,
        },
      });
    });
  }

  static async getAyclDetail(id: string) {
    const batch = await prisma.aYCLBatch.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
        materials: true,
        schedules: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!batch) {
      throw new Error("NOT_FOUND");
    }

    // 🔥 NORMALIZE SECTION CONTENT (biar sama kayak input create)
    const normalizeContent = (type: any, content: any) => {
      switch (type) {
        case "PROGRAM_INFO":
        case "CLOSING":
          return {
            text: content?.text || "",
          };

        case "CHALLENGE":
        case "TARGET":
        case "BENEFIT":
          return {
            items: Array.isArray(content?.items) ? content.items : [],
          };

        case "DIFFERENTIATOR":
          return {
            items: Array.isArray(content?.items)
              ? content.items.map((i: any) => ({
                  title: i.title || "",
                  desc: i.desc || "",
                }))
              : [],
          };

        default:
          return {};
      }
    };

    return {
      // ======================
      // CORE
      // ======================
      id: batch.id,
      title: batch.title,
      slug: batch.slug,
      whatsappGroupLink: batch.whatsappGroupLink,
      price: Number(batch.price),
      isActive: batch.isActive,

      // ======================
      // DETAIL
      // ======================
      headline: batch.headline,
      subHeadline: batch.subHeadline,
      description: batch.description,

      startDate: batch.startDate,
      endDate: batch.endDate,

      // ======================
      // SECTIONS
      // ======================
      sections: batch.sections.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        order: s.order,
        content: normalizeContent(s.type, s.content),
      })),

      // ======================
      // MATERIALS
      // ======================
      materials: batch.materials.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
      })),

      // ======================
      // SCHEDULES
      // ======================
      schedules: batch.schedules.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        googleMeetLink: s.googleMeetLink,
        quota: s.quota,
      })),
    };
  }

  static async getPublicAycl(slug?: string) {
    const batch = await prisma.aYCLBatch.findFirst({
      where: {
        isActive: true,
        ...(slug ? { slug } : {}),
      },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
        materials: true,
        schedules: {
          orderBy: { date: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc", // fallback kalau tanpa slug
      },
    });

    if (!batch) {
      throw new Error("NOT_FOUND");
    }

    const normalizeContent = (type: any, content: any) => {
      switch (type) {
        case "PROGRAM_INFO":
        case "CLOSING":
          return { text: content?.text || "" };

        case "CHALLENGE":
        case "TARGET":
        case "BENEFIT":
          return {
            items: Array.isArray(content?.items) ? content.items : [],
          };

        case "DIFFERENTIATOR":
          return {
            items: Array.isArray(content?.items)
              ? content.items.map((i: any) => ({
                  title: i.title || "",
                  desc: i.desc || "",
                }))
              : [],
          };

        default:
          return {};
      }
    };

    return {
      id: batch.id,
      title: batch.title,
      slug: batch.slug,
      whatsappGroupLink: batch.whatsappGroupLink,
      price: Number(batch.price),

      headline: batch.headline,
      subHeadline: batch.subHeadline,
      description: batch.description,

      startDate: batch.startDate,
      endDate: batch.endDate,

      sections: batch.sections.map((s) => ({
        type: s.type,
        title: s.title,
        order: s.order,
        content: normalizeContent(s.type, s.content),
      })),

      materials: batch.materials.map((m) => ({
        title: m.title,
        description: m.description,
      })),

      schedules: batch.schedules.map((s) => ({
        title: s.title,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        googleMeetLink: s.googleMeetLink,
        quota: s.quota,
      })),
    };
  }

  static async getActiveAyclList() {
    const batches = await prisma.aYCLBatch.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
      select: {
        id: true,
        title: true,
        slug: true,

        // 🔥 TAMBAHAN PENTING
        headline: true,
        subHeadline: true,
        price: true,
      },
    });

    return batches.map((b) => ({
      ...b,
      price: Number(b.price), // biar langsung usable di frontend
    }));
  }
}
