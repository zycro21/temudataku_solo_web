import { PrismaClient } from "@prisma/client";
import { newFormId } from "./form_id.js";
import { FormError, type FormActor } from "./form.service.js";
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "../validations/form_category.validation.js";

const prisma = new PrismaClient();

// Jenis form = pengelompokan form (mis. Pendaftaran, Presensi, Feedback).
// Dipisah per tipe (EVENT / NON_EVENT). Daftar jenis dipakai bersama oleh semua
// admin/CM; ubah & hapus hanya untuk admin atau pembuatnya.

function canManageCategory(
  actor: FormActor,
  cat: { createdById: string | null },
) {
  return actor.roles.includes("admin") || cat.createdById === actor.userId;
}

async function getCategoryOrThrow(id: string) {
  const cat = await prisma.formCategory.findUnique({ where: { id } });
  if (!cat) throw new FormError(404, "Jenis form tidak ditemukan");
  return cat;
}

async function assertNameFree(
  type: "EVENT" | "NON_EVENT",
  name: string,
  exceptId?: string,
) {
  const dup = await prisma.formCategory.findFirst({
    where: {
      type,
      name: { equals: name, mode: "insensitive" },
      ...(exceptId && { id: { not: exceptId } }),
    },
    select: { id: true },
  });
  if (dup) {
    throw new FormError(
      409,
      "Jenis dengan nama itu sudah ada di tipe ini",
      "CATEGORY_NAME_TAKEN",
    );
  }
}

function toItem(c: any) {
  const { _count, ...rest } = c;
  return { ...rest, formCount: _count?.forms ?? 0 };
}

// Dipakai createForm: categoryId opsional; kalau diisi harus ada dan tipenya cocok.
export async function assertCategoryMatchesType(
  categoryId: string | null | undefined,
  type: "EVENT" | "NON_EVENT",
): Promise<string | null> {
  if (!categoryId) return null;
  const cat = await prisma.formCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, type: true },
  });
  if (!cat) throw new FormError(400, "Jenis form tidak ditemukan");
  if (cat.type !== type) {
    throw new FormError(400, "Tipe jenis form tidak sesuai dengan tipe form");
  }
  return cat.id;
}

export async function listCategories(
  _actor: FormActor,
  query: ListCategoriesQuery,
) {
  const rows = await prisma.formCategory.findMany({
    where: {
      type: query.type,
      ...(query.search && {
        name: { contains: query.search, mode: "insensitive" },
      }),
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      type: true,
      name: true,
      description: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
      // form yang sudah diarsipkan tidak dihitung
      _count: { select: { forms: { where: { status: { not: "ARCHIVED" } } } } },
    },
  });
  return { items: rows.map(toItem) };
}

export async function createCategory(
  actor: FormActor,
  input: CreateCategoryInput,
) {
  await assertNameFree(input.type, input.name);
  try {
    const created = await prisma.formCategory.create({
      data: {
        id: newFormId("category"),
        type: input.type,
        name: input.name,
        description: input.description?.trim() || null,
        createdById: actor.userId,
      },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { forms: true } },
      },
    });
    return toItem(created);
  } catch (err: any) {
    // dua request bersamaan dengan nama sama: unique (type, name) jadi pengaman
    if (err?.code === "P2002") {
      throw new FormError(
        409,
        "Jenis dengan nama itu sudah ada di tipe ini",
        "CATEGORY_NAME_TAKEN",
      );
    }
    throw err;
  }
}

export async function updateCategory(
  actor: FormActor,
  id: string,
  input: UpdateCategoryInput,
) {
  const cat = await getCategoryOrThrow(id);
  if (!canManageCategory(actor, cat)) {
    throw new FormError(403, "Kamu tidak punya akses ke jenis form ini");
  }
  if (input.name !== undefined && input.name !== cat.name) {
    await assertNameFree(cat.type as "EVENT" | "NON_EVENT", input.name, id);
  }
  try {
    const updated = await prisma.formCategory.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description?.trim() || null,
        }),
      },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { forms: { where: { status: { not: "ARCHIVED" } } } },
        },
      },
    });
    return toItem(updated);
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new FormError(
        409,
        "Jenis dengan nama itu sudah ada di tipe ini",
        "CATEGORY_NAME_TAKEN",
      );
    }
    throw err;
  }
}

export async function deleteCategory(actor: FormActor, id: string) {
  const cat = await getCategoryOrThrow(id);
  if (!canManageCategory(actor, cat)) {
    throw new FormError(403, "Kamu tidak punya akses ke jenis form ini");
  }
  // Hitung semua form (termasuk arsip): FK-nya Restrict, jadi form arsip pun menahan
  const used = await prisma.form.count({ where: { categoryId: id } });
  if (used > 0) {
    throw new FormError(
      409,
      `Jenis masih dipakai ${used} form, pindahkan atau hapus form tersebut dulu`,
      "CATEGORY_IN_USE",
    );
  }
  await prisma.formCategory.delete({ where: { id } });
  return { id };
}
