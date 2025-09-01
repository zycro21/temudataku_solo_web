"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import QrisModal from "./QrisModal";
import AtmBersamaModal from "./AtmBersamaModal";

export default function CheckoutSummary() {
  const [paymentMethod, setPaymentMethod] = useState("atm");
  const [showQRIS, setShowQRIS] = useState(false);
  const [showATM, setShowATM] = useState(false); // 🔹 state baru

  const handlePesan = () => {
    if (paymentMethod === "qris") {
      setShowQRIS(true);
    } else if (paymentMethod === "atm") {
      setShowATM(true);
    } else {
      alert("Lanjutkan proses pembayaran untuk metode lain");
    }
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
      id: "briva",
      label: "Pembayaran Duitku Briva",
      logo: ["/assets/checkout/bri.png"],
    },
    {
      id: "bsi",
      label: "Pembayaran Duitku BSI",
      logo: ["/assets/checkout/bsi.png"],
    },
  ];

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
              alt="Mentoring 1 on 1"
              width={80}
              height={80}
              className="rounded-md"
            />
            <div className="flex justify-between w-full">
              <span>Mentoring 1 on 1</span>
              <span className="font-semibold">Rp 49.000</span>
            </div>
          </div>
        </div>

        {/* Ringkasan Harga */}
        <div className="text-sm space-y-2 mb-14">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp 49.000</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Diskon</span>
            <span>Rp 0</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total</span>
            <span>Rp 49.000</span>
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
          className="w-[250px] mx-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 font-medium block"
        >
          Pesan
        </Button>
      </div>

      {/* Modal QRIS */}
      <QrisModal open={showQRIS} onOpenChange={setShowQRIS} />

      {/* Modal ATM Bersama */}
      <AtmBersamaModal open={showATM} onOpenChange={setShowATM} />
    </>
  );
}
