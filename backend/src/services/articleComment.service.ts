import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const commentAuthorSelect = {
  id: true,
  fullName: true,
  profilePicture: true,
} as const;

export default {
  async createComment(
    articleId: string,
    userId: string,
    content: string,
    parentId?: string,
  ) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article || article.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    if (parentId) {
      const parent = await prisma.articleComment.findUnique({
        where: { id: parentId },
      });
      if (!parent || parent.deletedAt || parent.articleId !== articleId) {
        throw new Error("Komentar induk tidak ditemukan");
      }
    }

    const comment = await prisma.articleComment.create({
      data: { articleId, userId, content, parentId: parentId ?? null },
      include: { user: { select: commentAuthorSelect } },
    });

    return {
      id: comment.id,
      articleId: comment.articleId,
      parentId: comment.parentId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      totalLikes: 0,
      totalReplies: 0,
    };
  },

  async getComments(articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article || article.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    const comments = await prisma.articleComment.findMany({
      where: { articleId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: commentAuthorSelect },
        _count: { select: { likes: true, replies: true } },
      },
    });

    return comments.map((c) => ({
      id: c.id,
      articleId: c.articleId,
      parentId: c.parentId,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: c.user,
      totalLikes: c._count.likes,
      totalReplies: c._count.replies,
    }));
  },

  async toggleCommentLike(commentId: string, userId: string) {
    const comment = await prisma.articleComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.deletedAt) {
      throw new Error("Komentar tidak ditemukan");
    }

    const existing = await prisma.articleCommentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing) {
      await prisma.articleCommentLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.articleCommentLike.create({ data: { commentId, userId } });
    }

    const totalLikes = await prisma.articleCommentLike.count({
      where: { commentId },
    });

    return { liked: !existing, totalLikes };
  },

  // 🔥 BARU — daftar ID komentar (di artikel ini) yang SUDAH di-like oleh
  // user yang sedang login. Dipisah dari getComments (yang publik/tanpa
  // auth) SAMA PERSIS pola getArticleLikeStatus di articleLike.service.ts
  // — endpoint publik cuma balikin data agregat (totalLikes), sedangkan
  // status "sudah like atau belum" MILIK USER TERTENTU diambil lewat
  // endpoint terpisah yang butuh login. Ini yang bikin status like
  // artikel tetap kegambar bener setelah refresh, tapi status like
  // komentar sebelumnya nggak — komentar belum punya endpoint ini.
  async getCommentsLikeStatus(articleId: string, userId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article || article.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    const likes = await prisma.articleCommentLike.findMany({
      where: {
        userId,
        comment: { articleId, deletedAt: null },
      },
      select: { commentId: true },
    });

    return likes.map((l) => l.commentId);
  },

  // 🔥 BARU — hapus komentar/reply MILIK SENDIRI (soft delete, sama pola
  // deleteArticle). Reply di bawahnya TETAP ada (nggak ikut kehapus),
  // tapi karena getComments cuma nampilin yang deletedAt: null, komentar
  // yang dihapus ini otomatis hilang dari list — reply-nya sendiri tetap
  // tampil (FE nge-treat reply yang parent-nya udah nggak ada di list
  // sebagai komentar top-level, lihat ArticleComments.tsx).
  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.articleComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.deletedAt) {
      throw new Error("Komentar tidak ditemukan");
    }
    if (comment.userId !== userId) {
      throw new Error("Anda tidak dapat menghapus komentar milik orang lain");
    }

    await prisma.articleComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { id: commentId };
  },
};
