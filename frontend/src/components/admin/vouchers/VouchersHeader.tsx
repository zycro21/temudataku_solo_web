"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Tag,
  CheckCircle,
  XCircle,
  BarChart2,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface VouchersHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  onVoucherCreated: () => void;
}

interface VoucherStats {
  total: number;
  active: number;
  inactive: number;
  totalUsed: number;
}

const PRODUCT_SCOPES = [
  "GLOBAL",
  "ELEARNING",
  //   "PRACTICE",
  "MENTORING",
  "AYCL",
] as const;
const DISCOUNT_TYPES = ["PERCENTAGE", "FLAT"] as const;

const SCOPE_LABELS: Record<string, string> = {
  GLOBAL: "Global",
  ELEARNING: "E-Learning",
  //   PRACTICE: "Practice",
  MENTORING: "Mentoring (Bootcamp, 1 on 1, Group)",
  AYCL: "AYCL",
};

type ProductScope = (typeof PRODUCT_SCOPES)[number];
type DiscountType = (typeof DISCOUNT_TYPES)[number];

interface CreateForm {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  minimumPurchase: string;
  productScope: ProductScope;
  usageLimit: string;
  usageLimitPerUser: string;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
}

const defaultForm: CreateForm = {
  code: "",
  name: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxDiscountAmount: "",
  minimumPurchase: "",
  productScope: "GLOBAL",
  usageLimit: "",
  usageLimitPerUser: "1",
  startDate: "",
  expiryDate: "",
  isActive: true,
};

export default function VouchersHeader({
  search,
  onSearchChange,
  onVoucherCreated,
}: VouchersHeaderProps) {
  const [stats, setStats] = useState<VoucherStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalUsed: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const [allRes, activeRes, inactiveRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers?limit=1`,
          { withCredentials: true },
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers?limit=1&isActive=true`,
          { withCredentials: true },
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers?limit=1&isActive=false`,
          { withCredentials: true },
        ),
      ]);
      setStats({
        total: allRes.data.total ?? 0,
        active: activeRes.data.total ?? 0,
        inactive: inactiveRes.data.total ?? 0,
        totalUsed: 0,
      });
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit() {
    if (!form.code || !form.name || !form.discountValue) {
      toast.error("Kode, nama, dan nilai diskon wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers`,
        {
          code: form.code,
          name: form.name,
          description: form.description || undefined,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          maxDiscountAmount: form.maxDiscountAmount
            ? Number(form.maxDiscountAmount)
            : undefined,
          minimumPurchase: form.minimumPurchase
            ? Number(form.minimumPurchase)
            : undefined,
          productScope: form.productScope,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
          usageLimitPerUser: Number(form.usageLimitPerUser),
          startDate: form.startDate || undefined,
          expiryDate: form.expiryDate || undefined,
          isActive: form.isActive,
        },
        { withCredentials: true },
      );
      toast.success("Voucher berhasil dibuat");
      setShowModal(false);
      setForm(defaultForm);
      fetchStats();
      onVoucherCreated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal membuat voucher");
    } finally {
      setSubmitting(false);
    }
  }

  const statCards = [
    {
      label: "Jumlah Voucher",
      value: stats.total,
      icon: <Tag className="w-4 h-4 text-gray-500" />,
      valueClass: "text-gray-800",
    },
    {
      label: "Voucher Aktif",
      value: stats.active,
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      valueClass: "text-green-600",
    },
    {
      label: "Voucher Tidak Aktif",
      value: stats.inactive,
      icon: <XCircle className="w-4 h-4 text-red-400" />,
      valueClass: "text-red-500",
    },
  ];

  return (
    <>
      {/* Header title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Voucher</h1>
          <p className="text-sm text-gray-500">Manajemen voucher diskon</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                {card.icon}
                {card.label}
              </div>
              <p className={`text-2xl font-bold ${card.valueClass}`}>
                {statsLoading ? (
                  <span className="text-gray-300 animate-pulse">—</span>
                ) : (
                  card.value
                )}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 mt-1" />
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari kode atau nama voucher..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
        />
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-semibold text-gray-800">
                Buat Voucher Baru
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(defaultForm);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Row: kode + nama */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Contoh: DISKON50"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 uppercase"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Hanya huruf, angka,{" "}
                    <code className="bg-gray-100 px-0.5 rounded">-</code> dan{" "}
                    <code className="bg-gray-100 px-0.5 rounded">_</code>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Contoh: Diskon 50% Spesial"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi{" "}
                  <span className="text-emerald-500 font-normal text-xs">
                    Opsional
                  </span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Deskripsi opsional..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
                />
              </div>

              {/* Row: tipe diskon + nilai diskon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Diskon <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FLAT">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Diskon <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="discountValue"
                    type="number"
                    value={form.discountValue}
                    onChange={handleChange}
                    placeholder={
                      form.discountType === "PERCENTAGE"
                        ? "Contoh: 30"
                        : "Contoh: 50000"
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Maks diskon (hanya jika PERCENTAGE) + minimum pembelian */}
              <div className="grid grid-cols-2 gap-4">
                {form.discountType === "PERCENTAGE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maks. Potongan (Rp){" "}
                      <span className="text-emerald-500 font-normal text-xs">
                        Opsional
                      </span>
                    </label>
                    <input
                      name="maxDiscountAmount"
                      type="number"
                      value={form.maxDiscountAmount}
                      onChange={handleChange}
                      placeholder="Contoh: 100000"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Pembelian (Rp){" "}
                    <span className="text-emerald-500 font-normal text-xs">
                      Opsional
                    </span>
                  </label>
                  <input
                    name="minimumPurchase"
                    type="number"
                    value={form.minimumPurchase}
                    onChange={handleChange}
                    placeholder="Contoh: 200000"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Scope produk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Produk
                </label>
                <select
                  name="productScope"
                  value={form.productScope}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white"
                >
                  {PRODUCT_SCOPES.map((s) => (
                    <option key={s} value={s}>
                      {SCOPE_LABELS[s] ?? s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row: limit pemakaian + limit per user */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit Pemakaian{" "}
                    <span className="text-emerald-500 font-normal text-xs">
                      Opsional
                    </span>
                    <span className="text-gray-400 font-normal text-xs"></span>
                  </label>
                  <input
                    name="usageLimit"
                    type="number"
                    value={form.usageLimit}
                    onChange={handleChange}
                    placeholder="Contoh: 100"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit per User
                  </label>
                  <input
                    name="usageLimitPerUser"
                    type="number"
                    value={form.usageLimitPerUser}
                    onChange={handleChange}
                    placeholder="Default: 1"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Row: tanggal mulai + tanggal kedaluwarsa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai{" "}
                    <span className="text-emerald-500 font-normal text-xs">
                      Opsional
                    </span>
                  </label>
                  <input
                    name="startDate"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Kedaluwarsa{" "}
                    <span className="text-emerald-500 font-normal text-xs">
                      Opsional
                    </span>
                  </label>
                  <input
                    name="expiryDate"
                    type="datetime-local"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Status aktif */}
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Aktifkan voucher ini
                </label>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white rounded-b-2xl">
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(defaultForm);
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting ? "Menyimpan..." : "Simpan Voucher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
