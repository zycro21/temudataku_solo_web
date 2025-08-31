"use client";

import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface QrisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QrisModal({ open, onOpenChange }: QrisModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[330px] !p-0 overflow-hidden rounded-xl border-0 shadow-lg">
        <div className="relative">
          {/* Bagian hijau */}
          <div className="bg-emerald-500 px-5 py-6 flex items-start gap-3 rounded-t-lg h-40">
            <Image
              src="/assets/checkout/logotemudataku.png"
              alt="TemuDataku Logo"
              width={55}
              height={55}
              className="bg-white p-2 rounded mr-2"
            />
            <DialogTitle className="text-white text-xl m-0 mt-3">
              TemuDataku
            </DialogTitle>
          </div>

          {/* Section Total (floating) */}
          <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 w-[90%] bg-white rounded-lg shadow-md px-5 py-5 flex flex-col gap-3 text-sm font-semibold">
            {/* Baris atas */}
            <div className="flex justify-between items-start leading-tight">
              <span className="mt-[2px]">Total</span>
              <div className="flex flex-col items-end">
                <span>Bayar dalam 00:30:00</span>
              </div>
            </div>

            {/* Nominal & Order ID + Icon sejajar */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="text-2xl font-bold leading-none">Rp49.000</div>
                <p className="text-xs text-gray-500 leading-none mt-1">
                  Order ID #34345432315
                </p>
              </div>
              <ChevronDown size={20} className="text-black ml-2" />
            </div>
          </div>
        </div>

        {/* Body putih */}
        <div className="bg-white pt-13 pb-6 px-6 rounded-b-lg">
          {/* Judul QRIS di bawah kiri */}
          <p
            className="font-semibold text-left mb-6 ml-3"
            style={{ fontFamily: "cursive" }}
          >
            QRIS
          </p>

          <div className="text-center space-y-4">
            {/* Logo QRIS di atas barcode */}
            <Image
              src="/assets/checkout/logoqris.png"
              alt="Logo QRIS"
              width={30}
              height={30}
              className="mx-auto"
            />

            {/* Barcode */}
            <Image
              src="/assets/checkout/qrisbarcode.png"
              alt="QRIS"
              width={120}
              height={120}
              className="mx-auto"
            />

            {/* NMID */}
            <p className="text-xs text-gray-500 mb-10">NMID : IDXXXXXXXX</p>

            {/* Cara Bayar */}
            <Link
              href="/cara-bayar"
              className="flex items-center justify-start gap-2 cursor-pointer group ml-1"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 text-xs text-gray-400 group-hover:border-emerald-600 group-hover:text-emerald-600">
                ?
              </span>
              <span className="text-sm font-medium text-black group-hover:text-emerald-600">
                Cara Bayar
              </span>
            </Link>

            {/* Separator */}
            <div className="border-t pt-4">
              <Button className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white">
                Saya Sudah Bayar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
