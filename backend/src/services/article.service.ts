import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

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

const articleDetailInclude = {
  author: { select: { id: true, fullName: true, profilePicture: true } },
  blocks: {
    orderBy: { orderNumber: "asc" as const },
    include: {
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
            include: {
              comments: { orderBy: { orderNumber: "asc" as const } },
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
        category: data.category,
        tags: data.tags || [],
        status: data.status ?? "DRAFT",
        publishedAt,
      },
    });

    return newArticle;
  },

  async getArticles(query: {
    page: number;
    limit: number;
    category?: string;
    tag?: string;
    search?: string;
  }) {
    const { page, limit, category, tag, search } = query;
    const skip = (page - 1) * limit;

    // 🔥 Endpoint list ini publik — cuma artikel PUBLISHED yang boleh
    // nongol di sini, apa pun query yang dikirim. Kalau nanti butuh
    // listing admin (semua status), sebaiknya dibikin endpoint terpisah
    // yang di-guard authenticate + authorizeRoles, bukan nambah parameter
    // status yang bisa dipanggil publik.
    const where: any = { status: "PUBLISHED" };

    if (category) where.category = category;
    if (tag) where.tags = { has: tag };
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
          author: {
            select: { id: true, fullName: true, profilePicture: true },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 🔥 Admin-only (di-guard di route) — makanya nggak difilter status,
  // soalnya dipakai buat load draft/archived ke form edit di CMS.
  async getArticleById(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: articleDetailInclude,
    });

    if (!article) throw new Error("Artikel tidak ditemukan");

    return article;
  },

  // Publik — dipakai buat halaman detail artikel, jadi cuma yang
  // PUBLISHED yang boleh diakses.
  async getArticleBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: articleDetailInclude,
    });

    if (!article || article.status !== "PUBLISHED") {
      // Sengaja disamain pesannya sama kasus "beneran nggak ada" —
      // draft/archived nggak perlu ketahuan exist ke publik.
      throw new Error("Artikel tidak ditemukan");
    }

    return article;
  },

  async updateArticle(id: string, data: any) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new Error("Artikel tidak ditemukan");

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
        category: data.category ?? existing.category,
        tags: data.tags ?? existing.tags,
        status: data.status ?? existing.status,
        publishedAt,
      },
    });

    return updated;
  },

  async deleteArticle(id: string) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new Error("Artikel tidak ditemukan");

    // onDelete: Cascade di schema otomatis ngehapus semua
    // ArticleBlock/ArticleContentBlock/dst di bawah artikel ini.
    await prisma.article.delete({ where: { id } });

    return { id };
  },
};
