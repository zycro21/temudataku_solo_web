"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, Copy } from "lucide-react";

interface AtmBersamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AtmBersamaModal({
  open,
  onOpenChange,
}: AtmBersamaModalProps) {
  const [copied, setCopied] = useState(false);
  const vaRef = useRef<HTMLSpanElement>(null);

  const handleCopy = () => {
    if (vaRef.current) {
      const text = vaRef.current.innerText; // ambil isi span
      navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[330px] !p-0 overflow-hidden rounded-xl border-0 shadow-lg">
        <div className="relative">
          {/* Bagian hijau header */}
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

          {/* Floating Section Total */}
          <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 w-[90%] bg-white rounded-lg shadow-md px-5 py-5 flex flex-col gap-3 text-sm font-semibold">
            <div className="flex justify-between items-start leading-tight">
              <span className="mt-[2px]">Total</span>
              <div className="flex flex-col items-end">
                <span>Bayar dalam 00:30:00</span>
              </div>
            </div>
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

        {/* Body putih utama */}
        <div className="bg-white pt-12 pb-6 px-6 rounded-b-lg space-y-5">
          {/* Header ATM Bersama */}
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold">ATM Bersama</h3>
            <Image
              src="/assets/checkout/atmBersama.png"
              alt="ATM Bersama"
              width={40}
              height={10}
            />
          </div>

          {/* Deskripsi */}
          <p className="text-[10px] text-gray-400">
            Selesaikan pembayaranmu dari ATM Bersama dengan nomor virtual
            account di bawah
          </p>

          {/* Virtual Account Number */}
          <div>
            <p className="text-xs text-black">Virtual Account Number</p>
            <div className="flex justify-between items-center border-b pb-2 mt-1">
              <span
                ref={vaRef}
                className="text-lg font-medium tracking-wide select-text"
              >
                103362220447
              </span>
              <button
                onClick={handleCopy}
                className="text-blue-700 text-sm flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Copy size={14} /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Cara Membayar */}
          <div className="border-b pb-2 mb-40">
            <button className="flex items-center justify-between w-full text-sm font-medium">
              <span>Cara Membayar</span>
              <ChevronDown size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-4 flex justify-center">
            <Button className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-white">
              Saya Sudah Bayar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
