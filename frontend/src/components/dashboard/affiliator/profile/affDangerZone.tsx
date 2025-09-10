"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import AddAccountModal from "./addAccountModal";

export default function AffDangerZone() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="p-8 shadow-sm border border-gray-200 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        Metode Penarikan Saldo
      </h2>
      <p className="text-sm text-gray-500 mb-0">Metode Penarikan Saldo</p>

      <div className="space-y-4">
        {/* Item Bank */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
          <div className="flex items-center space-x-3">
            <Image
              src="/assets/dashboard/affiliator/bank.svg"
              alt="Bank Icon"
              width={14}
              height={14}
            />
            <div>
              <p className="font-medium text-gray-800">
                Bank Central Asia (BCA)
              </p>
              <p className="text-sm text-gray-500">176**********</p>
            </div>
          </div>
          <span className="text-sm font-medium text-emerald-600">active</span>
        </div>

        {/* Item Dana */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
          <div className="flex items-center space-x-3">
            <Image
              src="/assets/dashboard/affiliator/dana.svg"
              alt="Dana Icon"
              width={20}
              height={20}
            />
            <div>
              <p className="font-medium text-gray-800">Dana</p>
              <p className="text-sm text-gray-500">085********</p>
            </div>
          </div>
          <span className="text-sm font-medium text-emerald-600">active</span>
        </div>
      </div>

      {/* Tombol Tambah Akun */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-6 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg py-4 font-medium"
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
