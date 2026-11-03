"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Save,
  Shuffle,
  X,
} from "lucide-react";
import { FORM_API, getApiErrorMessage, type FormStatus } from "./shared";

interface Props {
  formId: string;
  status: FormStatus;
  disabled: boolean;
  /** Dipanggil setelah link baru tersimpan (supaya panel lain ikut memuat ulang) */
  onSaved: () => void;
}

interface ShareInfo {
  url: string;
  slug: string;
  isPublished: boolean;
}

interface SlugCheck {
  slug: string;
  available: boolean;
  reason?:
    | "INVALID_FORMAT"
    | "RESERVED"
    | "TAKEN_BY_FORM"
    | "TAKEN_BY_SHORTLINK";
  message?: string;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSlug(length = 8) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

// Ketikan dirapikan sesuai aturan backend: huruf kecil, angka, dan tanda hubung
function normalize(v: string) {
  return v
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);
}

// Kolom "Link Form": bisa diketik manual atau diacak. Backend menjamin link unik
// di seluruh form DAN short link. QR dibuat otomatis dari link yang tersimpan.
export default function FormLinkCard({
  formId,
  status,
  disabled,
  onSaved,
}: Props) {
  const [info, setInfo] = useState<ShareInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [check, setCheck] = useState<SlugCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const published = status === "PUBLISHED";
  const saved = info?.slug ?? "";
  // Bagian depan link (mis. https://domain/form/) diambil dari URL yang tersimpan
  const prefix = info
    ? info.url.slice(0, info.url.length - info.slug.length)
    : "";
  const changed = !!info && value !== saved;

  const load = () => {
    const controller = new AbortController();
    setLoadError(null);
    axios
      .get(`${FORM_API}/forms/${formId}/share`, {
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data: ShareInfo = res.data?.data ?? res.data;
        setInfo(data);
        setValue(data.slug);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setLoadError(getApiErrorMessage(err, "Gagal memuat link form"));
      });
    return () => controller.abort();
  };

  useEffect(load, [formId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cek ketersediaan otomatis (ditunda) setiap link diubah
  useEffect(() => {
    if (!info || !changed || !value) {
      setCheck(null);
      setChecking(false);
      return;
    }
    const controller = new AbortController();
    setChecking(true);
    const t = setTimeout(() => {
      axios
        .get(`${FORM_API}/slug-availability`, {
          params: { slug: value, formId },
          withCredentials: true,
          signal: controller.signal,
        })
        .then((res) => setCheck(res.data?.data ?? res.data))
        .catch((err) => {
          if (axios.isCancel(err)) return;
          setCheck({
            slug: value,
            available: false,
            message: getApiErrorMessage(err, "Gagal memeriksa link"),
          });
        })
        .finally(() => {
          if (!controller.signal.aborted) setChecking(false);
        });
    }, 450);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [value, changed, info, formId]);

  const canSave =
    !disabled &&
    !saving &&
    changed &&
    !checking &&
    check?.slug === value &&
    check.available;

  const handleSave = async () => {
    if (!canSave) return;
    if (
      published &&
      !window.confirm(
        "Form sudah dipublikasikan. Link lama dan QR yang sudah dibagikan tidak akan berfungsi lagi setelah diganti. Lanjutkan?",
      )
    ) {
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Menyimpan link...");
    try {
      const res = await axios.patch(
        `${FORM_API}/forms/${formId}/slug`,
        { slug: value },
        { withCredentials: true },
      );
      const data: ShareInfo = res.data?.data ?? res.data;
      setInfo(data);
      setValue(data.slug);
      setCheck(null);
      toast.success("Link form tersimpan, QR diperbarui", { id: toastId });
      onSaved();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal menyimpan link"), {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

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
    if (!svg) return;
    const baseName = `qr-${saved || "form"}`;

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
    <section className="rounded-xl border border-gray-200 bg-white p-4 xl:sticky xl:top-4 xl:self-start">
      <h2 className="text-sm font-semibold text-gray-900">Bagikan Link Form</h2>
      <p className="mt-0.5 text-xs text-gray-500">
        Atur link sendiri atau acak. Link harus unik di semua form dan short
        link. Berlaku untuk Form Event maupun Non-Event.
      </p>

      {loadError && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-red-600">{loadError}</p>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
          >
            Coba lagi
          </button>
        </div>
      )}
      {!loadError && !info && (
        <div className="mt-3 space-y-2">
          <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-36 animate-pulse rounded-lg bg-gray-100" />
        </div>
      )}

      {info && (
        <div className="mt-3 space-y-3">
          {/* Kolom link */}
          <div>
            <label
              htmlFor="form-slug"
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Link form
            </label>
            <div className="flex items-stretch gap-2">
              <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <span className="max-w-[55%] shrink-0 truncate bg-gray-50 px-2.5 py-2 text-xs text-gray-500">
                  {prefix}
                </span>
                <input
                  id="form-slug"
                  type="text"
                  value={value}
                  disabled={disabled || saving}
                  maxLength={60}
                  spellCheck={false}
                  autoCapitalize="off"
                  onChange={(e) => setValue(normalize(e.target.value))}
                  placeholder="link-form-kamu"
                  className="min-w-0 flex-1 px-2 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:bg-gray-50"
                />
              </div>
              <button
                type="button"
                title="Acak link"
                aria-label="Acak link"
                disabled={disabled || saving}
                onClick={() => setValue(randomSlug())}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Acak
              </button>
            </div>

            {/* Status ketersediaan */}
            <div className="mt-1.5 min-h-4 text-xs">
              {changed && !value && (
                <span className="text-red-600">Link tidak boleh kosong</span>
              )}
              {changed && value && checking && (
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Memeriksa ketersediaan...
                </span>
              )}
              {changed &&
                value &&
                !checking &&
                check?.slug === value &&
                (check.available ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                    Link tersedia
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <X className="h-3.5 w-3.5" />
                    {check.message ?? "Link tidak bisa dipakai"}
                  </span>
                ))}
              {!changed && (
                <span className="text-gray-400">
                  Huruf kecil, angka, dan tanda hubung (3 sampai 60 karakter).
                </span>
              )}
            </div>

            {changed && published && (
              <p className="mt-1 text-xs text-amber-700">
                Form sudah dipublikasikan: link dan QR lama berhenti berfungsi
                setelah link diganti.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Simpan Link
            </button>
            {changed && (
              <button
                type="button"
                onClick={() => setValue(saved)}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>
            )}
          </div>

          {/* Link tersimpan: copy, buka, QR otomatis */}
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={info.url}
                aria-label="Link form tersimpan"
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600"
              />
              <button
                type="button"
                onClick={copy}
                title="Salin link"
                aria-label="Salin link"
                className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            {published ? (
              <a
                href={info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka Link
              </a>
            ) : (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Link baru bisa dibuka responden setelah form dipublikasikan.
              </p>
            )}

            {changed ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-8 text-center">
                <p className="text-xs text-gray-500">
                  QR akan dibuat setelah link disimpan.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div
                  ref={qrRef}
                  className="rounded-lg border border-gray-100 bg-white p-3"
                >
                  <QRCodeSVG value={info.url} size={152} />
                </div>
                <p className="text-xs text-gray-500">
                  Scan QR untuk membuka form
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Download className="h-3.5 w-3.5" />
                    Unduh QR:
                  </span>
                  {(["svg", "png", "jpg"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => downloadQr(fmt)}
                      disabled={!published}
                      title={
                        published
                          ? undefined
                          : "Publikasikan form dulu untuk mengunduh QR"
                      }
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium uppercase text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                {!published && (
                  <p className="text-xs text-gray-400">
                    Unduh QR tersedia setelah form dipublikasikan.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
