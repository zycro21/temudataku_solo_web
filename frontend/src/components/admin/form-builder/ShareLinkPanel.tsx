"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, ExternalLink, QrCode } from "lucide-react";
import { FORM_API, getApiErrorMessage } from "./shared";

interface Props {
  formId: string;
  /** Berubah setiap link form diganti, memicu pemuatan ulang */
  refreshKey?: number;
}

interface ShareInfo {
  url: string;
  isShownOnEventPage: boolean;
}

// Panel "Bagikan Link Form": hanya dirender saat form berstatus Published
export default function ShareLinkPanel({ formId, refreshKey = 0 }: Props) {
  const [info, setInfo] = useState<ShareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    axios
      .get(`${FORM_API}/forms/${formId}/share`, {
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => setInfo(res.data?.data ?? res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(getApiErrorMessage(err, "Gagal memuat link form"));
      });
    return () => controller.abort();
  }, [formId, refreshKey]);

  const copy = async () => {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.url);
      toast.success("Link form disalin");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const saveBlob = (blob: Blob, filename: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadQr = async (format: "svg" | "png" | "jpg") => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || !info) return;
    // Nama file dari bagian akhir link, mis. .../form/UTqRxgsd -> qr-UTqRxgsd
    const slug = info.url.split(/[?#]/)[0].replace(/\/+$/, "").split("/").pop();
    const baseName = `qr-${slug || "form"}`;

    if (format === "svg") {
      const xml = new XMLSerializer().serializeToString(svg);
      saveBlob(new Blob([xml], { type: "image/svg+xml" }), `${baseName}.svg`);
      return;
    }

    // PNG/JPG: gambar ulang SVG ke canvas beresolusi tinggi + margin putih
    // (quiet zone) supaya QR tetap mudah di-scan setelah dicetak.
    const qrSize = 1024;
    const margin = 64;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width", String(qrSize));
    clone.setAttribute("height", String(qrSize));
    const xml = new XMLSerializer().serializeToString(clone);
    const svgUrl = URL.createObjectURL(
      new Blob([xml], { type: "image/svg+xml;charset=utf-8" }),
    );
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Gagal memuat gambar QR"));
        img.src = svgUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = qrSize + margin * 2;
      canvas.height = qrSize + margin * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas tidak didukung");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, margin, margin, qrSize, qrSize);

      const mime = format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mime, 0.95),
      );
      if (!blob) throw new Error("Gagal membuat file");
      saveBlob(blob, `${baseName}.${format}`);
    } catch {
      toast.error(`Gagal mengunduh QR (${format.toUpperCase()})`);
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  };

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
      <h2 className="text-sm font-semibold text-gray-900">Bagikan Link Form</h2>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {!error && !info && (
        <div className="mt-2 h-9 animate-pulse rounded-lg bg-white/70" />
      )}
      {info && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={info.url}
              aria-label="Link form"
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-white px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Link
              </button>
              <a
                href={info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-white px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka Link
              </a>
              <button
                type="button"
                aria-expanded={showQr}
                onClick={() => setShowQr((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-white px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
              >
                <QrCode className="h-3.5 w-3.5" />
                QR Code
              </button>
            </div>
          </div>
          {info.isShownOnEventPage && (
            <p className="text-xs text-gray-500">
              Form ini juga tampil di halaman Event yang dipilih.
            </p>
          )}
          {showQr && (
            <div className="flex flex-wrap items-center gap-4">
              <div ref={qrRef} className="rounded-lg bg-white p-3">
                <QRCodeSVG value={info.url} size={144} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Download className="h-3.5 w-3.5" />
                  Unduh QR:
                </span>
                {(["svg", "png", "jpg"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => downloadQr(fmt)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium uppercase text-gray-600 hover:bg-gray-50"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
