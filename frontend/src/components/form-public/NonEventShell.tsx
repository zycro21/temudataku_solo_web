"use client";

import type { ReactNode } from "react";

interface ShellProps {
  themeColor: string;
  backgroundColor: string;
  fontFamily: string;
  /** Pojok kanan atas (mis. tombol Masuk / Daftar), opsional */
  topRight?: ReactNode;
  children: ReactNode;
}

// Pola lingkaran dekoratif yang diulang ke segala arah (tile 800x800), jadi
// latar tetap bercorak sampai bagian paling bawah, berapa pun panjang form.
// Semua bentuk berada di dalam tile supaya sambungan antar-tile tidak terpotong.
function backgroundPattern(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">` +
    `<g fill="${color}">` +
    `<circle cx="150" cy="140" r="110" fill-opacity="0.12"/>` +
    `<circle cx="640" cy="230" r="80" fill-opacity="0.08"/>` +
    `<circle cx="330" cy="500" r="130" fill-opacity="0.10"/>` +
    `<circle cx="690" cy="640" r="90" fill-opacity="0.12"/>` +
    `<circle cx="100" cy="700" r="50" fill-opacity="0.10"/>` +
    `</g>` +
    `<g fill="none" stroke="${color}" stroke-opacity="0.16" stroke-width="3">` +
    `<circle cx="470" cy="110" r="46"/>` +
    `<circle cx="560" cy="420" r="62"/>` +
    `<circle cx="170" cy="400" r="34"/>` +
    `</g>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Kerangka halaman isi form untuk form NON-EVENT (diakses lewat link langsung):
// logo di atas, kartu putih di tengah, dekorasi lembut berwarna tema di latar.
// Desain form EVENT berbeda dan dibuat terpisah nanti.
export default function NonEventShell({
  themeColor,
  backgroundColor,
  fontFamily,
  topRight,
  children,
}: ShellProps) {
  return (
    <div
      className="relative min-h-screen px-3 py-6 sm:px-4 sm:py-12"
      style={{
        backgroundColor,
        backgroundImage: backgroundPattern(themeColor),
        backgroundSize: "800px 800px",
        backgroundRepeat: "repeat",
        fontFamily,
      }}
    >
      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center">
        {/* Pojok kanan atas: tinggi tetap supaya tidak melompat saat muncul */}
        <div className="mb-2 flex h-8 w-full items-center justify-end">
          {topRight}
        </div>

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/dashboard/user/Navbar_logo.png"
          alt="TemuDataku"
          className="mb-6 h-16 w-auto sm:mb-8 sm:h-24"
        />

        <div className="w-full">{children}</div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Didukung oleh TemuDataku
        </p>
      </div>
    </div>
  );
}

// Kartu putih tempat isi halaman. headerSrc = gambar header form (opsional).
export function ShellCard({
  headerSrc,
  themeColor,
  children,
}: {
  headerSrc?: string | null;
  themeColor: string;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5"
      style={{ borderTop: `5px solid ${themeColor}` }}
    >
      {headerSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={headerSrc}
          alt=""
          className="h-32 w-full object-cover sm:h-40"
        />
      )}
      <div className="p-4 sm:p-7">{children}</div>
    </div>
  );
}
