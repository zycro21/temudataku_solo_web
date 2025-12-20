"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Download,
  Plus,
  Users,
  UserCheck,
  User,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./data-table";
import { columns, Mentor } from "./columns";
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

export default function AdminMentorPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [exportOpen, setExportOpen] = useState(false);

  const [stats, setStats] = useState([
    {
      title: "Jumlah Mentor",
      value: "0",
      change: "",
      image: "/assets/admin/mentor.svg",
    },
    {
      title: "Mentor Aktif",
      value: "0",
      image: "/assets/admin/mentorac.svg",
      color: "text-green-600",
    },
    {
      title: "Mentor Tidak Aktif",
      value: "0",
      image: "/assets/admin/mentornonac.svg",
      color: "text-red-600",
    },
  ]);

  useEffect(() => {
    const fetchMentorStats = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/users`,
          {
            withCredentials: true,
            params: {
              limit: 10000, // ambil semua biar gampang dihitung
            },
          }
        );

        const users = res.data.data.users;

        // ===============================
        // FILTER ROLE MENTOR
        // ===============================
        const mentorUsers = users.filter((user: any) =>
          user.userRoles?.some((ur: any) => ur.role?.roleName === "mentor")
        );

        const totalMentor = mentorUsers.length;

        // ===============================
        // MENTOR AKTIF / TIDAK AKTIF
        // ===============================
        const activeMentor = mentorUsers.filter(
          (u: any) => u.isActive === true
        ).length;

        const inactiveMentor = mentorUsers.filter(
          (u: any) => u.isActive === false
        ).length;

        // ===============================
        // CHANGE (1 MINGGU TERAKHIR)
        // ===============================
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newMentorThisWeek = mentorUsers.filter((u: any) => {
          const createdAt = new Date(u.createdAt);
          return createdAt >= oneWeekAgo;
        }).length;

        // ===============================
        // SET STATS
        // ===============================
        setStats([
          {
            title: "Jumlah Mentor",
            value: totalMentor.toString(),
            change: `+${newMentorThisWeek} minggu ini`,
            image: "/assets/admin/mentee.svg",
          },
          {
            title: "Mentor Aktif",
            value: activeMentor.toString(),
            image: "/assets/admin/menteeac.svg",
            color: "text-green-600",
          },
          {
            title: "Mentor Tidak Aktif",
            value: inactiveMentor.toString(),
            image: "/assets/admin/menteenonac.svg",
            color: "text-red-600",
          },
        ]);
      } catch (error) {
        console.error("Gagal mengambil stats mentor:", error);
      }
    };

    fetchMentorStats();
  }, []);

  const [mentees, setMentees] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);

        const [usersRes, mentorsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/users`, {
            withCredentials: true,
          }),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/admin/mentor-profiles`,
            { withCredentials: true }
          ),
        ]);

        const users = usersRes.data.data.users;
        const mentorProfiles = mentorsRes.data.data;

        // Map mentorProfile by userId
        const mentorProfileMap = new Map<
          string,
          { bio?: string; expertise?: string }
        >();

        mentorProfiles.forEach((mp: any) => {
          mentorProfileMap.set(mp.userId, {
            bio: mp.bio,
            expertise: mp.expertise,
          });
        });

        const mentors: Mentor[] = users
          .filter((u: any) =>
            u.userRoles.some((r: any) => r.role.roleName === "mentor")
          )
          .map((u: any) => {
            const mentorExtra = mentorProfileMap.get(u.id);

            // FIX FOTO
            const photo =
              u.profilePicture && u.profilePicture !== "default.jpg"
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${u.profilePicture}`
                : "/assets/dashboard/user/avatar.png";

            return {
              id: u.id,
              photo,
              name: u.fullName,
              registeredAt: u.createdAt,
              email: u.email,
              role: "Mentor",
              status: u.isActive ? "aktif" : "inaktif",
              bio: mentorExtra?.bio,
              expertise: mentorExtra?.expertise,
            };
          });

        setMentees(mentors);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data mentor");
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    role: "Mentor",
    status: "Aktif",
    expertise: "",
    bio: "",
  });

  const [addStep, setAddStep] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const generateStrongPassword = (length = 12) => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+{}[]<>?";

    const allChars = upper + lower + numbers + symbols;

    // pastikan minimal 1 dari tiap kategori
    let password =
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      symbols[Math.floor(Math.random() * symbols.length)];

    // sisa random
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // shuffle biar ga ketebak urutannya
    return password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  };

  const handleAddMentor = async () => {
    try {
      // GENERATE PASSWORD
      const generatedPassword = generateStrongPassword(12);

      // REGISTER USER (ADMIN)
      const formData = new FormData();
      formData.append("email", addFormData.email);
      formData.append("password", generatedPassword);
      formData.append("fullName", addFormData.name);
      formData.append("role", "mentor");
      formData.append("createdByAdmin", "true");

      if (photoFile) {
        formData.append("profilePicture", photoFile);
      }

      const registerRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const userId = registerRes.data.user.id;

      // CREATE MENTOR PROFILE
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/mentor/profile`,
        {
          userId,
          expertise: addFormData.expertise,
          bio: addFormData.bio,
        },
        { withCredentials: true }
      );

      // COPY PASSWORD
      await navigator.clipboard.writeText(generatedPassword);

      toast.success(
        `Mentor berhasil ditambahkan, \nPassword: ${generatedPassword}\n(Password sudah disalin ke clipboard)`
      );

      // RESET STATE
      setShowAddDialog(false);
      setAddStep(1);
      setPhotoPreview("");
      setPhotoFile(null);
      setAddFormData({
        name: "",
        email: "",
        role: "Mentor",
        status: "Aktif",
        expertise: "",
        bio: "",
      });

      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal menambahkan mentor");
    }
  };

  const expertiseOptions = [
    "Data Engineer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "Business Intelligence",
    "Software Engineer",
    "Mobile Developer",
    "Cloud Architect",
    "AI Researcher",
    "Fullstack Developer",
  ];

  const handleExportMentor = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor data mentor ke ${format.toUpperCase()}...`
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/users/export`,
        {
          params: {
            format,
            role: "mentor",
          },
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      // BUAT TIMESTAMP FILE
      const now = new Date();
      const timestamp = now
        .toLocaleString("sv-SE")
        .replace(" ", "_")
        .replace(/:/g, "-");

      const extension = format === "excel" ? "xlsx" : "csv";
      const filename = `mentor-${timestamp}.${extension}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export berhasil", {
        id: loadingToastId,
        description: `Data mentor berhasil diekspor (${filename})`,
      });
    } catch (err: any) {
      console.error("Export mentor error:", err);

      toast.error("Gagal export data mentor", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor data mentor",
      });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">Mentor</h1>
          <p className="text-gray-600">Mentor</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Dropdown Export Data */}
          <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300"
                type="button"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>

                {/* ICON — AMAN DARI HYDRATION ERROR */}
                {mounted &&
                  (exportOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ))}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExportMentor("csv")}>
                Export ke CSV
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleExportMentor("excel")}>
                Export ke Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tombol Tambah Mentor */}
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center gap-1"
            onClick={() => {
              setAddFormData({
                name: "",
                email: "",
                role: "Mentor",
                status: "Aktif",
                expertise: "",
                bio: "",
              });
              setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mentor</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards — mengikuti struktur Mentee */}
      <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="max-w-[340px] w-full flex flex-col justify-between px-0 py-2
      shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
      cursor-pointer rounded-lg bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-3">
                {/* Icon pakai Next Image */}
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={15}
                  height={15}
                  className="opacity-90"
                />

                <p className="text-md font-medium text-gray-600">
                  {stat.title}
                </p>
              </div>

              {/* Chevron dummy */}
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>

            {/* Content */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p
                  className={`text-4xl font-bold leading-tight ${
                    stat.color || "text-gray-900"
                  }`}
                >
                  {stat.value}
                </p>

                {stat.change && (
                  <span className="inline-block text-xs font-medium text-emerald-700 bg-green-200 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Mentor Terdaftar
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={mentees} />
      </Card>

      {/* Add Mentor Dialog */}
      {mounted && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent
            className="sm:max-w-xl"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Tambah Mentor Baru
              </DialogTitle>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="flex items-center justify-start space-x-8 mb-1">
              {" "}
              {/* STEP 1 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    addStep === 1
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-xs font-medium ${
                    addStep === 1 ? "text-[#0CA678]" : "text-gray-500"
                  }`}
                >
                  Lengkapi Informasi Dasar
                </span>
              </div>
              {/* STEP 2 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    addStep === 2
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-medium ${
                    addStep === 2 ? "text-[#0CA678]" : "text-gray-500"
                  }`}
                >
                  Lengkapi Profil Admin
                </span>
              </div>
              {/* STEP 3 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    addStep === 3
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs font-medium ${
                    addStep === 3 ? "text-[#0CA678]" : "text-gray-500"
                  }`}
                >
                  Atur Peran dan Status
                </span>
              </div>
            </div>

            {/* ───────── Separator between NAVIGATION & FORM ───────── */}
            <div className="border-b border-gray-200 mb-4"></div>

            <div className="space-y-6">
              {/* Step 1: Basic Information */}
              {addStep === 1 && (
                <>
                  {/* Photo Section — UPDATED sesuai Add Mentee */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-4">
                      Foto Mentor
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
                          />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>

                      {/* Bagian kanan */}
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

                        <p className="text-xs text-gray-500 mt-2">
                          File png atau jpg maks 4MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Nama Lengkap
                      </label>
                      <Input
                        placeholder="Masukkan nama lengkap mentor"
                        value={addFormData.name}
                        onChange={(e) =>
                          setAddFormData({
                            ...addFormData,
                            name: e.target.value,
                          })
                        }
                        className="w-full py-3 text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="Masukkan alamat email aktif"
                        value={addFormData.email}
                        onChange={(e) =>
                          setAddFormData({
                            ...addFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full py-3 text-base"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Admin Profile */}
              {addStep === 2 && (
                <div className="space-y-6">
                  {/* Form Field 1 */}
                  <div className="bg-gray-100 p-4 rounded-md">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Keahlian Mentor
                    </label>

                    <Select
                      value={addFormData.expertise || ""}
                      onValueChange={(value) =>
                        setAddFormData({ ...addFormData, expertise: value })
                      }
                    >
                      <SelectTrigger className="w-full py-3 text-base bg-white">
                        <SelectValue placeholder="Pilih keahlian" />
                      </SelectTrigger>

                      <SelectContent>
                        {expertiseOptions.map((item, index) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Form Field 2 */}
                  <div className="bg-gray-100 p-4 rounded-md">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Bio
                    </label>

                    <textarea
                      placeholder="Masukkan bio mentor"
                      value={addFormData.bio || ""}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, bio: e.target.value })
                      }
                      className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md 
          resize-none focus:ring-[#0CA678] focus:border-[#0CA678] 
          text-base bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Role and Status */}
              {addStep === 3 && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Peran
                    </label>
                    <Select
                      value={addFormData.role}
                      onValueChange={(value) =>
                        setAddFormData({ ...addFormData, role: value })
                      }
                    >
                      <SelectTrigger className="w-full py-3 text-base">
                        <SelectValue placeholder="Mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mentee">Mentee</SelectItem>
                        <SelectItem value="Mentor">Mentor</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Status Akun
                    </label>
                    <Select
                      value={addFormData.status}
                      onValueChange={(value) =>
                        setAddFormData({ ...addFormData, status: value })
                      }
                    >
                      <SelectTrigger className="w-full py-3 text-base">
                        <SelectValue placeholder="Aktif" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* ───────── Separator between FORM & CTA BUTTONS ───────── */}
            <div className="border-t border-gray-200 mt-2 pt-2"></div>

            <DialogFooter className="flex space-x-4 sm:justify-center mt-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent py-3"
                onClick={() => {
                  if (addStep === 1) {
                    setShowAddDialog(false);
                    setAddStep(1);
                  } else {
                    setAddStep(addStep - 1);
                  }
                }}
              >
                {addStep === 1 ? "Kembali" : "Sebelumnya"}
              </Button>
              <Button
                className="flex-1 bg-[#0CA678] hover:bg-[#08916C] py-3"
                onClick={() => {
                  if (addStep === 3) {
                    handleAddMentor();
                  } else {
                    setAddStep(addStep + 1);
                  }
                }}
              >
                {addStep === 3 ? "Tambah Mentor" : "Selanjutnya"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
