"use client";

import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Download,
  Plus,
  Users,
  UserCheck,
  User,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { columns, Mentee } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function AdminMenteePage() {
  const router = useRouter();

  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor data mentee ke ${format.toUpperCase()}...`,
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/users/export`,
        {
          params: {
            format,
            role: "mentee",
          },
          responseType: "blob",
          withCredentials: true,
        },
      );

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mentee.${format === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // UPDATE TO SUCCESS
      toast.success("Export berhasil", {
        id: loadingToastId,
        description: `Data mentee berhasil diekspor ke format ${format.toUpperCase()}`,
      });
    } catch (err: any) {
      console.error("Export error:", err);

      toast.error("Gagal export data mentee", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor data",
      });
    }
  };

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    role: "mentee",
    status: "Aktif",
  });

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + "!A1";
  };

  const handleAddMentee = async () => {
    const generatedPassword = generatePassword();

    try {
      const formData = new FormData();

      formData.append("email", addFormData.email);
      formData.append("fullName", addFormData.name);
      formData.append("role", "mentee");
      formData.append("password", generatedPassword);

      formData.append("createdByAdmin", "true");

      // status akun
      formData.append(
        "isActive",
        addFormData.status === "Aktif" ? "true" : "false",
      );

      if (photoFile) {
        formData.append("profilePicture", photoFile);
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // AUTO COPY PASSWORD
      await navigator.clipboard.writeText(generatedPassword);

      // TOAST SUCCESS
      toast.success("Mentee berhasil ditambahkan", {
        description: (
          <div className="space-y-1">
            <div>
              <strong>Email:</strong> {addFormData.email}
            </div>
            <div>
              <strong>Password:</strong>{" "}
              <span className="font-mono">{generatedPassword}</span>
            </div>
            <div className="text-xs text-green-600">
              Password sudah otomatis disalin ke clipboard
            </div>
          </div>
        ),
        duration: 6000,
      });

      setShowAddDialog(false);
      setPhotoPreview("");
      setPhotoFile(null);

      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error("Gagal menambah mentee", err);

      toast.error("Gagal menambahkan mentee", {
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat menyimpan data",
      });
    }
  };

  const [stats, setStats] = useState([
    {
      title: "Jumlah Mentee",
      value: "0",
      change: "",
      image: "/assets/admin/mentee.svg",
    },
    {
      title: "Mentee Aktif",
      value: "0",
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
    {
      title: "Mentee Tidak Aktif",
      value: "0",
      image: "/assets/admin/menteenonac.svg",
      color: "text-red-600",
    },
  ]);

  useEffect(() => {
    const fetchMenteeStats = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/users`,
          {
            withCredentials: true,
            params: {
              limit: 10000, // ambil semua biar gampang dihitung
            },
          },
        );

        const users = res.data.data.users;

        // ===============================
        // FILTER ROLE MENTEE
        // ===============================
        const menteeUsers = users.filter((user: any) =>
          user.userRoles?.some((ur: any) => ur.role?.roleName === "mentee"),
        );

        const totalMentee = menteeUsers.length;

        // ===============================
        // MENTEE AKTIF / TIDAK AKTIF
        // ===============================
        const activeMentee = menteeUsers.filter(
          (u: any) => u.isActive === true,
        ).length;

        const inactiveMentee = menteeUsers.filter(
          (u: any) => u.isActive === false,
        ).length;

        // ===============================
        // CHANGE (1 MINGGU TERAKHIR)
        // ===============================
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newMenteeThisWeek = menteeUsers.filter((u: any) => {
          const createdAt = new Date(u.createdAt);
          return createdAt >= oneWeekAgo;
        }).length;

        // ===============================
        // SET STATS
        // ===============================
        setStats([
          {
            title: "Jumlah Mentee",
            value: totalMentee.toString(),
            change: `+${newMenteeThisWeek} minggu ini`,
            image: "/assets/admin/mentee.svg",
          },
          {
            title: "Mentee Aktif",
            value: activeMentee.toString(),
            image: "/assets/admin/menteeac.svg",
            color: "text-green-600",
          },
          {
            title: "Mentee Tidak Aktif",
            value: inactiveMentee.toString(),
            image: "/assets/admin/menteenonac.svg",
            color: "text-red-600",
          },
        ]);
      } catch (error) {
        console.error("Gagal mengambil stats mentee:", error);
      }
    };

    fetchMenteeStats();
  }, []);

  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/users?limit=10000`,
          {
            withCredentials: true,
          },
        );

        const json = res.data;

        if (!json.success) {
          console.error("Failed fetch mentees:", json);
          setLoading(false);
          return;
        }

        const users = json.data.users;

        // Filter user yang punya role mentee
        const menteeUsers = users.filter((user: any) =>
          user.userRoles.some(
            (roleObj: any) => roleObj.role.roleName === "mentee",
          ),
        );

        // Mapping ke format Mentee
        const mapped: Mentee[] = menteeUsers.map((u: any) => {
          const photo =
            u.profilePicture && u.profilePicture !== "default.jpg"
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${u.profilePicture}`
              : "/assets/dashboard/user/avatar.png";

          return {
            id: u.id,
            photo,
            name: u.fullName,
            createdAt: u.createdAt,
            email: u.email,
            role: "mentee",
            status: u.isActive ? "Aktif" : "Tidak Aktif",
          };
        });

        setMentees(mapped);
      } catch (err) {
        console.error("ERROR FETCH:", err);
      }

      setLoading(false);
    };

    fetchMentees();
  }, []);

  // Loading UI
  if (loading) {
    return <p className="text-gray-600">Loading data mentee...</p>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mb-0.5">Mentee</h1>
          <p className="text-sm text-gray-600">Mentee</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Dropdown Export Data */}
          <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 border border-gray-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>

                {exportOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36 text-sm">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tombol Tambah */}
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center gap-1 px-3 py-1.5 text-sm"
            onClick={() => {
              setAddFormData({
                name: "",
                email: "",
                role: "Mentee",
                status: "Aktif",
              });
              setShowAddDialog(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="w-full flex flex-col justify-between px-0 py-1.5
      shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
      cursor-pointer rounded-md bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-2 pb-1">
              <div className="flex items-center gap-2">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={14}
                  height={14}
                  className="opacity-90"
                />

                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {/* Content */}
            <CardContent className="px-4 pt-0 pb-2">
              <div className="flex items-center gap-2">
                <p
                  className={`text-2xl font-bold leading-tight ${
                    stat.color || "text-gray-900"
                  }`}
                >
                  {stat.value}
                </p>

                {stat.change && (
                  <span className="inline-block text-[10px] font-medium text-emerald-700 bg-green-200 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Mentee Terdaftar
      </h2>

      {/* DataTable */}
      <Card className="p-6 mb-10">
        <DataTable columns={columns} data={mentees} />
      </Card>

      {/* Add Mentee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Tambah Mentee Baru
            </DialogTitle>
          </DialogHeader>

          {/* Garis pemisah setelah Title */}
          <div className="border-t my-3"></div>

          <div className="space-y-6">
            {/* Photo Section */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-4">
                Foto Mentee
              </p>

              <div className="flex items-start space-x-4">
                {/* Preview Foto */}
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                {/* Bagian kanan: tombol + info */}
                <div className="flex flex-col">
                  <div className="flex items-center space-x-3">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      id="upload-photo"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setPhotoFile(file);
                        setPhotoPreview(URL.createObjectURL(file));
                      }}
                    />

                    <Button
                      variant="outline"
                      className="border-[#0CA678] text-[#0CA678] border-dashed hover:bg-[#0CA678] hover:text-white bg-transparent"
                      onClick={() =>
                        document.getElementById("upload-photo")?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload foto profil
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => setPhotoPreview("")}
                    >
                      Hapus
                    </Button>
                  </div>

                  {/* Info file */}
                  <p className="text-xs text-gray-500 mt-2">
                    File png atau jpg maks 4MB
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Lengkap
                </label>
                <Input
                  placeholder="Masukkan nama lengkap mentee"
                  value={addFormData.name}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, name: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Masukkan alamat email aktif"
                  value={addFormData.email}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, email: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Peran
                  </label>
                  <Select
                    value={addFormData.role}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, role: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentee">Mentee</SelectItem>
                      <SelectItem value="Mentor">Mentor</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status Akun
                  </label>
                  <Select
                    value={addFormData.status}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, status: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Garis pemisah sebelum tombol */}
          <div className="border-t my-4"></div>

          <DialogFooter className="flex space-x-4 sm:justify-center">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setShowAddDialog(false)}
            >
              Kembali
            </Button>
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              onClick={handleAddMentee}
            >
              Tambah Mentee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
