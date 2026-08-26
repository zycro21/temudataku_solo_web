"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Undo2,
  Redo2,
  Heading1,
  UploadCloud,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ARTICLE_CATEGORIES } from "@/components/admin/artikel/articleCategories";
import ArticleContentElementsSidebar from "@/components/admin/artikel/ArticleContentElementsSidebar";

// ─── Type dari API ────────────────────────────────────────────────────────────
interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  status: string; // "DRAFT" | "PUBLISHED" (defensif kalau ada data lama)
  isRecommended: boolean;
  author: {
    id: string;
    fullName: string;
    profilePicture: string | null;
    roles: string[];
  } | null;
}

// Role bisa lebih dari satu — prioritas tampilan: Admin > CM > CURDEV.
function getAuthorRoleLabel(roles?: string[] | null): string | null {
  if (!roles || roles.length === 0) return null;
  const lower = roles.map((r) => r.toLowerCase());
  if (lower.includes("admin")) return "Admin";
  if (lower.includes("cm")) return "CM";
  if (lower.includes("curdev")) return "CURDEV";
  return null;
}

// 🔥 BARU: mirror persis fungsi slugify() di article.service.ts backend.
// Validator (updateArticleSchema) nge-cek slug pakai regex ketat
// (/^[a-z0-9]+(?:-[a-z0-9]+)*$/) SEBELUM sempat dinormalisasi backend,
// jadi kalau kita kirim mentah (ada spasi/huruf besar/tanda strip
// ganda), request bisa kena 400. Normalisasi yang sama diterapkan di FE
// sebelum submit, biar nggak pernah gagal validasi cuma gara-gara format.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ArtikelEditorPage() {
  const router = useRouter();
  const params = useParams<{ articleId: string }>();
  const articleId = params.articleId;

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<ArticleDetail | null>(null);

  // ─── Field yang bisa diedit di halaman ini (Article Settings) ──────────
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [isRecommended, setIsRecommended] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [titleEditing, setTitleEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  // 🔥 BARU: panel kanan (Style/Structure/Article Settings) bisa di-minimize
  // sama seperti sidebar kiri.
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const buildCoverUrl = (coverImage: string | null) =>
    coverImage ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${coverImage}` : null;

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${articleId}`,
        { withCredentials: true },
      );
      const data: ArticleDetail = res.data.data;
      setArticle(data);
      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setCategory(data.category ?? "");
      setIsRecommended(data.isRecommended ?? false);
      setCoverFile(null);
      setCoverPreview(buildCoverUrl(data.coverImage));
      setDirty(false);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal memuat artikel",
      );
      router.push("/admin/artikel");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // ─── Tandai "belum disimpan" tiap kali field di atas berubah ───────────
  useEffect(() => {
    if (!article) return;
    const changed =
      title !== (article.title ?? "") ||
      slug !== (article.slug ?? "") ||
      category !== (article.category ?? "") ||
      isRecommended !== (article.isRecommended ?? false) ||
      coverFile !== null;
    setDirty(changed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slug, category, isRecommended, coverFile]);

  // 🔥 BARU: validasi ringan sebelum submit (dipakai Save & Publish/Draft
  // toggle). Slug di-normalisasi otomatis (lihat slugify() di atas) jadi
  // nggak pernah gagal format; kategori cuma wajib pas mau PUBLISH.
  const validateBeforeSubmit = (requireCategory: boolean) => {
    if (requireCategory && !category) {
      toast.error("Kategori wajib diisi sebelum publish");
      return false;
    }
    return true;
  };

  const buildFormData = (statusOverride?: "DRAFT" | "PUBLISHED") => {
    const formData = new FormData();
    formData.append("title", title.trim() || "Artikel Baru");

    // Slug dikirim cuma kalau diisi — kosongkan berarti "biarkan slug lama",
    // sesuai perilaku updateArticleSchema (field opsional).
    const normalizedSlug = slug.trim() ? slugify(slug) : "";
    if (normalizedSlug) formData.append("slug", normalizedSlug);

    // 🔥 FIX: cuma kirim "category" kalau memang diisi. String kosong ""
    // ternyata ke-convert jadi angka 0 oleh middleware validate di backend
    // (Number("") === 0, bukan NaN, jadi ke-anggap "keliatan angka" dan
    // di-coerce) — akibatnya Zod nolak dengan "expected string, received
    // number". Category itu optional di schema, jadi solusinya sama kayak
    // slug: cuma di-append kalau ada isinya.
    if (category) formData.append("category", category);
    formData.append("isRecommended", String(isRecommended));
    if (statusOverride) formData.append("status", statusOverride);
    if (coverFile) formData.append("coverImage", coverFile);
    return formData;
  };

  const applyServerResponse = (data: ArticleDetail) => {
    setArticle(data);
    setSlug(data.slug ?? "");
    setCoverFile(null);
    setCoverPreview(buildCoverUrl(data.coverImage));
    setDirty(false);
  };

  const handleSave = async () => {
    if (!article) return;
    if (!validateBeforeSubmit(false)) return;
    setSaving(true);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${article.id}`,
        buildFormData(),
        { withCredentials: true },
      );
      toast.success("Perubahan berhasil disimpan");
      applyServerResponse(res.data.data);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal menyimpan artikel",
      );
    } finally {
      setSaving(false);
    }
  };

  // 🔥 DIUBAH: dulu tombol ini cuma satu arah (DRAFT -> PUBLISHED, disabled
  // kalau sudah published). Sekarang jadi toggle dua arah — klik "Publish"
  // saat DRAFT akan set PUBLISHED (label lalu berubah jadi "Draft"), dan
  // klik "Draft" saat PUBLISHED akan set balik ke DRAFT (label balik jadi
  // "Publish"). Kategori cuma divalidasi wajib pas mau PUBLISH, bukan pas
  // mau balik ke draft.
  const handlePublishToggle = async () => {
    if (!article) return;
    const nextStatus: "DRAFT" | "PUBLISHED" = isPublished
      ? "DRAFT"
      : "PUBLISHED";
    if (!validateBeforeSubmit(nextStatus === "PUBLISHED")) return;

    setPublishing(true);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${article.id}`,
        buildFormData(nextStatus),
        { withCredentials: true },
      );
      toast.success(
        nextStatus === "PUBLISHED"
          ? "Artikel berhasil dipublikasikan"
          : "Artikel dikembalikan ke draft",
      );
      applyServerResponse(res.data.data);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengubah status artikel",
      );
    } finally {
      setPublishing(false);
    }
  };

  // 🔥 Preview konten lengkap baru akurat setelah fitur konten artikel
  // (heading/paragraph/dst) dibuat — draft juga belum bisa diakses lewat
  // endpoint publik (getArticleBySlug cuma balikin yang PUBLISHED). Untuk
  // sekarang cukup notifikasi placeholder.
  const handlePreview = () => {
    toast.info("Preview akan tersedia setelah fitur konten artikel dibuat");
  };

  const handleCoverFile = (file: File | null) => {
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const cancelCoverFile = () => {
    setCoverFile(null);
    setCoverPreview(buildCoverUrl(article?.coverImage ?? null));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!article) return null;

  const roleLabel = getAuthorRoleLabel(article.author?.roles);
  const isPublished = article.status === "PUBLISHED";

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b bg-white px-5 py-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/admin/artikel")}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          {titleEditing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setTitleEditing(false)}
              className="text-sm font-medium text-gray-800 border-b border-emerald-400 focus:outline-none px-1 py-0.5 max-w-md"
            />
          ) : (
            <button
              onClick={() => setTitleEditing(true)}
              className="flex items-center gap-2 min-w-0 group"
            >
              <span className="text-sm font-medium text-gray-800 truncate max-w-md">
                {title || "Tanpa judul"}
              </span>
              <Pencil
                size={13}
                className="text-gray-400 group-hover:text-gray-600 shrink-0"
              />
            </button>
          )}

          {/* 🔥 Undo/redo placeholder — history editor baru relevan setelah
              fitur konten artikel (drag & drop block) ada. */}
          <div className="flex items-center gap-1 ml-2 text-gray-300">
            <button disabled className="p-1.5 rounded-md cursor-not-allowed">
              <Undo2 size={16} />
            </button>
            <button disabled className="p-1.5 rounded-md cursor-not-allowed">
              <Redo2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              dirty
                ? "border-amber-300 text-amber-600 bg-amber-50"
                : "border-emerald-300 text-emerald-600 bg-emerald-50"
            }`}
          >
            {dirty ? "Belum disimpan" : "Tersimpan"}
          </span>

          <button
            onClick={handlePreview}
            className="border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="border border-emerald-500 text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Save"}
          </button>
          <button
            onClick={handlePublishToggle}
            disabled={publishing}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {publishing
              ? isPublished
                ? "Mengembalikan ke draft..."
                : "Mempublikasikan..."
              : isPublished
                ? "Draft"
                : "Publish"}
          </button>
        </div>
      </div>

      {/* ── BODY: 3 kolom ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Content Elements — sidebar terpisah, lihat
            ArticleContentElementsSidebar.tsx. Klik elemen masih placeholder
            (drag & drop konten sungguhan = tahap berikutnya). */}
        <ArticleContentElementsSidebar
          onAddElement={() =>
            toast.info(
              "Fitur drag & drop konten artikel akan hadir di update berikutnya",
            )
          }
        />

        {/* CENTER: Canvas (placeholder, fitur konten = tahap berikutnya) */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
          <div className="text-center max-w-xs">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Heading1 size={28} className="text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Start building your article
            </p>
            <p className="text-xs text-gray-400">
              Drag and drop elements from the left sidebar.
            </p>
          </div>
        </div>

        {/* RIGHT: Style / Structure (placeholder) + Article Settings (aktif) */}
        <div className="relative h-full shrink-0 flex">
          {/* 🔥 BARU: tombol collapse/expand — mengambang setengah nempel di
              garis border kiri panel ini, arah panahnya kebalikan dari
              sidebar kiri karena panel ini "terbuka ke kiri". */}
          <button
            onClick={() => setRightPanelOpen((v) => !v)}
            aria-label={rightPanelOpen ? "Minimize panel" : "Expand panel"}
            className="absolute top-1/2 -left-3 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 hover:border-emerald-300 transition-colors"
          >
            {rightPanelOpen ? (
              <ChevronRight size={12} className="text-gray-500" />
            ) : (
              <ChevronLeft size={12} className="text-gray-500" />
            )}
          </button>

          <div
            className={`border-l bg-white overflow-hidden h-full transition-all duration-200 ease-in-out ${
              rightPanelOpen ? "w-80" : "w-0 border-l-0"
            }`}
          >
            {/* Lebar konten dikunci 320px biar transisinya "slide out" rapi,
                sama seperti sidebar kiri. */}
            <div className="w-80 h-full overflow-y-auto">
              {/* Style — placeholder, nunggu fitur konten */}
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Style</h3>
                <p className="text-[11px] text-gray-400 mb-3">
                  Override the appearance of selected content
                </p>
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-6 text-center">
                  <p className="text-[11px] text-gray-400 px-4">
                    Pilih salah satu elemen konten untuk mengatur style-nya.
                    Tersedia setelah fitur konten artikel dibuat.
                  </p>
                </div>
              </div>

              {/* Structure — placeholder, nunggu fitur konten */}
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold text-gray-800">
                  Structure
                </h3>
                <p className="text-[11px] text-gray-400 mb-3">
                  Organize sections and content hierarchy
                </p>
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-6 text-center">
                  <p className="text-[11px] text-gray-400 px-4">
                    Belum ada konten di artikel ini.
                  </p>
                </div>
              </div>

              {/* Article Settings — terhubung ke endpoint article yang sudah ada */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Article Settings
                </h3>
                <p className="text-[11px] text-gray-400 mb-4">
                  Set article details and recommendations
                </p>

                <div className="space-y-4">
                  {/* Author — read-only. Backend updateArticle belum menerima
                  authorId, jadi reassign penulis belum didukung; kalau
                  butuh ini, perlu endpoint tambahan buat list user
                  admin/cm/curdev + field authorId di updateArticle. */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Author
                    </label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                      <span className="text-sm text-gray-700 truncate">
                        {article.author?.fullName ?? "-"}
                      </span>
                      {roleLabel && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          ({roleLabel})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    >
                      <option value="">Select category</option>
                      {ARTICLE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="contoh-slug-artikel"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <p className="mt-1 text-[10px] text-gray-400">
                      Dipakai di URL publik artikel. Otomatis dirapikan (huruf
                      kecil, tanda strip) saat disimpan.
                    </p>
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Thumbnail Image
                    </label>
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        handleCoverFile(e.dataTransfer.files?.[0] ?? null);
                      }}
                      className={`flex flex-col items-center justify-center gap-1.5 border border-dashed rounded-lg py-6 cursor-pointer transition ${
                        dragActive
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleCoverFile(e.target.files?.[0] ?? null)
                        }
                      />
                      <UploadCloud size={18} className="text-gray-400" />
                      <p className="text-[11px] text-gray-500 text-center px-3">
                        Upload or drag and drop files here
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Supported format: JPG, PNG, max 2MB
                      </p>
                      {/* 🔥 BARU: rasio yang dipakai buat preview & thumbnail
                      artikel adalah 16:9 (standar thumbnail kebanyakan
                      platform) — dikasih tau di sini biar admin upload
                      gambar dengan komposisi yang pas, nggak kepotong aneh. */}
                      <p className="text-[10px] text-gray-400">
                        Rasio yang direkomendasikan: 16:9 (mis. 1280×720px)
                      </p>
                    </label>

                    {coverPreview && (
                      // 🔥 DIUBAH: dulu box preview cuma h-28 (tinggi tetap,
                      // bukan rasio beneran) — sekarang pakai aspect-video
                      // (rasio 16:9 asli Tailwind) supaya preview-nya benar-benar
                      // mencerminkan crop 16:9 yang bakal dipakai sebagai
                      // thumbnail, bukan cuma persegi panjang acak.
                      <div className="mt-3 relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={coverPreview}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Tombol batal cuma muncul kalau ada file baru yang
                        BELUM disimpan — bukan buat hapus cover lama yang
                        sudah tersimpan (backend belum punya jalur hapus
                        cover tanpa menggantinya dengan file baru). */}
                        {coverFile && (
                          <button
                            onClick={cancelCoverFile}
                            className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white rounded-full p-1 text-gray-500"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recommended */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecommended}
                      onChange={(e) => setIsRecommended(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                    />
                    <span className="text-sm text-gray-700">
                      Set as Recommended Article
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
