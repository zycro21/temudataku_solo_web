"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Plus,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

interface AyclHeaderProps {
  //   search: string;
  //   onSearchChange: (value: string) => void;
  onAyclCreated: () => void;
  refreshKey: number;
}

interface ScheduleEntry {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  googleMeetLink: string;
  quota: string;
}

interface MaterialEntry {
  title: string;
  description: string;
}

interface DifferentiatorItem {
  title: string;
  desc: string;
}

const emptySchedule = (): ScheduleEntry => ({
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  googleMeetLink: "",
  quota: "",
});

const emptyMaterial = (): MaterialEntry => ({ title: "", description: "" });
const emptyDiff = (): DifferentiatorItem => ({ title: "", desc: "" });

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-3 mt-1">
      {children}
    </p>
  );
}

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {optional && (
        <span className="ml-1 text-xs text-gray-400 font-normal">
          (opsional)
        </span>
      )}
    </label>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400";
const textareaCls = `${inputCls} resize-none`;

export default function AyclHeader({
  //   search,
  //   onSearchChange,
  onAyclCreated,
  refreshKey,
}: AyclHeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [page, setPage] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [totalAycl, setTotalAycl] = useState(0);
  const [expiredAycl, setExpiredAycl] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/aycl`,
        {
          params: { limit: 1000 },
          withCredentials: true,
        },
      );

      const list = res.data.data ?? [];

      const now = new Date();

      const expired = list.filter((item: any) => {
        if (!item.endDate) return false;
        return new Date(item.endDate) < now;
      });

      setTotalAycl(list.length);
      setExpiredAycl(expired.length);
    } catch (err) {
      console.error("Gagal fetch stats AYCL:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  // Page 1: Core
  const [core, setCore] = useState({
    title: "",
    slug: "",
    whatsappGroupLink: "",
    price: "",
    isActive: true,
  });

  // Page 2: Detail
  const [headline, setHeadline] = useState("");
  const [subHeadline, setSubHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [programInfoText, setProgramInfoText] = useState("");
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([
    emptySchedule(),
  ]);
  const [challenges, setChallenges] = useState<string[]>([""]);
  const [targets, setTargets] = useState<string[]>([""]);
  const [differentiators, setDifferentiators] = useState<DifferentiatorItem[]>([
    emptyDiff(),
  ]);
  const [materials, setMaterials] = useState<MaterialEntry[]>([
    emptyMaterial(),
  ]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [closingText, setClosingText] = useState("");

  const resetForm = () => {
    // page
    setPage(1);

    // core
    setCore({
      title: "",
      slug: "",
      whatsappGroupLink: "",
      price: "",
      isActive: true,
    });

    // detail
    setHeadline("");
    setSubHeadline("");
    setDescription("");
    setProgramInfoText("");

    setSchedules([emptySchedule()]);
    setChallenges([""]);
    setTargets([""]);
    setDifferentiators([emptyDiff()]);
    setMaterials([emptyMaterial()]);
    setBenefits([""]);
    setClosingText("");
  };

  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function untuk memastikan scroll balik normal saat komponen di-unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCreateModal]);

  const openCreate = () => {
    resetForm();
    setShowCreateModal(true);
    setTimeout(() => setCreateVisible(true), 10);
  };

  const closeCreate = () => {
    setCreateVisible(false);
    setTimeout(() => setShowCreateModal(false), 250);
  };

  const validatePage1 = () => {
    if (!core.title.trim()) {
      toast.error("Title wajib diisi");
      return false;
    }
    if (!core.slug.trim()) {
      toast.error("Slug wajib diisi");
      return false;
    }
    if (core.price === "" || isNaN(Number(core.price))) {
      toast.error("Price wajib diisi dengan angka");
      return false;
    }
    return true;
  };

  const goToPage2 = () => {
    if (!validatePage1()) return;
    setPage(2);
  };

  const handleCreate = async () => {
    if (!headline.trim()) {
      toast.error("Headline wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const sections: any[] = [];
      let order = 1;

      if (programInfoText.trim()) {
        sections.push({
          type: "PROGRAM_INFO",
          title: "Program Info",
          content: { text: programInfoText },
          order: order++,
        });
      }
      const filteredChallenges = challenges.filter((c) => c.trim());
      if (filteredChallenges.length) {
        sections.push({
          type: "CHALLENGE",
          title: "Challenge",
          content: { items: filteredChallenges },
          order: order++,
        });
      }
      const filteredTargets = targets.filter((t) => t.trim());
      if (filteredTargets.length) {
        sections.push({
          type: "TARGET",
          title: "Target",
          content: { items: filteredTargets },
          order: order++,
        });
      }
      const filteredDiff = differentiators.filter(
        (d) => d.title.trim() || d.desc.trim(),
      );
      if (filteredDiff.length) {
        sections.push({
          type: "DIFFERENTIATOR",
          title: "Differentiator",
          content: { items: filteredDiff },
          order: order++,
        });
      }
      const filteredBenefits = benefits.filter((b) => b.trim());
      if (filteredBenefits.length) {
        sections.push({
          type: "BENEFIT",
          title: "Benefit",
          content: { items: filteredBenefits },
          order: order++,
        });
      }
      if (closingText.trim()) {
        sections.push({
          type: "CLOSING",
          title: "Closing",
          content: { text: closingText },
          order: order++,
        });
      }

      const filteredMaterials = materials
        .filter((m) => m.title.trim())
        .map((m) => ({
          title: m.title,
          description: m.description || undefined,
        }));

      const filteredSchedules = schedules
        .filter((s) => s.date && s.startTime && s.endTime)
        .map((s) => ({
          title: s.title || undefined,
          date: s.date,
          startTime: `${s.date}T${s.startTime}:00`,
          endTime: `${s.date}T${s.endTime}:00`,
          googleMeetLink: s.googleMeetLink || undefined,
          quota: s.quota ? parseInt(s.quota) : undefined,
        }));

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/aycl`,
        {
          title: core.title,
          slug: core.slug,
          whatsappGroupLink: core.whatsappGroupLink || undefined,
          price: Number(core.price),
          isActive: core.isActive,
          headline,
          subHeadline: subHeadline || undefined,
          description: description || undefined,
          sections,
          materials: filteredMaterials,
          schedules: filteredSchedules,
        },
        { withCredentials: true },
      );

      toast.success("AYCL berhasil dibuat!");
      closeCreate();
      onAyclCreated();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Gagal membuat AYCL";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic list helpers
  const addStr = (list: string[], set: (v: string[]) => void) =>
    set([...list, ""]);
  const updateStr = (
    list: string[],
    set: (v: string[]) => void,
    i: number,
    val: string,
  ) => {
    const next = [...list];
    next[i] = val;
    set(next);
  };
  const removeStr = (list: string[], set: (v: string[]) => void, i: number) =>
    set(list.filter((_, idx) => idx !== i));

  const addSchedule = () => setSchedules((p) => [...p, emptySchedule()]);
  const updateSchedule = (i: number, key: keyof ScheduleEntry, val: string) => {
    setSchedules((p) => {
      const n = [...p];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };
  const removeSchedule = (i: number) =>
    setSchedules((p) => p.filter((_, idx) => idx !== i));

  const addMaterial = () => setMaterials((p) => [...p, emptyMaterial()]);
  const updateMaterial = (i: number, key: keyof MaterialEntry, val: string) => {
    setMaterials((p) => {
      const n = [...p];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };
  const removeMaterial = (i: number) =>
    setMaterials((p) => p.filter((_, idx) => idx !== i));

  const addDiff = () => setDifferentiators((p) => [...p, emptyDiff()]);
  const updateDiff = (
    i: number,
    key: keyof DifferentiatorItem,
    val: string,
  ) => {
    setDifferentiators((p) => {
      const n = [...p];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };
  const removeDiff = (i: number) =>
    setDifferentiators((p) => p.filter((_, idx) => idx !== i));

  return (
    <>
      <div className="pt-3 pl-3 pr-2 pb-6 space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
              AYCL (All You Can Learn)
            </h1>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              Kelola program AYCL yang tersedia untuk peserta dengan lebih
              mudah, terstruktur, dan efisien.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            <Plus size={16} />
            Create AYCL
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-400 font-medium mb-1">Total AYCL</p>
            <p className="text-3xl font-semibold text-emerald-600">
              {loadingStats ? "..." : totalAycl}
            </p>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-400 font-medium mb-1">
              Sudah Lewat
            </p>
            <p className="text-3xl font-bold text-gray-400">
              {loadingStats ? "..." : expiredAycl}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div
          className={`fixed inset-0 h-screen w-screen z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            createVisible
              ? "bg-black/60 opacity-100 backdrop-blur-sm"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[620px] max-h-[88vh] flex flex-col rounded-2xl shadow-2xl transform transition-all duration-300 ${
              createVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Create AYCL
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {page === 1
                    ? "Langkah 1 dari 2 — Informasi utama program"
                    : "Langkah 2 dari 2 — Detail & konten program"}
                </p>
              </div>
              <button
                onClick={closeCreate}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-7 pt-3 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className={`h-1.5 rounded-full flex-1 transition-colors ${page >= 1 ? "bg-emerald-500" : "bg-gray-200"}`}
                />
                <div
                  className={`h-1.5 rounded-full flex-1 transition-colors ${page >= 2 ? "bg-emerald-500" : "bg-gray-200"}`}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400">Inti</span>
                <span className="text-[10px] text-gray-400">Detail</span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-7 py-4">
              {/* PAGE 1 */}
              {page === 1 && (
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input
                      type="text"
                      value={core.title}
                      onChange={(e) =>
                        setCore((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="AYCL Batch 2"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <FieldLabel>Slug</FieldLabel>
                    <input
                      type="text"
                      value={core.slug}
                      onChange={(e) =>
                        setCore((p) => ({
                          ...p,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, ""),
                        }))
                      }
                      placeholder="aycl-batch-2"
                      className={inputCls}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Hanya huruf kecil, angka, dan tanda hubung (-)
                    </p>
                  </div>

                  <div>
                    <FieldLabel>Harga (Rp)</FieldLabel>
                    <input
                      type="number"
                      min={0}
                      value={core.price}
                      onChange={(e) =>
                        setCore((p) => ({ ...p, price: e.target.value }))
                      }
                      placeholder="49000"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <FieldLabel optional>Link Grup WhatsApp</FieldLabel>
                    <input
                      type="url"
                      value={core.whatsappGroupLink}
                      onChange={(e) =>
                        setCore((p) => ({
                          ...p,
                          whatsappGroupLink: e.target.value,
                        }))
                      }
                      placeholder="https://chat.whatsapp.com/..."
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <div className="relative">
                      <select
                        value={core.isActive ? "true" : "false"}
                        onChange={(e) =>
                          setCore((p) => ({
                            ...p,
                            isActive: e.target.value === "true",
                          }))
                        }
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="true">Aktif</option>
                        <option value="false">Tidak Aktif</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2 */}
              {page === 2 && (
                <div className="space-y-5">
                  {/* Hero */}
                  <SectionLabel>Hero</SectionLabel>
                  <div>
                    <FieldLabel>Headline</FieldLabel>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="All You Can Learn • Data Analyst Program"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <FieldLabel optional>Sub Headline</FieldLabel>
                    <input
                      type="text"
                      value={subHeadline}
                      onChange={(e) => setSubHeadline(e.target.value)}
                      placeholder="Upgrade skill Data Analyst..."
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <FieldLabel optional>Deskripsi Singkat Program</FieldLabel>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Program belajar intensif untuk kamu..."
                      className={textareaCls}
                    />
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Program Info */}
                  <SectionLabel>Info Program</SectionLabel>
                  <div>
                    <FieldLabel optional>Teks Program Info</FieldLabel>
                    <textarea
                      rows={3}
                      value={programInfoText}
                      onChange={(e) => setProgramInfoText(e.target.value)}
                      placeholder="AYCL Batch 2 adalah program belajar Data Analyst..."
                      className={textareaCls}
                    />
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Schedule */}
                  <SectionLabel>Jadwal / Schedule</SectionLabel>
                  {schedules.map((s, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Sesi {i + 1}
                        </span>
                        {schedules.length > 1 && (
                          <button
                            onClick={() => removeSchedule(i)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <div>
                        <FieldLabel optional>Judul Sesi</FieldLabel>
                        <input
                          type="text"
                          value={s.title}
                          onChange={(e) =>
                            updateSchedule(i, "title", e.target.value)
                          }
                          placeholder="Sesi 1 — Data Cleaning"
                          className={inputCls}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <FieldLabel>Tanggal</FieldLabel>
                          <input
                            type="date"
                            value={s.date}
                            onChange={(e) =>
                              updateSchedule(i, "date", e.target.value)
                            }
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <FieldLabel>Mulai</FieldLabel>
                          <input
                            type="time"
                            value={s.startTime}
                            onChange={(e) =>
                              updateSchedule(i, "startTime", e.target.value)
                            }
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <FieldLabel>Selesai</FieldLabel>
                          <input
                            type="time"
                            value={s.endTime}
                            onChange={(e) =>
                              updateSchedule(i, "endTime", e.target.value)
                            }
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <FieldLabel optional>Link Google Meet</FieldLabel>
                          <input
                            type="url"
                            value={s.googleMeetLink}
                            onChange={(e) =>
                              updateSchedule(
                                i,
                                "googleMeetLink",
                                e.target.value,
                              )
                            }
                            placeholder="https://meet.google.com/..."
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <FieldLabel optional>Kuota</FieldLabel>
                          <input
                            type="number"
                            min={1}
                            value={s.quota}
                            onChange={(e) =>
                              updateSchedule(i, "quota", e.target.value)
                            }
                            placeholder="100"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addSchedule}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                  >
                    <Plus size={13} /> Tambah Jadwal
                  </button>

                  <div className="border-t border-gray-100" />

                  {/* Challenge */}
                  <SectionLabel>Tantangan Sebelum Memulai</SectionLabel>
                  {challenges.map((c, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={c}
                        onChange={(e) =>
                          updateStr(
                            challenges,
                            setChallenges,
                            i,
                            e.target.value,
                          )
                        }
                        placeholder={`Challenge ${i + 1}`}
                        className={inputCls}
                      />
                      {challenges.length > 1 && (
                        <button
                          onClick={() =>
                            removeStr(challenges, setChallenges, i)
                          }
                          className="mt-2 text-red-400 hover:text-red-600 shrink-0 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addStr(challenges, setChallenges)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                  >
                    <Plus size={13} /> Tambah Tantangan
                  </button>

                  <div className="border-t border-gray-100" />

                  {/* Target */}
                  <SectionLabel>Target Peserta</SectionLabel>
                  {targets.map((t, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={t}
                        onChange={(e) =>
                          updateStr(targets, setTargets, i, e.target.value)
                        }
                        placeholder={`Target ${i + 1}`}
                        className={inputCls}
                      />
                      {targets.length > 1 && (
                        <button
                          onClick={() => removeStr(targets, setTargets, i)}
                          className="mt-2 text-red-400 hover:text-red-600 shrink-0 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addStr(targets, setTargets)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                  >
                    <Plus size={13} /> Tambah Target
                  </button>

                  <div className="border-t border-gray-100" />

                  {/* Differentiator */}
                  <SectionLabel>
                    Perbedaan Program ini dengan Program Lain
                  </SectionLabel>
                  {differentiators.map((d, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Item {i + 1}
                        </span>
                        {differentiators.length > 1 && (
                          <button
                            onClick={() => removeDiff(i)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={d.title}
                        onChange={(e) => updateDiff(i, "title", e.target.value)}
                        placeholder="Judul keunggulan"
                        className={inputCls}
                      />
                      <textarea
                        rows={2}
                        value={d.desc}
                        onChange={(e) => updateDiff(i, "desc", e.target.value)}
                        placeholder="Deskripsi keunggulan..."
                        className={textareaCls}
                      />
                    </div>
                  ))}
                  <button
                    onClick={addDiff}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                  >
                    <Plus size={13} /> Tambah Perbedaan
                  </button>

                  <div className="border-t border-gray-100" />

                  {/* Materials */}
                  <SectionLabel>
                    Materi Program (Saran Jumlah-nya sama dengan Jumlah Jadwal)
                  </SectionLabel>
                  {materials.map((m, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Materi {i + 1}
                        </span>
                        {materials.length > 1 && (
                          <button
                            onClick={() => removeMaterial(i)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) =>
                          updateMaterial(i, "title", e.target.value)
                        }
                        placeholder="Data Cleaning with Excel"
                        className={inputCls}
                      />
                      <textarea
                        rows={2}
                        value={m.description}
                        onChange={(e) =>
                          updateMaterial(i, "description", e.target.value)
                        }
                        placeholder="Deskripsi materi (opsional)..."
                        className={textareaCls}
                      />
                    </div>
                  ))}
                  <button
                    onClick={addMaterial}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                  >
                    <Plus size={13} /> Tambah Materi
                  </button>

                  <div className="border-t border-gray-100" />

                  {/* Benefit */}
                  <SectionLabel>Benefit</SectionLabel>
                  {benefits.map((b, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) =>
                          updateStr(benefits, setBenefits, i, e.target.value)
                        }
                        placeholder={`Benefit ${i + 1}`}
                        className={inputCls}
                      />
                      {benefits.length > 1 && (
                        <button
                          onClick={() => removeStr(benefits, setBenefits, i)}
                          className="mt-2 text-red-400 hover:text-red-600 shrink-0 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addStr(benefits, setBenefits)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                  >
                    <Plus size={13} /> Tambah Benefit
                  </button>

                  <div className="border-t border-gray-100" />

                  {/* Closing */}
                  <SectionLabel>Closing</SectionLabel>
                  <div>
                    <FieldLabel optional>Teks Penutup</FieldLabel>
                    <textarea
                      rows={2}
                      value={closingText}
                      onChange={(e) => setClosingText(e.target.value)}
                      placeholder="Kalau kamu ingin mulai belajar data dengan lebih terarah..."
                      className={textareaCls}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-gray-100 shrink-0 flex gap-3">
              {page === 1 ? (
                <>
                  <button
                    onClick={closeCreate}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={goToPage2}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                  >
                    Selanjutnya <ChevronRight size={15} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setPage(1)}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={15} /> Kembali
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Menyimpan..." : "Buat AYCL"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
