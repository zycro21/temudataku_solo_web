import {
  PrismaClient,
  Prisma,
  ELearningInteractiveType,
  AnchorPosition,
  ELearningAnchoredContentType,
} from "@prisma/client";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class ELearningTextInteractiveService {
  static async getByTextId(
    textId: string,
    query: {
      page: number;
      limit: number;
      sortOrder: "asc" | "desc";
      type?: ELearningInteractiveType;
    },
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    const { page, limit, sortOrder, type } = query;
    const skip = (page - 1) * limit;

    /**
     * 1️⃣ Ambil text + course
     */
    const text = await prisma.eLearningText.findUnique({
      where: { id: textId },
      include: {
        subBab: {
          include: {
            subChapter: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!text) throw new Error("Text tidak ditemukan");

    /**
     * 2️⃣ Role-based access
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== text.subBab.subChapter.course.mentorId
    ) {
      throw new Error("Akses ditolak: hanya mentor pemilik course");
    }

    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: { in: ["active", "confirmed", "completed"] },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("Akses ditolak: subscription tidak aktif");
      }
    }

    /**
     * 3️⃣ Ambil anchor
     */
    const anchorWhere: any = {
      contentType: ELearningAnchoredContentType.INTERACTIVE,
      block: { textId },
    };

    const [anchors, total] = await prisma.$transaction([
      prisma.eLearningTextContentAnchor.findMany({
        where: anchorWhere,
        skip,
        take: limit,
        orderBy: { orderNumber: sortOrder },
        include: {
          block: {
            select: { id: true, order: true },
          },
        },
      }),
      prisma.eLearningTextContentAnchor.count({ where: anchorWhere }),
    ]);

    const interactiveIds = anchors.map((a) => a.contentId);

    /**
     * 4️⃣ Ambil interactive
     */
    const interactives = await prisma.eLearningTextInteractive.findMany({
      where: {
        id: { in: interactiveIds },
        ...(type && { type }),
      },
      include: {
        matching: true,
        multipleChoice: true,
      },
    });

    const interactiveMap = new Map(interactives.map((i) => [i.id, i]));

    /**
     * 5️⃣ Normalisasi response
     */
    const data = anchors
      .map((a) => {
        const interactive = interactiveMap.get(a.contentId);
        if (!interactive) return null;

        return {
          id: interactive.id,
          type: interactive.type,
          createdAt: interactive.createdAt,
          updatedAt: interactive.updatedAt,
          anchor: {
            blockId: a.blockId,
            blockOrder: a.block.order,
            position: a.position,
            orderNumber: a.orderNumber,
          },
          detail: {
            matching: interactive.matching,
            multipleChoice: interactive.multipleChoice,
          },
        };
      })
      .filter(Boolean);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createInteractive(
    textId: string,
    data: {
      type: ELearningInteractiveType;
      anchor: {
        blockId: string;
        position: AnchorPosition;
        orderNumber?: number;
      };
    },
    user: { roles: string[]; mentorProfileId?: string }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil text + relasi sampai course
       */
      const text = await tx.eLearningText.findUnique({
        where: { id: textId },
        include: {
          subBab: {
            include: {
              subChapter: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      });

      if (!text) {
        throw new Error("Text tidak ditemukan");
      }

      /**
       * 2️⃣ Validasi akses mentor
       */
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== text.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor pemilik course yang boleh menambah interactive"
        );
      }

      /**
       * 3️⃣ Validasi block milik text ini
       */
      const block = await tx.eLearningTextBlock.findFirst({
        where: {
          id: data.anchor.blockId,
          textId,
        },
      });

      if (!block) {
        throw new Error("Block tidak ditemukan pada text ini");
      }

      /**
       * 4️⃣ Tentukan orderNumber anchor (GLOBAL per block, ANTI DUPLIKAT & ANTI LOMPAT)
       */
      let anchorOrderNumber: number;

      if (typeof data.anchor.orderNumber === "number") {
        // ❗ CEK KE SEMUA ANCHOR DALAM BLOCK (VIDEO + INTERACTIVE)
        const exists = await tx.eLearningTextContentAnchor.findFirst({
          where: {
            blockId: data.anchor.blockId,
            orderNumber: data.anchor.orderNumber,
          },
        });

        if (exists) {
          throw new Error("orderNumber anchor sudah digunakan pada block ini");
        }

        anchorOrderNumber = data.anchor.orderNumber;
      } else {
        // ✅ Ambil orderNumber TERBESAR di block TANPA PEDULI contentType
        const lastAnchor = await tx.eLearningTextContentAnchor.findFirst({
          where: {
            blockId: data.anchor.blockId,
          },
          orderBy: {
            orderNumber: "desc",
          },
        });

        anchorOrderNumber = lastAnchor?.orderNumber
          ? lastAnchor.orderNumber + 1
          : 1;
      }

      /**
       * 5️⃣ Generate ID (FORMAT BARU)
       */
      const interactiveId = `ETIn_${nanoid(10)}`;
      const anchorId = `ETAn_${nanoid(10)}`;

      /**
       * 6️⃣ Create interactive
       */
      const interactive = await tx.eLearningTextInteractive.create({
        data: {
          id: interactiveId,
          textId,
          type: data.type,
        },
      });

      /**
       * 7️⃣ Create anchor (WAJIB)
       */
      await tx.eLearningTextContentAnchor.create({
        data: {
          id: anchorId,
          blockId: data.anchor.blockId,
          contentType: ELearningAnchoredContentType.INTERACTIVE,
          contentId: interactive.id,
          position: data.anchor.position,
          orderNumber: anchorOrderNumber,
        },
      });

      return interactive;
    });
  }

  static async updateInteractive(
    interactiveId: string,
    data: {
      type?: ELearningInteractiveType;
      anchor?: {
        blockId: string;
        position: AnchorPosition;
        orderNumber?: number;
      };
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + course (UNTUK AUTH)
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          text: {
            include: {
              subBab: {
                include: {
                  subChapter: {
                    include: {
                      course: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!interactive) {
        throw new Error("Interactive tidak ditemukan");
      }

      /**
       * 2️⃣ Ambil anchor interactive (QUERY TERPISAH – INI FIX ERROR)
       */
      const anchor = await tx.eLearningTextContentAnchor.findFirst({
        where: {
          contentType: "INTERACTIVE",
          contentId: interactiveId,
        },
      });

      if (!anchor) {
        throw new Error("Anchor interactive tidak ditemukan");
      }

      /**
       * 3️⃣ Validasi akses mentor
       */
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !==
          interactive.text.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor pemilik course yang dapat mengubah interactive"
        );
      }

      /**
       * 4️⃣ Update type (jika ada)
       */
      if (data.type) {
        await tx.eLearningTextInteractive.update({
          where: { id: interactiveId },
          data: {
            type: data.type,
            updatedAt: new Date(),
          },
        });
      }

      /**
       * 5️⃣ Update anchor (jika ada)
       */
      if (data.anchor) {
        // validasi block tujuan masih dalam text yang sama
        const block = await tx.eLearningTextBlock.findFirst({
          where: {
            id: data.anchor.blockId,
            textId: interactive.textId,
          },
        });

        if (!block) {
          throw new Error("Block tujuan tidak ditemukan pada text ini");
        }

        /**
         * Ambil semua anchor INTERACTIVE di block tujuan
         */
        const anchorsInBlock = await tx.eLearningTextContentAnchor.findMany({
          where: {
            blockId: data.anchor.blockId,
            contentType: "INTERACTIVE",
          },
          orderBy: {
            orderNumber: "asc",
          },
        });

        /**
         * Hapus anchor yang sedang di-update dari list
         */
        const filtered = anchorsInBlock.filter((a) => a.id !== anchor.id);

        /**
         * Tentukan posisi insert
         */
        let targetIndex = filtered.length;
        if (
          data.anchor.orderNumber !== undefined &&
          data.anchor.orderNumber > 0
        ) {
          targetIndex = Math.min(data.anchor.orderNumber - 1, filtered.length);
        }

        /**
         * Sisipkan anchor yang di-update
         */
        filtered.splice(targetIndex, 0, {
          ...anchor,
          blockId: data.anchor.blockId,
          position: data.anchor.position,
        });

        /**
         * Re-assign orderNumber (ANTI LOMPAT)
         */
        for (let i = 0; i < filtered.length; i++) {
          await tx.eLearningTextContentAnchor.update({
            where: { id: filtered[i].id },
            data: {
              orderNumber: i + 1,
              blockId:
                filtered[i].id === anchor.id
                  ? data.anchor.blockId
                  : filtered[i].blockId,
              position:
                filtered[i].id === anchor.id
                  ? data.anchor.position
                  : filtered[i].position,
            },
          });
        }
      }

      /**
       * 6️⃣ Return interactive terbaru
       */
      return tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          matching: true,
          multipleChoice: true,
        },
      });
    });
  }

  static async deleteInteractive(
    interactiveId: string,
    user: {
      roles: string[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Validasi role (ADMIN ONLY)
       */
      if (!user.roles.includes("admin")) {
        throw new Error(
          "Akses ditolak: hanya admin yang dapat menghapus interactive"
        );
      }

      /**
       * 2️⃣ Ambil interactive
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
      });

      if (!interactive) {
        throw new Error("Interactive tidak ditemukan");
      }

      /**
       * 3️⃣ Ambil anchor INTERACTIVE terkait
       */
      const anchor = await tx.eLearningTextContentAnchor.findFirst({
        where: {
          contentType: "INTERACTIVE",
          contentId: interactiveId,
        },
      });

      if (!anchor) {
        throw new Error("Anchor interactive tidak ditemukan");
      }

      const { blockId } = anchor;

      /**
       * 4️⃣ Hapus anchor
       */
      await tx.eLearningTextContentAnchor.delete({
        where: { id: anchor.id },
      });

      /**
       * 5️⃣ Hapus interactive
       */
      await tx.eLearningTextInteractive.delete({
        where: { id: interactiveId },
      });

      /**
       * 6️⃣ Ambil sisa anchor INTERACTIVE di block yang sama
       */
      const remainingAnchors = await tx.eLearningTextContentAnchor.findMany({
        where: {
          blockId,
          contentType: "INTERACTIVE",
        },
        orderBy: {
          orderNumber: "asc",
        },
      });

      /**
       * 7️⃣ Reorder orderNumber agar tidak lompat
       */
      for (let i = 0; i < remainingAnchors.length; i++) {
        await tx.eLearningTextContentAnchor.update({
          where: { id: remainingAnchors[i].id },
          data: {
            orderNumber: i + 1,
          },
        });
      }

      return true;
    });
  }

  static async reorderInteractives(
    textId: string,
    blockId: string,
    orders: { anchorId: string; orderNumber: number }[],
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil text + validasi akses
       */
      const text = await tx.eLearningText.findUnique({
        where: { id: textId },
        include: {
          subBab: {
            include: {
              subChapter: {
                include: { course: true },
              },
            },
          },
        },
      });

      if (!text) {
        throw new Error("Text tidak ditemukan");
      }

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== text.subBab.subChapter.course.mentorId
      ) {
        throw new Error("Akses ditolak");
      }

      /**
       * 2️⃣ Validasi block milik text
       */
      const block = await tx.eLearningTextBlock.findFirst({
        where: {
          id: blockId,
          textId,
        },
      });

      if (!block) {
        throw new Error("Block tidak ditemukan pada text ini");
      }

      /**
       * 3️⃣ Ambil anchor INTERACTIVE di block
       */
      const anchors = await tx.eLearningTextContentAnchor.findMany({
        where: {
          blockId,
          contentType: "INTERACTIVE",
        },
      });

      const anchorIds = anchors.map((a) => a.id);

      /**
       * 4️⃣ Validasi semua anchorId ada di block ini
       */
      for (const item of orders) {
        if (!anchorIds.includes(item.anchorId)) {
          throw new Error(
            `Anchor ${item.anchorId} tidak ditemukan pada block ini`
          );
        }
      }

      /**
       * 5️⃣ Update orderNumber (bulk, TANPA lompat)
       */
      for (const item of orders) {
        await tx.eLearningTextContentAnchor.update({
          where: { id: item.anchorId },
          data: {
            orderNumber: item.orderNumber,
          },
        });
      }

      /**
       * 6️⃣ Normalisasi ulang (anti lompat)
       */
      const reordered = await tx.eLearningTextContentAnchor.findMany({
        where: {
          blockId,
          contentType: "INTERACTIVE",
        },
        orderBy: { orderNumber: "asc" },
      });

      for (let i = 0; i < reordered.length; i++) {
        await tx.eLearningTextContentAnchor.update({
          where: { id: reordered[i].id },
          data: { orderNumber: i + 1 },
        });
      }
    });
  }

  static async getDetailById(
    interactiveId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    /**
     * 1️⃣ Ambil interactive + relasi text → course
     */
    const interactive = await prisma.eLearningTextInteractive.findUnique({
      where: { id: interactiveId },
      include: {
        text: {
          include: {
            subBab: {
              include: {
                subChapter: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
        matching: true,
        multipleChoice: true,
      },
    });

    if (!interactive) {
      throw new Error("Interactive tidak ditemukan");
    }

    const course = interactive.text.subBab.subChapter.course;

    /**
     * 2️⃣ Role-based access
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error("Akses ditolak: hanya mentor pemilik course");
    }

    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: { in: ["active", "confirmed", "completed"] },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("Akses ditolak: subscription tidak aktif");
      }
    }

    /**
     * 3️⃣ Ambil anchor (INTERACTIVE)
     */
    const anchor = await prisma.eLearningTextContentAnchor.findFirst({
      where: {
        contentType: "INTERACTIVE",
        contentId: interactive.id,
      },
      include: {
        block: {
          select: {
            id: true,
            order: true,
            textId: true,
          },
        },
      },
    });

    if (!anchor) {
      throw new Error("Anchor interactive tidak ditemukan");
    }

    /**
     * 4️⃣ Normalisasi response
     */
    return {
      id: interactive.id,
      type: interactive.type,
      textId: interactive.textId,
      createdAt: interactive.createdAt,
      updatedAt: interactive.updatedAt,
      anchor: {
        id: anchor.id,
        blockId: anchor.blockId,
        blockOrder: anchor.block.order,
        position: anchor.position,
        orderNumber: anchor.orderNumber,
      },
      detail: {
        matching: interactive.matching,
        multipleChoice: interactive.multipleChoice,
      },
    };
  }

  static async moveInteractive(
    interactiveId: string,
    payload: {
      targetBlockId: string;
      position: AnchorPosition;
    },
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    const { targetBlockId, position } = payload;

    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + course
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          text: {
            include: {
              subBab: {
                include: {
                  subChapter: {
                    include: { course: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!interactive) {
        throw new Error("Interactive tidak ditemukan");
      }

      const course = interactive.text.subBab.subChapter.course;

      /**
       * 2️⃣ Role-based access
       */
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: hanya mentor pemilik course");
      }

      /**
       * 3️⃣ Ambil anchor lama
       */
      const oldAnchor = await tx.eLearningTextContentAnchor.findFirst({
        where: {
          contentType: "INTERACTIVE",
          contentId: interactiveId,
        },
      });

      if (!oldAnchor) {
        throw new Error("Anchor interactive tidak ditemukan");
      }

      /**
       * 4️⃣ Pastikan block tujuan valid & satu text
       */
      const targetBlock = await tx.eLearningTextBlock.findUnique({
        where: { id: targetBlockId },
      });

      if (!targetBlock) {
        throw new Error("Block tujuan tidak ditemukan");
      }

      if (targetBlock.textId !== interactive.textId) {
        throw new Error("Block tujuan tidak berada dalam text yang sama");
      }

      /**
       * 5️⃣ Rapihkan orderNumber block lama (TANPA DELETE)
       */
      const remainingAnchors = await tx.eLearningTextContentAnchor.findMany({
        where: {
          blockId: oldAnchor.blockId,
          contentType: "INTERACTIVE",
          NOT: { id: oldAnchor.id },
        },
        orderBy: { orderNumber: "asc" },
      });

      for (let i = 0; i < remainingAnchors.length; i++) {
        await tx.eLearningTextContentAnchor.update({
          where: { id: remainingAnchors[i].id },
          data: { orderNumber: i + 1 },
        });
      }

      /**
       * 6️⃣ Hitung orderNumber baru di block tujuan
       */
      const lastAnchor = await tx.eLearningTextContentAnchor.findFirst({
        where: {
          blockId: targetBlockId,
          contentType: "INTERACTIVE",
        },
        orderBy: { orderNumber: "desc" },
      });

      const newOrderNumber = lastAnchor ? (lastAnchor.orderNumber ?? 0) + 1 : 1;

      /**
       * 7️⃣ UPDATE anchor lama (ID TETAP)
       */
      await tx.eLearningTextContentAnchor.update({
        where: { id: oldAnchor.id },
        data: {
          blockId: targetBlockId,
          position,
          orderNumber: newOrderNumber,
        },
      });
    });
  }

  static async getByBlockId(
    blockId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    /**
     * 1️⃣ Ambil block + text + course
     */
    const block = await prisma.eLearningTextBlock.findUnique({
      where: { id: blockId },
      include: {
        text: {
          include: {
            subBab: {
              include: {
                subChapter: {
                  include: { course: true },
                },
              },
            },
          },
        },
      },
    });

    if (!block) throw new Error("Block tidak ditemukan");

    const course = block.text.subBab.subChapter.course;

    /**
     * 2️⃣ Role-based access
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error("Akses ditolak: hanya mentor pemilik course");
    }

    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: { in: ["active", "confirmed", "completed"] },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("Akses ditolak: subscription tidak aktif");
      }
    }

    /**
     * 3️⃣ Ambil anchor interactive khusus block ini
     */
    const anchors = await prisma.eLearningTextContentAnchor.findMany({
      where: {
        blockId,
        contentType: "INTERACTIVE",
      },
      orderBy: {
        orderNumber: "asc",
      },
    });

    if (anchors.length === 0) return [];

    const interactiveIds = anchors.map((a) => a.contentId);

    /**
     * 4️⃣ Ambil interactive
     */
    const interactives = await prisma.eLearningTextInteractive.findMany({
      where: {
        id: { in: interactiveIds },
      },
      include: {
        matching: true,
        multipleChoice: true,
      },
    });

    const interactiveMap = new Map(interactives.map((i) => [i.id, i]));

    /**
     * 5️⃣ Normalisasi response (editor-friendly)
     */
    return anchors
      .map((a) => {
        const interactive = interactiveMap.get(a.contentId);
        if (!interactive) return null;

        return {
          id: interactive.id,
          type: interactive.type,
          createdAt: interactive.createdAt,
          updatedAt: interactive.updatedAt,
          anchor: {
            blockId: a.blockId,
            position: a.position,
            orderNumber: a.orderNumber,
          },
          detail: {
            matching: interactive.matching,
            multipleChoice: interactive.multipleChoice,
          },
        };
      })
      .filter(Boolean);
  }

  static async exportInteractivesToFile(
    exportFormat: "csv" | "excel"
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    /**
     * 1️⃣ Ambil anchor INTERACTIVE + relasi lengkap
     */
    const anchors = await prisma.eLearningTextContentAnchor.findMany({
      where: {
        contentType: "INTERACTIVE",
      },
      include: {
        block: {
          include: {
            text: {
              include: {
                subBab: {
                  include: {
                    subChapter: {
                      include: {
                        course: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const interactiveIds = anchors.map((a) => a.contentId);

    /**
     * 2️⃣ Ambil interactive
     */
    const interactives = await prisma.eLearningTextInteractive.findMany({
      where: {
        id: { in: interactiveIds },
      },
    });

    const interactiveMap = new Map(interactives.map((i) => [i.id, i]));

    /**
     * 3️⃣ Flatten rows (export-friendly)
     */
    const rows = anchors.map((a) => {
      const interactive = interactiveMap.get(a.contentId);

      return {
        InteractiveID: interactive?.id ?? "-",
        InteractiveType: interactive?.type ?? "-",

        AnchorID: a.id,
        AnchorBlockID: a.blockId,
        AnchorPosition: a.position,
        AnchorOrderNumber: a.orderNumber ?? "-",

        BlockOrder: a.block.order,
        TextID: a.block.text.id,
        TextTitle: a.block.text.title ?? "-",
        TextOrderNumber: a.block.text.orderNumber ?? "-",

        SubBabID: a.block.text.subBab.id,
        SubBabTitle: a.block.text.subBab.title ?? "-",

        SubChapterID: a.block.text.subBab.subChapter.id,
        SubChapterTitle: a.block.text.subBab.subChapter.title ?? "-",

        CourseID: a.block.text.subBab.subChapter.course.id,
        CourseTitle: a.block.text.subBab.subChapter.course.title ?? "-",

        InteractiveCreatedAt: format(
          interactive?.createdAt ?? new Date(),
          "yyyy-MM-dd HH:mm:ss"
        ),
        InteractiveUpdatedAt: format(
          interactive?.updatedAt ?? new Date(),
          "yyyy-MM-dd HH:mm:ss"
        ),
        AnchorCreatedAt: format(
          a.createdAt ?? new Date(),
          "yyyy-MM-dd HH:mm:ss"
        ),
      };
    });

    /**
     * 4️⃣ Generate filename random
     */
    const randomString = (length: number) =>
      Array.from({ length }, () =>
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
          Math.floor(Math.random() * 62)
        )
      ).join("");

    /**
     * 5️⃣ CSV
     */
    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `elearning_interactives_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    /**
     * 6️⃣ Excel
     */
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ELearningInteractives");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 28,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `elearning_interactives_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}
