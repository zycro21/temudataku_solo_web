"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import AddAccountModal from "./addAccountModal";
import axios from "axios";
import { toast } from "sonner";

const MAX_METHODS = 5;
const CONTACT_EMAIL = "temudataku@gmail.com";

interface WithdrawalMethod {
  id: string;
  type: "bank" | "eWallet";
  providerName: string;
  accountNumber: string;
  accountName?: string;
  isActive?: boolean;
}

export default function AffDangerZone() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/withdrawals`,
        { params: { page: 1, limit: 15 }, withCredentials: true },
      );
      if (res.data.success) setMethods(res.data.data);
    } catch (err) {
      console.error("Failed to fetch withdrawals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleToggleActive = async (method: WithdrawalMethod) => {
    setTogglingId(method.id);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/withdrawals/${method.id}`,
        { isActive: !method.isActive },
        { withCredentials: true },
      );
      setMethods((prev) =>
        prev.map((m) =>
          m.id === method.id ? { ...m, isActive: !m.isActive } : m,
        ),
      );
      toast.success(
        `Metode ${method.providerName} berhasil ${!method.isActive ? "diaktifkan" : "dinonaktifkan"}`,
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? "Gagal mengubah status metode",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const isAtLimit = methods.length >= MAX_METHODS;

  return (
    <Card className="p-6 shadow-sm border border-gray-200 bg-gray-50">
      <h2 className="font-bold text-gray-800 mb-0" style={{ fontSize: "18px" }}>
        Metode Penarikan Saldo
      </h2>
      <p className="text-gray-500 mb-1" style={{ fontSize: "12.5px" }}>
        Maksimal {MAX_METHODS} metode penarikan.
      </p>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500" style={{ fontSize: "13px" }}>
            Memuat metode...
          </p>
        ) : methods.length > 0 ? (
          methods.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-white"
            >
              <div className="flex items-center space-x-3">
                <Image
                  src={`/assets/dashboard/affiliator/${
                    m.type === "bank" ? "bank.svg" : "dana.svg"
                  }`}
                  alt={`${m.providerName} Icon`}
                  width={m.type === "bank" ? 14 : 20}
                  height={m.type === "bank" ? 14 : 20}
                />
                <div>
                  <p
                    className="font-medium text-gray-800"
                    style={{ fontSize: "13px" }}
                  >
                    {m.providerName}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: "12px" }}>
                    {m.accountNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(m)}
                disabled={togglingId === m.id}
                className={`font-semibold px-2.5 py-1 rounded-full border transition ${
                  m.isActive
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                    : "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                } disabled:opacity-50`}
                style={{ fontSize: "11px" }}
              >
                {togglingId === m.id
                  ? "..."
                  : m.isActive
                    ? "Aktif"
                    : "Nonaktif"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 font-bold" style={{ fontSize: "13px" }}>
            Belum ada metode penarikan/pembayaran
          </p>
        )}
      </div>

      {/* Keterangan tidak bisa edit */}
      <p className="text-gray-400 mt-3" style={{ fontSize: "11px" }}>
        Untuk mengubah atau menghapus data metode penarikan, hubungi kami di{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-emerald-600 underline"
        >
          {CONTACT_EMAIL}
        </a>
      </p>

      {/* Tombol tambah — disable jika sudah 5 */}
      <Button
        onClick={() => {
          if (isAtLimit) {
            toast.error(`Maksimal ${MAX_METHODS} metode penarikan.`);
            return;
          }
          setIsModalOpen(true);
        }}
        disabled={isAtLimit}
        className="w-full mt-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontSize: "13px", padding: "11px 16px" }}
      >
        {isAtLimit
          ? `Batas maksimal (${MAX_METHODS}) tercapai`
          : "+ Tambah Akun Baru"}
      </Button>

      {isAtLimit && (
        <p
          className="text-center text-gray-400 mt-2"
          style={{ fontSize: "11px" }}
        >
          Nonaktifkan salah satu metode atau hubungi{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-emerald-600 underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          untuk bantuan.
        </p>
      )}

      <AddAccountModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMethods}
      />
    </Card>
  );
}
