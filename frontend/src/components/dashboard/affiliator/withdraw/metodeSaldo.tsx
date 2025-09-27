"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import AddAccountModal from "../profile/addAccountModal";
import axios from "axios";

interface WithdrawalMethod {
  id: string;
  type: "bank" | "eWallet";
  providerName: string;
  accountNumber: string;
  accountName?: string;
  isActive?: boolean;
}

export default function MetodeSaldo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/withdrawals`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setMethods(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch withdrawal methods:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, []);

  return (
    <Card className="p-8 shadow-sm border border-gray-200 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Metode Penarikan Saldo
      </h2>
      <p className="text-lg text-gray-800 mb-0">Metode Penarikan Saldo</p>

      <div className="space-y-4 mt-2">
        {loading ? (
          <p className="text-gray-500 text-sm">Memuat metode...</p>
        ) : methods.length > 0 ? (
          methods.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-white"
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
                  <p className="font-medium text-gray-800">{m.providerName}</p>
                  <p className="text-sm text-gray-500">{m.accountNumber}</p>
                </div>
              </div>
              <span
                className={`text-sm font-medium ${
                  m.isActive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {m.isActive ? "active" : "inactive"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm font-bold">
            Belum ada metode penarikan
          </p>
        )}
      </div>

      {/* Tombol Tambah Akun */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg py-4 font-medium"
      >
        + Tambah Akun Baru
      </Button>

      <AddAccountModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
}
