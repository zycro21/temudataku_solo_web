"use client";

import { useEffect, useState } from "react";
import { Check, Link2, List } from "lucide-react";
import { richTextDisplayClass } from "@/lib/editorHTMLUtils";
import {
  decodeFontStyleToken,
  markdownToHTML,
} from "@/components/admin/artikel/articleMarkdown";
import { getFontStyle } from "@/components/admin/artikel/articleFontStyles";
import type {
  ArticleAdditionalContentItem,
  ArticleBlock,
  ArticleContentBlockItem,
} from "@/components/artikel/articleApi";

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function scrollToId(id?: string | null) {
  if (!id) return;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function DecodedRichText({
  id,
  raw,
  className,
}: {
  id?: string;
  raw: string;
  className: string;
}) {
  const { fontType, fontSize, rest } = decodeFontStyleToken(raw ?? "");
  const html = markdownToHTML(rest);
  return (
    <div
      id={id}
      className={`${richTextDisplayClass} ${className}`}
      style={getFontStyle(fontType, fontSize)}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}

function ContentItem({ item }: { item: ArticleContentBlockItem }) {
  if (item.headingContent) {
    return (
      <DecodedRichText
        id={item.id}
        raw={item.headingContent.text}
        className="text-gray-900 font-bold scroll-mt-24"
      />
    );
  }

  if (item.paragraphContent) {
    return (
      <DecodedRichText
        id={item.id}
        raw={item.paragraphContent.text}
        className="text-gray-700 leading-relaxed scroll-mt-24"
      />
    );
  }

  if (item.highlightContent) {
    return (
      <div
        id={item.id}
        className="scroll-mt-24 flex bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden"
      >
        <div className="w-6 bg-emerald-500 shrink-0" />
        <div className="flex-1 py-4 pr-5 pl-5 md:py-5 md:pr-6 md:pl-6">
          <DecodedRichText
            raw={item.highlightContent.text}
            className="text-gray-700 italic leading-relaxed"
          />
        </div>
      </div>
    );
  }

  if (item.dividerContent) {
    return (
      <hr
        id={item.id}
        style={{
          borderTopStyle:
            item.dividerContent.style === "DASHED" ? "dashed" : "solid",
          borderTopWidth: 1,
        }}
        className="scroll-mt-24 border-gray-300"
      />
    );
  }

  if (item.tableContent) {
    const columns = [...item.tableContent.columns].sort(
      (a, b) => a.orderNumber - b.orderNumber,
    );
    const rows = [...item.tableContent.rows].sort(
      (a, b) => a.orderNumber - b.orderNumber,
    );

    return (
      <div id={item.id} className="scroll-mt-24 overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            {columns.map((col) => (
              <col key={col.id} style={{ width: `${100 / columns.length}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="border border-gray-400 px-3 py-2 bg-gray-50 text-left text-gray-700 font-semibold"
                >
                  <span
                    className={richTextDisplayClass}
                    dangerouslySetInnerHTML={{
                      __html: markdownToHTML(col.header) || "",
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => {
                  const cell = row.cells.find((c) => c.columnId === col.id);
                  return (
                    <td
                      key={col.id}
                      className="border border-gray-400 px-3 py-2 align-top text-gray-700 break-words"
                    >
                      <div
                        className={richTextDisplayClass}
                        dangerouslySetInnerHTML={{
                          __html: markdownToHTML(cell?.value ?? "") || "",
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (item.linkContent) {
    const {
      linkText,
      linkType,
      externalUrl,
      targetContentBlockId,
      targetAdditionalContentId,
    } = item.linkContent;

    if (linkType === "ARTICLE_SECTION") {
      const targetId = targetContentBlockId || targetAdditionalContentId || "";
      return (
        <div id={item.id} className="scroll-mt-24 flex justify-center">
          <button
            onClick={() => scrollToId(targetId)}
            className="inline-flex items-center gap-2 text-lg font-medium text-emerald-600 hover:underline"
          >
            <List size={18} />
            {linkText}
          </button>
        </div>
      );
    }

    return (
      <div id={item.id} className="scroll-mt-24 flex justify-center">
        <a
          href={externalUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-lg font-medium text-emerald-600 hover:underline"
        >
          <Link2 size={18} />
          {linkText}
        </a>
      </div>
    );
  }

  return null;
}

function MediaItem({ item }: { item: ArticleAdditionalContentItem }) {
  const media = item.imageVideo;
  if (!media) return null;

  if (media.mediaType === "IMAGE") {
    return (
      <div id={item.id} className="scroll-mt-24 mx-auto">
        <div
          className="mx-auto rounded-2xl overflow-hidden"
          style={{ width: `${media.widthPercent ?? 100}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.url}
            alt={media.title ?? ""}
            className="w-full h-auto block"
          />
        </div>
        {media.caption && (
          <p className="mt-2 text-center text-sm text-gray-400">
            {media.caption}
          </p>
        )}
      </div>
    );
  }

  const embedUrl = toEmbedUrl(media.url);
  return (
    <div id={item.id} className="scroll-mt-24">
      {embedUrl ? (
        <div className="relative w-[92%] mx-auto aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          src={media.url}
          controls
          className="w-[92%] mx-auto block aspect-video rounded-2xl bg-black"
        />
      )}
      {media.caption && (
        <p className="mt-2 text-center text-sm text-gray-400">
          {media.caption}
        </p>
      )}
    </div>
  );
}

function findTocItem(blocks: ArticleBlock[]): ArticleContentBlockItem | null {
  for (const block of blocks) {
    const found = block.contentBlocks.find((c) => c.tableOfContentContent);
    if (found) return found;
  }
  return null;
}

// 🔥 BARU — badge centang + highlight item aktif berdasarkan scroll-spy,
// PERSIS pola TocSidebar di ArticlePreview.tsx admin.
function TocSidebar({
  tocItem,
  activeId,
}: {
  tocItem: ArticleContentBlockItem;
  activeId: string | null;
}) {
  const items = tocItem.tableOfContentContent?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="sticky top-24 self-start hidden md:block">
      <p className="text-base font-bold text-gray-800 mb-4">
        Table of Contents
      </p>
      <div className="space-y-3">
        {[...items]
          .sort((a, b) => a.orderNumber - b.orderNumber)
          .map((item, i) => {
            const targetId =
              item.targetContentBlockId || item.targetAdditionalContentId || "";
            const isActive = !!targetId && targetId === activeId;
            return (
              <button
                key={i}
                type="button"
                onClick={() => scrollToId(targetId)}
                disabled={!targetId}
                className={`flex items-start gap-2.5 text-left text-sm w-full transition ${
                  isActive
                    ? "text-emerald-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                } ${!targetId ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${
                    isActive ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <Check size={12} strokeWidth={3} className="text-white" />
                </span>
                <span className="break-words">{item.label}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}

// 🔥 BARU — versi TOC buat mobile: SAMA fungsinya kayak TocSidebar (badge
// centang + highlight aktif dari scroll-spy), tapi non-sticky & full
// width, ditaruh di ATAS konten (bukan di samping) karena di layar
// sempit nggak ada tempat buat sidebar kayak di desktop.
function MobileTocList({
  tocItem,
  activeId,
}: {
  tocItem: ArticleContentBlockItem;
  activeId: string | null;
}) {
  const items = tocItem.tableOfContentContent?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="md:hidden mb-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      <p className="text-sm font-bold text-gray-800 mb-3">Table of Contents</p>
      <div className="space-y-2.5">
        {[...items]
          .sort((a, b) => a.orderNumber - b.orderNumber)
          .map((item, i) => {
            const targetId =
              item.targetContentBlockId || item.targetAdditionalContentId || "";
            const isActive = !!targetId && targetId === activeId;
            return (
              <button
                key={i}
                type="button"
                onClick={() => scrollToId(targetId)}
                disabled={!targetId}
                className={`flex items-start gap-2.5 text-left text-sm w-full transition ${
                  isActive
                    ? "text-emerald-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                } ${!targetId ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${
                    isActive ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <Check size={12} strokeWidth={3} className="text-white" />
                </span>
                <span className="break-words">{item.label}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default function ArticleContentRenderer({
  blocks,
}: {
  blocks: ArticleBlock[];
}) {
  const tocItem = findTocItem(blocks);
  const tocTargetIds = (tocItem?.tableOfContentContent?.items ?? [])
    .map((it) => it.targetContentBlockId || it.targetAdditionalContentId || "")
    .filter(Boolean);
  const tocTargetIdsKey = tocTargetIds.join(",");

  const [activeId, setActiveId] = useState<string | null>(null);

  // Scroll-spy: elemen target TOC yang lagi paling atas kelihatan di
  // viewport ditandai aktif. rootMargin -70% bikin section baru dianggap
  // "aktif" begitu lewatin ~30% teratas layar, bukan nunggu penuh.
  useEffect(() => {
    if (tocTargetIds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    tocTargetIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocTargetIdsKey]);

  // Default-kan item pertama sebagai aktif sebelum user sempat scroll.
  useEffect(() => {
    setActiveId((prev) => prev ?? tocTargetIds[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocTargetIdsKey]);

  return (
    <div className="mt-10">
      {tocItem && <MobileTocList tocItem={tocItem} activeId={activeId} />}

      <div
        className={
          tocItem ? "grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8" : ""
        }
      >
        {tocItem && <TocSidebar tocItem={tocItem} activeId={activeId} />}

        <div className="min-w-0 space-y-6">
          {blocks
            .slice()
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .flatMap((block) => {
              const combined = [
                ...block.contentBlocks
                  .filter((c) => !c.tableOfContentContent)
                  .map((c) => ({
                    kind: "content" as const,
                    orderNumber: c.orderNumber,
                    item: c,
                  })),
                ...block.additionalContents.map((m) => ({
                  kind: "media" as const,
                  orderNumber: m.orderNumber,
                  item: m,
                })),
              ].sort((a, b) => a.orderNumber - b.orderNumber);

              return combined.map((entry) =>
                entry.kind === "content" ? (
                  <ContentItem key={entry.item.id} item={entry.item} />
                ) : (
                  <MediaItem key={entry.item.id} item={entry.item} />
                ),
              );
            })}
        </div>
      </div>
    </div>
  );
}
