import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  // Publik — dipakai buat isi dropdown filter kategori & form buat/edit
  // artikel, jadi nggak di-guard authenticate. Diurutkan A-Z biar enak
  // dicari di dropdown.
  async getCategories() {
    const categories = await prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      // 🔥 Dipakai FE buat nge-disable tombol delete kalau kategori masih
      // dipakai artikel lain (lihat deleteCategory di bawah).
      articleCount: c._count.articles,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  },

  async createCategory(name: string) {
    const trimmed = name.trim();

    const existing = await prisma.articleCategory.findUnique({
      where: { name: trimmed },
    });
    if (existing) {
      throw new Error("Kategori dengan nama ini sudah ada");
    }

    return prisma.articleCategory.create({ data: { name: trimmed } });
  },

  async updateCategory(id: string, name: string) {
    const trimmed = name.trim();

    const existing = await prisma.articleCategory.findUnique({
      where: { id },
    });
    if (!existing) throw new Error("Kategori tidak ditemukan");

    if (trimmed !== existing.name) {
      const nameTaken = await prisma.articleCategory.findFirst({
        where: { name: trimmed, NOT: { id } },
      });
      if (nameTaken) throw new Error("Kategori dengan nama ini sudah ada");
    }

    return prisma.articleCategory.update({
      where: { id },
      data: { name: trimmed },
    });
  },

  async deleteCategory(id: string) {
    const existing = await prisma.articleCategory.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });
    if (!existing) throw new Error("Kategori tidak ditemukan");

    // 🔥 Kategori yang masih dipakai artikel (draft/published mana pun)
    // sengaja nggak boleh langsung dihapus — biar admin nggak nggak sadar
    // bikin artikel yang masih pakai kategori itu jadi "tanpa kategori".
    // Admin harus pindahin dulu artikelnya ke kategori lain baru bisa hapus.
    if (existing._count.articles > 0) {
      throw new Error(
        `Kategori masih dipakai oleh ${existing._count.articles} artikel, tidak bisa dihapus`,
      );
    }

    await prisma.articleCategory.delete({ where: { id } });
    return { id };
  },

  // 🔥 BARU — detail 1 kategori by id (publik), dipakai halaman
  // /artikel/kategori/[id] biar FE nggak perlu fetch semua kategori cuma
  // buat nampilin nama kategori di breadcrumb & header.
  async getCategoryById(id: string) {
    const category = await prisma.articleCategory.findUnique({
      where: { id },
    });

    if (!category) throw new Error("Kategori tidak ditemukan");

    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  },
};
