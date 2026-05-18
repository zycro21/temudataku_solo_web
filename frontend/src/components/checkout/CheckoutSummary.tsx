"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import QrisModal from "./QrisModal";
import AtmBersamaModal from "./AtmBersamaModal";
import { toast } from "sonner";
import axios from "axios";

export default function CheckoutSummary({
  booking,
  ayclBooking,
  paymentId,
  priceSummary,
  formData,
  isTermsChecked,
  type,
}: any) {
  const [paymentMethod, setPaymentMethod] = useState("atm");
  const [showQRIS, setShowQRIS] = useState(false);
  const [showATM, setShowATM] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Dynamic Price Logic ───────────────────────────────────────────────────
  const basePrice =
    type === "aycl"
      ? Number(ayclBooking?.batch?.price ?? 0)
      : Number(booking?.mentoringService?.price ?? 0);

  const originalPrice = Number(priceSummary?.originalPrice ?? basePrice);
  const finalPrice = Number(priceSummary?.finalPrice ?? originalPrice);
  const discount = priceSummary ? originalPrice - finalPrice : 0;

  // ── Title ─────────────────────────────────────────────────────────────────
  const serviceTitle =
    type === "aycl"
      ? (ayclBooking?.batch?.title ?? "All You Can Learn")
      : (booking?.mentoringService?.serviceName ?? "Mentoring Session");

  const formatRupiah = (value: number | string) => {
    return `Rp${Number(value).toLocaleString("id-ID")}`;
  };

  const validateForm = () => {
    if (!formData) {
      toast.error("Form belum diisi.");
      return false;
    }

    if (!formData.email?.trim()) {
      toast.error("Email wajib diisi.");
      return false;
    }

    if (!formData.fullName?.trim()) {
      toast.error("Nama lengkap wajib diisi.");
      return false;
    }

    if (!formData.province?.trim()) {
      toast.error("Provinsi wajib dipilih.");
      return false;
    }

    if (!formData.city?.trim()) {
      toast.error("Kota/Kabupaten wajib dipilih.");
      return false;
    }

    if (!formData.phone?.trim()) {
      toast.error("Nomor telepon wajib diisi.");
      return false;
    }

    if (type === "mentoring") {
      if (!formData.description?.trim()) {
        toast.error("Kebutuhan yang dibutuhkan wajib diisi.");
        return false;
      }

      if (!formData.expectedOutput?.trim()) {
        toast.error("Output yang diharapkan wajib diisi.");
        return false;
      }
    }

    if (type === "aycl") {
      // TAMBAH VALIDASI SCHEDULE
      if (
        !formData.selectedSchedules ||
        formData.selectedSchedules.length === 0
      ) {
        toast.error("Pilih minimal satu kelas yang ingin diikuti.");
        return false;
      }
    }

    if (!isTermsChecked) {
      toast.error("Anda belum menyetujui ketentuan dan syarat.");
      return false;
    }

    return true;
  };

  const paymentOptions = [
    {
      id: "atm",
      label: "Pembayaran ATM Bersama",
      logo: ["/assets/checkout/atmBersama.png"],
    },
    {
      id: "bni",
      label: "Pembayaran BNI",
      logo: ["/assets/checkout/bni.png"],
    },
    {
      id: "mandiri",
      label: "Pembayaran Mandiri",
      logo: ["/assets/checkout/mandiri.png"],
    },
    {
      id: "qris",
      label: "Pembayaran Shopeepay/QRIS",
      logo: ["/assets/checkout/shopeepay.png", "/assets/checkout/qris.png"],
    },
    {
      id: "bri",
      label: "Pembayaran BRI",
      logo: ["/assets/checkout/bri.png"],
    },
    {
      id: "bsi",
      label: "Pembayaran BSI",
      logo: ["/assets/checkout/bsi.png"],
    },
  ];

  const mapToDuitkuCode = (method: string) => {
    const map: Record<string, string> = {
      atm: "A1",
      bni: "I1",
      mandiri: "M2",
      bri: "BR",
      bsi: "BV",
      qris: "SP",
    };

    return map[method];
  };

  const handlePesan = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!validateForm()) {
      setIsProcessing(false);
      return;
    }

    if (!paymentId) {
      toast.error("Payment ID tidak ditemukan.");
      setIsProcessing(false);
      return;
    }

    const loadingToast = toast.loading("Memproses pembayaran...");

    try {
      // ==============================
      // CREATE PAYMENT
      // ==============================
      const paymentRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments/create`,
        {
          referenceId: paymentId,
          paymentMethod: mapToDuitkuCode(paymentMethod),
        },
        { withCredentials: true },
      );

      if (!paymentRes.data?.success) {
        throw new Error("Gagal membuat pembayaran.");
      }

      const paymentUrl = paymentRes.data?.data?.paymentUrl;

      if (!paymentUrl) {
        throw new Error("Payment URL tidak ditemukan.");
      }

      // ==============================
      // UPDATE BOOKING CONTENT (mentoring only)
      // ==============================
      if (type === "mentoring" && booking?.id) {
        const formPayload = new FormData();

        if (formData.description)
          formPayload.append("material", formData.description);

        if (formData.expectedOutput)
          formPayload.append("expectedOutput", formData.expectedOutput);

        if (formData.supportingDocs?.length > 0) {
          for (const file of formData.supportingDocs) {
            formPayload.append("supportDocument", file);
          }
        }

        if ([...formPayload.keys()].length > 0) {
          await axios.patch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/${booking.id}/content`,
            formPayload,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
        }
      }

      // ==============================
      // UPDATE USER (mentoring & aycl)
      // ==============================
      try {
        const currentUser = type === "aycl" ? ayclBooking?.user : booking?.user;

        if (
          formData.province !== currentUser?.province ||
          formData.city !== currentUser?.city ||
          formData.phone !== currentUser?.phoneNumber
        ) {
          const userFormData = new FormData();

          if (formData.province !== currentUser?.province) {
            userFormData.append("province", formData.province);
          }

          if (formData.city !== currentUser?.city) {
            userFormData.append("city", formData.city);
          }

          if (formData.phone !== currentUser?.phoneNumber) {
            userFormData.append("phoneNumber", formData.phone);
          }

          await axios.put(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update`,
            userFormData,
            { withCredentials: true },
          );
        }
      } catch (err: any) {
        if (err.response?.data?.message !== "No changes detected") {
          console.error("Update profile gagal:", err);
        }
      }

      // ==============================
      // UPDATE AYCL BOOKING (aycl only)
      // ==============================
      if (type === "aycl" && ayclBooking?.id) {
        try {
          await axios.patch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ayclbooking/${ayclBooking.id}`,
            {
              selectedSchedules: formData.selectedSchedules ?? [],
            },
            { withCredentials: true },
          );
        } catch (err: any) {
          console.error("Update AYCL booking gagal:", err);
        }
      }

      toast.dismiss(loadingToast);
      toast.success("Mengalihkan ke halaman pembayaran...");

      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.dismiss(loadingToast);
      setIsProcessing(false);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat memproses pembayaran.",
      );
    }
  };

  return (
    <>
      <div
        className="border rounded-lg p-4 md:p-5 shadow-sm bg-white space-y-5 
    max-h-[125vh] md:max-h-[750px] overflow-y-auto 
    mt-4 ml-4 lg:ml-3 
    w-full max-w-md mx-auto lg:max-w-none"
      >
        {/* Header */}
        <h2 className="text-lg font-semibold text-center lg:text-left">
          Pemesanan
        </h2>

        {/* Detail Pesanan */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/mentoringPage/mentoring1on1.svg"
              alt={serviceTitle}
              width={56}
              height={56}
              className="rounded-md w-14 h-14"
            />

            <div className="flex justify-between w-full items-start gap-2">
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-xs leading-snug">
                  {serviceTitle}
                </span>

                {priceSummary && (
                  <span className="text-[11px] text-gray-400">
                    Harga sebelum diskon
                  </span>
                )}
              </div>

              <span className="font-semibold text-sm shrink-0">
                {formatRupiah(originalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Ringkasan Harga */}
        <div className="text-xs space-y-1.5 mb-10">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatRupiah(originalPrice)}</span>
          </div>

          {priceSummary && (
            <div className="text-[11px] text-green-600 font-medium">
              Kode Voucher berhasil diterapkan!!
            </div>
          )}

          <div className="flex justify-between border-t pt-1.5">
            <span>Diskon</span>
            <span className={discount > 0 ? "text-green-600" : ""}>
              {formatRupiah(discount)}
            </span>
          </div>

          <div className="flex justify-between font-semibold text-sm border-t pt-1.5">
            <span>Total</span>
            <span>{formatRupiah(finalPrice)}</span>
          </div>
        </div>

        {/* Pembayaran */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Pembayaran</h3>
          <div className="space-y-2">
            {paymentOptions.map((option) => (
              <label
                key={option.id}
                className="flex flex-row justify-between items-center 
                  cursor-pointer rounded-md px-3 py-2 hover:bg-gray-50 shadow-sm gap-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={paymentMethod === option.id}
                    onChange={() => setPaymentMethod(option.id)}
                    className="text-emerald-600 focus:ring-emerald-500 shrink-0"
                  />
                  <span className="text-xs leading-relaxed">
                    {option.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {option.logo?.map((logo, idx) => (
                    <Image
                      key={idx}
                      src={logo}
                      alt={option.label}
                      width={32}
                      height={18}
                      className="object-contain h-6 md:h-8"
                    />
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tombol Pesan */}
        <Button
          onClick={handlePesan}
          disabled={isProcessing}
          className="w-full md:w-[200px] mx-auto bg-emerald-500 hover:bg-emerald-600 
           text-white rounded-md py-2 text-sm md:text-xs font-medium block"
        >
          {isProcessing ? "Memproses..." : "Pesan"}
        </Button>
      </div>

      <QrisModal open={showQRIS} onOpenChange={setShowQRIS} />
      <AtmBersamaModal open={showATM} onOpenChange={setShowATM} />
    </>
  );
}
