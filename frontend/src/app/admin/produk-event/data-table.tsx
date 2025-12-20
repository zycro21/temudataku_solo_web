"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Search,
  Trash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { MentorOption } from "@/types/mentor";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  mentorOptions: MentorOption[];
}

type EditFieldProps = {
  label: string;
  children: React.ReactNode;
};

const EditField = ({ label, children }: EditFieldProps) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-600 block">{label}</label>
    {children}
  </div>
);

export function DataTable<TData extends Project, TValue>({
  columns,
  data,
  mentorOptions,
}: DataTableProps<TData, TValue>) {
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedProduct, setSelectedProject] = React.useState<Project | null>(
    null
  );
  const [detailTab, setDetailTab] = React.useState(1);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setDetailTab(1);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    kategori: "Mentoring" | "E-Learning";
  } | null>(null);

  const handleDelete = (id?: string) => {
    if (!id || !selectedProduct) return;

    setDeleteTarget({
      id,
      kategori: selectedProduct.kategori as "Mentoring" | "E-Learning",
    });

    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.kategori === "Mentoring") {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/admin/mentoring-services/${deleteTarget.id}`,
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${deleteTarget.id}`,
          {
            withCredentials: true,
          }
        );
      }

      toast.success("Produk berhasil dihapus");

      setIsDeleteDialogOpen(false);
      setIsDetailDialogOpen(false);
      setDeleteTarget(null);

      // opsional: refresh data
      // fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus produk");
    }
  };

  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [editStep, setEditStep] = React.useState(1);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  type Kategori = "Mentoring" | "E-Learning";
  type TipeMentoring =
    | "Bootcamp"
    | "Short Class"
    | "Live Class"
    | "1 on 1 Mentoring"
    | "Group Mentoring";

  type EditFormData = {
    id: string;
    nama: string;
    kategori: Kategori;
    tipeMentoring: TipeMentoring | "";
    foto: File | null;
    deskripsi: string;
    harga: string;
    status: string;

    // 🆕 mentor
    mentorIds?: string[]; // mentoring
    mentorId?: string; // e-learning

    // 🆕 tambahan
    maxParticipants?: string;
    durationDays?: string;

    diskonTipe: string;
    diskon: number;
    hargaDiskon: string;

    // 🟢 MENTORING
    benefits?: string;
    mechanism?: string;
    toolsUsed?: string;
    targetAudience?: string;
    schedule?: string;
    alumniPortfolio?: string;
    syllabusPath?: string;

    // 🟢 E-LEARNING
    category?: string;
    level?: string;
    estimatedDuration?: string;
    tags?: string[];
  };

  const initialEditFormData: EditFormData = {
    id: "",
    nama: "",
    kategori: "Mentoring",
    tipeMentoring: "",
    foto: null,
    deskripsi: "",
    harga: "",
    status: "Aktif",

    mentorIds: [],
    mentorId: "",

    maxParticipants: "",
    durationDays: "",

    diskonTipe: "persentase",
    diskon: 0,
    hargaDiskon: "",

    benefits: "",
    mechanism: "",
    toolsUsed: "",
    targetAudience: "",
    schedule: "",
    alumniPortfolio: "",
    syllabusPath: "",

    category: "",
    level: "",
    estimatedDuration: "",
    tags: [],
  };

  const [editFormData, setEditFormData] =
    useState<EditFormData>(initialEditFormData);

  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");

  // close edit dialog
  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditStep(1); // reset kembali ke step 1
  };

  // ke step berikutnya
  const handleEditNextStep = () => {
    if (editStep < 2) {
      setEditStep(editStep + 1);
    }
  };

  // ke step sebelumnya
  const handleEditPrevStep = () => {
    if (editStep > 1) {
      setEditStep(editStep - 1);
    }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const toBooleanStatus = (status: string) => status === "Aktif";

  // simpan perubahan
  const handleSaveEdit = async () => {
    try {
      if (!editFormData.id) {
        toast.error("ID produk tidak ditemukan");
        return;
      }

      // ============================
      // 🟢 MENTORING
      // ============================
      if (editFormData.kategori === "Mentoring") {
        const payload = {
          serviceName: editFormData.nama,
          description: editFormData.deskripsi,
          price: Number(editFormData.harga),
          maxParticipants: editFormData.maxParticipants
            ? Number(editFormData.maxParticipants)
            : undefined,
          durationDays: editFormData.durationDays
            ? Number(editFormData.durationDays)
            : undefined,
          isActive: toBooleanStatus(editFormData.status),

          mentorProfileIds: selectedMentorIds,

          benefits: editFormData.benefits,
          mechanism: editFormData.mechanism,
          syllabusPath: editFormData.syllabusPath,
          toolsUsed: editFormData.toolsUsed,
          targetAudience: editFormData.targetAudience,
          schedule: editFormData.schedule,
          alumniPortfolio: editFormData.alumniPortfolio,
        };

        // Hapus undefined (biar PATCH bersih)
        Object.keys(payload).forEach(
          (key) =>
            (payload as any)[key] === undefined && delete (payload as any)[key]
        );

        await axios.patch(
          `${API_BASE}/api/mentorService/admin/mentoring-services/${editFormData.id}`,
          payload,
          { withCredentials: true }
        );

        toast.success("Mentoring berhasil diperbarui");
      }

      // ============================
      // 🔵 E-LEARNING
      // ============================
      if (editFormData.kategori === "E-Learning") {
        const formData = new FormData();

        formData.append("title", editFormData.nama);
        formData.append("description", editFormData.deskripsi);
        formData.append("price", editFormData.harga);
        formData.append("category", editFormData.category || "");
        formData.append("level", editFormData.level || "");
        formData.append(
          "estimatedDuration",
          editFormData.estimatedDuration || ""
        );
        formData.append("benefits", editFormData.benefits || "");
        formData.append("toolsUsed", editFormData.toolsUsed || "");
        formData.append("targetAudience", editFormData.targetAudience || "");
        formData.append(
          "isActive",
          String(toBooleanStatus(editFormData.status))
        );

        if (selectedMentorId) {
          formData.append("mentorId", selectedMentorId);
        }

        // TAGS
        (editFormData.tags ?? []).forEach((tag) =>
          formData.append("tags[]", tag)
        );

        // FOTO / THUMBNAIL
        if (editFormData.foto) {
          formData.append("thumbnailImages", editFormData.foto);
        }

        await axios.put(
          `${API_BASE}/api/elearningCourse/courses/${editFormData.id}`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("E-Learning berhasil diperbarui");
      }

      // ============================
      // CLOSE DIALOG
      // ============================
      setShowEditDialog(false);
      setEditStep(1);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal menyimpan perubahan");
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const totalPages = table.getPageCount();

  const DetailItem = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <label className="text-sm font-semibold text-gray-600 block mb-1">
        {label}
      </label>
      <p className="text-sm font-medium text-gray-900">
        {value && value !== "-" ? value : "-"}
      </p>
    </div>
  );

  const getFileNameFromUrl = (url?: string | null) => {
    if (!url) return "";
    try {
      return decodeURIComponent(url.split("/").pop() || "");
    } catch {
      return "";
    }
  };

  const EditDialog = (
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent
        forceMount
        className="max-w-3xl max-h-[90vh] p-6 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Produk Atau Event</DialogTitle>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center space-x-4 my-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                editStep >= 1
                  ? "bg-[#0CA678] text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              1
            </div>
            <span
              className={`text-xs font-medium ${
                editStep === 1 ? "text-[#0CA678]" : "text-gray-400"
              }`}
            >
              Edit Informasi Dasar
            </span>
          </div>

          {/* Garis dihapus */}

          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                editStep >= 2
                  ? "bg-[#0CA678] text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-medium ${
                editStep === 2 ? "text-[#0CA678]" : "text-gray-400"
              }`}
            >
              Edit Deskripsi, Harga, dan Status
            </span>
          </div>
        </div>

        {/* Garis Pemisah */}
        <div className="w-full h-px bg-gray-300 mb-4"></div>

        {/* Konten Form Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          {editStep === 1 ? (
            <>
              {/* STEP 1 */}
              <div className="space-y-6">
                <label className="text-sm font-bold text-gray-900 block mb-2">
                  Foto Produk
                </label>

                <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6 flex flex-col items-center text-center">
                  <Image
                    src={previewFoto || "/placeholder-image.png"}
                    width={120}
                    height={120}
                    unoptimized
                    className="rounded object-contain max-w-full max-h-48 mb-3 bg-gray-300"
                    alt="foto"
                  />
                  <p className="font-bold text-gray-900 mb-1">
                    File Berhasil Diupload
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {editFormData.foto?.name ||
                      getFileNameFromUrl(previewFoto) ||
                      "foto_produk.jpg"}
                  </p>

                  <div className="flex space-x-3">
                    <label className="bg-[#0CA678] hover:bg-[#08916C] text-white text-sm px-4 py-2 rounded cursor-pointer">
                      Ubah Foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setEditFormData({
                            ...editFormData,
                            foto: file,
                          });
                          if (file) setPreviewFoto(URL.createObjectURL(file));
                        }}
                      />
                    </label>

                    <Button
                      variant="destructive"
                      className="text-sm"
                      onClick={() => {
                        setEditFormData({ ...editFormData, foto: null });
                        setPreviewFoto(null);
                      }}
                    >
                      Hapus Foto
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    ID Produk
                  </label>
                  <Input
                    value={editFormData.id}
                    disabled
                    className="bg-green-50 border-green-300 font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Kategori Produk
                  </label>
                  <Select
                    value={editFormData.kategori}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
                        kategori: value as Kategori,
                        tipeMentoring:
                          value === "Mentoring"
                            ? editFormData.tipeMentoring
                            : "",
                      })
                    }
                  >
                    <SelectTrigger className="w-full rounded-lg">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentoring">Mentoring</SelectItem>
                      <SelectItem value="E-Learning">E-Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editFormData.kategori === "Mentoring" && (
                  <div className="mt-2 col-span-2">
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      Tipe Mentoring
                    </label>
                    <Select
                      value={editFormData.tipeMentoring}
                      onValueChange={(value) =>
                        setEditFormData({
                          ...editFormData,
                          tipeMentoring: value as TipeMentoring,
                        })
                      }
                    >
                      <SelectTrigger className="w-full rounded-lg">
                        <SelectValue placeholder="Pilih tipe mentoring" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="Short Class">Short Class</SelectItem>
                        <SelectItem value="Live Class">Live Class</SelectItem>
                        <SelectItem value="1 on 1 Mentoring">
                          1 on 1 Mentoring
                        </SelectItem>
                        <SelectItem value="Group Mentoring">
                          Group Mentoring
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="pt-3 mb-3">
                <label className="text-sm font-bold text-gray-900 block mb-2">
                  Nama Produk
                </label>
                <Input
                  value={editFormData.nama}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      nama: e.target.value,
                    })
                  }
                  placeholder="Masukkan nama produk"
                />
              </div>

              {editFormData.kategori === "Mentoring" && (
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Pilih Mentor (bisa lebih dari 1)
                  </label>

                  <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {mentorOptions.map((mentor) => {
                      const checked = selectedMentorIds.includes(mentor.id);

                      return (
                        <label
                          key={mentor.id}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedMentorIds((prev) =>
                                checked
                                  ? prev.filter((id) => id !== mentor.id)
                                  : [...prev, mentor.id]
                              );
                            }}
                          />
                          {mentor.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {editFormData.kategori === "E-Learning" && (
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Pilih Mentor
                  </label>

                  <Select
                    value={selectedMentorId}
                    onValueChange={(value) => setSelectedMentorId(value)}
                  >
                    <SelectTrigger className="w-full border rounded-lg">
                      <SelectValue placeholder="Pilih mentor" />
                    </SelectTrigger>

                    <SelectContent>
                      {mentorOptions.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          {mentor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          ) : (
            <>
              {/* STEP 2 */}
              <div className="space-y-5 pt-2">
                <EditField label="Deskripsi">
                  <textarea
                    rows={4}
                    className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                    placeholder="Masukkan deskripsi produk"
                    value={editFormData.deskripsi}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        deskripsi: e.target.value,
                      }))
                    }
                  />
                </EditField>
              </div>

              {editFormData.kategori === "Mentoring" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 pb-3">
                  <EditField label="Max Participants">
                    <Input
                      type="number"
                      min={1}
                      value={editFormData.maxParticipants}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          maxParticipants: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Duration (Days)">
                    <Input
                      type="number"
                      min={1}
                      value={editFormData.durationDays}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          durationDays: e.target.value,
                        }))
                      }
                    />
                  </EditField>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pb-5">
                <EditField label="Harga">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Masukkan harga"
                    value={editFormData.harga}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        harga: e.target.value,
                      }))
                    }
                  />
                </EditField>

                <EditField label="Status">
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full rounded-lg">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </EditField>
              </div>

              {/* <div className="pt-3">
                    <EditField label="Diskon">
                      <div className="flex items-center gap-6 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="diskonTipe"
                            checked={editFormData.diskonTipe === "persentase"}
                            onChange={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                diskonTipe: "persentase",
                                diskon: 0,
                              }))
                            }
                          />
                          <span className="text-sm font-bold text-gray-700">
                            Persentase (%)
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="diskonTipe"
                            checked={editFormData.diskonTipe === "angka"}
                            onChange={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                diskonTipe: "angka",
                                diskon: 0,
                              }))
                            }
                          />
                          <span className="text-sm font-bold text-gray-700">
                            Nominal (Rp)
                          </span>
                        </label>
                      </div>

                      {editFormData.diskonTipe && (
                        <Input
                          placeholder={
                            editFormData.diskonTipe === "persentase"
                              ? "Isikan persentase diskon"
                              : "Isikan jumlah diskon dalam rupiah"
                          }
                          value={editFormData.diskon}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            const harga = Number(editFormData.harga) || 0;

                            const hargaDiskon =
                              editFormData.diskonTipe === "persentase"
                                ? harga - (harga * value) / 100
                                : harga - value;

                            setEditFormData((prev) => ({
                              ...prev,
                              diskon: value,
                              hargaDiskon: hargaDiskon.toString(),
                            }));
                          }}
                        />
                      )}
                    </EditField>
                  </div> */}

              {/* ======================
        MENTORING ONLY
    ====================== */}
              {editFormData.kategori === "Mentoring" && (
                <div className="space-y-4 pt-6">
                  <h3 className="text-base font-bold text-emerald-700">
                    Detail Mentoring
                  </h3>

                  <EditField label="Benefits">
                    <textarea
                      rows={3}
                      placeholder="Tuliskan manfaat utama yang akan didapatkan peserta"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.benefits}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          benefits: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Mechanism">
                    <textarea
                      rows={3}
                      placeholder="Jelaskan mekanisme pelaksanaan mentoring"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.mechanism}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          mechanism: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Syllabus Path">
                    <textarea
                      rows={2}
                      placeholder="Masukkan alur atau path silabus mentoring"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.syllabusPath}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          syllabusPath: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Tools Used">
                    <textarea
                      rows={2}
                      placeholder="Sebutkan tools atau teknologi yang digunakan"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.toolsUsed}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          toolsUsed: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Target Audience">
                    <textarea
                      rows={2}
                      placeholder="Jelaskan target peserta mentoring"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.targetAudience}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          targetAudience: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Schedule">
                    <textarea
                      rows={2}
                      placeholder="Tuliskan jadwal pelaksanaan mentoring"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.schedule}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          schedule: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Alumni Portfolio">
                    <textarea
                      rows={2}
                      placeholder="Contoh portfolio atau hasil karya alumni"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.alumniPortfolio}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          alumniPortfolio: e.target.value,
                        }))
                      }
                    />
                  </EditField>
                </div>
              )}

              {/* ======================
        E-LEARNING ONLY
    ====================== */}
              {editFormData.kategori === "E-Learning" && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-base font-bold text-emerald-700">
                    Detail E-Learning
                  </h3>

                  <EditField label="Category">
                    <textarea
                      rows={2}
                      placeholder="Masukkan kategori e-learning"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.category}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Level">
                    <textarea
                      rows={2}
                      placeholder="Tentukan level e-learning"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.level}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          level: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Estimated Duration">
                    <textarea
                      rows={2}
                      placeholder="Perkiraan durasi pembelajaran"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.estimatedDuration}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          estimatedDuration: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Benefits">
                    <textarea
                      rows={3}
                      placeholder="Manfaat yang akan diperoleh peserta"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      value={editFormData.benefits}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          benefits: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  <EditField label="Tools Used">
                    <textarea
                      rows={2}
                      placeholder="Tools atau platform yang digunakan"
                      className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          toolsUsed: e.target.value,
                        }))
                      }
                    />
                  </EditField>

                  {/* TAGS – TETAP INPUT */}
                  <EditField label="Tags">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editFormData.tags ?? []).map((tag, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                tags: prev.tags?.filter((_, i) => i !== idx),
                              }))
                            }
                            className="font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <Input
                      placeholder="Tekan Enter untuk menambahkan tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (!value) return;

                          setEditFormData((prev) => ({
                            ...prev,
                            tags: prev.tags?.includes(value)
                              ? prev.tags
                              : [...(prev.tags ?? []), value],
                          }));

                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                  </EditField>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex space-x-3 pt-4 border-t mt-4">
          {editStep === 1 ? (
            <>
              <Button
                variant="outline"
                className="flex-1 border-[#0CA678] text-[#0CA678]"
                onClick={handleCloseEditDialog}
              >
                Kembali
              </Button>
              <Button
                className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                onClick={handleEditNextStep}
              >
                Selanjutnya
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 border-[#0CA678] text-[#0CA678]"
                onClick={handleEditPrevStep}
              >
                Sebelumnya
              </Button>
              <Button
                className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                onClick={handleSaveEdit}
              >
                Simpan Perubahan
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

          <Input
            placeholder="Cari data..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="
        pl-10
        bg-gray-100
        border border-gray-300
        focus:border-green-500
        focus:ring-green-500
        focus-visible:ring-green-500
        rounded-lg
      "
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
                                px-4 py-3 text-sm font-semibold text-gray-700 transition-colors
                                ${
                                  header.column.getIsSorted()
                                    ? "bg-emerald-200"
                                    : ""
                                }
                                ${
                                  header.column.getIsFiltered()
                                    ? "bg-emerald-100"
                                    : ""
                                }
                                ${
                                  header.column.getCanSort() ||
                                  header.column.getCanFilter()
                                    ? "cursor-pointer"
                                    : ""
                                }
                              `}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => {
                    const isSelectColumn = cell.column.id === "select";
                    return (
                      <TableCell
                        key={cell.id}
                        className={`
    px-4 py-3 align-top
    break-words whitespace-normal
    ${isSelectColumn ? "" : "cursor-pointer"}
  `}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setDetailTab(1);
                            setSelectedProject(row.original);
                            setIsDetailDialogOpen(true);
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 📌 Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Menampilkan {from}-{to} dari {totalRows} data
        </div>
        <div className="flex items-center space-x-4">
          {/* Tampilkan per halaman */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Tampilkan per halaman</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Numbered Pagination */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, pageIndex - 2),
                Math.min(totalPages, pageIndex + 3)
              )
              .map((page) => (
                <Button
                  key={page}
                  variant={pageIndex + 1 === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(page - 1)}
                  className={
                    pageIndex + 1 === page
                      ? "bg-[#0CA678] hover:bg-[#08916C]"
                      : ""
                  }
                >
                  {page}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Product Dialog */}
      {isDetailDialogOpen && (
        <Dialog open onOpenChange={setIsDetailDialogOpen}>
          <DialogContent
            className="max-w-2xl"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <div className="flex items-center justify-between pb-3 border-b">
                <DialogTitle>Detail Produk & Event</DialogTitle>
                <button
                  onClick={handleCloseDetailDialog}
                  className="text-gray-400 hover:text-gray-600"
                ></button>
              </div>
            </DialogHeader>

            {/* Tab Selector */}
            <div className="flex w-full mt-4 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setDetailTab(1)}
                className={`w-1/2 py-2 text-sm font-medium transition-colors ${
                  detailTab === 1
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Informasi Dasar
              </button>

              <button
                onClick={() => setDetailTab(2)}
                className={`w-1/2 py-2 text-sm font-medium transition-colors ${
                  detailTab === 2
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Deskripsi, Harga, dan Status
              </button>
            </div>

            {/* Scrollable Content */}
            {selectedProduct && (
              <div className="max-h-[60vh] overflow-y-auto pr-2 mt-6 space-y-6">
                {detailTab === 1 ? (
                  <>
                    {/* Foto */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">
                        Foto Produk Atau Event
                      </label>
                      <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                        {selectedProduct.foto ? (
                          <Image
                            src={selectedProduct.foto}
                            alt={selectedProduct.nama}
                            width={400}
                            height={250}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500">Product Image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ID + Tanggal Ditambahkan */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          ID Produk
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedProduct.id}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Tanggal Ditambahkan
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedProduct.tanggalDitambahkan ?? "-"}
                        </p>
                      </div>
                    </div>

                    {/* Kategori + Tipe Mentoring */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Kategori
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedProduct.kategori}
                        </p>
                      </div>

                      {selectedProduct.kategori === "Mentoring" && (
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Tipe Mentoring
                          </label>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedProduct.tipeMentoring ?? "-"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Nama Produk */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Nama Produk Atau Event
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedProduct.nama}
                      </p>
                    </div>

                    {/* Mentor */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Mentor
                      </label>

                      {selectedProduct.kategori === "Mentoring" ? (
                        <div className="flex flex-wrap gap-2">
                          {(selectedProduct.mentorNames ?? []).length > 0 ? (
                            selectedProduct.mentorNames!.map((name, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium"
                              >
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedProduct.mentorName ?? "-"}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {detailTab === 2 && (
                      <>
                        {/* ======================
            DESKRIPSI + HARGA (UMUM)
        ====================== */}
                        <div>
                          <label className="text-base font-semibold text-gray-600 block mb-2">
                            Deskripsi
                          </label>
                          <p className="text-sm font-medium text-gray-900 leading-relaxed">
                            {selectedProduct.deskripsi}
                          </p>
                        </div>

                        {/* ======================
   MENTORING META (AFTER DESCRIPTION)
====================== */}
                        {selectedProduct.kategori === "Mentoring" && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-600 block mb-1">
                                Max Participants
                              </label>
                              <p className="text-sm font-bold text-gray-900">
                                {selectedProduct.maxParticipants ?? "-"}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-semibold text-gray-600 block mb-1">
                                Duration (Days)
                              </label>
                              <p className="text-sm font-bold text-gray-900">
                                {selectedProduct.durationDays
                                  ? `${selectedProduct.durationDays} hari`
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-600 block mb-1">
                              Harga
                            </label>
                            <p className="text-sm font-bold text-gray-900">
                              {selectedProduct.hargaDisplay}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-gray-600 block mb-1">
                              Status
                            </label>
                            <p
                              className={`text-sm font-bold ${
                                selectedProduct.status === "Aktif"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {selectedProduct.status}
                            </p>
                          </div>
                        </div>

                        {/* ======================
            DISKON (UMUM)
        ====================== */}
                        {/* <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-600 block mb-1">
                              Tipe Diskon
                            </label>
                            <p className="text-sm font-bold text-gray-900">
                              {selectedProduct.diskonTipe ?? "-"}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-gray-600 block mb-1">
                              Diskon
                            </label>
                            <p className="text-sm font-bold text-gray-900">
                              {selectedProduct.diskonTipe === "persentase"
                                ? `${selectedProduct.diskon}%`
                                : selectedProduct.diskonTipe === "angka"
                                ? `Rp${selectedProduct.diskon}`
                                : "-"}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-gray-600 block mb-1">
                              Harga Setelah Diskon
                            </label>
                            <p className="text-sm font-bold text-gray-900">
                              {selectedProduct.hargaDiskon}
                            </p>
                          </div>
                        </div> */}

                        {/* ======================
            MENTORING ONLY
        ====================== */}
                        {selectedProduct.kategori === "Mentoring" && (
                          <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-base font-bold text-emerald-700">
                              Detail Mentoring
                            </h3>

                            <DetailItem
                              label="Benefits"
                              value={selectedProduct.benefits}
                            />
                            <DetailItem
                              label="Mechanism"
                              value={selectedProduct.mechanism}
                            />
                            <DetailItem
                              label="Syllabus Path"
                              value={selectedProduct.syllabusPath}
                            />
                            <DetailItem
                              label="Tools Used"
                              value={selectedProduct.toolsUsed}
                            />
                            <DetailItem
                              label="Target Audience"
                              value={selectedProduct.targetAudience}
                            />
                            <DetailItem
                              label="Schedule"
                              value={selectedProduct.schedule}
                            />
                            <DetailItem
                              label="Alumni Portfolio"
                              value={selectedProduct.alumniPortfolio}
                            />
                          </div>
                        )}

                        {/* ======================
            E-LEARNING ONLY
        ====================== */}
                        {selectedProduct.kategori === "E-Learning" && (
                          <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-base font-bold text-emerald-700">
                              Detail E-Learning
                            </h3>

                            <DetailItem
                              label="Category"
                              value={selectedProduct.category}
                            />
                            <DetailItem
                              label="Level"
                              value={selectedProduct.level}
                            />
                            <DetailItem
                              label="Estimated Duration"
                              value={selectedProduct.estimatedDuration}
                            />
                            <DetailItem
                              label="Benefits"
                              value={selectedProduct.benefits}
                            />
                            <DetailItem
                              label="Tools Used"
                              value={selectedProduct.toolsUsed}
                            />

                            <div>
                              <label className="text-sm font-semibold text-gray-600 block mb-1">
                                Tags
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {(selectedProduct.tags ?? []).length > 0 ? (
                                  selectedProduct.tags!.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700"
                                    >
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    -
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex pt-6 border-t gap-3">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-2"
                onClick={() => {
                  if (selectedProduct) {
                    setPreviewFoto(selectedProduct.foto);
                    setEditFormData({
                      id: selectedProduct.id,
                      nama: selectedProduct.nama,
                      kategori: selectedProduct.kategori,
                      tipeMentoring:
                        selectedProduct.kategori === "Mentoring"
                          ? selectedProduct.tipeMentoring ?? ""
                          : "",
                      foto: null,
                      deskripsi: selectedProduct.deskripsi,
                      harga: selectedProduct.harga.toString(),
                      status: selectedProduct.status,

                      mentorIds: selectedProduct.mentorIds || [],
                      mentorId: selectedProduct.mentorId || "",

                      maxParticipants:
                        selectedProduct.maxParticipants?.toString() || "",
                      durationDays:
                        selectedProduct.durationDays?.toString() || "",

                      diskonTipe: selectedProduct.diskonTipe ?? "persentase",
                      diskon: selectedProduct.diskon ?? 0,
                      hargaDiskon: selectedProduct.hargaDiskon ?? "",

                      // 🔹 mentoring
                      benefits: selectedProduct.benefits ?? "",
                      mechanism: selectedProduct.mechanism ?? "",
                      toolsUsed: selectedProduct.toolsUsed ?? "",
                      targetAudience: selectedProduct.targetAudience ?? "",
                      schedule: selectedProduct.schedule ?? "",
                      alumniPortfolio: selectedProduct.alumniPortfolio ?? "",
                      syllabusPath: selectedProduct.syllabusPath ?? "",

                      // 🔹 e-learning
                      category: selectedProduct.category ?? "",
                      level: selectedProduct.level ?? "",
                      estimatedDuration:
                        selectedProduct.estimatedDuration ?? "",
                      tags: selectedProduct.tags ?? [],
                    });
                  }

                  setSelectedMentorIds(selectedProduct?.mentorIds || []);
                  setSelectedMentorId(selectedProduct?.mentorId || "");

                  setEditStep(1);
                  setIsDetailDialogOpen(false);
                  setTimeout(() => setShowEditDialog(true), 0);
                }}
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Button>

              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
                onClick={() => handleDelete(selectedProduct?.id)}
              >
                <Trash className="w-4 h-4" />
                <span>Hapus</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {EditDialog}

      {isDeleteDialogOpen && (
        <Dialog open onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent
            className="max-w-md"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-emerald-700">
                Konfirmasi Hapus
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Apakah kamu yakin ingin menghapus{" "}
                <span className="font-semibold text-gray-900">
                  {selectedProduct?.nama}
                </span>
                ?
              </p>

              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                Tindakan ini tidak dapat dibatalkan.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={confirmDelete}
              >
                Ya, Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
