import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔥 BARU — like/unlike untuk Article. Satu user cuma boleh punya SATU
// like per artikel (dijaga oleh unique constraint [articleId, userId] di
// schema, model ArticleLike), makanya di sini nggak ada "createLike" dan
// "deleteLike" terpisah — cuma satu fungsi toggle yang otomatis milih:
// belum ada like punya user ini -> buat, sudah ada -> hapus (unlike).
export default {
  async toggleArticleLike(articleId: string, userId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article || article.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    const existing = await prisma.articleLike.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });

    if (existing) {
      await prisma.articleLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.articleLike.create({ data: { articleId, userId } });
    }

    const totalLikes = await prisma.articleLike.count({
      where: { articleId },
    });

    // existing ada -> baru aja DIHAPUS (unlike) -> liked jadi false.
    // existing nggak ada -> baru aja DIBUAT (like) -> liked jadi true.
    return { liked: !existing, totalLikes };
  },

  // Dipakai buat nge-load status like awal pas halaman artikel dibuka
  // (biar ikon hati langsung kegambar terisi/kosong tanpa nunggu user
  // klik dulu) — beda dari toggleArticleLike, ini cuma BACA, nggak
  // ngubah apa-apa.
  async getArticleLikeStatus(articleId: string, userId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article || article.deletedAt) {
      throw new Error("Artikel tidak ditemukan");
    }

    const [existing, totalLikes] = await Promise.all([
      prisma.articleLike.findUnique({
        where: { articleId_userId: { articleId, userId } },
      }),
      prisma.articleLike.count({ where: { articleId } }),
    ]);

    return { liked: !!existing, totalLikes };
  },
};
