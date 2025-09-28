"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import SuccessWithdrawModal from "./successWithdraw";
import FailedWithdrawModal from "./failedWithdraw";
import axios from "axios";
import { toast } from "sonner";

interface WithdrawalMethod {
  id: string;
  type: "bank" | "eWallet";
  providerName: string;
  accountNumber: string;
  accountName: string;
}

interface ReferralCode {
  id: string;
  code: string;
}

export default function PenarikanSaldo() {
  const [method, setMethod] = useState("");
  const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
  const [amountValue, setAmountValue] = useState<number>(0); // simpan angka asli
  const [amountDisplay, setAmountDisplay] = useState(""); // untuk tampilan
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [saldoTersedia, setSaldoTersedia] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Format angka ke Rupiah
  const formatRupiah = (num: number) => {
    if (!num) return "";
    return "Rp" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numeric = parseInt(raw || "0", 10);
    setAmountValue(isNaN(numeric) ? 0 : numeric);
    setAmountDisplay(formatRupiah(numeric));
  };

  // Fetch saldo & metode withdraw
  const fetchSaldoDanData = async (rc?: ReferralCode) => {
    if (!rc) return;
    let totalKomisi = 0;
    try {
      const comRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-commissions/${rc.id}`,
        { withCredentials: true }
      );
      if (comRes.data.success) {
        const commissions = comRes.data.data.commissions || [];
        totalKomisi = commissions.reduce(
          (sum: number, c: any) => sum + (c.amount || 0),
          0
        );
      }
    } catch (err) {
      console.warn("Gagal ambil komisi:", err);
    }

    // Hitung total paid
    let totalPaid = 0;
    let page = 1;
    let hasMore = true;
    let safetyCounter = 0;

    while (hasMore && safetyCounter < 100) {
      try {
        const payRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/commission-payments`,
          {
            params: { status: "paid", page, limit: 50 },
            withCredentials: true,
          }
        );

        if (payRes.data.success) {
          const { data, totalPages } = payRes.data.data;
          totalPaid += data.reduce(
            (sum: number, p: any) => sum + (p.amount || 0),
            0
          );
          page++;
          hasMore = totalPages ? page <= totalPages : false;
        } else {
          hasMore = false;
        }
      } catch (err) {
        console.warn("Error saat fetch payments halaman", page, err);
        hasMore = false;
      }
      safetyCounter++;
    }

    setSaldoTersedia(Math.max(totalKomisi - totalPaid, 0));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil withdrawal methods affiliator
        const wmRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/withdrawals`,
          { withCredentials: true }
        );
        if (wmRes.data.success) {
          setMethods(wmRes.data.data || []);
        }

        // Ambil referral codes affiliator
        const refRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes`,
          { withCredentials: true }
        );
        const codes = refRes.data.data.referralCodes;
        if (!codes || codes.length === 0) {
          toast.error("Referral code tidak ditemukan. Tidak bisa tarik saldo.");
          return;
        }
        setReferralCode(codes[0]);

        // Hitung saldo
        await fetchSaldoDanData(codes[0]);
      } catch (err) {
        console.error("Gagal ambil data:", err);
        toast.error("Gagal memuat data withdraw/saldo");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWithdraw = async () => {
    if (!method || !referralCode) return;

    // cek jumlah valid
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Jumlah tidak valid");
      return;
    }

    // Cek lebih besar dari saldo
    if (amountValue > saldoTersedia) {
      setShowFailed(true); // modal gagal khusus saldo
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/commission-payments/request`,
        {
          referralCodeId: referralCode.id,
          amount: amountValue,
          withdrawalMethodId: method,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setShowSuccess(true);
        setAmountValue(0);
        setAmountDisplay("");
        setMethod("");
        // Refresh saldo dari backend agar sinkron
        await fetchSaldoDanData(referralCode);
      } else {
        toast.error("Penarikan gagal diproses");
      }
    } catch (err: any) {
      console.error("Gagal request penarikan:", err);
      toast.error("Terjadi kesalahan jaringan. Coba lagi nanti.");
    }
  };

  return (
    <>
      <Card className="p-8 shadow-sm border border-gray-200 bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Penarikan Saldo
        </h2>

        {!referralCode ? (
          <p className="text-red-500 text-sm">
            Tidak ada referral code. Anda tidak bisa melakukan penarikan saldo.
          </p>
        ) : (
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
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.providerName} - {m.accountNumber} a.n {m.accountName}
                  </option>
                ))}
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
                value={amountDisplay}
                onChange={handleAmountChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Saldo Tersedia:{" "}
                {loading
                  ? "Loading..."
                  : `Rp${saldoTersedia.toLocaleString("id-ID")}`}
              </p>
            </div>
          </div>
        )}

        {/* Tombol */}
        <div className="mt-0">
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 py-2"
            onClick={handleWithdraw}
            disabled={!method || amountValue <= 0 || loading || !referralCode}
          >
            Tarik Saldo
          </Button>
        </div>
      </Card>

      <SuccessWithdrawModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <FailedWithdrawModal
        open={showFailed}
        onClose={() => setShowFailed(false)}
      />
    </>
  );
}
