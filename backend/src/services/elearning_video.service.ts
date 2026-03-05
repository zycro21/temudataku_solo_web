import {
  PrismaClient,
  ELearningAnchoredContentType,
  AnchorPosition,
} from "@prisma/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegPath as string);

function getVideoDurationSeconds(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Math.floor(metadata.format.duration || 0));
    });
  });
}

export class ELearningVideoService {
  static async createVideo({
    user,
    subBabId,
    title,
    anchor,
    filePath,
    fileAbsolutePath,
    mimeType,
  }: {
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    };
    subBabId: string;
    title: string;
    anchor: {
      blockId: string;
      position: AnchorPosition;
    };
    filePath: string;
    fileAbsolutePath: string;
    mimeType: string;
  }) {
    // ===============================
    // 1️⃣ Validasi SubBab + Ownership
    // ===============================
    const subBab = await prisma.eLearningSubBab.findUnique({
      where: { id: subBabId },
      include: {
        subChapter: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!subBab) {
      throw new Error("SubBab tidak ditemukan");
    }

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");

    if (isMentor && !isAdmin) {
      if (!user.mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }

      if (subBab.subChapter.course.mentorId !== user.mentorProfileId) {
        throw new Error("Anda tidak berhak menambahkan media di course ini");
      }
    }

    // ===============================
    // 2️⃣ Validasi block
    // ===============================
    const block = await prisma.eLearningTextBlock.findFirst({
      where: {
        id: anchor.blockId,
        text: {
          subBabId,
        },
      },
    });

    if (!block) {
      throw new Error("Block tidak ditemukan pada SubBab ini");
    }

    // ===============================
    // 3️⃣ Tentukan tipe & durasi
    // ===============================
    const isVideo = mimeType.startsWith("video/");
    let durationSeconds = 0;

    if (isVideo) {
      try {
        durationSeconds = await getVideoDurationSeconds(fileAbsolutePath);
        if (!durationSeconds || durationSeconds <= 0) {
          throw new Error("Durasi video tidak valid");
        }
      } catch (err) {
        if (fs.existsSync(fileAbsolutePath)) {
          fs.unlinkSync(fileAbsolutePath);
        }
        throw err;
      }
    }

    // ===============================
    // 4️⃣ Generate ID (VIDEO vs IMAGE)
    // ===============================
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(5).toString("hex");

    const mediaId = isVideo
      ? `elvideo-${formattedDate}-${randomHex}`
      : `elimage-${formattedDate}-${randomHex}`;

    // ===============================
    // 5️⃣ TRANSACTION
    // ===============================
    try {
      return await prisma.$transaction(async (tx) => {
        const video = await tx.eLearningVideo.create({
          data: {
            id: mediaId,
            subBabId,
            title,
            videoUrl: filePath,
            durationSeconds,
            isPreview: false,
          },
        });

        const lastAnchor = await tx.eLearningTextContentAnchor.findFirst({
          where: { blockId: anchor.blockId },
          orderBy: { orderNumber: "desc" },
        });

        const nextOrderNumber = lastAnchor?.orderNumber
          ? lastAnchor.orderNumber + 1
          : 1;

        await tx.eLearningTextContentAnchor.create({
          data: {
            id: `ETAnVi_${nanoid(10)}`,
            blockId: anchor.blockId,
            contentType: ELearningAnchoredContentType.VIDEO,
            contentId: video.id,
            position: anchor.position,
            orderNumber: nextOrderNumber,
          },
        });

        return video;
      });
    } catch (err) {
      if (fs.existsSync(fileAbsolutePath)) {
        fs.unlinkSync(fileAbsolutePath);
      }
      throw err;
    }
  }

  static async getVideosBySubBab({
    user,
    subBabId,
    page,
    limit,
    sortBy,
    sortOrder,
  }: {
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    };
    subBabId: string;
    page: number;
    limit: number;
    sortBy: "orderNumber" | "createdAt" | "title";
    sortOrder: "asc" | "desc";
  }) {
    const now = new Date();

    /**
     * 1️⃣ Validasi SubBab + Course
     */
    const subBab = await prisma.eLearningSubBab.findUnique({
      where: { id: subBabId },
      include: {
        subChapter: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!subBab) {
      throw new Error("SubBab tidak ditemukan");
    }

    /**
     * 2️⃣ RULE AKSES
     */
    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    if (isMentor && !isAdmin) {
      if (!user.mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }

      if (subBab.subChapter.course.mentorId !== user.mentorProfileId) {
        throw new Error("Anda tidak berhak mengakses video pada sub-bab ini");
      }
    }

    if (isMentee) {
      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          startAt: { lte: now },
          endAt: { gt: now },
        },
        orderBy: {
          endAt: "desc",
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Akses ditolak. Anda tidak memiliki subscription aktif."
        );
      }
    }

    /**
     * 3️⃣ Pagination
     */
    const skip = (page - 1) * limit;

    /**
     * ================================
     * 4️⃣ MODE A — SORT BY orderNumber
     * ================================
     */
    if (sortBy === "orderNumber") {
      const anchors = await prisma.eLearningTextContentAnchor.findMany({
        where: {
          contentType: "VIDEO",
          block: {
            text: {
              subBabId,
            },
          },
        },
        orderBy: {
          orderNumber: sortOrder,
        },
        include: {
          block: {
            select: {
              id: true,
              textId: true, // ✅ TAMBAHAN
            },
          },
        },
      });

      const total = anchors.length;

      const pagedAnchors = anchors.slice(skip, skip + limit);
      const videoIds = pagedAnchors.map((a) => a.contentId);

      const videos = await prisma.eLearningVideo.findMany({
        where: {
          id: { in: videoIds },
        },
      });

      const videoMap = new Map(videos.map((v) => [v.id, v]));

      const blockMap = new Map<
        string,
        {
          blockId: string;
          textId: string;
          videos: any[];
        }
      >();

      for (const anchor of pagedAnchors) {
        const video = videoMap.get(anchor.contentId);
        if (!video) continue;

        if (!blockMap.has(anchor.blockId)) {
          blockMap.set(anchor.blockId, {
            blockId: anchor.blockId,
            textId: anchor.block.textId, // ✅ TAMBAHAN
            videos: [],
          });
        }

        blockMap.get(anchor.blockId)!.videos.push({
          ...video,
          anchor: {
            id: anchor.id,
            position: anchor.position,
            orderNumber: anchor.orderNumber,
            createdAt: anchor.createdAt,
          },
        });
      }

      return {
        blocks: Array.from(blockMap.values()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    /**
     * ================================
     * 5️⃣ MODE B — SORT BY VIDEO FIELD
     * ================================
     */
    const [videos, total] = await prisma.$transaction([
      prisma.eLearningVideo.findMany({
        where: { subBabId },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.eLearningVideo.count({
        where: { subBabId },
      }),
    ]);

    const videoIds = videos.map((v) => v.id);

    const anchors = await prisma.eLearningTextContentAnchor.findMany({
      where: {
        contentType: "VIDEO",
        contentId: { in: videoIds },
      },
      include: {
        block: {
          select: {
            id: true,
            textId: true, // ✅ TAMBAHAN
          },
        },
      },
    });

    const anchorMap = new Map(
      anchors.map((a) => [
        a.contentId,
        {
          ...a,
          blockId: a.block.id,
          textId: a.block.textId,
        },
      ])
    );

    return {
      blocks: [
        {
          blockId: null,
          textId: null,
          videos: videos.map((video) => ({
            ...video,
            anchor: anchorMap.get(video.id) ?? null,
          })),
        },
      ],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getVideoById({
    user,
    videoId,
  }: {
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    };
    videoId: string;
  }) {
    const now = new Date();

    /**
     * 1️⃣ Ambil video + relasi sampai course
     */
    const video = await prisma.eLearningVideo.findUnique({
      where: { id: videoId },
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

    if (!video) {
      throw new Error("Video tidak ditemukan");
    }

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    /**
     * 2️⃣ 🔐 RULE AKSES
     */

    // 🧑‍🏫 Mentor → hanya course miliknya
    if (isMentor && !isAdmin) {
      if (!user.mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }

      if (video.subBab.subChapter.course.mentorId !== user.mentorProfileId) {
        throw new Error("Anda tidak berhak mengakses video ini");
      }
    }

    // 👩‍🎓 Mentee → wajib subscription aktif
    if (isMentee) {
      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          startAt: { lte: now },
          endAt: { gt: now },
        },
        orderBy: {
          endAt: "desc",
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Akses ditolak. Anda tidak memiliki subscription aktif."
        );
      }
    }

    /**
     * 3️⃣ Ambil anchor VIDEO (jika ada)
     */
    const anchor = await prisma.eLearningTextContentAnchor.findFirst({
      where: {
        contentType: "VIDEO",
        contentId: video.id,
      },
      include: {
        block: true,
      },
    });

    /**
     * 4️⃣ Return video + anchor
     */
    return {
      ...video,
      anchor: anchor
        ? {
            id: anchor.id,
            blockId: anchor.blockId,
            position: anchor.position,
            orderNumber: anchor.orderNumber,
          }
        : null,
    };
  }

  static async updateVideo({
    user,
    videoId,
    payload,
  }: {
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    };
    videoId: string;
    payload: {
      title?: string;
      isPreview?: boolean;
      anchor?: {
        blockId: string;
        position: AnchorPosition;
        orderNumber?: number;
      };
    };
  }) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil video + relasi course
       */
      const video = await tx.eLearningVideo.findUnique({
        where: { id: videoId },
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

      if (!video) {
        throw new Error("Video tidak ditemukan");
      }

      const isAdmin = user.roles.includes("admin");
      const isMentor = user.roles.includes("mentor");

      /**
       * 2️⃣ Validasi akses mentor
       */
      if (isMentor && !isAdmin) {
        if (!user.mentorProfileId) {
          throw new Error("Mentor profile tidak ditemukan");
        }

        if (video.subBab.subChapter.course.mentorId !== user.mentorProfileId) {
          throw new Error("Tidak berhak mengubah video ini");
        }
      }

      /**
       * 3️⃣ Update metadata video
       */
      const updatedVideo = await tx.eLearningVideo.update({
        where: { id: videoId },
        data: {
          title: payload.title,
          isPreview: payload.isPreview,
        },
      });

      /**
       * 4️⃣ Update anchor VIDEO (jika ada)
       */
      if (payload.anchor) {
        const existingAnchor = await tx.eLearningTextContentAnchor.findFirst({
          where: {
            contentType: "VIDEO",
            contentId: videoId,
          },
        });

        if (!existingAnchor) {
          throw new Error("Anchor video tidak ditemukan");
        }

        const oldBlockId = existingAnchor.blockId;
        const oldOrder = existingAnchor.orderNumber;
        const newBlockId = payload.anchor.blockId;
        const newOrder = payload.anchor.orderNumber;

        /**
         * 5️⃣ Reorder jika orderNumber berubah
         */
        if (
          typeof newOrder === "number" &&
          (newBlockId !== oldBlockId || newOrder !== oldOrder)
        ) {
          // geser di block lama
          if (oldOrder !== null) {
            await tx.eLearningTextContentAnchor.updateMany({
              where: {
                blockId: oldBlockId,
                contentType: "VIDEO",
                orderNumber: {
                  gt: oldOrder,
                },
              },
              data: {
                orderNumber: {
                  decrement: 1,
                },
              },
            });
          }

          // geser di block baru
          await tx.eLearningTextContentAnchor.updateMany({
            where: {
              blockId: newBlockId,
              contentType: "VIDEO",
              orderNumber: {
                gte: newOrder,
              },
            },
            data: {
              orderNumber: {
                increment: 1,
              },
            },
          });
        }

        /**
         * 6️⃣ Update anchor TANPA ganti ID
         */
        await tx.eLearningTextContentAnchor.update({
          where: { id: existingAnchor.id },
          data: {
            blockId: payload.anchor.blockId,
            position: payload.anchor.position,
            orderNumber:
              typeof payload.anchor.orderNumber === "number"
                ? payload.anchor.orderNumber
                : existingAnchor.orderNumber,
          },
        });
      }

      return updatedVideo;
    });
  }

  static async deleteVideo({ videoId }: { videoId: string }) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil video
       */
      const video = await tx.eLearningVideo.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new Error("Video tidak ditemukan");
      }

      const { videoUrl } = video;

      /**
       * 2️⃣ Ambil anchor VIDEO
       */
      const anchor = await tx.eLearningTextContentAnchor.findFirst({
        where: {
          contentType: "VIDEO",
          contentId: videoId,
        },
      });

      /**
       * 3️⃣ HAPUS FILE VIDEO (TIDAK DIUBAH)
       */
      if (videoUrl) {
        const filename = videoUrl.replace("/uploads/elearning/videos/", "");

        const filePath = path.join(
          __dirname,
          "../../uploads/elearning/videos",
          filename
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      /**
       * 4️⃣ HAPUS RECORD VIDEO
       */
      await tx.eLearningVideo.delete({
        where: { id: videoId },
      });

      /**
       * 5️⃣ HAPUS ANCHOR + RAPiKAN ORDER
       */
      if (anchor && anchor.orderNumber !== null) {
        const { blockId, orderNumber } = anchor;

        /**
         * Geser anchor VIDEO lain dalam block yang sama
         */
        await tx.eLearningTextContentAnchor.updateMany({
          where: {
            blockId,
            contentType: "VIDEO",
            orderNumber: {
              gt: orderNumber,
            },
          },
          data: {
            orderNumber: {
              decrement: 1,
            },
          },
        });

        /**
         * Hapus anchor video
         */
        await tx.eLearningTextContentAnchor.delete({
          where: { id: anchor.id },
        });
      }

      return { id: videoId };
    });
  }

  static async reorderVideos({
    user,
    subBabId,
    blockId,
    orders,
  }: {
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    };
    subBabId: string;
    blockId: string;
    orders: { videoId: string; orderNumber: number }[];
  }) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil SubBab + relasi course
       */
      const subBab = await tx.eLearningSubBab.findUnique({
        where: { id: subBabId },
        include: {
          subChapter: {
            include: { course: true },
          },
        },
      });

      if (!subBab) {
        throw new Error("SubBab tidak ditemukan");
      }

      /**
       * 2️⃣ Validasi hak akses
       */
      const isAdmin = user.roles.includes("admin");
      const isMentor = user.roles.includes("mentor");

      if (isMentor && !isAdmin) {
        if (!user.mentorProfileId) {
          throw new Error("Mentor profile tidak ditemukan");
        }

        if (subBab.subChapter.course.mentorId !== user.mentorProfileId) {
          throw new Error("Tidak berhak mengatur video ini");
        }
      }

      /**
       * 3️⃣ Ambil SEMUA anchor dalam block (VIDEO + INTERACTIVE)
       */
      const allAnchors = await tx.eLearningTextContentAnchor.findMany({
        where: { blockId },
        orderBy: { orderNumber: "asc" },
      });

      if (allAnchors.length === 0) {
        throw new Error("Tidak ada konten pada block ini");
      }

      /**
       * 4️⃣ Ambil anchor VIDEO saja
       */
      const videoAnchors = allAnchors.filter((a) => a.contentType === "VIDEO");

      if (videoAnchors.length === 0) {
        throw new Error("Tidak ada video pada block ini");
      }

      /**
       * 5️⃣ WAJIB kirim semua video dalam block
       */
      if (orders.length !== videoAnchors.length) {
        throw new Error("Harus mengirim seluruh video dalam block yang sama");
      }

      const videoAnchorMap = new Map(videoAnchors.map((a) => [a.contentId, a]));

      /**
       * 6️⃣ Validasi videoId milik block
       */
      for (const o of orders) {
        if (!videoAnchorMap.has(o.videoId)) {
          throw new Error(`Video ${o.videoId} tidak berada pada block ini`);
        }
      }

      /**
       * 7️⃣ Validasi orderNumber VIDEO (unik saja, TIDAK perlu 1..N)
       */
      const orderNumbers = orders.map((o) => o.orderNumber);

      if (new Set(orderNumbers).size !== orderNumbers.length) {
        throw new Error("orderNumber video tidak boleh duplikat");
      }

      /**
       * 8️⃣ Map VIDEO yang direorder
       */
      const videoOrderMap = new Map(
        orders.map((o) => [o.videoId, o.orderNumber])
      );

      /**
       * 9️⃣ Update orderNumber sementara (VIDEO saja)
       */
      const updatedAnchors = allAnchors.map((anchor) => {
        if (
          anchor.contentType === "VIDEO" &&
          videoOrderMap.has(anchor.contentId)
        ) {
          return {
            ...anchor,
            orderNumber: videoOrderMap.get(anchor.contentId)!,
          };
        }
        return anchor;
      });

      /**
       * 🔟 Sort ulang semua anchor berdasarkan orderNumber
       */
      updatedAnchors.sort(
        (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
      );

      /**
       * 1️⃣1️⃣ Normalize ulang orderNumber GLOBAL (1..N)
       */
      for (let i = 0; i < updatedAnchors.length; i++) {
        await tx.eLearningTextContentAnchor.update({
          where: { id: updatedAnchors[i].id },
          data: { orderNumber: i + 1 },
        });
      }

      return {
        subBabId,
        blockId,
        totalAnchors: updatedAnchors.length,
        totalVideos: videoAnchors.length,
      };
    });
  }

  static async togglePreview({
    user,
    videoId,
    isPreview,
  }: {
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    };
    videoId: string;
    isPreview: boolean;
  }) {
    const video = await prisma.eLearningVideo.findUnique({
      where: { id: videoId },
      include: {
        subBab: {
          include: {
            subChapter: { include: { course: true } },
          },
        },
      },
    });

    if (!video) throw new Error("Video tidak ditemukan");

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");

    if (isMentor && !isAdmin) {
      if (!user.mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }
      if (video.subBab.subChapter.course.mentorId !== user.mentorProfileId) {
        throw new Error("Tidak berhak mengubah preview video ini");
      }
    }

    return prisma.eLearningVideo.update({
      where: { id: videoId },
      data: { isPreview },
    });
  }

  static async getVideoForPlayer(
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
    videoId: string
  ) {
    /**
     * 1️⃣ Ambil video
     */
    const video = await prisma.eLearningVideo.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new Error("Video tidak ditemukan");
    }

    /**
     * 2️⃣ Validasi subscription mentee (jika bukan preview)
     */
    const isMentee = user.roles.includes("mentee");

    if (isMentee && !video.isPreview) {
      const activeSub = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          endAt: { gt: new Date() },
        },
      });

      if (!activeSub) {
        throw new Error("Akses ditolak. Subscription tidak aktif");
      }
    }

    /**
     * 3️⃣ Ambil anchor VIDEO milik video ini
     */
    const anchor = await prisma.eLearningTextContentAnchor.findFirst({
      where: {
        contentType: "VIDEO",
        contentId: video.id,
      },
    });

    // video TANPA anchor → tidak punya prev/next
    if (!anchor || anchor.orderNumber == null) {
      return {
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl,
        durationSeconds: video.durationSeconds,
        isPreview: video.isPreview,
        prevVideoId: null,
        nextVideoId: null,
      };
    }

    /**
     * 4️⃣ Cari anchor sebelumnya & berikutnya
     *     (SATU BLOCK, SATU ALUR)
     */
    const prevAnchor = await prisma.eLearningTextContentAnchor.findFirst({
      where: {
        blockId: anchor.blockId,
        contentType: "VIDEO",
        orderNumber: {
          lt: anchor.orderNumber,
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
    });

    const nextAnchor = await prisma.eLearningTextContentAnchor.findFirst({
      where: {
        blockId: anchor.blockId,
        contentType: "VIDEO",
        orderNumber: {
          gt: anchor.orderNumber,
        },
      },
      orderBy: {
        orderNumber: "asc",
      },
    });

    return {
      id: video.id,
      title: video.title,
      videoUrl: video.videoUrl,
      durationSeconds: video.durationSeconds,
      isPreview: video.isPreview,
      prevVideoId: prevAnchor?.contentId ?? null,
      nextVideoId: nextAnchor?.contentId ?? null,
    };
  }

  static async moveVideo({
    user,
    videoId,
    payload,
  }: {
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    };
    videoId: string;
    payload: {
      targetBlockId: string;
      position: AnchorPosition;
      orderNumber?: number;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil video + relasi course
       */
      const video = await tx.eLearningVideo.findUnique({
        where: { id: videoId },
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

      if (!video) {
        throw new Error("Video tidak ditemukan");
      }

      const isAdmin = user.roles.includes("admin");
      const isMentor = user.roles.includes("mentor");

      /**
       * 2️⃣ Validasi akses mentor
       */
      if (isMentor && !isAdmin) {
        if (!user.mentorProfileId) {
          throw new Error("Mentor profile tidak ditemukan");
        }

        if (video.subBab.subChapter.course.mentorId !== user.mentorProfileId) {
          throw new Error("Tidak berhak memindahkan video ini");
        }
      }

      /**
       * 3️⃣ Ambil anchor video (WAJIB ADA)
       */
      const anchor = await tx.eLearningTextContentAnchor.findFirst({
        where: {
          contentType: "VIDEO",
          contentId: videoId,
        },
      });

      if (!anchor) {
        throw new Error("Anchor video tidak ditemukan");
      }

      const oldBlockId = anchor.blockId;
      const oldOrder = anchor.orderNumber;

      const newBlockId = payload.targetBlockId;

      /**
       * 4️⃣ Validasi block tujuan
       */
      const targetBlock = await tx.eLearningTextBlock.findUnique({
        where: { id: newBlockId },
      });

      if (!targetBlock) {
        throw new Error("Block tujuan tidak ditemukan");
      }

      /**
       * 5️⃣ Tentukan orderNumber baru
       */
      let newOrder = payload.orderNumber;

      if (typeof newOrder !== "number") {
        const lastAnchor = await tx.eLearningTextContentAnchor.findFirst({
          where: {
            blockId: newBlockId,
            contentType: "VIDEO",
          },
          orderBy: {
            orderNumber: "desc",
          },
        });

        newOrder = lastAnchor?.orderNumber ? lastAnchor.orderNumber + 1 : 1;
      }

      /**
       * 6️⃣ Jika pindah posisi / block → reorder aman
       */
      const isSameBlock = oldBlockId === newBlockId;
      const isSameOrder = oldOrder === newOrder;

      if (!isSameBlock || !isSameOrder) {
        /**
         * A. Tutup celah di block lama
         */
        if (oldOrder !== null) {
          await tx.eLearningTextContentAnchor.updateMany({
            where: {
              blockId: oldBlockId,
              contentType: "VIDEO",
              orderNumber: {
                gt: oldOrder,
              },
            },
            data: {
              orderNumber: {
                decrement: 1,
              },
            },
          });
        }

        /**
         * B. Buka slot di block baru
         */
        await tx.eLearningTextContentAnchor.updateMany({
          where: {
            blockId: newBlockId,
            contentType: "VIDEO",
            orderNumber: {
              gte: newOrder,
            },
          },
          data: {
            orderNumber: {
              increment: 1,
            },
          },
        });
      }

      /**
       * 7️⃣ Update anchor TANPA GANTI ID
       */
      const updatedAnchor = await tx.eLearningTextContentAnchor.update({
        where: { id: anchor.id },
        data: {
          blockId: newBlockId,
          position: payload.position,
          orderNumber: newOrder,
        },
      });

      return {
        videoId: video.id,
        anchor: updatedAnchor,
      };
    });
  }

  static async getVideosByBlock({
    user,
    blockId,
  }: {
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    };
    blockId: string;
  }) {
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

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    /**
     * 2️⃣ Validasi akses mentor
     */
    if (isMentor && !isAdmin) {
      if (!user.mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }

      if (course.mentorId !== user.mentorProfileId) {
        throw new Error("Tidak berhak mengakses video pada block ini");
      }
    }

    /**
     * 3️⃣ Validasi subscription mentee
     */
    if (isMentee && !isAdmin) {
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
        orderBy: {
          endAt: "desc",
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Akses ditolak. Anda tidak memiliki subscription aktif."
        );
      }
    }

    /**
     * 4️⃣ Ambil anchor VIDEO + join video
     */
    const anchors = await prisma.eLearningTextContentAnchor.findMany({
      where: {
        blockId,
        contentType: "VIDEO",
      },
      include: {
        block: false,
      },
      orderBy: {
        orderNumber: "asc",
      },
    });

    /**
     * 5️⃣ Ambil data video sekaligus
     */
    const videoIds = anchors.map((a) => a.contentId);

    if (videoIds.length === 0) {
      return [];
    }

    const videos = await prisma.eLearningVideo.findMany({
      where: {
        id: {
          in: videoIds,
        },
      },
    });

    /**
     * 6️⃣ Mapping anchor → video (aman & terurut)
     */
    const videoMap = new Map(videos.map((v) => [v.id, v]));

    const result = anchors
      .filter((anchor) => videoMap.has(anchor.contentId))
      .map((anchor) => ({
        anchor: {
          id: anchor.id,
          blockId: anchor.blockId,
          position: anchor.position,
          orderNumber: anchor.orderNumber,
        },
        video: videoMap.get(anchor.contentId)!,
      }));

    return result;
  }
}
