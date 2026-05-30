"use client";

import axios from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type PaymentDetail = {
  id: string;

  merchantOrderId?: string;

  type: string;

  title: string;

  amount: number;

  installmentNumber?: number | null;

  dueDate?: string | null;

  status: "pending" | "confirmed" | "failed" | "refunded";

  paymentMethod?: string | null;

  paymentDate?: string | null;

  transactionId?: string | null;

  createdAt: string;

  updatedAt?: string | null;

  booking?: {
    id: string;

    mentoringService: {
      id: string;

      serviceName: string;

      thumbnail?: string | null;
    };
  } | null;

  invoice?: {
    id: string;

    paymentType: string;

    installmentCount?: number | null;

    totalAmount: number;

    paidAmount: number;

    remainingAmount: number;

    status: string;
  } | null;
};

export default function PaymentDetailPage() {
  const params = useParams();

  const paymentId = params.paymentId as string;

  const [payment, setPayment] = useState<PaymentDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("atm");

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPaymentDetail = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/my/payments/${paymentId}`,
          { withCredentials: true },
        );

        setPayment(response.data.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to fetch payment detail",
        );
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentDetail();
    }
  }, [paymentId]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
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

  const handlePay = async () => {
    try {
      setIsProcessing(true);

      const loadingToast = toast.loading("Memproses pembayaran...");

      const paymentRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments/create`,
        {
          referenceId: payment?.id,
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

      toast.dismiss(loadingToast);

      toast.success("Mengalihkan ke halaman pembayaran...");

      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan saat pembayaran.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading payment detail...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="bg-white border rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-3">Failed</h2>

          <p className="text-gray-600">{error || "Payment not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 md:py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border p-5 md:p-8">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 md:items-center md:justify-between border-b pb-5 md:pb-6">
            <div className="flex gap-3 md:gap-4">
              <Image
                src={
                  payment.booking?.mentoringService?.thumbnail
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${payment.booking.mentoringService.thumbnail}`
                    : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
                }
                alt={payment.title}
                width={80}
                height={80}
                className="rounded-xl object-cover w-14 h-14 md:w-20 md:h-20 shrink-0"
                unoptimized
              />

              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">
                  Pembayaran Cicilan
                </p>

                <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-snug">
                  {payment.title}
                </h1>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
                Total Yang Harus Dibayar
              </p>

              <h2 className="text-2xl md:text-4xl font-bold text-emerald-600">
                {formatPrice(payment.amount)}
              </h2>
            </div>
          </div>

          {/* DETAIL */}
          <div className="mt-5 md:mt-8 space-y-4 md:space-y-5">
            <div className="border rounded-xl md:rounded-2xl p-4 md:p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 mb-1">
                    Nama Program
                  </p>

                  <p className="font-semibold text-sm md:text-base">
                    {payment.title}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">
                    Pembayaran
                  </p>

                  <p className="font-semibold text-sm md:text-base">
                    Cicilan Ke-
                    {payment.installmentNumber || 1}
                  </p>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-base md:text-lg font-semibold">
                Metode Pembayaran
              </h3>

              <div className="space-y-2">
                {paymentOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex flex-row justify-between items-center 
                    cursor-pointer rounded-xl border px-3 md:px-4 py-2.5 md:py-3 
                    hover:bg-gray-50 gap-2"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id)}
                        className="accent-emerald-500 w-4 h-4 shrink-0"
                      />

                      <span className="text-xs md:text-sm leading-relaxed">
                        {option.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {option.logo?.map((logo, idx) => (
                        <Image
                          key={idx}
                          src={logo}
                          alt={option.label}
                          width={36}
                          height={22}
                          className="object-contain h-5 md:h-7"
                        />
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* BUTTON */}
            <Button
              onClick={handlePay}
              disabled={isProcessing || payment.status === "confirmed"}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 md:py-6 text-sm md:text-base rounded-xl"
            >
              {payment.status === "confirmed"
                ? "Sudah Dibayar"
                : isProcessing
                  ? "Memproses..."
                  : "Bayar"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
