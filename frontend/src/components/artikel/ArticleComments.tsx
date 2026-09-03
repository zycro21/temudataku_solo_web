"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import {
  ArticleCommentItem,
  createComment,
  deleteComment,
  fetchComments,
  fetchCommentsLikeStatus,
  formatArticleDate,
  toggleCommentLike,
} from "@/components/artikel/articleApi";
// 🔥 BARU — dipakai buat nampilin foto + nama akun yang lagi login di
// atas kotak "tulis komentar" (lihat bagian render di bawah).
import { useAuth } from "@/context/AuthContext";

const REPLIES_PREVIEW_COUNT = 3;
// 🔥 BARU — komen top-level (bukan reply) default cuma nampilin 15,
// sisanya di-collapse di balik tombol "Tampilkan Lebih Banyak" (sama
// pola kayak balasan per-thread di bawah, gaya YouTube).
const BASE_COMMENTS_PREVIEW_COUNT = 15;

// 🔥 Duplikat dari pola isValidImageSrc di ArticleDetail.tsx — supaya
// avatar komentar konsisten dengan avatar author (validasi src + fallback
// inisial huruf kalau gambar gagal/kosong).
function isValidImageSrc(src?: string | null): src is string {
  return (
    !!src &&
    (src.startsWith("/") ||
      src.startsWith("http://") ||
      src.startsWith("https://"))
  );
}

// 🔥 BARU — resolver avatar untuk USER YANG SEDANG LOGIN (dari
// AuthContext), SAMA PERSIS pola profileImage di Navbar.tsx: kalau belum
// ada foto pakai default, kalau udah full URL pakai apa adanya, kalau
// masih nama file polos prefix-in /images/.
function resolveCurrentUserAvatarUrl(
  profilePicture?: string | null,
): string | null {
  if (!profilePicture) return null;
  if (profilePicture.startsWith("http")) return profilePicture;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${profilePicture}`;
}

type CommentNode = ArticleCommentItem & { children: CommentNode[] };

// 🔥 BARU — total semua balasan nested di bawah satu base comment
// (bukan cuma direct children), dipakai buat label tombol
// "Lihat N Balasan" versi mobile.
function countAllReplies(node: CommentNode): number {
  return node.children.reduce(
    (sum, child) => sum + 1 + countAllReplies(child),
    0,
  );
}

// 🔥 BARU — deteksi viewport mobile (di bawah breakpoint `md` Tailwind
// = 768px). Dipakai buat ganti behavior preview balasan: batas 3 +
// tombol per-thread cuma buat desktop, di mobile semua balasan
// di-collapse di balik satu tombol langsung di base comment.
function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpointPx]);

  return isMobile;
}

function buildTree(flat: ArticleCommentItem[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));

  const roots: CommentNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      // Top-level ATAU parent-nya udah kehapus (nggak ada lagi di list) —
      // tetap ditampilkan sebagai top-level daripada ilang begitu aja.
      roots.push(node);
    }
  });
  return roots;
}

function CommentAvatar({ name, src }: { name: string; src: string | null }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <div className="h-9 w-9 shrink-0">
      {isValidImageSrc(src) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-9 w-9 rounded-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = "none";
            const parent = img.parentElement;
            if (parent) {
              const fallback = document.createElement("div");
              fallback.className =
                "h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium";
              fallback.textContent = initial;
              parent.appendChild(fallback);
            }
          }}
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
          {initial}
        </div>
      )}
    </div>
  );
}

function CommentThread({
  node,
  currentUserId,
  likedIds,
  onToggleLike,
  onReplySubmit,
  onDelete,
  depth = 0,
  isLastReply = false,
  isMobile,
  mobileForceExpanded = false,
}: {
  node: CommentNode;
  currentUserId?: string;
  likedIds: Set<string>;
  onToggleLike: (id: string) => void;
  onReplySubmit: (parentId: string, content: string) => Promise<void>;
  onDelete: (id: string) => void;
  depth?: number;
  isLastReply?: boolean;
  isMobile: boolean;
  // 🔥 BARU — di mobile, cuma base comment (depth 0) yang punya tombol
  // sendiri. Kalau base-nya udah "expanded", flag ini diturunin ke semua
  // keturunannya (rekursif) supaya seluruh thread ikut kebuka tanpa
  // batas 3 dan tanpa tombol per-thread lagi.
  mobileForceExpanded?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  // 🔥 BARU — behavior beda antara mobile & desktop:
  // - Desktop: tiap thread nampilin maks REPLIES_PREVIEW_COUNT (3) balasan,
  //   sisanya di balik tombol "Lihat N Balasan Lainnya" per-thread (perilaku
  //   lama, nggak berubah).
  // - Mobile: nggak ada batas 3 sama sekali. Base comment (depth 0) yang
  //   punya satu tombol "Lihat N Balasan" — begitu dipencet, seluruh
  //   subtree di bawahnya kebuka penuh (diturunin lewat mobileForceExpanded).
  const childMobileForceExpanded = isMobile
    ? depth === 0
      ? showAllReplies
      : mobileForceExpanded
    : false;

  const visibleReplies = isMobile
    ? childMobileForceExpanded
      ? node.children
      : []
    : showAllReplies
      ? node.children
      : node.children.slice(0, REPLIES_PREVIEW_COUNT);
  const hiddenCount = isMobile
    ? 0
    : node.children.length - visibleReplies.length;
  const totalNestedReplies = countAllReplies(node);
  const isLiked = likedIds.has(node.id);

  const handleReplySubmit = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onReplySubmit(node.id, trimmed);
      setReplyText("");
      setReplying(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Tentukan jarak berdasarkan depth dan posisi
  let marginClass = "mt-10 first:mt-0"; // default untuk base comment
  if (depth > 0) {
    if (isLastReply) {
      // Reply terakhir dalam satu thread - jarak sedang
      marginClass = "mt-4";
    } else {
      // Reply yang masih dalam satu thread - jarak kecil
      marginClass = "mt-3";
    }
  }

  return (
    <div
      className={
        depth > 0
          ? `${marginClass} pl-8 border-l-2 border-gray-100`
          : marginClass
      }
    >
      {/* Baris foto profil + nama + tanggal */}
      <div className="flex items-center gap-3">
        <CommentAvatar
          name={node.user?.fullName ?? "Pengguna"}
          src={node.user?.profilePicture ?? null}
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {node.user?.fullName ?? "Pengguna"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {formatArticleDate(node.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {node.content}
        </p>

        <div className="mt-2 flex items-center gap-3 text-xs">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-300 px-3 py-1">
            <button
              onClick={() => onToggleLike(node.id)}
              className={`flex items-center gap-1 font-medium transition cursor-pointer ${
                isLiked
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-emerald-600"
              }`}
            >
              <Heart size={13} className={isLiked ? "fill-emerald-600" : ""} />
              {node.totalLikes}
            </button>
            <span className="h-3 w-px bg-emerald-200" />
            <span className="flex items-center gap-1 text-gray-500">
              <MessageCircle size={13} />
              {node.totalReplies}
            </span>
          </div>

          <button
            onClick={() => setReplying((v) => !v)}
            className="font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer transition"
          >
            Reply
          </button>
          {currentUserId && node.user?.id === currentUserId && (
            <button
              onClick={() => onDelete(node.id)}
              className="font-medium text-red-400 hover:text-red-600 cursor-pointer transition"
            >
              Hapus
            </button>
          )}
        </div>

        {replying && (
          <div className="mt-3 flex items-start gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Balas ${node.user?.fullName ?? "komentar ini"}...`}
              rows={2}
              className="flex-1 rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-emerald-400"
            />
            <button
              onClick={handleReplySubmit}
              disabled={submitting || !replyText.trim()}
              className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60 cursor-pointer"
            >
              Submit
            </button>
          </div>
        )}

        {/* Replies */}
        <div className="space-y-0">
          {visibleReplies.map((child, index) => {
            const isLast = index === visibleReplies.length - 1;
            return (
              <CommentThread
                key={child.id}
                node={child}
                currentUserId={currentUserId}
                likedIds={likedIds}
                onToggleLike={onToggleLike}
                onReplySubmit={onReplySubmit}
                onDelete={onDelete}
                depth={depth + 1}
                isLastReply={isLast}
                isMobile={isMobile}
                mobileForceExpanded={childMobileForceExpanded}
              />
            );
          })}
        </div>

        {/* Desktop — tombol per-thread, batas 3 balasan */}
        {!isMobile && hiddenCount > 0 && (
          <button
            onClick={() => setShowAllReplies(true)}
            className="mt-3 text-xs font-medium text-emerald-600 hover:underline cursor-pointer"
          >
            Lihat {hiddenCount} Balasan Lainnya
          </button>
        )}
        {!isMobile &&
          showAllReplies &&
          node.children.length > REPLIES_PREVIEW_COUNT && (
            <button
              onClick={() => setShowAllReplies(false)}
              className="mt-3 text-xs font-medium text-emerald-600 hover:underline cursor-pointer"
            >
              Tampilkan Lebih Sedikit
            </button>
          )}

        {/* 🔥 BARU — Mobile: satu tombol di base comment aja (kalau ada
            balasan sama sekali), nggak ada batas 3 & nggak ada tombol
            per-thread di reply anak-anaknya. */}
        {isMobile && depth === 0 && node.children.length > 0 && (
          <button
            onClick={() => setShowAllReplies((v) => !v)}
            className="mt-3 text-xs font-medium text-emerald-600 hover:underline cursor-pointer"
          >
            {showAllReplies
              ? "Tampilkan Lebih Sedikit "
              : `Lihat ${totalNestedReplies} Balasan`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ArticleComments({
  articleId,
  currentUserId,
}: {
  articleId: string;
  currentUserId?: string;
}) {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [comments, setComments] = useState<ArticleCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAllBaseComments, setShowAllBaseComments] = useState(false);

  const loadComments = async () => {
    try {
      const result = await fetchComments(articleId);
      setComments(result);
    } catch (err) {
      console.error("Gagal memuat komentar:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIX — status like komentar MILIK USER YANG LOGIN diambil lewat
  // endpoint terpisah (butuh cookie session), SAMA pola status like
  // artikel di ArticleDetail.tsx. Sebelumnya ini nyoba dibaca dari field
  // `liked` di response getComments (yang publik, dipanggil pakai
  // `fetch` polos tanpa cookie) — makanya nggak pernah kekirim & ikon
  // hati selalu balik ke abu-abu abis refresh walau totalLikes-nya bener.
  const loadLikedIds = async () => {
    if (!currentUserId) {
      setLikedIds(new Set());
      return;
    }
    try {
      const likedCommentIds = await fetchCommentsLikeStatus(articleId);
      setLikedIds(new Set(likedCommentIds));
    } catch (err) {
      console.error("Gagal memuat status like komentar:", err);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // 🔥 FIX — dipisah dari effect di atas dan tergantung `currentUserId`
  // juga: saat komponen pertama kali mount, AuthContext masih `loading`
  // sehingga `currentUserId` awalnya `undefined`. Tanpa dependency ini,
  // status like komentar cuma dicoba sekali sebelum login-nya "kebaca",
  // sehingga selalu kosong walau usernya sebenernya sudah login.
  useEffect(() => {
    loadLikedIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, currentUserId]);

  const requireLogin = () => {
    toast.error("Silakan login terlebih dahulu");
  };

  const handleToggleLike = async (commentId: string) => {
    if (!currentUserId) return requireLogin();
    try {
      const result = await toggleCommentLike(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, totalLikes: result.totalLikes } : c,
        ),
      );
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (result.liked) next.add(commentId);
        else next.delete(commentId);
        return next;
      });
    } catch (err) {
      console.error("Gagal like komentar:", err);
      toast.error("Gagal memproses like komentar");
    }
  };

  const handleReplySubmit = async (parentId: string, content: string) => {
    if (!currentUserId) return requireLogin();
    try {
      await createComment(articleId, content, parentId);
      await loadComments();
    } catch (err) {
      console.error("Gagal mengirim balasan:", err);
      toast.error("Gagal mengirim balasan");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error("Gagal menghapus komentar:", err);
      toast.error("Gagal menghapus komentar");
    }
  };

  const handleSubmitComment = async () => {
    if (!currentUserId) return requireLogin();
    const trimmed = newComment.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await createComment(articleId, trimmed);
      setNewComment("");
      await loadComments();
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
      toast.error("Gagal mengirim komentar");
    } finally {
      setSubmitting(false);
    }
  };

  const tree = buildTree(comments);
  const visibleTree = showAllBaseComments
    ? tree
    : tree.slice(0, BASE_COMMENTS_PREVIEW_COUNT);
  const hiddenBaseCount = tree.length - visibleTree.length;

  const currentUserAvatarUrl = resolveCurrentUserAvatarUrl(
    currentUser?.profilePicture,
  );

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-gray-900">
        Komentar ({comments.length})
      </h2>

      {/* 🔥 BARU — foto + nama akun yang sedang login, di atas kotak
          tulis komentar. Cuma muncul kalau lagi login. */}
      {currentUserId && (
        <div className="mt-4 flex items-center gap-3">
          <CommentAvatar
            name={currentUser?.fullName ?? "Anda"}
            src={currentUserAvatarUrl}
          />
          <p className="text-sm font-semibold text-gray-900">
            {currentUser?.fullName ?? "Anda"}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-start gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Kami ingin mendengar pandangan Anda, tulis disini..."
          rows={3}
          className="flex-1 rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-emerald-400"
        />
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleSubmitComment}
          disabled={submitting || !newComment.trim()}
          className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60 cursor-pointer"
        >
          Submit
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Memuat komentar...</p>
      ) : tree.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">
          Belum ada komentar. Jadilah yang pertama!
        </p>
      ) : (
        <div className="mt-2">
          {visibleTree.map((node) => (
            <CommentThread
              key={node.id}
              node={node}
              currentUserId={currentUserId}
              likedIds={likedIds}
              onToggleLike={handleToggleLike}
              onReplySubmit={handleReplySubmit}
              onDelete={handleDelete}
              isMobile={isMobile}
            />
          ))}

          {hiddenBaseCount > 0 && (
            <button
              onClick={() => setShowAllBaseComments(true)}
              className="mt-4 text-sm font-medium text-emerald-600 hover:underline cursor-pointer"
            >
              Tampilkan {hiddenBaseCount} Komentar Lainnya ⌄
            </button>
          )}
          {showAllBaseComments && tree.length > BASE_COMMENTS_PREVIEW_COUNT && (
            <button
              onClick={() => setShowAllBaseComments(false)}
              className="mt-4 text-sm font-medium text-emerald-600 hover:underline cursor-pointer"
            >
              Tampilkan Lebih Sedikit ⌃
            </button>
          )}
        </div>
      )}
    </section>
  );
}
