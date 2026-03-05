import {
  PrismaClient,
  Prisma,
  ELearningInteractiveType,
  AnchorPosition,
  ELearningAnchoredContentType,
  CodeLanguage,
} from "@prisma/client";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { spawn } from "child_process";

const prisma = new PrismaClient();
const execAsync = promisify(exec);

const MAX_OUTPUT = 10_000;

function truncateOutput(output?: string | null) {
  if (!output) return null;

  if (output.length > MAX_OUTPUT) {
    return output.slice(0, MAX_OUTPUT) + "\n...output truncated";
  }

  return output;
}

export class ELearningExecutableCodeService {
  static async createExecutableCode(
    textId: string,
    data: {
      title?: string;
      description?: string;
      language: CodeLanguage;
      initialCode: string;
      anchor: {
        blockId: string;
        position: AnchorPosition;
        orderNumber?: number;
      };
    },
    user: { roles: string[]; mentorProfileId?: string },
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
          "Akses ditolak: hanya mentor pemilik course yang boleh menambah executable code",
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
       * 4️⃣ Tentukan orderNumber anchor (GLOBAL per block)
       */
      let anchorOrderNumber: number;

      if (typeof data.anchor.orderNumber === "number") {
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
       * 5️⃣ Generate ID custom & unique
       */
      const executableCodeId = `ECode_${nanoid(12)}`;
      const anchorId = `ETAn_${nanoid(10)}`;

      /**
       * 6️⃣ Create executable code
       */
      const executableCode = await tx.eLearningExecutableCode.create({
        data: {
          id: executableCodeId,
          textId,
          title: data.title,
          description: data.description,
          language: data.language,
          initialCode: data.initialCode, // MULTI-LINE AMAN
          isEditable: false, // DEFAULT SESUAI PERMINTAAN
        },
      });

      /**
       * 7️⃣ Create anchor CODE
       */
      await tx.eLearningTextContentAnchor.create({
        data: {
          id: anchorId,
          blockId: data.anchor.blockId,
          contentType: ELearningAnchoredContentType.CODE,
          contentId: executableCode.id,
          position: data.anchor.position,
          orderNumber: anchorOrderNumber,
        },
      });

      return executableCode;
    });
  }

  static async getExecutableCodeById(
    executableCodeId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    /**
     * 1️⃣ Ambil executable code + relasi sampai course
     */
    const executableCode = await prisma.eLearningExecutableCode.findUnique({
      where: { id: executableCodeId },
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

    if (!executableCode) {
      throw new Error("Executable code tidak ditemukan");
    }

    const course = executableCode.text.subBab.subChapter.course;

    /**
     * 2️⃣ Validasi mentor (harus pemilik course)
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error(
        "Akses ditolak: hanya mentor pemilik course yang boleh mengakses executable code ini",
      );
    }

    /**
     * 3️⃣ Validasi mentee (harus subscription aktif)
     */
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
     * 4️⃣ Optional: ambil anchor CODE (berguna untuk render posisi di UI)
     */
    const anchor = await prisma.eLearningTextContentAnchor.findFirst({
      where: {
        contentType: "CODE",
        contentId: executableCode.id,
      },
    });

    /**
     * 5️⃣ Response data siap untuk render editor
     */
    return {
      id: executableCode.id,
      title: executableCode.title,
      description: executableCode.description,
      language: executableCode.language,
      initialCode: executableCode.initialCode,
      isEditable: executableCode.isEditable,
      createdAt: executableCode.createdAt,
      updatedAt: executableCode.updatedAt,
      anchor: anchor
        ? {
            blockId: anchor.blockId,
            position: anchor.position,
            orderNumber: anchor.orderNumber,
          }
        : null,
    };
  }

  static async getExecutableCodesByText(
    textId: string,
    query: {
      language?: CodeLanguage;
      page: number;
      limit: number;
      sortBy: "createdAt" | "updatedAt" | "title";
      sortOrder: "asc" | "desc";
    },
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    /**
     * 1️⃣ Ambil text + relasi sampai course
     */
    const text = await prisma.eLearningText.findUnique({
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

    const course = text.subBab.subChapter.course;

    /**
     * 2️⃣ Validasi mentor (pemilik course)
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error(
        "Akses ditolak: hanya mentor pemilik course yang boleh mengakses executable code ini",
      );
    }

    /**
     * 3️⃣ Validasi mentee (subscription aktif)
     */
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
     * 4️⃣ Pagination & filter
     */
    const skip = (query.page - 1) * query.limit;

    const whereClause: any = {
      textId,
    };

    if (query.language) {
      whereClause.language = query.language;
    }

    /**
     * 5️⃣ Query data
     */
    const [total, executableCodes] = await prisma.$transaction([
      prisma.eLearningExecutableCode.count({
        where: whereClause,
      }),
      prisma.eLearningExecutableCode.findMany({
        where: whereClause,
        skip,
        take: query.limit,
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        include: {
          runs: false,
        },
      }),
    ]);

    /**
     * 6️⃣ Ambil anchor CODE untuk tiap executable code
     */
    const codeIds = executableCodes.map((c) => c.id);

    const anchors = await prisma.eLearningTextContentAnchor.findMany({
      where: {
        contentType: "CODE",
        contentId: { in: codeIds },
      },
    });

    const anchorMap = new Map(anchors.map((a) => [a.contentId, a]));

    /**
     * 7️⃣ Shape response
     */
    const data = executableCodes.map((code) => {
      const anchor = anchorMap.get(code.id);

      return {
        id: code.id,
        title: code.title,
        description: code.description,
        language: code.language,
        initialCode: code.initialCode,
        isEditable: code.isEditable,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
        anchor: anchor
          ? {
              blockId: anchor.blockId,
              position: anchor.position,
              orderNumber: anchor.orderNumber,
            }
          : null,
      };
    });

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  static async updateExecutableCode(
    executableCodeId: string,
    data: {
      title?: string;
      description?: string;
      language?: CodeLanguage;
      initialCode?: string;
      isEditable?: boolean;
      anchor?: {
        blockId?: string;
        position?: AnchorPosition;
        orderNumber?: number;
      };
    },
    user: { roles: string[]; mentorProfileId?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil executable code + relasi course
       */
      const executableCode = await tx.eLearningExecutableCode.findUnique({
        where: { id: executableCodeId },
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

      if (!executableCode) {
        throw new Error("Executable code tidak ditemukan");
      }

      /**
       * 2️⃣ Validasi akses mentor
       */
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !==
          executableCode.text.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor pemilik course yang boleh mengubah executable code",
        );
      }

      /**
       * 3️⃣ Update executable code (PARTIAL)
       */
      const updatedExecutableCode = await tx.eLearningExecutableCode.update({
        where: { id: executableCodeId },
        data: {
          title: data.title,
          description: data.description,
          language: data.language,
          initialCode: data.initialCode, // MULTI-LINE AMAN
          isEditable: data.isEditable,
        },
      });

      /**
       * 4️⃣ Jika tidak update anchor → selesai
       */
      if (!data.anchor) {
        return updatedExecutableCode;
      }

      /**
       * 5️⃣ Ambil anchor CODE
       */
      const anchor = await tx.eLearningTextContentAnchor.findFirst({
        where: {
          contentType: ELearningAnchoredContentType.CODE,
          contentId: executableCodeId,
        },
      });

      if (!anchor) {
        throw new Error("Anchor executable code tidak ditemukan");
      }

      const targetBlockId = data.anchor.blockId ?? anchor.blockId;
      const targetOrder = data.anchor.orderNumber;

      /**
       * 6️⃣ Validasi block milik text
       */
      const block = await tx.eLearningTextBlock.findFirst({
        where: {
          id: targetBlockId,
          textId: executableCode.textId,
        },
      });

      if (!block) {
        throw new Error("Block tidak ditemukan pada text ini");
      }

      /**
       * 7️⃣ SHIFTING ORDER NUMBER (ANTI SWAP & ANTI LOMPAT)
       */
      if (
        typeof targetOrder === "number" &&
        targetOrder !== anchor.orderNumber
      ) {
        const anchors = await tx.eLearningTextContentAnchor.findMany({
          where: { blockId: targetBlockId },
          orderBy: { orderNumber: "asc" },
        });

        const maxOrder = anchors.length;
        if (targetOrder < 1 || targetOrder > maxOrder) {
          throw new Error("orderNumber anchor tidak valid");
        }

        if (targetOrder < (anchor.orderNumber ?? 0)) {
          // naik → geser turun
          await tx.eLearningTextContentAnchor.updateMany({
            where: {
              blockId: targetBlockId,
              orderNumber: {
                gte: targetOrder,
                lt: anchor.orderNumber ?? undefined,
              },
            },
            data: {
              orderNumber: { increment: 1 },
            },
          });
        } else {
          // turun → geser naik
          await tx.eLearningTextContentAnchor.updateMany({
            where: {
              blockId: targetBlockId,
              orderNumber: {
                gt: anchor.orderNumber ?? undefined,
                lte: targetOrder,
              },
            },
            data: {
              orderNumber: { decrement: 1 },
            },
          });
        }
      }

      /**
       * 8️⃣ Update anchor
       */
      await tx.eLearningTextContentAnchor.update({
        where: { id: anchor.id },
        data: {
          blockId: targetBlockId,
          position: data.anchor.position,
          orderNumber: targetOrder,
        },
      });

      return updatedExecutableCode;
    });
  }

  static async deleteExecutableCode(executableCodeId: string) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil executable code
       */
      const executableCode = await tx.eLearningExecutableCode.findUnique({
        where: { id: executableCodeId },
      });

      if (!executableCode) {
        throw new Error("Executable code tidak ditemukan");
      }

      /**
       * 2️⃣ Ambil anchor CODE
       */
      const anchor = await tx.eLearningTextContentAnchor.findFirst({
        where: {
          contentType: ELearningAnchoredContentType.CODE,
          contentId: executableCodeId,
        },
      });

      /**
       * 3️⃣ Jika ada anchor → lakukan shifting
       */
      if (anchor && typeof anchor.orderNumber === "number") {
        const deletedOrder = anchor.orderNumber;
        const blockId = anchor.blockId;

        /**
         * Geser semua anchor di bawahnya (SEMUA TYPE)
         * Contoh:
         * 1 2 [3] 4 5 6  → hapus 3
         * 1 2 3 4 5
         */
        await tx.eLearningTextContentAnchor.updateMany({
          where: {
            blockId,
            orderNumber: {
              gt: deletedOrder,
            },
          },
          data: {
            orderNumber: {
              decrement: 1,
            },
          },
        });

        /**
         * 4️⃣ Hapus anchor
         */
        await tx.eLearningTextContentAnchor.delete({
          where: { id: anchor.id },
        });
      }

      /**
       * 5️⃣ Hapus executable code
       * (runs akan ikut terhapus jika FK cascade)
       */
      await tx.eLearningExecutableCode.delete({
        where: { id: executableCodeId },
      });

      return true;
    });
  }

  static async toggleEditable(
    executableCodeId: string,
    isEditable: boolean,
    user: { roles: string[]; mentorProfileId?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil executable code + relasi sampai course
       */
      const executableCode = await tx.eLearningExecutableCode.findUnique({
        where: { id: executableCodeId },
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

      if (!executableCode) {
        throw new Error("Executable code tidak ditemukan");
      }

      /**
       * 2️⃣ Validasi akses mentor
       */
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !==
          executableCode.text.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor pemilik course yang boleh mengubah status code",
        );
      }

      /**
       * 3️⃣ Cegah update sia-sia
       */
      if (executableCode.isEditable === isEditable) {
        return executableCode;
      }

      /**
       * 4️⃣ Update isEditable
       */
      const updated = await tx.eLearningExecutableCode.update({
        where: { id: executableCodeId },
        data: {
          isEditable,
          updatedAt: new Date(),
        },
      });

      return updated;
    });
  }

  static async getExecutableCodesByBlock(
    blockId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    /**
     * 1️⃣ Ambil block + relasi sampai course
     */
    const block = await prisma.eLearningTextBlock.findUnique({
      where: { id: blockId },
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

    if (!block) {
      throw new Error("Block tidak ditemukan");
    }

    const course = block.text.subBab.subChapter.course;

    /**
     * 2️⃣ Validasi akses mentor
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error(
        "Akses ditolak: hanya mentor pemilik course yang boleh mengakses block ini",
      );
    }

    /**
     * 3️⃣ Validasi subscription mentee
     */
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
     * 4️⃣ Ambil anchor CODE + executable code
     */
    const anchors = await prisma.eLearningTextContentAnchor.findMany({
      where: {
        blockId,
        contentType: ELearningAnchoredContentType.CODE,
      },
      include: {
        // join manual ke executable code
        // (Prisma belum punya polymorphic relation)
      },
      orderBy: {
        orderNumber: "asc",
      },
    });

    if (anchors.length === 0) {
      return [];
    }

    const executableCodes = await prisma.eLearningExecutableCode.findMany({
      where: {
        id: {
          in: anchors.map((a) => a.contentId),
        },
      },
    });

    /**
     * 5️⃣ Merge anchor + executable code
     */
    const result = anchors
      .map((anchor) => {
        const code = executableCodes.find((ec) => ec.id === anchor.contentId);

        if (!code) return null;

        return {
          // executable code fields (LENGKAP)
          id: code.id,
          textId: code.textId,
          title: code.title,
          description: code.description,
          language: code.language,
          initialCode: code.initialCode,
          isEditable: code.isEditable,
          createdAt: code.createdAt,
          updatedAt: code.updatedAt,

          // anchor metadata
          anchor: {
            id: anchor.id,
            orderNumber: anchor.orderNumber,
            position: anchor.position,
            contentType: anchor.contentType,
          },
        };
      })
      .filter(Boolean);

    return result;
  }

  static async duplicateExecutableCode(
    executableCodeId: string,
    data: {
      targetTextId: string;
      override?: {
        title?: string;
        description?: string;
        isEditable?: boolean;
      };
      anchor: {
        blockId: string;
        position: AnchorPosition;
        orderNumber?: number;
      };
    },
    user: { roles: string[]; mentorProfileId?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil executable code asal + relasi course
       */
      const sourceCode = await tx.eLearningExecutableCode.findUnique({
        where: { id: executableCodeId },
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

      if (!sourceCode) {
        throw new Error("Executable code tidak ditemukan");
      }

      /**
       * 2️⃣ Validasi akses mentor (source)
       */
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !==
          sourceCode.text.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor pemilik course yang boleh menduplikasi executable code",
        );
      }

      /**
       * 3️⃣ Ambil target text + validasi course ownership
       */
      const targetText = await tx.eLearningText.findUnique({
        where: { id: data.targetTextId },
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

      if (!targetText) {
        throw new Error("Target text tidak ditemukan");
      }

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== targetText.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: target text bukan milik course mentor ini",
        );
      }

      /**
       * 4️⃣ Validasi block target
       */
      const block = await tx.eLearningTextBlock.findFirst({
        where: {
          id: data.anchor.blockId,
          textId: targetText.id,
        },
      });

      if (!block) {
        throw new Error("Block target tidak ditemukan pada text ini");
      }

      /**
       * 5️⃣ Tentukan orderNumber anchor
       */
      let anchorOrderNumber: number;

      if (typeof data.anchor.orderNumber === "number") {
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
        const lastAnchor = await tx.eLearningTextContentAnchor.findFirst({
          where: { blockId: data.anchor.blockId },
          orderBy: { orderNumber: "desc" },
        });

        anchorOrderNumber = lastAnchor?.orderNumber
          ? lastAnchor.orderNumber + 1
          : 1;
      }

      /**
       * 6️⃣ Generate ID custom & unique
       */
      const newExecutableCodeId = `ECode_${nanoid(12)}`;
      const anchorId = `ETAn_${nanoid(10)}`;

      /**
       * 7️⃣ Create duplicated executable code
       */
      const duplicatedCode = await tx.eLearningExecutableCode.create({
        data: {
          id: newExecutableCodeId,
          textId: targetText.id,
          title: data.override?.title ?? sourceCode.title,
          description: data.override?.description ?? sourceCode.description,
          language: sourceCode.language,
          initialCode: sourceCode.initialCode,
          isEditable: data.override?.isEditable ?? sourceCode.isEditable,
        },
      });

      /**
       * 8️⃣ Create anchor CODE
       */
      await tx.eLearningTextContentAnchor.create({
        data: {
          id: anchorId,
          blockId: data.anchor.blockId,
          contentType: ELearningAnchoredContentType.CODE,
          contentId: duplicatedCode.id,
          position: data.anchor.position,
          orderNumber: anchorOrderNumber,
        },
      });

      return duplicatedCode;
    });
  }

  private static async runCppWithSpawn(
    baseDir: string,
    code: string,
    input?: string,
  ) {
    // 1. Tulis file source code
    fs.writeFileSync(path.join(baseDir, "main.cpp"), code);

    const start = Date.now();
    const msys2Root = "D:\\c++\\mingw64";
    const binPath = path.join(msys2Root, "bin");

    return new Promise<{
      output: string | null;
      error: string | null;
      executionTime: number;
      isSuccess: boolean;
    }>((resolve) => {
      /** 1️⃣ COMPILE STAGE */
      const compile = spawn(
        "cmd.exe",
        [
          "/c",
          // Menambahkan bin compiler ke PATH sesi ini agar g++ bisa dipanggil
          `set PATH=${binPath};%PATH% && g++ main.cpp -std=c++17 -O2 -o main.exe`,
        ],
        {
          cwd: baseDir,
          windowsHide: true,
        },
      );

      let compileError = "";

      compile.stderr.on("data", (d) => {
        compileError += d.toString();
      });

      compile.on("error", (err) => {
        return resolve({
          output: null,
          error: `Compiler process error: ${err.message}`,
          executionTime: Date.now() - start,
          isSuccess: false,
        });
      });

      compile.on("close", (code) => {
        // Jika compile gagal (exit code bukan 0)
        if (code !== 0) {
          return resolve({
            output: null,
            error: truncateOutput(compileError || "Compile failed"),
            executionTime: Date.now() - start,
            isSuccess: false,
          });
        }

        /** 2️⃣ RUN STAGE (BAGIAN KRITIS) */
        const exePath = path.join(baseDir, "main.exe");

        // Validasi fisik file sebelum di-run untuk menghindari ENOENT
        if (!fs.existsSync(exePath)) {
          return resolve({
            output: null,
            error: "Runtime error: main.exe tidak ditemukan setelah kompilasi.",
            executionTime: Date.now() - start,
            isSuccess: false,
          });
        }

        const run = spawn("main.exe", [], {
          cwd: baseDir,
          windowsHide: true,
          shell: true, // PENTING: Menghindari ENOENT di Windows
          env: {
            ...process.env,
            // PENTING: Masukkan folder bin compiler ke PATH agar exe menemukan DLL (libgcc, dll)
            PATH: `${binPath};${process.env.PATH}`,
          },
        });

        let output = "";
        let error = "";

        // Handle Input (Stdin)
        if (input) {
          run.stdin.write(input);
          run.stdin.end();
        }

        run.stdout.on("data", (d) => (output += d.toString()));
        run.stderr.on("data", (d) => (error += d.toString()));

        run.on("error", (err: any) => {
          return resolve({
            output: null,
            error: `Runtime spawn error: ${err.message}`,
            executionTime: Date.now() - start,
            isSuccess: false,
          });
        });

        run.on("close", (exitCode) => {
          // Anggap sukses jika tidak ada error di stderr dan exitCode adalah 0
          // Namun beberapa kompetisi pemrograman menganggap exitCode != 0 sebagai Runtime Error
          resolve({
            output: truncateOutput(output.trim() || null),
            error: truncateOutput(error.trim() || null),
            executionTime: Date.now() - start,
            isSuccess: exitCode === 0 && !error,
          });
        });
      });
    });
  }

  private static async runCodeWithLocal(
    language: CodeLanguage,
    code: string,
    input?: string,
  ) {
    const runId = nanoid(10);
    const baseDir = path.join(process.cwd(), "tmp", "code-run", runId);

    fs.mkdirSync(baseDir, { recursive: true });
    const start = Date.now();

    try {
      /** 🔥 KHUSUS C++ → SPAWN */
      if (language === "CPP") {
        return await this.runCppWithSpawn(baseDir, code, input);
      }

      /** 🔹 Bahasa lain → exec */
      let fileName = "";
      let command = "";

      switch (language) {
        case "PYTHON":
          fileName = "main.py";
          command = "python main.py";
          break;

        case "JAVASCRIPT":
          fileName = "main.js";
          command = "node main.js";
          break;

        case "R":
          fileName = "main.R";
          command = "Rscript main.R";
          break;

        case "SQL":
          fileName = "query.sql";

          fs.writeFileSync(
            path.join(baseDir, "init.sql"),
            `
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT
);
INSERT INTO users (name, email) VALUES
('Alice', 'alice@mail.com'),
('Bob', 'bob@mail.com');
        `.trim(),
          );

          command = "sqlite3 test.db < init.sql && sqlite3 test.db < query.sql";
          break;

        default:
          throw new Error("Bahasa tidak didukung di Local Runner");
      }

      fs.writeFileSync(path.join(baseDir, fileName), code);

      if (input && language !== "SQL") {
        fs.writeFileSync(path.join(baseDir, "input.txt"), input);
      }

      const { stdout, stderr } = await execAsync(
        `${command}${input && language !== "SQL" ? " < input.txt" : ""}`,
        {
          cwd: baseDir,
          timeout: 3000,
          shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh",
        },
      );

      return {
        output: truncateOutput(stdout?.trim() || null),
        error: truncateOutput(stderr?.trim() || null),
        executionTime: Date.now() - start,
        isSuccess: true,
      };
    } catch (err: any) {
      return {
        output: truncateOutput(err.stdout?.toString()?.trim() || null),
        error: truncateOutput(
          err.stderr?.toString()?.trim() ||
            err.stdout?.toString()?.trim() ||
            err.message,
        ),
        executionTime: Date.now() - start,
        isSuccess: false,
      };
    } finally {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
  }

  private static async runCodeWithDocker(
    language: CodeLanguage,
    code: string,
    input?: string,
  ) {
    const runId = nanoid(10);
    const baseDir = `/tmp/code-run/${runId}`;

    fs.mkdirSync(baseDir, { recursive: true });

    let fileName = "";
    let dockerImage = "";
    let command = "";

    switch (language) {
      case "PYTHON":
        fileName = "main.py";
        dockerImage = "python:3.11-alpine";
        command = "python -u main.py";
        break;

      case "JAVASCRIPT":
        fileName = "main.js";
        dockerImage = "node:20-alpine";
        command = "node main.js";
        break;

      case "CPP":
        fileName = "main.cpp";
        dockerImage = "gcc:13";
        command = [
          // COMPILE
          "g++ main.cpp -std=c++17 -O2 -Wall -Wextra -o main",
          // RUN (ANTI INFINITE LOOP)
          "timeout 2s ./main",
        ].join(" && ");
        break;

      case "R":
        fileName = "main.R";
        dockerImage = "r-base:4.3";
        command = "Rscript main.R";
        break;

      case "SQL":
        fileName = "query.sql";
        dockerImage = "nouchka/sqlite3";

        fs.writeFileSync(
          path.join(baseDir, "init.sql"),
          `
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT
);

INSERT INTO users (name, email) VALUES
('Alice', 'alice@mail.com'),
('Bob', 'bob@mail.com');
        `.trim(),
        );

        command = "sqlite3 test.db < init.sql && sqlite3 test.db < query.sql";
        break;

      default:
        throw new Error("Bahasa tidak didukung");
    }

    fs.writeFileSync(path.join(baseDir, fileName), code);

    if (input && language !== "SQL") {
      fs.writeFileSync(path.join(baseDir, "input.txt"), input);
    }

    const start = Date.now();

    try {
      const { stdout, stderr } = await execAsync(
        `
docker run --rm \
  --network none \
  --memory=256m \
  --cpus=0.5 \
  -v ${baseDir}:/app \
  -w /app \
  ${dockerImage} \
  sh -c "${command}${input && language !== "SQL" ? " < input.txt" : ""}"
      `,
        { timeout: 5000 },
      );

      return {
        output: truncateOutput(stdout?.trim() || null),
        error: truncateOutput(stderr?.trim() || null),
        executionTime: Date.now() - start,
        isSuccess: true,
      };
    } catch (err: any) {
      return {
        output: null,
        error: truncateOutput(err.stderr?.trim() || err.message),
        executionTime: Date.now() - start,
        isSuccess: false,
      };
    } finally {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
  }

  static async runExecutableCode(
    executableCodeId: string,
    data: {
      code?: string;
      input?: string;
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil executable code + relasi course
       */
      const executableCode = await tx.eLearningExecutableCode.findUnique({
        where: { id: executableCodeId },
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

      if (!executableCode) {
        throw new Error("Executable code tidak ditemukan");
      }

      /**
       * 2️⃣ Validasi akses
       */
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !==
          executableCode.text.subBab.subChapter.course.mentorId
      ) {
        throw new Error("Akses ditolak: mentor bukan pemilik course");
      }

      /**
       * 3️⃣ Validasi subscription mentee
       */
      if (user.roles.includes("mentee")) {
        const now = new Date();

        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: {
              in: ["active", "confirmed", "completed"],
            },
            startAt: { lte: now },
            endAt: { gt: now },
          },
        });

        if (!activeSubscription) {
          throw new Error("Akses ditolak: subscription tidak aktif");
        }
      }

      /**
       * 4️⃣ Tentukan code yang dijalankan
       */
      const codeToRun = data.code?.trim() || executableCode.initialCode;

      /**
       * 5️⃣ Jalankan runner (Docker / Local)
       */

      if (process.env.CODE_RUNNER_MODE === "disabled") {
        throw new Error("Code runner dinonaktifkan di environment ini");
      }

      if (
        process.env.NODE_ENV === "production" &&
        process.env.CODE_RUNNER_MODE === "local"
      ) {
        throw new Error("Local runner tidak diizinkan di production");
      }

      const runnerMode = process.env.CODE_RUNNER_MODE || "docker";

      const runResult =
        runnerMode === "docker"
          ? await ELearningExecutableCodeService.runCodeWithDocker(
              executableCode.language,
              codeToRun,
              data.input,
            )
          : await ELearningExecutableCodeService.runCodeWithLocal(
              executableCode.language,
              codeToRun,
              data.input,
            );

      /**
       * 6️⃣ Generate ID custom
       */
      const codeRunId = `CRun_${nanoid(12)}`;

      /**
       * 7️⃣ Simpan histori run
       */
      const savedRun = await tx.eLearningCodeRun.create({
        data: {
          id: codeRunId,
          executableId: executableCode.id,
          userId: user.userId,
          input: data.input,
          output: runResult.output,
          error: runResult.error,
          executionTime: runResult.executionTime,
          isSuccess: runResult.isSuccess,
        },
      });

      /**
       * 8️⃣ Return response
       */
      return {
        runId: savedRun.id,
        output: savedRun.output,
        error: savedRun.error,
        executionTime: savedRun.executionTime,
        isSuccess: savedRun.isSuccess,
      };
    });
  }

  static async getRunHistory(
    executableId: string,
    query: {
      limit: number;
      page: number;
      success?: boolean;
      sort: "latest" | "oldest" | "fastest" | "slowest";
    },
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    /**
     * 1️⃣ Ambil executable + relasi sampai course
     */
    const executable = await prisma.eLearningExecutableCode.findUnique({
      where: { id: executableId },
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

    if (!executable) {
      throw new Error("Executable code tidak ditemukan");
    }

    const course = executable.text.subBab.subChapter.course;

    /**
     * 2️⃣ Validasi akses
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error("Akses ditolak: bukan mentor pemilik course");
    }

    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("Akses ditolak: subscription tidak aktif");
      }
    }

    /**
     * 3️⃣ Filter & pagination
     */
    const where: any = {
      executableId,
    };

    // mentee hanya boleh lihat miliknya sendiri
    if (user.roles.includes("mentee")) {
      where.userId = user.userId;
    }

    if (typeof query.success === "boolean") {
      where.isSuccess = query.success;
    }

    const orderByMap: Record<string, any> = {
      latest: { executedAt: "desc" },
      oldest: { executedAt: "asc" },
      fastest: { executionTime: "asc" },
      slowest: { executionTime: "desc" },
    };

    const skip = (query.page - 1) * query.limit;

    const [total, runs] = await Promise.all([
      prisma.eLearningCodeRun.count({ where }),
      prisma.eLearningCodeRun.findMany({
        where,
        orderBy: orderByMap[query.sort],
        skip,
        take: query.limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    /**
     * 4️⃣ Response pagination
     */
    return {
      data: runs,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  static async getRunDetail(
    runId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    /**
     * 1️⃣ Ambil run + relasi sampai course
     */
    const run = await prisma.eLearningCodeRun.findUnique({
      where: { id: runId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        executable: {
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
    });

    if (!run) {
      throw new Error("Run tidak ditemukan");
    }

    const course = run.executable.text.subBab.subChapter.course;

    /**
     * 2️⃣ Validasi akses mentor
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error("Akses ditolak: bukan mentor pemilik course");
    }

    /**
     * 3️⃣ Validasi akses mentee
     */
    if (user.roles.includes("mentee")) {
      if (run.userId !== user.userId) {
        throw new Error("Akses ditolak: hanya boleh melihat run milik sendiri");
      }

      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("Akses ditolak: subscription tidak aktif");
      }
    }

    /**
     * 4️⃣ Response detail (rapi & aman)
     */
    return {
      id: run.id,
      executableId: run.executableId,
      language: run.executable.language,
      input: run.input,
      output: run.output,
      error: run.error,
      isSuccess: run.isSuccess,
      executionTime: run.executionTime,
      executedAt: run.executedAt,
      user: run.user,
      executable: {
        id: run.executable.id,
        title: run.executable.title,
        description: run.executable.description,
      },
    };
  }

  static async getMyCodeRuns(
    params: {
      page: number;
      limit: number;
    },
    user: { userId: string; roles: string[] },
  ) {
    /**
     * 1️⃣ Pastikan mentee & subscription aktif
     */
    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("Akses ditolak: subscription tidak aktif");
      }
    }

    /**
     * 2️⃣ Pagination
     */
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    /**
     * 3️⃣ Ambil data code runs milik user
     */
    const [total, runs] = await Promise.all([
      prisma.eLearningCodeRun.count({
        where: {
          userId: user.userId,
        },
      }),
      prisma.eLearningCodeRun.findMany({
        where: {
          userId: user.userId,
        },
        orderBy: {
          executedAt: "desc",
        },
        skip,
        take: limit,
        include: {
          executable: {
            include: {
              text: {
                include: {
                  subBab: {
                    include: {
                      subChapter: {
                        include: {
                          course: {
                            select: {
                              id: true,
                              title: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    /**
     * 4️⃣ Mapping response (biar rapi & aman)
     */
    const data = runs.map((run) => ({
      id: run.id,
      language: run.executable.language,
      title: run.executable.title,
      isSuccess: run.isSuccess,
      executionTime: run.executionTime,
      executedAt: run.executedAt,
      input: run.input,
      output: run.output,
      error: run.error,
      course: {
        id: run.executable.text.subBab.subChapter.course.id,
        title: run.executable.text.subBab.subChapter.course.title,
      },
    }));

    /**
     * 5️⃣ Return paginated response
     */
    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }
}
