"use client";

import {
  Search,
  Plus,
  X,
  ChevronDown,
  Ticket,
  CheckCircle2,
  Users,
  Clock,
  Ban,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface SubscriptionPlanOption {
  id: string;
  name: string;
  durationDay: number;
  price: number | string;
}

export interface RedeemCodeStatsShape {
  total: number;
  active: number;
  exhausted: number;
  expired: number;
  disabled: number;
}

interface RedeemCodeHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCodeCreated?: () => void;
  stats: RedeemCodeStatsShape;
}

const MAX_NOTE = 500;

export default function RedeemCodeHeader({
  search,
  onSearchChange,
  onCodeCreated,
  stats,
}: RedeemCodeHeaderProps) {
  const [plans, setPlans] = useState<SubscriptionPlanOption[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [createdCode, setCreatedCode] = useState<string>("");

  const [form, setForm] = useState({
    planId: "",
    code: "",
    maxUses: "1",
    expiresAt: "",
    note: "",
  });

  // 🔥 Plan list buat dropdown — endpoint yang sama dengan yang dipakai
  // ChooseSubscriptionElearning di halaman publik /elearning.
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubscriptionPlan/elearning/subscription-plans`,
          {
            params: { isActive: true, limit: 50 },
            withCredentials: true,
          },
        );
        setPlans(res.data.data?.data ?? []);
      } catch (err) {
        console.error("Gagal mengambil subscription plans:", err);
      }
    };
    fetchPlans();
  }, []);

  const resetForm = () => {
    setForm({ planId: "", code: "", maxUses: "1", expiresAt: "", note: "" });
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      setShowCreateModal(false);
      resetForm();
    }, 250);
  };

  const handleCreate = async () => {
    if (!form.planId) {
      toast.error("Plan wajib dipilih");
      return;
    }
    if (!form.expiresAt) {
      toast.error("Tanggal kadaluarsa wajib diisi");
      return;
    }
    const maxUsesNum = Number(form.maxUses);
    if (!maxUsesNum || maxUsesNum < 1) {
      toast.error("Max Uses minimal 1");
      return;
    }
    const expiresAtDate = new Date(form.expiresAt);
    if (expiresAtDate.getTime() <= Date.now()) {
      toast.error("Tanggal kadaluarsa harus di masa depan");
      return;
    }
    if (form.code && !/^[A-Za-z0-9-]+$/.test(form.code)) {
      toast.error("Kode cuma boleh huruf, angka, dan strip");
      return;
    }

    setCreating(true);
    try {
      const payload: Record<string, any> = {
        planId: form.planId,
        maxUses: maxUsesNum,
        expiresAt: expiresAtDate.toISOString(),
      };
      if (form.code.trim()) payload.code = form.code.trim().toUpperCase();
      if (form.note.trim()) payload.note = form.note.trim();

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/redeemCode/codes`,
        payload,
        { withCredentials: true },
      );

      setCreatedCode(res.data?.data?.code ?? form.code);

      setModalVisible(false);
      setTimeout(() => {
        setShowCreateModal(false);
        resetForm();
        setShowSuccessModal(true);
        setTimeout(() => setSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal membuat kode redeem",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    setTimeout(() => {
      setShowSuccessModal(false);
      onCodeCreated?.();
    }, 250);
  };

  const copyCreatedCode = () => {
    navigator.clipboard.writeText(createdCode);
    toast.success("Kode disalin ke clipboard");
  };

  const statCards = [
    {
      label: "Total Kode",
      value: stats.total,
      icon: Ticket,
      accent: "text-gray-700 bg-gray-100",
    },
    {
      label: "Aktif",
      value: stats.active,
      icon: CheckCircle2,
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Kuota Habis",
      value: stats.exhausted,
      icon: Users,
      accent: "text-amber-600 bg-amber-50",
    },
    {
      label: "Kadaluarsa",
      value: stats.expired,
      icon: Clock,
      accent: "text-gray-500 bg-gray-100",
    },
    {
      label: "Dinonaktifkan",
      value: stats.disabled,
      icon: Ban,
      accent: "text-red-500 bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title + Create button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Kode Redeem</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola kode redeem untuk akses E-Learning Subscription tanpa
            payment.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
            <Plus size={16} className="text-emerald-600" strokeWidth={3} />
          </span>
          Buat Kode Redeem
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border px-5 py-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.accent}`}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-gray-800 leading-tight">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 truncate">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative w-[28rem]">
        <Input
          placeholder="Cari kode / catatan..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 py-2 text-sm bg-white h-auto"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* ── CREATE MODAL ─────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            modalVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[540px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl transform transition-all duration-300 ${
              modalVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-start justify-between pt-6 px-7 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Buat Kode Redeem Baru
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Kode ini bisa dipakai user buat dapat akses subscription tanpa
                  lewat pembayaran.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition mt-0.5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-7">
              <div className="space-y-5 mt-5">
                {/* Plan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    Subscription Plan
                  </label>
                  <div className="relative">
                    <select
                      value={form.planId}
                      onChange={(e) =>
                        setForm({ ...form, planId: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                    >
                      <option value="" disabled className="text-gray-400">
                        Pilih plan
                      </option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({plan.durationDay} hari)
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Code (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    Kode{" "}
                    <span className="text-gray-400 font-normal">
                      (opsional -- kosongkan untuk melakukan generate otomatis)
                    </span>
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        // 🔥 Buang semua karakter selain huruf/angka/strip
                        // (termasuk spasi) langsung saat diketik — bukan
                        // cuma divalidasi pas submit.
                        code: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9-]/g, ""),
                      })
                    }
                    type="text"
                    placeholder="mis. PROMO-AGT26-001"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 uppercase"
                  />
                </div>

                {/* Max Uses + Expires At */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">
                     Total Max Penggunaan Kode
                    </label>
                    <input
                      value={form.maxUses}
                      onChange={(e) =>
                        setForm({ ...form, maxUses: e.target.value })
                      }
                      type="number"
                      min={1}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">
                      Kadaluarsa
                    </label>
                    <input
                      value={form.expiresAt}
                      onChange={(e) =>
                        setForm({ ...form, expiresAt: e.target.value })
                      }
                      type="datetime-local"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    Catatan{" "}
                    <span className="text-gray-400 font-normal">
                      ({form.note.length}/{MAX_NOTE})
                    </span>
                  </label>
                  <textarea
                    value={form.note}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        note: e.target.value.slice(0, MAX_NOTE),
                      })
                    }
                    placeholder="mis. Giveaway IG Agustus 2026"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-7 mt-5 pb-8 shrink-0">
              <button
                onClick={handleClose}
                disabled={creating}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {creating ? "Membuat..." : "Buat Kode"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL ────────────────────────────────────────────────── */}
      {showSuccessModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            successVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              successVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Kode Redeem Berhasil Dibuat!
            </h2>

            <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 mb-6">
              <span className="font-mono font-semibold text-emerald-700 text-sm tracking-wide">
                {createdCode}
              </span>
              <button
                onClick={copyCreatedCode}
                className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold underline"
              >
                Salin
              </button>
            </div>

            <button
              onClick={handleSuccessClose}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              Lihat Daftar Kode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
