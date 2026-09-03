import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

// ─── Tipe konten (disesuaikan dengan revisi skema) ──────────────────────────
// Dihapus: accordion, carousel, content_card, tab_navigation, summary.
// Ditambahkan: divider, table, link, table_of_content.
//
// `key` (opsional di SEMUA tipe, termasuk image_video) dan
// `targetKey`/`targetContentBlockId` (target content) atau
// `targetMediaKey`/`targetAdditionalContentId` (target gambar/video) di
// link & table_of_content adalah mekanisme buat nge-resolve target —
// lihat comment di createContentBlockShells/finalizePendingContents di
// bawah buat penjelasan lengkap.

type HeadingContentInput = {
  type: "heading";
  key?: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  orderNumber?: number;
};
type ParagraphContentInput = {
  type: "paragraph";
  key?: string;
  text: string;
  orderNumber?: number;
};
type HighlightContentInput = {
  type: "highlight";
  key?: string;
  text: string;
  orderNumber?: number;
};
type DividerContentInput = {
  type: "divider";
  key?: string;
  style?: "SOLID" | "DASHED";
  orderNumber?: number;
};
type TableContentInput = {
  type: "table";
  key?: string;
  orderNumber?: number;
  columns: { header: string }[];
  rows: { cells: (string | null | undefined)[] }[];
};
type LinkContentInput = {
  type: "link";
  key?: string;
  orderNumber?: number;
  linkText: string;
  linkType: "external_url" | "article_section";
  externalUrl?: string;
  targetKey?: string;
  targetContentBlockId?: string;
  targetMediaKey?: string;
  targetAdditionalContentId?: string;
};
type TableOfContentContentInput = {
  type: "table_of_content";
  key?: string;
  orderNumber?: number;
  items: {
    label: string;
    orderNumber: number;
    targetKey?: string;
    targetContentBlockId?: string;
    targetMediaKey?: string;
    targetAdditionalContentId?: string;
  }[];
};

type BlockContentInput =
  | HeadingContentInput
  | ParagraphContentInput
  | HighlightContentInput
  | DividerContentInput
  | TableContentInput
  | LinkContentInput
  | TableOfContentContentInput;

type AdditionalContentInput = {
  type: "image_video"; 
  key?: string;
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
      dividerContent: true,
      linkContent: true,
      tableContent: {
        include: {
          columns: { orderBy: { orderNumber: "asc" as const } },
          rows: {
            orderBy: { orderNumber: "asc" as const },
            include: { cells: true },
          },
        },
      },
      tableOfContentContent: {
        include: { items: { orderBy: { orderNumber: "asc" as const } } },
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

// ─── Target resolution (Link & Table of Content) ────────────────────────────
// Target boleh nunjuk ke 2 macam hal:
//   1. Content block lain (heading/paragraph/table/divider/dll)
//   2. Additional content — gambar/video (ArticleAdditionalContent)
// masing-masing punya jalur "key" (target di request yang sama) dan
// "id" (target yang sudah ada di DB) sendiri-sendiri, makanya ada 2 pasang
// keyMap+validTargetIds yang jalan paralel: satu buat content block, satu
// buat media.
//
// Proses create-nya tetap 2 tahap sama kayak sebelumnya:
//   Tahap 1 (createContentBlockShells + createAdditionalContents) — bikin
//     SEMUA ArticleContentBlock & ArticleAdditionalContent (termasuk detail
//     heading/paragraph/table/divider/image_video-nya), KECUALI detail
//     link & table_of_content yang ditunda ke Tahap 2. Tiap content/media
//     yang punya `key` didaftarkan ke keyMap masing-masing.
//   Tahap 2 (finalizePendingContents) — baru bikin detail link & TOC,
//     resolve target-nya lewat salah satu dari 2 pasang keyMap/validIds
//     di atas, tergantung field target mana yang diisi client.

type PendingContent =
  | { kind: "link"; contentBlockId: string; input: LinkContentInput }
  | { kind: "toc"; contentBlockId: string; input: TableOfContentContentInput };

type TargetMaps = {
  contentKeyMap: Map<string, string>;
  mediaKeyMap: Map<string, string>;
  validContentTargetIds: Set<string>;
  validMediaTargetIds: Set<string>;
};

function createEmptyTargetMaps(): TargetMaps {
  return {
    contentKeyMap: new Map(),
    mediaKeyMap: new Map(),
    validContentTargetIds: new Set(),
    validMediaTargetIds: new Set(),
  };
}

// "Isi salah satu pasangan" — content ATAU media, bukan dua-duanya/kosong.
// Sudah divalidasi di Zod juga, tapi tetap dicek di sini sebagai jaga-jaga
// terakhir sebelum nyentuh DB.
function resolveTarget(
  maps: TargetMaps,
  input: {
    targetKey?: string;
    targetContentBlockId?: string;
    targetMediaKey?: string;
    targetAdditionalContentId?: string;
  },
): {
  targetContentBlockId: string | null;
  targetAdditionalContentId: string | null;
} {
  const wantsContent = !!(input.targetKey || input.targetContentBlockId);
  const wantsMedia = !!(
    input.targetMediaKey || input.targetAdditionalContentId
  );

  if (wantsContent === wantsMedia) {
    throw new Error(
      "Target wajib diisi salah satu: content block (targetKey/targetContentBlockId) atau media (targetMediaKey/targetAdditionalContentId), tidak boleh dua-duanya atau kosong",
    );
  }

  if (wantsContent) {
    const id = input.targetKey
      ? maps.contentKeyMap.get(input.targetKey)
      : input.targetContentBlockId;

    if (!id || !maps.validContentTargetIds.has(id)) {
      throw new Error(
        `Target content "${input.targetKey ?? input.targetContentBlockId}" tidak ditemukan`,
      );
    }
    return { targetContentBlockId: id, targetAdditionalContentId: null };
  }

  const mediaId = input.targetMediaKey
    ? maps.mediaKeyMap.get(input.targetMediaKey)
    : input.targetAdditionalContentId;

  if (!mediaId || !maps.validMediaTargetIds.has(mediaId)) {
    throw new Error(
      `Target media "${input.targetMediaKey ?? input.targetAdditionalContentId}" tidak ditemukan`,
    );
  }
  return { targetContentBlockId: null, targetAdditionalContentId: mediaId };
}

async function getExistingContentBlockIds(
  tx: any,
  articleId: string,
): Promise<Set<string>> {
  const rows = await tx.articleContentBlock.findMany({
    where: { block: { articleId } },
    select: { id: true },
  });
  return new Set(rows.map((r: { id: string }) => r.id));
}

async function getExistingAdditionalContentIds(
  tx: any,
  articleId: string,
): Promise<Set<string>> {
  const rows = await tx.articleAdditionalContent.findMany({
    where: { block: { articleId } },
    select: { id: true },
  });
  return new Set(rows.map((r: { id: string }) => r.id));
}

// ─── Tahap 1: bikin content block + detailnya (kecuali link & TOC) ─────────

async function createContentBlockShells(
  tx: any,
  articleBlockId: string,
  contents: BlockContentInput[],
  maps: TargetMaps,
  pending: PendingContent[],
): Promise<void> {
  for (const content of contents) {
    const contentBlock = await tx.articleContentBlock.create({
      data: {
        blockId: articleBlockId,
        type: content.type.toUpperCase() as any,
        orderNumber: content.orderNumber,
      },
    });

    maps.validContentTargetIds.add(contentBlock.id);
    if (content.key) maps.contentKeyMap.set(content.key, contentBlock.id);

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

      case "divider":
        await tx.articleDividerContent.create({
          data: { contentId: contentBlock.id, style: content.style ?? "SOLID" },
        });
        break;

      case "table": {
        const table = await tx.articleTableContent.create({
          data: { contentId: contentBlock.id },
        });

        const columnIds: string[] = [];
        for (let i = 0; i < content.columns.length; i++) {
          const col = await tx.articleTableColumn.create({
            data: {
              tableId: table.id,
              header: content.columns[i].header,
              orderNumber: i + 1,
            },
          });
          columnIds.push(col.id);
        }

        for (let r = 0; r < content.rows.length; r++) {
          const row = await tx.articleTableRow.create({
            data: { tableId: table.id, orderNumber: r + 1 },
          });

          const cells = content.rows[r].cells;
          for (let c = 0; c < columnIds.length; c++) {
            await tx.articleTableCell.create({
              data: {
                rowId: row.id,
                columnId: columnIds[c],
                value: cells[c] ?? null,
              },
            });
          }
        }
        break;
      }

      // Ditunda ke Tahap 2 — belum bikin detailnya di sini, cuma "ngaku"
      // ArticleContentBlock shell-nya sudah ada (biar bisa jadi target
      // link/TOC lain juga kalau perlu).
      case "link":
        pending.push({
          kind: "link",
          contentBlockId: contentBlock.id,
          input: content,
        });
        break;

      case "table_of_content":
        pending.push({
          kind: "toc",
          contentBlockId: contentBlock.id,
          input: content,
        });
        break;
    }
  }
}

// ─── Tahap 2: baru bikin detail link & table_of_content, target sudah bisa
// di-resolve karena SEMUA content block & media (termasuk dari block lain
// di request yang sama) sudah kebentuk di Tahap 1 ──────────────────────────

async function finalizePendingContents(
  tx: any,
  articleId: string,
  pending: PendingContent[],
  maps: TargetMaps,
): Promise<void> {
  for (const item of pending) {
    if (item.kind === "link") {
      const { input, contentBlockId } = item;

      let targetContentBlockId: string | null = null;
      let targetAdditionalContentId: string | null = null;

      if (input.linkType === "article_section") {
        const resolved = resolveTarget(maps, input);
        targetContentBlockId = resolved.targetContentBlockId;
        targetAdditionalContentId = resolved.targetAdditionalContentId;
      } else if (!input.externalUrl) {
        throw new Error(
          `externalUrl wajib diisi untuk link "${input.linkText}" bertipe external_url`,
        );
      }

      await tx.articleLinkContent.create({
        data: {
          contentId: contentBlockId,
          linkText: input.linkText,
          linkType: input.linkType.toUpperCase() as any,
          externalUrl:
            input.linkType === "external_url" ? input.externalUrl : null,
          targetContentBlockId,
          targetAdditionalContentId,
        },
      });
    } else {
      const { input, contentBlockId } = item;

      let toc;
      try {
        toc = await tx.articleTableOfContentContent.create({
          data: { contentId: contentBlockId, articleId },
        });
      } catch (err: any) {
        if (err.code === "P2002") {
          throw new Error(
            "Artikel ini sudah punya Table of Content — hapus/ubah yang lama dulu sebelum menambahkan yang baru",
          );
        }
        throw err;
      }

      for (const tocItem of input.items) {
        const { targetContentBlockId, targetAdditionalContentId } =
          resolveTarget(maps, tocItem);

        await tx.articleTableOfContentItem.create({
          data: {
            tocId: toc.id,
            label: tocItem.label,
            orderNumber: tocItem.orderNumber,
            targetContentBlockId,
            targetAdditionalContentId,
          },
        });
      }
    }
  }
}

// ─── additionalContents (image_video) — sekarang ikut daftarin `key`-nya
// ke mediaKeyMap, biar bisa jadi target Link/TOC juga ─────────────────────

async function createAdditionalContents(
  tx: any,
  articleBlockId: string,
  additionalContents: AdditionalContentInput[],
  maps: TargetMaps,
  mediaFiles: Express.Multer.File[],
  startMediaFileIndex: number,
): Promise<number> {
  let mediaFileIndex = startMediaFileIndex;

  for (const additional of additionalContents) {
    const additionalContent = await tx.articleAdditionalContent.create({
      data: {
        blockId: articleBlockId,
        type: additional.type.toUpperCase() as any,
        position: additional.position,
        orderNumber: additional.orderNumber,
      },
    });

    maps.validMediaTargetIds.add(additionalContent.id);
    if (additional.key)
      maps.mediaKeyMap.set(additional.key, additionalContent.id);

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
        (total, block) =>
          total + countNewImageVideo(block.additionalContents ?? []),
        0,
      );

      if (mediaFiles.length !== imageVideoCount) {
        throw new Error(
          `Jumlah mediaFiles (${mediaFiles.length}) tidak sesuai jumlah image_video (${imageVideoCount})`,
        );
      }

      // Cascade di schema otomatis hapus ArticleContentBlock,
      // ArticleAdditionalContent, dan semua tabel turunannya — termasuk
      // Table of Content lama kalau ada, jadi slot-nya bebas dipakai lagi.
      await tx.articleBlock.deleteMany({ where: { articleId: id } });

      // full-replace -> nggak ada yang survive dari sebelumnya, maps mulai kosong
      const maps = createEmptyTargetMaps();
      const pending: PendingContent[] = [];

      let mediaFileIndex = 0;

      // Tahap 1 — bikin semua ArticleBlock + content block shells + media
      // dulu (lintas block, biar Link/TOC bisa saling referensi bebas urutan)
      for (const block of data.blocks) {
        const articleBlock = await tx.articleBlock.create({
          data: { articleId: id, orderNumber: block.orderNumber },
        });

        await createContentBlockShells(
          tx,
          articleBlock.id,
          block.contents ?? [],
          maps,
          pending,
        );

        mediaFileIndex = await createAdditionalContents(
          tx,
          articleBlock.id,
          block.additionalContents ?? [],
          maps,
          mediaFiles,
          mediaFileIndex,
        );
      }

      // Tahap 2 — baru resolve & bikin detail Link/TOC
      await finalizePendingContents(tx, id, pending, maps);

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

      // Block baru -> nggak ada yang perlu dihapus, valid target ids tinggal
      // semua content block & media yang SUDAH ADA di artikel ini (buat
      // Link/TOC yang mau nunjuk ke section/media lain lewat *ContentBlockId).
      const maps = createEmptyTargetMaps();
      maps.validContentTargetIds = await getExistingContentBlockIds(
        tx,
        articleId,
      );
      maps.validMediaTargetIds = await getExistingAdditionalContentIds(
        tx,
        articleId,
      );
      const pending: PendingContent[] = [];

      await createContentBlockShells(
        tx,
        articleBlock.id,
        data.contents ?? [],
        maps,
        pending,
      );

      await createAdditionalContents(
        tx,
        articleBlock.id,
        data.additionalContents ?? [],
        maps,
        mediaFiles,
        0,
      );

      // Media & content shells di block ini sudah lengkap -> baru resolve link/TOC
      await finalizePendingContents(tx, articleId, pending, maps);

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
      if (
        data.contents !== undefined ||
        data.additionalContents !== undefined
      ) {
        const imageVideoCount = countNewImageVideo(
          data.additionalContents ?? [],
        );
        if (mediaFiles.length !== imageVideoCount) {
          throw new Error(
            `Jumlah mediaFiles (${mediaFiles.length}) tidak sesuai jumlah image_video (${imageVideoCount})`,
          );
        }

        // Cascade otomatis hapus detail content & media lama (termasuk TOC
        // lama di block ini kalau ada, jadi slotnya bebas dipakai ulang).
        await tx.articleContentBlock.deleteMany({ where: { blockId } });
        await tx.articleAdditionalContent.deleteMany({ where: { blockId } });

        // Ambil ulang valid target ids SETELAH delete di atas, biar content
        // /media yang barusan dihapus otomatis nggak bisa jadi target lagi.
        const maps = createEmptyTargetMaps();
        maps.validContentTargetIds = await getExistingContentBlockIds(
          tx,
          articleId,
        );
        maps.validMediaTargetIds = await getExistingAdditionalContentIds(
          tx,
          articleId,
        );
        const pending: PendingContent[] = [];

        await createContentBlockShells(
          tx,
          blockId,
          data.contents ?? [],
          maps,
          pending,
        );

        await createAdditionalContents(
          tx,
          blockId,
          data.additionalContents ?? [],
          maps,
          mediaFiles,
          0,
        );

        await finalizePendingContents(tx, articleId, pending, maps);
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

      // Cascade otomatis hapus contentBlocks/additionalContents di
      // bawahnya. Link lain yang nunjuk ke content/media di block ini
      // otomatis target-nya jadi NULL (onDelete: SetNull di skema); TOC
      // item yang nunjuk ke sini otomatis ikut kehapus (onDelete: Cascade).
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
