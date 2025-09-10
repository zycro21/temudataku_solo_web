"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SuccessWithdrawModal from "./successWithdraw";

export default function PenarikanSaldo() {
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Format angka ke Rupiah
  const formatRupiah = (value: string) => {
    const number = value.replace(/\D/g, ""); // hanya angka
    if (!number) return "";
    return (
      "Rp" + number.replace(/\B(?=(\d{3})+(?!\d))/g, ".") // titik setiap 3 digit
    );
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatRupiah(e.target.value));
  };

  const handleWithdraw = () => {
    if (!method || !amount) return;
    setShowSuccess(true);
  };

  return (
    <>
      <Card className="p-8 shadow-sm border border-gray-200 bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Penarikan Saldo
        </h2>

        {/* Form 2 kolom sejajar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pilih metode */}
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Metode Penarikan Saldo
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Pilih metode</option>
              <option>Bank Central Asia (BCA)</option>
              <option>Bank Mandiri</option>
              <option>Bank BNI</option>
              <option>Bank BRI</option>
              <option>Dana</option>
              <option>OVO</option>
              <option>GoPay</option>
              <option>ShopeePay</option>
            </select>
          </div>

          {/* Input jumlah */}
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Jumlah
            </label>
            <input
              type="text"
              placeholder="Rp0"
              value={amount}
              onChange={handleAmountChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Saldo Tersedia: Rp1.250.000,00
            </p>
          </div>
        </div>

        {/* Tombol */}
        <div className="mt-0">
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 py-2"
            onClick={handleWithdraw}
            disabled={!method || !amount}
          >
            Tarik Saldo
          </Button>
        </div>
      </Card>

      {/* Success Modal */}
      <SuccessWithdrawModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
