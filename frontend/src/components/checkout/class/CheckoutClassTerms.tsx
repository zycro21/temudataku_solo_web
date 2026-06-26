"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function CheckoutClassTerms({
  bookingId,
  onReferralApplied,
  priceSummary,
  onTermsChange,
  isPaymentPlanConfirmed,
}: any) {
  const [isChecked, setIsChecked] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);

  const handleReferralInteract = () => {
    if (!isPaymentPlanConfirmed) {
      toast.warning("Pilih dan konfirmasi tipe pembayaran terlebih dahulu.", {
        description:
          "Kode referral hanya bisa digunakan setelah tipe pembayaran dikonfirmasi.",
      });
    }
  };
  /* ===============================
     APPLY REFERRAL
  =============================== */
  const handleApplyCoupon = async () => {
    if (!isPaymentPlanConfirmed) {
      toast.warning("Pilih dan konfirmasi tipe pembayaran terlebih dahulu.", {
        description:
          "Kode hanya bisa digunakan setelah tipe pembayaran dikonfirmasi.",
      });
      return;
    }

    if (!bookingId) {
      toast.error("Booking tidak ditemukan.");
      return;
    }

    if (!coupon.trim()) {
      toast.warning("Silakan masukkan kode kupon.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/booking/${bookingId}/apply-code`,
        { code: coupon },
        { withCredentials: true },
      );

      const data = res.data.data;

      // Normalize response: voucher pakai finalAmount/originalAmount, referral pakai finalPrice/originalPrice
      // CheckoutSummary membaca priceSummary.finalPrice dan priceSummary.originalPrice
      const normalizedSummary = {
        originalPrice: data.originalPrice ?? data.originalAmount,
        finalPrice: data.finalPrice ?? data.finalAmount,
        discountAmount:
          data.discountAmount ??
          (data.originalPrice ?? data.originalAmount) -
            (data.finalPrice ?? data.finalAmount),
        paymentType: data.paymentType,
        installmentCount: data.installmentCount,
        recalculatedPayments: data.recalculatedPayments,
      };

      onReferralApplied(normalizedSummary);

      if (data.type === "voucher") {
        toast.success("Voucher berhasil diterapkan", {
          description: `Hemat Rp${normalizedSummary.discountAmount.toLocaleString("id-ID")} · Total: Rp${normalizedSummary.finalPrice.toLocaleString("id-ID")}`,
        });
      } else {
        toast.success("Referral berhasil diterapkan", {
          description: `Harga baru: Rp${normalizedSummary.finalPrice.toLocaleString("id-ID")}`,
        });
      }

      setIsVoucherApplied(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Gagal menerapkan kode.";

      toast.error("Gagal menerapkan kode", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     AUTO LOCK IF ALREADY APPLIED
  =============================== */
  useEffect(() => {
    if (priceSummary) {
      setIsVoucherApplied(true);
    }
  }, [priceSummary]);

  /* ===============================
     SEND TERMS STATUS TO PARENT
  =============================== */
  useEffect(() => {
    if (onTermsChange) onTermsChange(isChecked);
  }, [isChecked]);

  return (
    <div className="mt-0 p-4 md:p-6 md:pl-10 space-y-5 max-w-[60rem]">
      <h2 className="text-lg md:text-2xl font-bold text-center md:text-left">
        Syarat dan Ketentuan
      </h2>

      {/* ===============================
         COUPON SECTION
      =============================== */}
      <div className="border rounded-xl px-3 py-3 md:px-5 md:py-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
        <span className="shrink-0 text-sm md:text-base font-semibold text-center md:text-left w-full md:w-auto">
          Kode Kupon
        </span>

        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 md:ml-2 relative group min-w-0">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              onFocus={handleReferralInteract}
              placeholder="XXXX-9267"
              disabled={isVoucherApplied}
              className={`w-full md:flex-1 rounded-full md:rounded-l-full border md:border-r-0 bg-transparent px-3 py-2 text-xs md:text-sm outline-none
          ${isVoucherApplied ? "cursor-not-allowed bg-gray-100" : ""}`}
            />

            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={!coupon.trim() || loading || isVoucherApplied}
              className="w-full md:w-auto rounded-full md:rounded-r-full bg-green-600 text-white text-xs md:text-sm font-medium px-4 md:px-5 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Gunakan Kupon"}
            </button>

            {isVoucherApplied && (
              <div className="absolute -top-9 left-0 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Anda telah menggunakan voucher di pembelian ini
              </div>
            )}
          </div>

          {!isPaymentPlanConfirmed && (
            <p className="text-[11px] text-amber-600 mt-1 md:ml-2">
              Pilih dan konfirmasi tipe pembayaran terlebih dahulu untuk
              menggunakan kode voucher atau referral.
            </p>
          )}
        </div>
      </div>

      {/* Terms Scroll Box */}
      <div className="border rounded-md p-4 md:p-5 h-72 md:h-96 overflow-y-auto text-xs md:text-sm space-y-4 scroll-thin leading-relaxed">
        <p className="font-bold text-base md:text-lg tracking-tight text-center md:text-left">
          SYARAT DAN KETENTUAN UMUM TEMUDATAKU
        </p>

        <p className="italic">Terakhir diperbarui: 03 Maret 2026</p>

        <p>
          Dokumen ini merupakan{" "}
          <span className="font-semibold">
            perjanjian yang mengikat secara hukum
          </span>{" "}
          antara Anda (“Peserta”) dan{" "}
          <span className="underline">TemuDataku</span> (“Kami”) terkait
          penggunaan serta pembelian seluruh produk dan layanan yang tersedia.
        </p>

        <p className="font-medium">
          Dengan melakukan pembayaran atas produk TemuDataku, Anda dianggap
          telah membaca, memahami, dan menyetujui seluruh isi Syarat dan
          Ketentuan ini.
        </p>

        <p className="font-semibold mt-4">1. Ruang Lingkup Layanan</p>
        <p>
          Berlaku untuk seluruh produk dan layanan termasuk:
          <br />• Mentoring 1-on-1
          <br />• Mentoring Group
          <br />• Bootcamp
          <br />• All You Can Learn (AYCL)
          <br />• E-Learning
          <br />• Program digital lainnya
        </p>

        <p className="font-semibold">2. Pendaftaran dan Akurasi Data</p>
        <p>
          Peserta wajib memberikan data yang{" "}
          <span className="font-semibold">benar, lengkap, dan akurat</span>.
          TemuDataku tidak bertanggung jawab atas kesalahan data yang diinput
          oleh Peserta. Kami berhak menolak atau membatalkan pendaftaran apabila
          ditemukan pelanggaran kebijakan.
        </p>

        <p className="font-semibold">3. Pembayaran</p>
        <p>
          Pembayaran dianggap sah setelah dana diterima secara penuh. Slot
          mengikuti sistem{" "}
          <span className="underline">first paid, first secured</span>.
          Keterlambatan cicilan dapat mengakibatkan penghentian akses tanpa
          refund.
        </p>

        <p className="font-semibold">4. Kebijakan Pembatalan dan Refund</p>
        <p>
          Seluruh pembayaran bersifat{" "}
          <span className="font-bold">final dan non-refundable</span>, kecuali
          program dibatalkan oleh TemuDataku.
        </p>

        <p className="font-semibold">5. Akses dan Masa Berlaku</p>
        <p>
          Akses diberikan sesuai durasi masing-masing produk. Setelah masa
          berlaku berakhir, akses dapat dinonaktifkan secara otomatis.
        </p>

        <p className="font-semibold">6. Penjadwalan Ulang</p>
        <p>
          Mentoring 1-on-1 dapat dijadwalkan ulang maksimal satu kali dengan
          pemberitahuan minimal 24 jam. Permintaan di bawah 24 jam dianggap
          hangus.
        </p>

        <p className="font-semibold">7. Hak Kekayaan Intelektual</p>
        <p>
          Seluruh materi merupakan hak milik eksklusif TemuDataku. Peserta
          dilarang:
          <br />• Membagikan akun
          <br />• Merekam atau mendistribusikan ulang materi
          <br />• Menjual kembali materi
          <br />• Menggunakan materi untuk kepentingan komersial tanpa izin
          tertulis
        </p>

        <p className="font-semibold">8. Etika dan Perilaku Peserta</p>
        <p>
          Peserta wajib menjaga komunikasi profesional. Pelanggaran dapat
          mengakibatkan penghentian akses tanpa pengembalian dana.
        </p>

        <p className="font-semibold">9. Sertifikat</p>
        <p>
          Sertifikat diberikan sesuai ketentuan masing-masing program dan
          mengikuti data yang diinput saat pendaftaran.
        </p>

        <p className="font-semibold">10. Perubahan Program</p>
        <p>
          TemuDataku berhak melakukan perubahan terhadap jadwal, mentor,
          kurikulum, maupun metode penyampaian.
        </p>

        <p className="font-semibold">11. Batasan Tanggung Jawab</p>
        <p>
          TemuDataku tidak menjamin hasil pekerjaan atau keberhasilan karir
          tertentu. Hasil bergantung pada komitmen Peserta.
        </p>

        <p className="font-semibold">12. Keadaan Kahar (Force Majeure)</p>
        <p>
          Tidak bertanggung jawab atas kegagalan layanan akibat kejadian di luar
          kendali wajar seperti bencana alam atau kebijakan pemerintah.
        </p>

        <p className="font-semibold">13. Hukum yang Berlaku</p>
        <p>
          Diatur berdasarkan hukum Republik Indonesia dan diselesaikan melalui
          musyawarah atau Pengadilan Negeri sesuai domisili TemuDataku.
        </p>

        <p className="font-semibold">14. Persetujuan</p>
        <p className="font-medium">
          Dengan melakukan pembayaran, Peserta menyatakan telah membaca,
          memahami, dan menyetujui seluruh isi Syarat dan Ketentuan ini secara
          sadar dan tanpa paksaan.
        </p>
      </div>

      {/* ===============================
         CHECKBOX
      =============================== */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="terms-class"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="w-4 h-4 accent-green-600"
        />
        <label
          htmlFor="terms-class"
          className="text-xs md:text-sm text-gray-700 cursor-pointer"
        >
          Saya setuju dengan ketentuan dan syarat
        </label>
      </div>
    </div>
  );
}
