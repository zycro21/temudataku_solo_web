import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

type BlockContentInput =
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      text: string;
      orderNumber?: number;
    }
  | { type: "paragraph"; text: string; orderNumber?: number }
  | { type: "highlight"; text: string; orderNumber?: number }
  | {
      type: "accordion";
      title: string;
      description?: string;
      orderNumber?: number;
      items: { title: string; content: string; orderNumber: number }[];
    }
  | {
      type: "carousel";
      title: string;
      description?: string;
      cardsPerSlide?: number;
      orderNumber?: number;
      items: {
        title: string;
        image?: string;
        content?: string;
        orderNumber: number;
      }[];
    }
  | {
      type: "content_card";
      title: string;
      description?: string;
      disableExpandableContent: boolean;
      orderNumber?: number;
      items: {
        title: string;
        content: string;
        expandableContent?: string;
        orderNumber: number;
      }[];
    }
  | {
      type: "tab_navigation";
      title: string;
      description?: string;
      orderNumber?: number;
      tabs: { title: string; content: string; orderNumber: number }[];
    }
  | { type: "summary"; orderNumber?: number; comments: string[] };

type AdditionalContentInput = {
  type: "image_video";
  position: "BEFORE" | "AFTER" | "INLINE";
  orderNumber?: number;
  isNewUpload: boolean;
  content: {
    url?: string;
    title?: string;
    caption?: string;
    description?: string;
    mediaType: "IMAGE" | "VIDEO";
    thumbnailUrl?: string;
    durationSeconds?: number;
    widthPercent?: number;
  };
};

type BlockInput = {
  orderNumber: number;
  contents?: BlockContentInput[];
  additionalContents?: AdditionalContentInput[];
};

type SingleBlockInput = {
  orderNumber?: number;
  contents?: BlockContentInput[];
  additionalContents?: AdditionalContentInput[];
};

export type UpdateArticleContentInput = {
  blocks: BlockInput[];
};

// ─── Include shapes, dipakai ulang di semua operasi read ───────────────────

const blockDetailInclude = {
  contentBlocks: {
    orderBy: { orderNumber: "asc" as const },
    include: {
      headingContent: true,
      paragraphContent: true,
      highlightContent: true,
      accordionContent: {
        include: { items: { orderBy: { orderNumber: "asc" as const } } },
      },
      carouselContent: {
        include: { items: { orderBy: { orderNumber: "asc" as const } } },
      },
      contentCardContent: {
        include: { items: { orderBy: { orderNumber: "asc" as const } } },
      },
      tabContent: {
        include: { tabs: { orderBy: { orderNumber: "asc" as const } } },
      },
      summaryContent: {
        include: { comments: { orderBy: { orderNumber: "asc" as const } } },
      },
    },
  },
  additionalContents: {
    orderBy: { orderNumber: "asc" as const },
    include: { imageVideo: true },
  },
};

const articleContentDetailInclude = {
  blocks: {
    orderBy: { orderNumber: "asc" as const },
    include: blockDetailInclude,
  },
};

// ─── Helper bersama: bikin contents + additionalContents untuk SATU block ──
// Dipakai oleh updateArticleContent (bulk-replace), createArticleBlock, dan
// updateArticleBlock — supaya switch-case per tipe konten nggak diduplikat
// di 3 tempat berbeda. Mengembalikan index mediaFiles terakhir yang sudah
// terpakai, buat dilanjutkan kalau ada block berikutnya dalam loop yang sama.
async function createBlockContents(
  tx: any,
  articleBlockId: string,
  contents: BlockContentInput[],
  additionalContents: AdditionalContentInput[],
  mediaFiles: Express.Multer.File[],
  startMediaFileIndex: number,
): Promise<number> {
  let mediaFileIndex = startMediaFileIndex;

  for (const content of contents) {
    const contentBlock = await tx.articleContentBlock.create({
      data: {
        blockId: articleBlockId,
        type: content.type.toUpperCase() as any,
        orderNumber: content.orderNumber,
      },
    });

    switch (content.type) {
      case "heading":
        await tx.articleHeadingContent.create({
          data: {
            contentId: contentBlock.id,
            level: content.level,
            text: content.text,
          },
        });
        break;

      case "paragraph":
        await tx.articleParagraphContent.create({
          data: { contentId: contentBlock.id, text: content.text },
        });
        break;

      case "highlight":
        await tx.articleHighlightContent.create({
          data: { contentId: contentBlock.id, text: content.text },
        });
        break;

      case "accordion": {
        const acc = await tx.articleAccordionContent.create({
          data: {
            contentId: contentBlock.id,
            title: content.title,
            description: content.description,
          },
        });
        for (const item of content.items) {
          await tx.articleAccordionItem.create({
            data: {
              accordionId: acc.id,
              title: item.title,
              content: item.content,
              orderNumber: item.orderNumber,
            },
          });
        }
        break;
      }

      case "carousel": {
        const car = await tx.articleCarouselContent.create({
          data: {
            contentId: contentBlock.id,
            title: content.title,
            description: content.description,
            cardsPerSlide: content.cardsPerSlide,
          },
        });
        for (const item of content.items) {
          await tx.articleCarouselItem.create({
            data: {
              carouselId: car.id,
              title: item.title,
              image: item.image,
              content: item.content,
              orderNumber: item.orderNumber,
            },
          });
        }
        break;
      }

      case "content_card": {
        const card = await tx.articleContentCardContent.create({
          data: {
            contentId: contentBlock.id,
            title: content.title,
            description: content.description,
            disableExpandableContent: content.disableExpandableContent,
          },
        });
        for (const item of content.items) {
          await tx.articleContentCardItem.create({
            data: {
              cardId: card.id,
              title: item.title,
              content: item.content,
              expandableContent: item.expandableContent,
              orderNumber: item.orderNumber,
            },
          });
        }
        break;
      }

      case "tab_navigation": {
        const tab = await tx.articleTabNavigationContent.create({
          data: {
            contentId: contentBlock.id,
            title: content.title,
            description: content.description,
          },
        });
        for (const item of content.tabs) {
          await tx.articleTabItem.create({
            data: {
              tabId: tab.id,
              title: item.title,
              content: item.content,
              orderNumber: item.orderNumber,
            },
          });
        }
        break;
      }

      case "summary": {
        const summary = await tx.articleSummaryContent.create({
          data: { contentId: contentBlock.id },
        });
        for (let i = 0; i < content.comments.length; i++) {
          await tx.articleSummaryComment.create({
            data: {
              summaryId: summary.id,
              comment: content.comments[i],
              orderNumber: i + 1,
            },
          });
        }
        break;
      }
    }
  }

  for (const additional of additionalContents) {
    // Cuma image_video yang didukung sebagai additional content artikel.
    const additionalContent = await tx.articleAdditionalContent.create({
      data: {
        blockId: articleBlockId,
        type: additional.type.toUpperCase() as any,
        position: additional.position,
        orderNumber: additional.orderNumber,
      },
    });

    let finalUrl: string;

    if (additional.isNewUpload) {
      const uploadedMedia = mediaFiles[mediaFileIndex++];
      if (!uploadedMedia) {
        throw new Error(
          `File media untuk "${additional.content.title ?? "(tanpa judul)"}" tidak ditemukan`,
        );
      }
      finalUrl = `/uploads/articleMediaContents/${uploadedMedia.filename}`;
    } else {
      if (!additional.content.url) {
        throw new Error(
          `url wajib diisi untuk media "${additional.content.title ?? "(tanpa judul)"}" yang tidak diupload ulang`,
        );
      }
      finalUrl = additional.content.url;
    }

    await tx.articleImageVideoContent.create({
      data: {
        additionalContentId: additionalContent.id,
        url: finalUrl,
        title: additional.content.title,
        caption: additional.content.caption,
        description: additional.content.description,
        mediaType: additional.content.mediaType,
        thumbnailUrl: additional.content.thumbnailUrl,
        durationSeconds: additional.content.durationSeconds,
        widthPercent: additional.content.widthPercent ?? 100,
      },
    });
  }

  return mediaFileIndex;
}

function countNewImageVideo(additionalContents: AdditionalContentInput[]) {
  return additionalContents.filter(
    (item) => item.type === "image_video" && item.isNewUpload === true,
  ).length;
}

export default {
  // ── PUT /articles/:id/content — full-replace semua block ────────────────
  async updateArticleContent(
    id: string,
    data: UpdateArticleContentInput,
    mediaFiles: Express.Multer.File[],
  ) {
    return prisma.$transaction(async (tx: any) => {
      const existing = await tx.article.findUnique({ where: { id } });
      if (!existing) throw new Error("Artikel tidak ditemukan");

      const imageVideoCount = data.blocks.reduce(
        (total, block) => total + countNewImageVideo(block.additionalContents ?? []),
        0,
      );

      if (mediaFiles.length !== imageVideoCount) {
        throw new Error(
          `Jumlah mediaFiles (${mediaFiles.length}) tidak sesuai jumlah image_video (${imageVideoCount})`,
        );
      }

      // Cascade di schema otomatis hapus ArticleContentBlock,
      // ArticleAdditionalContent, dan semua tabel turunannya.
      await tx.articleBlock.deleteMany({ where: { articleId: id } });

      let mediaFileIndex = 0;

      for (const block of data.blocks) {
        const articleBlock = await tx.articleBlock.create({
          data: { articleId: id, orderNumber: block.orderNumber },
        });

        mediaFileIndex = await createBlockContents(
          tx,
          articleBlock.id,
          block.contents ?? [],
          block.additionalContents ?? [],
          mediaFiles,
          mediaFileIndex,
        );
      }

      return tx.article.findUnique({
        where: { id },
        include: articleContentDetailInclude,
      });
    });
  },

  // ── GET /articles/:id/content/blocks — list semua block sebuah artikel ──
  async getArticleBlocks(articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article) throw new Error("Artikel tidak ditemukan");

    return prisma.articleBlock.findMany({
      where: { articleId },
      orderBy: { orderNumber: "asc" },
      include: blockDetailInclude,
    });
  },

  // ── GET /articles/:id/content/blocks/:blockId — detail 1 block ─────────
  async getArticleBlockById(articleId: string, blockId: string) {
    const block = await prisma.articleBlock.findUnique({
      where: { id: blockId },
      include: blockDetailInclude,
    });

    if (!block || block.articleId !== articleId) {
      throw new Error("Block tidak ditemukan");
    }

    return block;
  },

  // ── POST /articles/:id/content/blocks — tambah 1 block baru ────────────
  async createArticleBlock(
    articleId: string,
    data: SingleBlockInput,
    mediaFiles: Express.Multer.File[],
  ) {
    return prisma.$transaction(async (tx: any) => {
      const article = await tx.article.findUnique({
        where: { id: articleId },
      });
      if (!article) throw new Error("Artikel tidak ditemukan");

      const imageVideoCount = countNewImageVideo(data.additionalContents ?? []);
      if (mediaFiles.length !== imageVideoCount) {
        throw new Error(
          `Jumlah mediaFiles (${mediaFiles.length}) tidak sesuai jumlah image_video (${imageVideoCount})`,
        );
      }

      const totalBlocks = await tx.articleBlock.count({
        where: { articleId },
      });

      // Kalau orderNumber nggak dikirim -> taruh di posisi paling akhir.
      // Kalau dikirim -> block-block lain yang orderNumber-nya >= posisi
      // itu digeser +1 dulu, biar nggak duplikat/nabrak.
      let orderNumber = data.orderNumber ?? totalBlocks + 1;
      if (orderNumber < 1) orderNumber = 1;
      if (orderNumber > totalBlocks + 1) orderNumber = totalBlocks + 1;

      if (orderNumber <= totalBlocks) {
        await tx.articleBlock.updateMany({
          where: { articleId, orderNumber: { gte: orderNumber } },
          data: { orderNumber: { increment: 1 } },
        });
      }

      const articleBlock = await tx.articleBlock.create({
        data: { articleId, orderNumber },
      });

      await createBlockContents(
        tx,
        articleBlock.id,
        data.contents ?? [],
        data.additionalContents ?? [],
        mediaFiles,
        0,
      );

      return tx.articleBlock.findUnique({
        where: { id: articleBlock.id },
        include: blockDetailInclude,
      });
    });
  },

  // ── PATCH /articles/:id/content/blocks/:blockId — update 1 block ───────
  async updateArticleBlock(
    articleId: string,
    blockId: string,
    data: SingleBlockInput,
    mediaFiles: Express.Multer.File[],
  ) {
    return prisma.$transaction(async (tx: any) => {
      const existingBlock = await tx.articleBlock.findUnique({
        where: { id: blockId },
      });
      if (!existingBlock || existingBlock.articleId !== articleId) {
        throw new Error("Block tidak ditemukan");
      }

      // Reorder dulu kalau orderNumber berubah (samain pola shift yang
      // dipakai updateText buat reorder teks dalam sub-bab).
      if (
        data.orderNumber !== undefined &&
        data.orderNumber !== existingBlock.orderNumber
      ) {
        const oldOrder = existingBlock.orderNumber as number;
        const newOrder = data.orderNumber;

        const totalBlocks = await tx.articleBlock.count({
          where: { articleId },
        });

        if (newOrder < 1 || newOrder > totalBlocks) {
          throw new Error("orderNumber tidak valid");
        }

        if (newOrder < oldOrder) {
          await tx.articleBlock.updateMany({
            where: {
              articleId,
              orderNumber: { gte: newOrder, lt: oldOrder },
            },
            data: { orderNumber: { increment: 1 } },
          });
        } else {
          await tx.articleBlock.updateMany({
            where: {
              articleId,
              orderNumber: { gt: oldOrder, lte: newOrder },
            },
            data: { orderNumber: { decrement: 1 } },
          });
        }

        await tx.articleBlock.update({
          where: { id: blockId },
          data: { orderNumber: newOrder },
        });
      }

      // Ganti isi block ini aja (bukan seluruh artikel) kalau
      // contents/additionalContents dikirim.
      if (data.contents !== undefined || data.additionalContents !== undefined) {
        const imageVideoCount = countNewImageVideo(
          data.additionalContents ?? [],
        );
        if (mediaFiles.length !== imageVideoCount) {
          throw new Error(
            `Jumlah mediaFiles (${mediaFiles.length}) tidak sesuai jumlah image_video (${imageVideoCount})`,
          );
        }

        await tx.articleContentBlock.deleteMany({ where: { blockId } });
        await tx.articleAdditionalContent.deleteMany({ where: { blockId } });

        await createBlockContents(
          tx,
          blockId,
          data.contents ?? [],
          data.additionalContents ?? [],
          mediaFiles,
          0,
        );
      }

      return tx.articleBlock.findUnique({
        where: { id: blockId },
        include: blockDetailInclude,
      });
    });
  },

  // ── DELETE /articles/:id/content/blocks/:blockId — hapus 1 block ───────
  async deleteArticleBlock(articleId: string, blockId: string) {
    return prisma.$transaction(async (tx: any) => {
      const existingBlock = await tx.articleBlock.findUnique({
        where: { id: blockId },
      });
      if (!existingBlock || existingBlock.articleId !== articleId) {
        throw new Error("Block tidak ditemukan");
      }

      const deletedOrder = existingBlock.orderNumber as number;

      // Cascade otomatis hapus contentBlocks/additionalContents di bawahnya.
      await tx.articleBlock.delete({ where: { id: blockId } });

      // Rapetin orderNumber block-block sesudahnya biar nggak bolong.
      await tx.articleBlock.updateMany({
        where: { articleId, orderNumber: { gt: deletedOrder } },
        data: { orderNumber: { decrement: 1 } },
      });

      return { id: blockId };
    });
  },
};