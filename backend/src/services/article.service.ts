import { PrismaClient, Prisma, ArticleElementType } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";
import { articleCoverPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 🔥 Hapus file cover lama dari disk. Dipanggil setelah DB update/delete
// berhasil (bukan sebelumnya), supaya kalau operasi DB gagal, file lama
// tetap aman dan tidak ke-hapus sia-sia.
function deleteCoverImageFile(coverImageUrl?: string | null) {
  if (!coverImageUrl) return;

  const filename = path.basename(coverImageUrl);
  const filePath = path.join(articleCoverPath, filename);

  fs.unlink(filePath, (err) => {
    // ENOENT (file memang udah nggak ada) bukan masalah — selain itu, log aja
    // biar ketahuan, tapi jangan sampai bikin request utamanya gagal.
    if (err && (err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Gagal menghapus file cover artikel lama:", err);
    }
  });
}

// 🔥 Disesuaikan dengan revisi skema: accordion/carousel/contentCard/tab/
// summary sudah dihapus (tidak jadi dipakai di artikel). Diganti dengan
// table/divider/link/tableOfContent — 4 tipe ini + heading/paragraph/
// highlight adalah SEMUA jenis content block yang tersisa.
// 🔥 BARU: author sekarang ikut include userRoles -> role.roleName, dipakai
// FE buat nampilin label role (Admin/CM/CURDEV) di kolom Author. Bentuk
// nested Prisma-nya (userRoles: [{ role: { roleName } }]) di-flatten ke
// `roles: string[]` lewat mapAuthorRoles() sebelum dibalikin ke response,
// biar FE nggak perlu tau struktur nested-nya.
const authorSelectWithRoles = {
  id: true,
  fullName: true,
  profilePicture: true,
  userRoles: { select: { role: { select: { roleName: true } } } },
} as const;

function mapAuthorRoles<
  T extends {
    id: string;
    fullName: string;
    profilePicture: string | null;
    userRoles: { role: { roleName: string } }[];
  } | null,
>(author: T) {
  if (!author) return null;
  return {
    id: author.id,
    fullName: author.fullName,
    profilePicture: author.profilePicture,
    roles: author.userRoles.map((ur) => ur.role.roleName),
  };
}

const articleDetailInclude = {
  author: { select: authorSelectWithRoles },
  category: { select: { id: true, name: true } },
  blocks: {
    orderBy: { orderNumber: "asc" as const },
    include: {
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
            include: {
              items: { orderBy: { orderNumber: "asc" as const } },
            },
          },
        },
      },
      additionalContents: {
        orderBy: { orderNumber: "asc" as const },
        include: { imageVideo: true },
      },
    },
  },
  _count: {
    select: {
      likes: true,
      comments: { where: { deletedAt: null } },
    },
  },
};

export default {
  async createArticle(data: any, userId: string) {
    // Generate custom ID — samain gaya dengan ELearningCourse
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
    const randomId = crypto.randomBytes(3).toString("hex");
    const articleId = `article-${formattedDate}-${randomId}`;

    // Slug: pakai yang dikirim user (di-normalize), atau generate dari title
    let slug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!slug) slug = articleId;

    const existingSlug = await prisma.article.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      // Slug bentrok -> tambah suffix random daripada langsung nolak,
      // biar UX admin lebih ramah (nggak perlu bolak-balik ganti slug manual).
      slug = `${slug}-${crypto.randomBytes(2).toString("hex")}`;
    }

    const publishedAt = data.status === "PUBLISHED" ? new Date() : null;

    const newArticle = await prisma.article.create({
      data: {
        id: articleId,
        authorId: userId,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        tags: data.tags || [],
        status: data.status ?? "DRAFT",
        isRecommended: data.isRecommended ?? false,
        publishedAt,
      },
    });

    return newArticle;
  },

  async getArticles(query: {
    page: number;
    limit: number;
    categoryId?: string;
    tag?: string;
    search?: string;
    isRecommended?: boolean;
  }) {
    const { page, limit, categoryId, tag, search, isRecommended } = query;
    const skip = (page - 1) * limit;

    // 🔥 Endpoint list ini publik — cuma artikel PUBLISHED yang boleh
    // nongol di sini, apa pun query yang dikirim. Kalau nanti butuh
    // listing admin (semua status), sebaiknya dibikin endpoint terpisah
    // yang di-guard authenticate + authorizeRoles, bukan nambah parameter
    // status yang bisa dipanggil publik.
    // 🔥 BARU: deletedAt: null — artikel yang udah di-soft-delete nggak
    // boleh nongol di mana pun buat publik, walau statusnya masih PUBLISHED
    // di DB (soft delete nggak ngubah status, cuma nyetel deletedAt).
    const where: any = { status: "PUBLISHED", deletedAt: null };

    if (categoryId) where.categoryId = categoryId;
    if (tag) where.tags = { has: tag };
    if (isRecommended !== undefined) where.isRecommended = isRecommended;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          author: { select: authorSelectWithRoles },
          category: { select: { id: true, name: true } },
          // 🔥 BARU: jumlah like & komentar buat ditampilin di card FE
          // (❤️ / 💬 di section "Pilihan Bacaan" & per-Kategori).
          // Relasinya diasumsikan bernama `likes` & `comments` di model
          // Article — sama persis pola penamaan yang udah dipakai model
          // ArticleComment buat relasi like-nya sendiri (lihat
          // `_count: { select: { likes: true, replies: true } }` di
          // articleComment.service.ts). Kalau nama relasi di schema kamu
          // ternyata beda, tinggal sesuaikan 2 key di `select` bawah ini.
          _count: {
            select: {
              likes: true,
              // Komentar yang udah di-soft-delete nggak ikut dihitung —
              // sama kayak filter yang dipakai `getComments`.
              comments: { where: { deletedAt: null } },
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      data: data.map((article) => {
        const { _count, ...rest } = article;
        return {
          ...rest,
          author: mapAuthorRoles(article.author),
          likeCount: _count.likes,
          commentCount: _count.comments,
        };
      }),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 🔥 Admin-only (di-guard di route) — nampilin SEMUA status (bukan cuma
  // PUBLISHED kayak getArticles publik di atas), dipakai tabel admin.
  // stats-nya sengaja dihitung dari query TANPA filter where, jadi angkanya
  // selalu total keseluruhan biarpun tabelnya lagi difilter search/status.
  async getArticlesAdmin(query: {
    page: number;
    limit: number;
    search?: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    categoryId?: string;
    isRecommended?: boolean;
    sortBy: "title" | "createdAt" | "updatedAt" | "status";
    sortOrder: "asc" | "desc";
  }) {
    const {
      page,
      limit,
      search,
      status,
      categoryId,
      isRecommended,
      sortBy,
      sortOrder,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (isRecommended !== undefined) where.isRecommended = isRecommended;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        // 🔥 category sekarang relasi (bukan string bebas lagi), jadi
        // search-nya lewat nama kategori terkait.
        { category: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total, statusCounts] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          author: { select: authorSelectWithRoles },
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.article.count({ where }),
      prisma.article.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ]);

    const countFor = (s: string) =>
      statusCounts.find((row) => row.status === s)?._count._all ?? 0;

    return {
      data: data.map((article) => ({
        ...article,
        author: mapAuthorRoles(article.author),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      // 🔥 DIUBAH: status ARCHIVED nggak dipakai lagi di app (cuma DRAFT &
      // PUBLISHED) — "archived" dihapus dari stats, sisanya cukup total,
      // draft, dan published.
      stats: {
        total: statusCounts.reduce((sum, row) => sum + row._count._all, 0),
        draft: countFor("DRAFT"),
        published: countFor("PUBLISHED"),
      },
    };
  },

  // 🔥 Admin-only (di-guard di route) — makanya nggak difilter status,
  // soalnya dipakai buat load draft/archived ke form edit di CMS.
  // 🔥 BARU: artikel yang udah di-soft-delete dianggap "tidak ditemukan"
  // di sini — buat lihat/restore artikel yang di-trash, pakai
  // getTrashedArticleById / endpoint trash yang terpisah.
  async getArticleById(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: articleDetailInclude,
    });

    if (!article || article.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    return {
      ...article,
      author: mapAuthorRoles(article.author),
      likeCount: article._count.likes,
      commentCount: article._count.comments,
    };
  },

  // Publik — dipakai buat halaman detail artikel, jadi cuma yang
  // PUBLISHED yang boleh diakses.
  async getArticleBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: articleDetailInclude,
    });

    if (!article || article.status !== "PUBLISHED" || article.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    return {
      ...article,
      author: mapAuthorRoles(article.author),
      likeCount: article._count.likes,
      commentCount: article._count.comments,
    };
  },

  async updateArticle(id: string, data: any) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      const newSlug = slugify(data.slug);
      const slugTaken = await prisma.article.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });
      if (slugTaken) throw new Error("Slug sudah dipakai artikel lain");
      slug = newSlug;
    }

    // Kalau baru pertama kali di-publish, catat publishedAt sekarang.
    // Kalau sebelumnya udah pernah publish, publishedAt lama dipertahankan
    // (jangan ke-reset tiap kali artikel diedit ulang).
    let publishedAt = existing.publishedAt;
    if (data.status === "PUBLISHED" && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        slug,
        excerpt: data.excerpt ?? existing.excerpt,
        coverImage: data.coverImage ?? existing.coverImage,
        categoryId: data.categoryId ?? existing.categoryId,
        tags: data.tags ?? existing.tags,
        status: data.status ?? existing.status,
        isRecommended: data.isRecommended ?? existing.isRecommended,
        publishedAt,
      },
    });

    // 🔥 Kalau cover diganti dengan yang baru (bukan sekadar nggak dikirim),
    // hapus file cover lama dari disk — dipanggil SETELAH update DB sukses.
    if (data.coverImage && data.coverImage !== existing.coverImage) {
      deleteCoverImageFile(existing.coverImage);
    }

    return updated;
  },

  // 🔥 DIUBAH: soft delete — bukan prisma.article.delete lagi. Artikel cuma
  // ditandai deletedAt, row-nya (dan semua blocks/content di bawahnya)
  // TETAP ada di DB, jadi masih bisa direstore. Karena itu file cover-nya
  // juga sengaja TIDAK dihapus dari disk di sini (baru dihapus beneran di
  // permanentDeleteArticle di bawah).
  async deleteArticle(id: string) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    await prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { id };
  },

  // 🔥 BARU — kembalikan artikel dari trash (deletedAt di-null-kan lagi).
  async restoreArticle(id: string) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new Error("Artikel tidak ditemukan");
    if (!existing.deletedAt) {
      throw new Error("Artikel ini tidak sedang berada di trash");
    }

    const restored = await prisma.article.update({
      where: { id },
      data: { deletedAt: null },
    });

    return restored;
  },

  // 🔥 BARU — hapus PERMANEN, sengaja cuma boleh dipanggil buat artikel
  // yang sudah berstatus soft-deleted (harus di-trash dulu, baru boleh
  // dihapus total) — safety net biar nggak ada delete permanen "sekali
  // klik" yang nggak sengaja.
  async permanentDeleteArticle(id: string) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new Error("Artikel tidak ditemukan");
    if (!existing.deletedAt) {
      throw new Error(
        "Artikel harus dipindahkan ke trash dulu sebelum dihapus permanen",
      );
    }

    // onDelete: Cascade di schema otomatis ngehapus semua
    // ArticleBlock/ArticleContentBlock/dst di bawah artikel ini.
    await prisma.article.delete({ where: { id } });

    // Baru di sini file cover-nya beneran dihapus dari disk.
    deleteCoverImageFile(existing.coverImage);

    return { id };
  },

  // 🔥 BARU — listing artikel yang lagi ada di trash (buat halaman
  // "Sampah"/"Trash" di admin). Pola query mirip getArticlesAdmin.
  async getTrashedArticles(query: {
    page: number;
    limit: number;
    search?: string;
    sortBy: "title" | "createdAt" | "updatedAt" | "status";
    sortOrder: "asc" | "desc";
  }) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: { not: null } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.article.findMany({
        where,
        // Default-nya diurutkan dari yang paling baru dihapus.
        orderBy:
          sortBy === "createdAt" && sortOrder === "desc"
            ? { deletedAt: "desc" }
            : { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          author: { select: authorSelectWithRoles },
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      data: data.map((article) => ({
        ...article,
        author: mapAuthorRoles(article.author),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  // 🔥 BARU — favorite elemen konten artikel per-user (sidebar "Content
  // Elements"). Cuma balikin array elementType-nya aja (bukan seluruh
  // row), soalnya FE cuma butuh tau "elemen mana aja yang di-favorite-in".
  async getElementFavorites(userId: string) {
    const favorites = await prisma.articleElementFavorite.findMany({
      where: { userId },
      select: { elementType: true },
    });

    return favorites.map((f) => f.elementType);
  },

  // Toggle: kalau sudah ada -> hapus (unfavorite), kalau belum -> buat
  // (favorite). Compound unique [userId, elementType] di schema bikin
  // pengecekan "sudah di-favorite-in belum" tinggal satu findUnique.
  async toggleElementFavorite(userId: string, elementType: ArticleElementType) {
    const existing = await prisma.articleElementFavorite.findUnique({
      where: { userId_elementType: { userId, elementType } },
    });

    if (existing) {
      await prisma.articleElementFavorite.delete({
        where: { id: existing.id },
      });
      return { elementType, isFavorite: false };
    }

    await prisma.articleElementFavorite.create({
      data: { userId, elementType },
    });
    return { elementType, isFavorite: true };
  },
};
