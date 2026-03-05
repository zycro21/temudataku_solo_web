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
  paymentId,
  priceSummary,
  formData,
  isTermsChecked,
  type,
}: any) {
  const [paymentMethod, setPaymentMethod] = useState("atm");
  const [showQRIS, setShowQRIS] = useState(false);
  const [showATM, setShowATM] = useState(false); // state baru

  // Dynamic Price Logic
  const basePrice = Number(booking?.mentoringService?.price ?? 0);
  const originalPrice = Number(priceSummary?.originalPrice ?? basePrice);
  const finalPrice = Number(priceSummary?.finalPrice ?? originalPrice);
  const discount = priceSummary ? originalPrice - finalPrice : 0;

  const [isProcessing, setIsProcessing] = useState(false);

  const serviceTitle =
    booking?.mentoringService?.serviceName ?? "Mentoring Session";

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

    if (!isTermsChecked) {
      toast.error("Anda belum menyetujui ketentuan dan syarat.");
      return false;
    }

    return true;
  };

  const paymentOptions = [
    {
      id: "atm",
      label: "Pembayaran Duitku ATM Bersama",
      logo: ["/assets/checkout/atmBersama.png"],
    },
    {
      id: "bni",
      label: "Pembayaran Duitku BNI",
      logo: ["/assets/checkout/bni.png"],
    },
    {
      id: "mandiri",
      label: "Pembayaran Duitku Mandiri",
      logo: ["/assets/checkout/mandiri.png"],
    },
    {
      id: "qris",
      label: "Pembayaran Duitku Shopeepay QRIS",
      logo: ["/assets/checkout/shopeepay.png", "/assets/checkout/qris.png"], // dua logo
    },
    {
      id: "bri",
      label: "Pembayaran Duitku BRI",
      logo: ["/assets/checkout/bri.png"],
    },
    {
      id: "bsi",
      label: "Pembayaran Duitku BSI",
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
      return;
    }

    // 🔥 SHOW LOADING TOAST
    const loadingToast = toast.loading("Memproses pembayaran...");

    try {
      // ==============================
      //  CREATE PAYMENT
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
      // UPDATE BOOKING CONTENT
      // ==============================
      if (booking?.id) {
        const formPayload = new FormData();

        if (type === "mentoring") {
          if (formData.description)
            formPayload.append("material", formData.description);

          if (formData.expectedOutput)
            formPayload.append("expectedOutput", formData.expectedOutput);
        }

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
      // UPDATE USER
      // ==============================
      try {
        if (
          formData.province !== booking?.user?.province ||
          formData.city !== booking?.user?.city
        ) {
          const userFormData = new FormData();
          userFormData.append("province", formData.province);
          userFormData.append("city", formData.city);

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

      // 🔥 DISMISS LOADING
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
      <div className="border rounded-xl p-6 shadow-sm bg-white space-y-6 max-h-[650px] overflow-y-auto mt-6 ml-4">
        {/* Header */}
        <h2 className="text-2xl font-bold">Pemesanan</h2>

        {/* Detail Pesanan */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/mentoringPage/mentoring1on1.svg"
              alt={serviceTitle}
              width={80}
              height={80}
              className="rounded-md"
            />

            <div className="flex justify-between w-full items-start">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{serviceTitle}</span>

                {priceSummary && (
                  <span className="text-xs text-gray-400">
                    Harga sebelum diskon
                  </span>
                )}
              </div>

              <span className="font-semibold">
                {formatRupiah(originalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Ringkasan Harga */}
        <div className="text-sm space-y-2 mb-14">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatRupiah(originalPrice)}</span>
          </div>

          {priceSummary && (
            <div className="text-xs text-green-600 font-medium">
              Kode Voucher berhasil diterapkan!!
            </div>
          )}

          <div className="flex justify-between border-t pt-2">
            <span>Diskon</span>
            <span className={discount > 0 ? "text-green-600" : ""}>
              {formatRupiah(discount)}
            </span>
          </div>

          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total</span>
            <span>{formatRupiah(finalPrice)}</span>
          </div>
        </div>

        {/* Pembayaran */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Pembayaran</h3>
          <div className="space-y-2">
            {paymentOptions.map((option) => (
              <label
                key={option.id}
                className="flex justify-between items-center cursor-pointer rounded-md px-3 py-2 hover:bg-gray-50 shadow-sm"
              >
                {/* Kiri: Radio + Label */}
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={paymentMethod === option.id}
                    onChange={() => setPaymentMethod(option.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </div>

                {/* Kanan: Logo(s) */}
                <div className="flex items-center gap-2">
                  {option.logo?.map((logo, idx) => (
                    <Image
                      key={idx}
                      src={logo}
                      alt={option.label}
                      width={32}
                      height={16}
                      className="object-contain"
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
          className="w-[250px] mx-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 font-medium block disabled:opacity-50"
        >
          {isProcessing ? "Memproses..." : "Pesan"}
        </Button>
      </div>

      {/* Modal QRIS */}
      <QrisModal open={showQRIS} onOpenChange={setShowQRIS} />

      {/* Modal ATM Bersama */}
      <AtmBersamaModal open={showATM} onOpenChange={setShowATM} />
    </>
  );
}
