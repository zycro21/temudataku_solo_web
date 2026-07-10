"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import SuccessModal from "./successAddAccountModal";
import { toast } from "sonner";
import axios from "axios";

export default function AddAccountModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [withdrawType, setWithdrawType] = useState<"bank" | "ewallet">("bank");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ bankOrWallet: "", number: "", name: "" });

  const bankOptions = ["BCA", "Mandiri", "BNI", "BRI"];
  const ewalletOptions = ["Dana", "OVO", "GoPay", "ShopeePay"];

  const handleSave = async () => {
    if (!form.bankOrWallet || !form.number || !form.name) {
      toast.error("Harap isi semua data metode pembayaran terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/withdrawals`,
        {
          type: withdrawType === "bank" ? "bank" : "eWallet",
          providerName: form.bankOrWallet,
          accountNumber: form.number,
          accountName: form.name,
        },
        { withCredentials: true },
      );

      toast.success("Metode pembayaran berhasil ditambahkan");
      onClose();
      setShowSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan, coba lagi");
    } finally {
      setLoading(false);
      setForm({ bankOrWallet: "", number: "", name: "" });
      setWithdrawType("bank");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                   !max-w-lg w-full bg-gray-100 flex flex-col"
        >
          <VisuallyHidden>
            <DialogTitle>Tambah Metode Pembayaran</DialogTitle>
          </VisuallyHidden>

          <div className="space-y-4 mt-3">
            <h2 className="text-lg font-semibold">
              Tambah Metode Pembayaran Baru
            </h2>

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
                value={form.bankOrWallet}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bankOrWallet: e.target.value }))
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
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {withdrawType === "bank" ? "Nomor Rekening" : "Nomor E-Wallet"}
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                placeholder={
                  withdrawType === "bank"
                    ? "Masukkan Nomor Rekening"
                    : "Masukkan Nomor E-Wallet"
                }
                value={form.number}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, number: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {withdrawType === "bank" ? "Nama Rekening" : "Nama di E-Wallet"}
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                placeholder={
                  withdrawType === "bank"
                    ? "Masukkan Nama Rekening"
                    : "Masukkan Nama di E-Wallet"
                }
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Keterangan tidak bisa edit di modal */}
          <p className="text-xs text-gray-400 mt-2">
            Setelah ditambahkan, data tidak dapat diedit. Untuk perubahan
            hubungi{" "}
            <a
              href="mailto:temudataku@gmail.com"
              className="text-emerald-600 underline"
            >
              temudataku@gmail.com
            </a>
          </p>

          <DialogFooter className="pt-4">
            <Button
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg py-3 font-medium"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
    </>
  );
}
