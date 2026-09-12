"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react"; // 🔥 TAMBAHAN

export default function CompleteAyclPage() {
  const { bookingId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    currentStatus: "",
    otherStatus: "",
    institution: "",
    studyProgram: "",
    semester: "",
    age: "",
    reason: "",
    familiarity: "",
  });

  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const statusOptions = [
    "Mahasiswa",
    "Fresh Graduate",
    "Profesional",
    "Career Switcher",
    "Other",
  ];

  const familiarityOptions = [
    "Belum pernah",
    "Pernah dengar tapi belum praktik",
    "Pernah ikut pelatihan",
    "Sudah sering praktik",
  ];

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const missingFields: string[] = [];

    if (!formData.currentStatus) missingFields.push("Status Saat Ini");
    if (!formData.institution) missingFields.push("Instansi");
    if (!formData.studyProgram) missingFields.push("Program Studi");
    if (!formData.semester) missingFields.push("Semester");
    if (!formData.age) missingFields.push("Usia");
    if (!formData.reason) missingFields.push("Alasan");
    if (!formData.familiarity) missingFields.push("Familiaritas");

    if (missingFields.length > 0) {
      toast.error(
        `Field berikut belum diisi:\n• ${missingFields.join("\n• ")}`,
        { duration: 4000 },
      );
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    if (!validateForm()) return;

    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ayclbooking/${bookingId}`,
        {
          currentStatus: formData.currentStatus,
          institution: formData.institution,
          studyProgram: formData.studyProgram,
          semester: formData.semester,
          age: Number(formData.age),
          reason: formData.reason,
          familiarity: formData.familiarity,
        },
        { withCredentials: true },
      );

      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      toast.error("Gagal update data.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    // 🔥 DIUBAH: padding luar dulu selalu "px-4 pt-10 py-20" (sama di
    // semua ukuran). Sekarang di mobile lebih rapat ("px-3 pt-6") + ada
    // "pb-28" (ruang cadangan buat sticky submit bar di bawah, biar
    // nggak numpuk sama konten). Mulai sm: (≥640px) balik PERSIS
    // "px-4 pt-10 py-20" seperti semula.
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 pt-6 pb-28 sm:px-4 sm:pt-10 sm:py-20">
      {/* 🔥 DIUBAH: card dulu selalu "rounded-xl p-6 md:p-8" — sekarang
          mobile "rounded-2xl p-5", balik PERSIS "rounded-xl p-6" mulai
          sm: (lalu md:p-8 tetap seperti semula). */}
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-xl p-5 sm:p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          {/* 🔥 BARU: badge kecil, CUMA muncul di mobile (sm:hidden) —
              penanda konteks halaman sebelum judul, biar nggak polos. */}
          <div className="sm:hidden inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-600">
            <Sparkles size={12} />
            Formulir AYCL
          </div>

          <h1 className="text-lg md:text-xl font-semibold">
            Lengkapi Data Pembelajaran untuk AYCL
          </h1>
          <p className="text-sm text-gray-500">
            Sebelum memulai kelas, mohon lengkapi data berikut
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          {/* STATUS */}
          <div>
            <label className="text-xs text-gray-600">
              Status Saat Ini <span className="text-red-500">*</span>
            </label>

            {/* 🔥 DIUBAH: py-2 → py-2.5 sm:py-2 (tap target sedikit lebih
                besar di mobile, balik ke ukuran original mulai sm:). */}
            <select
              className="w-full border rounded-lg px-3 py-2.5 sm:py-2 text-sm mt-1"
              value={isOtherSelected ? "Other" : formData.currentStatus}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "Other") {
                  setIsOtherSelected(true);
                  setFormData({
                    ...formData,
                    currentStatus: "",
                    otherStatus: "",
                  });
                } else {
                  setIsOtherSelected(false);
                  setFormData({
                    ...formData,
                    currentStatus: value,
                    otherStatus: "",
                  });
                }
              }}
            >
              <option value="">Pilih Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {isOtherSelected && (
              <input
                type="text"
                placeholder="Contoh: Freelancer, Ibu Rumah Tangga, dll"
                className="w-full border rounded-lg px-3 py-2.5 sm:py-2 text-sm mt-2 focus:ring-2 focus:ring-emerald-400"
                value={formData.otherStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otherStatus: e.target.value,
                    currentStatus: e.target.value,
                  })
                }
              />
            )}
          </div>

          <InputField
            label="Instansi"
            name="institution"
            onChange={handleChange}
            placeholder="Isi 'umum' jika tidak ada"
          />
          <InputField
            label="Program Studi"
            name="studyProgram"
            onChange={handleChange}
            placeholder="Jika bukan mahasiswa bisa isi dengan '-'"
          />

          <InputField
            label="Semester"
            name="semester"
            onChange={handleChange}
            placeholder="Jika bukan mahasiswa bisa isi dengan '-'"
          />

          <InputField
            label="Usia"
            name="age"
            type="number"
            onChange={handleChange}
            placeholder="Contoh: 21"
          />

          <TextareaField
            label="Mengapa kamu tertarik mengikuti All You Can Learn ini?"
            name="reason"
            onChange={handleChange}
            placeholder="Ceritakan alasan kamu mengikuti program ini..."
          />
          <div>
            <label className="text-xs text-gray-600">
              Sejauh mana kamu familiar dengan topik All You Can Learn ini?{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              name="familiarity"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2.5 sm:py-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Pilih tingkat pemahaman kamu</option>
              {familiarityOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🔥 DIUBAH: tombol submit ASLI ini TIDAK diubah sama sekali
            (teks, style, onClick, disabled) — cuma ditambah "hidden
            sm:block" biar disembunyikan di mobile (digantikan sticky bar
            di bawah) dan tampil PERSIS seperti semula mulai sm: ke atas. */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="hidden sm:block w-full bg-emerald-500 text-white py-2.5 rounded-lg hover:bg-emerald-600 transition font-medium"
        >
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </div>

      {/* 🔥 BARU: sticky submit bar, CUMA muncul di mobile (sm:hidden) —
          tombolnya sama persis (onClick={handleSubmit}, disabled={loading},
          teks sama), cuma ditaruh fixed di bawah viewport biar selalu
          gampang di-tap tanpa perlu scroll ke bawah form yang panjang. */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 p-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-500 text-white py-2.5 rounded-lg hover:bg-emerald-600 transition font-medium disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </div>

      {/* ================= MODAL CONFIRM ================= */}
      {showConfirm && (
        <Modal>
          <h2 className="text-lg font-semibold text-center">Konfirmasi Data</h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            Apakah kamu yakin ingin menyimpan data ini?
          </p>

          {/* 🔥 DIUBAH: dulu selalu "flex gap-3" (2 tombol berdampingan).
              Di mobile sekarang "flex-col" (stack, full-width) — balik
              PERSIS "flex-row" seperti semula mulai sm: ke atas. */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full sm:flex-1 border rounded-lg py-2.5 sm:py-2"
            >
              Batal
            </button>
            <button
              onClick={confirmSubmit}
              className="w-full sm:flex-1 bg-emerald-500 text-white rounded-lg py-2.5 sm:py-2"
            >
              Ya, Simpan
            </button>
          </div>
        </Modal>
      )}

      {/* ================= MODAL SUCCESS ================= */}
      {showSuccess && (
        <Modal>
          <h2 className="text-lg font-semibold text-center text-emerald-600">
            Berhasil 🎉
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            Data kamu berhasil disimpan
          </p>

          <div className="flex flex-col gap-3 mt-5">
            <button
              onClick={() => router.push("/dashboard/user")}
              className="bg-emerald-500 text-white py-2.5 sm:py-2 rounded-lg"
            >
              Ke Dashboard
            </button>

            <button
              onClick={() => router.push("/")}
              className="border py-2.5 sm:py-2 rounded-lg"
            >
              Ke Landing Page
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================= COMPONENT ================= */

function Modal({ children }: any) {
  return (
    <AnimatePresence>
      <motion.div
        // 🔥 DIUBAH: px-4 ditambah, biar overlay nggak mepet ke tepi
        // layar di mobile (sebelumnya overlay full-bleed tanpa padding,
        // modal card cuma dijaga oleh "max-w-sm" sendiri). Netral di
        // semua ukuran karena cuma nambah jarak dari tepi.
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* 🔥 DIUBAH: p-6 → p-5 sm:p-6 (dikit lebih rapat di mobile,
            balik ke ukuran original mulai sm: ke atas). */}
        <motion.div
          className="bg-white w-full max-w-sm rounded-xl p-5 sm:p-6 shadow-lg"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InputField({
  label,
  name,
  onChange,
  type = "text",
  placeholder,
}: any) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      {/* 🔥 DIUBAH: py-2 → py-2.5 sm:py-2 */}
      <input
        type={type}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2.5 sm:py-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-400"
      />
    </div>
  );
}

function TextareaField({ label, name, onChange, placeholder }: any) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      {/* 🔥 DIUBAH: py-2 → py-2.5 sm:py-2 */}
      <textarea
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2.5 sm:py-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-400"
      />
    </div>
  );
}
