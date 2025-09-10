"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Trash2, RotateCcw } from "lucide-react";
import SuccessModal from "./successAddAccountModal";
import { toast } from "sonner";

export default function AddAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [withdrawType, setWithdrawType] = useState<"bank" | "ewallet">("bank");

  const bankOptions = ["BCA", "Mandiri", "BNI", "BRI"];
  const ewalletOptions = ["Dana", "OVO", "GoPay", "ShopeePay"];

  // contoh data metode pembayaran
  const [methods, setMethods] = useState([
    {
      id: 1,
      type: "bank",
      name: "Bank Central Asia (BCA)",
      number: "176**********",
      icon: "/assets/dashboard/affiliator/bank.svg",
      active: true,
    },
    {
      id: 2,
      type: "ewallet",
      name: "Dana",
      number: "085********",
      icon: "/assets/dashboard/affiliator/dana.svg",
      active: true,
    },
  ]);

  // toggle active/inactive
  const toggleMethod = (id: number) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    bankOrWallet: "",
    number: "",
    name: "",
  });

  const handleSave = () => {
    if (!form.bankOrWallet || !form.number || !form.name) {
      toast.error("Mohon isi semua input atau lakukan perubahan terlebih dahulu");
      return;
    }

    // Kalau valid → tutup AddAccountModal + buka SuccessModal
    onClose();
    setShowSuccess(true);

    // Reset form biar kosong lagi
    setForm({ bankOrWallet: "", number: "", name: "" });
    setWithdrawType("bank");
  };

  useEffect(() => {
    if (!open) {
      setForm({ bankOrWallet: "", number: "", name: "" });
      setWithdrawType("bank");
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                   !max-w-4xl w-full max-h-[90vh] bg-gray-100 flex flex-col"
        >
          <VisuallyHidden>
            <DialogTitle>Tambah / Edit Metode Pembayaran</DialogTitle>
          </VisuallyHidden>

          <div className="overflow-y-auto pr-2 space-y-4 mt-3 flex-1">
            <p className="text-lg font-semibold">
              Metode Pembayaran yang Sudah Ada
            </p>

            {/* List metode */}
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={m.icon}
                    alt={`${m.name} Icon`}
                    width={20}
                    height={20}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.number}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-sm font-medium ${
                      m.active ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {m.active ? "active" : "inactive"}
                  </span>

                  <button
                    onClick={() => toggleMethod(m.id)}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    {m.active ? (
                      <Trash2 className="w-5 h-5 text-red-600 hover:text-red-200" />
                    ) : (
                      <RotateCcw className="w-5 h-5 text-emerald-600 hover:text-emerald-200" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            <h2 className="text-lg font-semibold mt-6">
              Tambah Metode Pembayaran Baru
            </h2>

            {/* Form input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Penarikan
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={withdrawType}
                  onChange={(e) =>
                    setWithdrawType(e.target.value as "bank" | "ewallet")
                  }
                >
                  <option value="bank">Bank</option>
                  <option value="ewallet">E-Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {withdrawType === "bank" ? "Nama Bank" : "Jenis E-Wallet"}
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={form.bankOrWallet ?? ""} // kasih fallback ""
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      bankOrWallet: e.target.value,
                    }))
                  }
                >
                  <option value="">
                    {withdrawType === "bank"
                      ? "Pilih Nama Bank"
                      : "Pilih Jenis E-Wallet"}
                  </option>
                  {(withdrawType === "bank" ? bankOptions : ewalletOptions).map(
                    (opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {withdrawType === "bank"
                    ? "Nomor Rekening Bank"
                    : "Nomor E-Wallet"}
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  placeholder={
                    withdrawType === "bank"
                      ? "Masukkan Nomor Rekening"
                      : "Masukkan Nomor E-Wallet"
                  }
                  value={form.number ?? ""} // kasih fallback ""
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, number: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {withdrawType === "bank"
                    ? "Nama Rekening Bank"
                    : "Nama di E-Wallet"}
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  placeholder={
                    withdrawType === "bank"
                      ? "Masukkan Nama Rekening"
                      : "Masukkan Nama di E-Wallet"
                  }
                  value={form.name ?? ""} // kasih fallback ""
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg py-3 font-medium"
              onClick={handleSave}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
    </>
  );
}
