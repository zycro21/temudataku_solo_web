"use client";

import { useState } from "react";

export default function CheckoutTerms() {
  const [isChecked, setIsChecked] = useState(false);
  const [coupon, setCoupon] = useState("");

  const terms = [
    "Pembayaran yang telah dilakukan tidak dapat dikembalikan dengan alasan apapun, kecuali bootcamp dibatalkan oleh penyelenggara.",
    "Materi mentoring hanya boleh digunakan untuk kepentingan pribadi dan dilarang untuk diperbanyak atau dikomersialkan tanpa izin tertulis dari penyelenggara.",
    "Dilarang keras merekam, mendistribusikan, atau mempublikasikan materi tanpa izin resmi.",
  ];

  const handleApplyCoupon = () => {
    // TODO: handle apply coupon
    alert(`Kode kupon: ${coupon || "(kosong)"}`);
  };

  return (
    <div className="mt-0 p-6 pl-6 md:pl-10 space-y-5 max-w-[60rem]">
      <h2 className="text-2xl font-bold">Syarat dan Ketentuan</h2>

      {/* Baris Kode Kupon (nyambung input + tombol) */}
      <div className="border rounded-xl px-3 py-4 md:px-5 md:py-5 flex items-center gap-3 w-full">
        <span className="shrink-0 text-base md:text-lg font-semibold">
          Kode Kupon
        </span>

        <div className="flex items-stretch ml-2 flex-1 w-full">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Temu1"
            className="rounded-l-full border border-r-0 bg-transparent px-4 py-2 text-sm shadow-xs outline-none
           focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[1px] flex-1"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="rounded-r-full bg-green-600 text-white text-sm font-medium
           px-5 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed border border-green-600"
            disabled={!coupon.trim()}
          >
            Gunakan Kupon
          </button>
        </div>
      </div>

      {/* Box bisa discroll untuk Terms */}
      <div className="border rounded-md p-4 h-32 overflow-y-auto text-sm space-y-2 scroll-thin">
        {terms.map((term, idx) => (
          <p key={idx}>
            {idx + 1}. {term}
          </p>
        ))}
      </div>

      {/* Checkbox persetujuan (native) */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="w-4 h-4 accent-green-600"
        />
        <label htmlFor="terms" className="text-sm cursor-pointer">
          saya setuju dengan ketentuan dan syarat
        </label>
      </div>
    </div>
  );
}
