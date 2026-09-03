// Helper fetch + tipe data buat semua section di halaman /artikel (publik).
// Endpoint GET di sini PUBLIK (fetch tanpa header auth). Endpoint yang
// butuh login (like, comment, delete comment) pakai axios + cookie
// session (withCredentials) — SAMA pola auth-nya kayak AuthContext.tsx
// (authAxios), bukan Bearer token.

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type ArticleAuthor = {
  id: string;
  fullName: string;
  profilePicture: string | null;
  roles: string[];
};

export type ArticleCategory = {
  id: string;
  name: string;
  description?: string | null;
};

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  isRecommended: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: ArticleAuthor | null;
  category: ArticleCategory | null;
  likeCount?: number;
  commentCount?: number;
};

export type ArticleListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ArticleListResult = {
  items: ArticleListItem[];
  meta: ArticleListMeta;
};

function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Pastikan selalu ada leading slash, biar jadi path lokal yang valid
  // (kalau backend kadang ngirim tanpa slash di depan, misal "uploads/xxx.png")
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

function mapArticleListItem(raw: any): ArticleListItem {
  return {
    ...raw,
    coverImage: resolveImageUrl(raw.coverImage),
    author: raw.author
      ? {
          ...raw.author,
          profilePicture: resolveImageUrl(raw.author.profilePicture),
        }
      : null,
  };
}

export function formatArticleDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCompactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

// 🔥 DIUBAH — dulu pakai array 8 warna Tailwind tetap (hash % 8), jadi
// kalau kategorinya lebih dari 8 pasti ada yang keulang/tabrakan warna.
// Sekarang warnanya di-generate langsung dari hash id kategori sebagai
// HSL (hue 0-360°), jadi tiap kategori dapet warna unik walau jumlahnya
// puluhan (50+) — bukan lagi milih dari daftar terbatas.
export function categoryBadgeColor(categoryId: string): {
  backgroundColor: string;
  color: string;
} {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return {
    backgroundColor: `hsl(${hue}, 85%, 95%)`,
    color: `hsl(${hue}, 65%, 30%)`,
  };
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Gagal mengambil data artikel");
  }
  return json.data as T;
}

export type FetchArticlesParams = {
  page?: number;
  limit?: number;
  categoryId?: string;
  tag?: string;
  search?: string;
  isRecommended?: boolean;
};

export async function fetchArticles(
  params: FetchArticlesParams = {},
): Promise<ArticleListResult> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.tag) qs.set("tag", params.tag);
  if (params.search) qs.set("search", params.search);
  if (params.isRecommended !== undefined)
    qs.set("isRecommended", String(params.isRecommended));

  const result = await getJson<{
    data: any[];
    meta: ArticleListMeta;
  }>(`${API_BASE}/api/article/articles?${qs.toString()}`);

  return {
    items: result.data.map(mapArticleListItem),
    meta: result.meta,
  };
}

export async function fetchArticleCategories(): Promise<ArticleCategory[]> {
  return getJson<ArticleCategory[]>(`${API_BASE}/api/article/categories`);
}

export async function fetchCategoryById(id: string): Promise<ArticleCategory> {
  return getJson<ArticleCategory>(`${API_BASE}/api/article/categories/${id}`);
}

// ── Detail artikel (/artikel/[slug]) ────────────────────────────────────

export type ArticleContentBlockItem = {
  id: string;
  orderNumber: number;
  headingContent?: { level: number; text: string } | null;
  paragraphContent?: { text: string } | null;
  highlightContent?: { text: string } | null;
  dividerContent?: { style: "SOLID" | "DASHED" } | null;
  linkContent?: {
    linkText: string;
    // 🔥 FIX: enum di response backend UPPERCASE (EXTERNAL_URL /
    // ARTICLE_SECTION), bukan lowercase kayak payload input Zod-nya.
    linkType: "EXTERNAL_URL" | "ARTICLE_SECTION";
    externalUrl?: string | null;
    targetContentBlockId?: string | null;
    targetAdditionalContentId?: string | null;
  } | null;
  // 🔥 FIX: cells itu ARRAY OF OBJECT (relasi tabel di DB), bukan array
  // of string — sama persis bentuknya kayak ArticleContentBlockResponse
  // di articleContentMapper.ts punya admin.
  tableContent?: {
    columns: { id: string; header: string; orderNumber: number }[];
    rows: {
      id: string;
      orderNumber: number;
      cells: { id: string; columnId: string; value: string | null }[];
    }[];
  } | null;
  tableOfContentContent?: {
    items: {
      id: string;
      label: string;
      orderNumber: number;
      targetContentBlockId?: string | null;
      targetAdditionalContentId?: string | null;
    }[];
  } | null;
};

export type ArticleAdditionalContentItem = {
  id: string;
  orderNumber: number;
  position: "BEFORE" | "AFTER" | "INLINE";
  imageVideo?: {
    url: string;
    title?: string | null;
    caption?: string | null;
    description?: string | null;
    mediaType: "IMAGE" | "VIDEO";
    thumbnailUrl?: string | null;
    durationSeconds?: number | null;
    widthPercent?: number | null;
  } | null;
};

export type ArticleBlock = {
  id: string;
  orderNumber: number;
  contentBlocks: ArticleContentBlockItem[];
  additionalContents: ArticleAdditionalContentItem[];
};

export type ArticleDetail = Omit<
  ArticleListItem,
  "likeCount" | "commentCount"
> & {
  likeCount: number;
  commentCount: number;
  blocks: ArticleBlock[];
};

function resolveBlocksMedia(blocks: ArticleBlock[]): ArticleBlock[] {
  return blocks.map((block) => ({
    ...block,
    additionalContents: block.additionalContents.map((ac) => ({
      ...ac,
      imageVideo: ac.imageVideo
        ? {
            ...ac.imageVideo,
            url: resolveImageUrl(ac.imageVideo.url) ?? ac.imageVideo.url,
            thumbnailUrl: resolveImageUrl(ac.imageVideo.thumbnailUrl),
          }
        : ac.imageVideo,
    })),
  }));
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleDetail> {
  const raw = await getJson<any>(
    `${API_BASE}/api/article/articles/slug/${slug}`,
  );
  const mapped = mapArticleListItem(raw);
  return {
    ...mapped,
    likeCount: raw.likeCount ?? 0,
    commentCount: raw.commentCount ?? 0,
    blocks: resolveBlocksMedia(raw.blocks ?? []),
  };
}

// ── Endpoint yang butuh login (like, comment, delete comment) ──────────
// 🔥 FIX: pakai cookie session (withCredentials) — SAMA pola authAxios di
// AuthContext.tsx, BUKAN Bearer token di localStorage (project ini nggak
// pakai localStorage token sama sekali).

async function postAuthed<T>(url: string, body?: any): Promise<T> {
  const res = await axios.post(`${API_BASE}${url}`, body, {
    withCredentials: true,
  });
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Gagal memproses permintaan");
  }
  return res.data.data as T;
}

async function deleteAuthed<T>(url: string): Promise<T> {
  const res = await axios.delete(`${API_BASE}${url}`, {
    withCredentials: true,
  });
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Gagal memproses permintaan");
  }
  return res.data.data as T;
}

export async function toggleArticleLike(
  articleId: string,
): Promise<{ liked: boolean; totalLikes: number }> {
  return postAuthed(`/api/article/articles/${articleId}/like`);
}

export async function getArticleLikeStatus(
  articleId: string,
): Promise<{ liked: boolean; totalLikes: number }> {
  const res = await axios.get(
    `${API_BASE}/api/article/articles/${articleId}/like-status`,
    { withCredentials: true },
  );
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Gagal mengambil status like");
  }
  return res.data.data;
}

export type ArticleCommentUser = {
  id: string;
  fullName: string;
  profilePicture: string | null;
};

export type ArticleCommentItem = {
  id: string;
  articleId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ArticleCommentUser;
  totalLikes: number;
  totalReplies: number;
  // Catatan: getComments (endpoint publik) SENGAJA nggak ngirim status
  // like per-user. Status like MILIK USER YANG LOGIN diambil terpisah
  // lewat fetchCommentsLikeStatus() di bawah (sama pola getArticleLikeStatus),
  // supaya endpoint publik ini tetap bisa di-cache/nggak butuh cookie.
  liked?: boolean;
};

// 🔥 BARU — resolver khusus foto profil USER (bukan author artikel).
// Tabel user nyimpen profilePicture sebagai nama file polos yang butuh
// prefix /images/ dulu — SAMA pola profileImage di Navbar.tsx. Dipisah
// dari resolveImageUrl() supaya author/cover artikel yang udah bener
// nggak ikut kena ubah.
function resolveUserAvatarUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}/images/${path}`;
}

export async function fetchComments(
  articleId: string,
): Promise<ArticleCommentItem[]> {
  const raw = await getJson<ArticleCommentItem[]>(
    `${API_BASE}/api/article/articles/${articleId}/comments`,
  );
  return raw.map((c) => ({
    ...c,
    user: {
      ...c.user,
      profilePicture: resolveUserAvatarUrl(c.user?.profilePicture),
    },
  }));
}

// 🔥 BARU — status like komentar MILIK USER YANG SEDANG LOGIN, dipanggil
// terpisah dari fetchComments (publik, dipanggil pakai `fetch` polos
// tanpa cookie). SAMA pola getArticleLikeStatus di atas: pakai axios +
// withCredentials supaya cookie session ikut terkirim, jadi backend tau
// user mana yang lagi minta.
export async function fetchCommentsLikeStatus(
  articleId: string,
): Promise<string[]> {
  const res = await axios.get(
    `${API_BASE}/api/article/articles/${articleId}/comments/like-status`,
    { withCredentials: true },
  );
  if (!res.data?.success) {
    throw new Error(
      res.data?.message || "Gagal mengambil status like komentar",
    );
  }
  return res.data.data;
}

export async function createComment(
  articleId: string,
  content: string,
  parentId?: string,
): Promise<ArticleCommentItem> {
  return postAuthed(`/api/article/articles/${articleId}/comments`, {
    content,
    parentId,
  });
}

export async function toggleCommentLike(
  commentId: string,
): Promise<{ liked: boolean; totalLikes: number }> {
  return postAuthed(`/api/article/comments/${commentId}/like`);
}

export async function deleteComment(
  commentId: string,
): Promise<{ id: string }> {
  return deleteAuthed(`/api/article/comments/${commentId}`);
}
