"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // 🔥 TAMBAHAN
import {
  ChevronDown,
  User,
  Calendar,
  FileText,
  ChevronRight,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  type RangeOption =
    | "Semua"
    | "Minggu Ini"
    | "Bulan Ini"
    | "3 Bulan Terakhir"
    | "1 Tahun Terakhir";

  const [selectedRange, setSelectedRange] = useState<RangeOption>("Semua");
  const [statData, setStatData] = useState({
    totalUsers: 0,
    totalMentors: 0,
    growthUsers: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // === FETCH USERS ===
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/users?limit=10000`,
          { withCredentials: true },
        );

        const users = res.data.data.users;
        const totalUsers = res.data.data.total;

        // Hitung mentor
        const totalMentors = users.filter((user: any) =>
          user.userRoles?.some((r: any) => r.role?.roleName === "mentor"),
        ).length;

        // === HITUNG USER 7 HARI TERAKHIR ===
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const growthUsers = users.filter((user: any) => {
          if (!user.registrationDate) return false;
          const regDate = new Date(user.registrationDate);
          return regDate >= sevenDaysAgo;
        }).length;

        // ================= PAYMENTS =================
        const paymentRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments`,
          {
            params: {
              page: 1,
              limit: 10000,
            },
            withCredentials: true,
          },
        );

        const statsFromApi = paymentRes.data.stats;

        // === SET SEMUA DATA ===
        setStatData({
          totalUsers,
          totalMentors,
          growthUsers,
          totalTransactions: statsFromApi?.total ?? 0,
        });
      } catch (err) {
        console.error("Gagal fetch stats:", err);
      }
    }

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Jumlah Pengguna",
      value: statData.totalUsers,
      change: `+${statData.growthUsers} minggu ini`,
      image: "/assets/admin/mentee.svg",
      href: "/admin/mentee",
    },
    {
      title: "Jumlah Mentor",
      value: statData.totalMentors,
      image: "/assets/dashboard/mentor/report.svg",
      href: "/admin/mentor",
    },
    {
      title: "Total Transaksi",
      value: statData.totalTransactions,
      image: "/assets/admin/trans.svg",
      href: "/admin/transaksi",
    },
  ];

  const [paymentStatus, setPaymentStatus] = useState([
    { status: "pending", total: 0 },
    { status: "confirmed", total: 0 },
    { status: "failed", total: 0 },
    { status: "cancelled", total: 0 },
  ]);

  const colors: Record<string, string> = {
    pending: "#F59F00", // oranye
    confirmed: "#0CA678", // hijau
    failed: "#E03131", // merah
    cancelled: "#000080",
  };

  const capitalize = (v: unknown) => {
    const s = String(v ?? "");
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  interface RevenueItem {
    key: string;
    month: string;
    mentoring: number;
    e_learning: number;
    aycl: number;
  }

  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);

  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Status pembayaran yang dianggap sudah sukses / lunas (dihitung sbg pendapatan)
  const SUCCESS_PAYMENT_STATUSES = ["confirmed", "paid", "settlement"];

  // --- 1. Tentukan rentang tanggal berdasarkan filter yang dipilih ---
  const getDateRange = (
    range: RangeOption,
  ): { start: Date | null; end: Date } => {
    const now = new Date();
    const end = now;

    switch (range) {
      case "Minggu Ini": {
        const dayIndex = now.getDay(); // 0 = Minggu
        const diffToMonday = dayIndex === 0 ? 6 : dayIndex - 1;
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - diffToMonday,
        );
        return { start, end };
      }
      case "Bulan Ini": {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start, end };
      }
      case "3 Bulan Terakhir": {
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return { start, end };
      }
      case "1 Tahun Terakhir": {
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        return { start, end };
      }
      case "Semua":
      default:
        return { start: null, end };
    }
  };

  // --- 2. Bangun "bucket" sumbu-X pendapatan sesuai granularitas filter ---
  // Minggu Ini -> per hari, Bulan Ini -> per minggu, sisanya -> per bulan
  const buildRevenueBuckets = (
    range: RangeOption,
    payments: any[],
  ): { buckets: RevenueItem[]; keyOf: (d: Date) => string } => {
    const now = new Date();
    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`;

    const buckets: RevenueItem[] = [];

    if (range === "Minggu Ini") {
      const dayIndex = now.getDay();
      const diffToMonday = dayIndex === 0 ? 6 : dayIndex - 1;
      const monday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - diffToMonday,
      );
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        buckets.push({
          key: dayKey(d),
          month: DAY_NAMES[d.getDay()],
          mentoring: 0,
          e_learning: 0,
          aycl: 0,
        });
      }
      return { buckets, keyOf: dayKey };
    }

    if (range === "Bulan Ini") {
      const daysSoFar = now.getDate(); // sampai hari ini
      const totalWeeks = Math.ceil(daysSoFar / 7);
      const weekKey = (d: Date) =>
        `${d.getFullYear()}-${d.getMonth() + 1}-w${Math.ceil(d.getDate() / 7)}`;

      for (let w = 1; w <= totalWeeks; w++) {
        const rangeStart = (w - 1) * 7 + 1;
        const rangeEnd = Math.min(w * 7, daysSoFar);
        buckets.push({
          key: `${now.getFullYear()}-${now.getMonth() + 1}-w${w}`,
          month:
            rangeStart === rangeEnd
              ? `${rangeStart}`
              : `${rangeStart}-${rangeEnd}`,
          mentoring: 0,
          e_learning: 0,
          aycl: 0,
        });
      }
      return { buckets, keyOf: weekKey };
    }

    if (range === "3 Bulan Terakhir" || range === "1 Tahun Terakhir") {
      const totalMonths = range === "3 Bulan Terakhir" ? 3 : 12;
      for (let i = totalMonths - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({
          key: monthKey(d),
          month: MONTH_NAMES[d.getMonth()],
          mentoring: 0,
          e_learning: 0,
          aycl: 0,
        });
      }
      return { buckets, keyOf: monthKey };
    }

    // "Semua" -> tampilkan semua bulan yang benar-benar ada datanya
    const dates = payments
      .map((p) => new Date(p.paymentDate ?? p.createdAt))
      .filter((d) => !isNaN(d.getTime()));

    if (dates.length === 0) {
      buckets.push({
        key: monthKey(now),
        month: MONTH_NAMES[now.getMonth()],
        mentoring: 0,
        e_learning: 0,
        aycl: 0,
      });
      return { buckets, keyOf: monthKey };
    }

    const minTime = Math.min(...dates.map((d) => d.getTime()));
    const minDate = new Date(minTime);
    const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endCursor = new Date(now.getFullYear(), now.getMonth(), 1);

    while (cursor <= endCursor) {
      const label =
        cursor.getFullYear() === now.getFullYear()
          ? MONTH_NAMES[cursor.getMonth()]
          : `${MONTH_NAMES[cursor.getMonth()]} '${String(
              cursor.getFullYear(),
            ).slice(2)}`;

      buckets.push({
        key: monthKey(cursor),
        month: label,
        mentoring: 0,
        e_learning: 0,
        aycl: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return { buckets, keyOf: monthKey };
  };

  // --- 3. Load payment sekali, lalu turunkan Status Pembayaran & Pendapatan ---
  // dari sumber data + filter tanggal yang sama, supaya keduanya selalu konsisten.
  useEffect(() => {
    const loadPaymentsData = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments`,
          {
            params: { page: 1, limit: 10000 },
            withCredentials: true,
          },
        );

        const allPayments = res.data.data || [];
        const { start, end } = getDateRange(selectedRange);

        const filtered = allPayments.filter((p: any) => {
          const dateSource = p.paymentDate ?? p.createdAt;
          if (!dateSource) return false;
          const d = new Date(dateSource);
          if (isNaN(d.getTime())) return false;
          if (start && d < start) return false;
          if (d > end) return false;
          return true;
        });

        // --- Status Pembayaran ---
        type AllowedStatus = "pending" | "confirmed" | "failed" | "cancelled";
        const allowedStatuses: AllowedStatus[] = [
          "pending",
          "confirmed",
          "failed",
          "cancelled",
        ];
        const statusCount: Record<AllowedStatus, number> = {
          pending: 0,
          confirmed: 0,
          failed: 0,
          cancelled: 0,
        };

        filtered.forEach((p: any) => {
          const status = p.status?.toLowerCase();
          if (allowedStatuses.includes(status)) {
            statusCount[status as AllowedStatus] += 1;
          }
        });

        setPaymentStatus([
          { status: "pending", total: statusCount.pending },
          { status: "confirmed", total: statusCount.confirmed },
          { status: "failed", total: statusCount.failed },
          { status: "cancelled", total: statusCount.cancelled },
        ]);

        // --- Pendapatan ---
        // type payment: "booking" -> Mentoring, "elearning" -> E-Learning, "aycl" -> AYCL
        // "practice" tidak ditampilkan sesuai kebutuhan saat ini
        const { buckets, keyOf } = buildRevenueBuckets(selectedRange, filtered);

        filtered.forEach((p: any) => {
          const status = String(p.status ?? "").toLowerCase();
          if (!SUCCESS_PAYMENT_STATUSES.includes(status)) return;
          if (p.type === "practice") return;
          if (
            p.type !== "booking" &&
            p.type !== "elearning" &&
            p.type !== "aycl"
          )
            return;

          const dateSource = p.paymentDate ?? p.createdAt;
          if (!dateSource) return;
          const payDate = new Date(dateSource);
          if (isNaN(payDate.getTime())) return;

          const key = keyOf(payDate);
          const target = buckets.find((b) => b.key === key);
          if (!target) return;

          const amount = Number(p.amount) || 0;
          if (p.type === "booking") target.mentoring += amount;
          else if (p.type === "elearning") target.e_learning += amount;
          else if (p.type === "aycl") target.aycl += amount;
        });

        setRevenueData(buckets);
      } catch (err) {
        console.error("Gagal memuat data payment:", err);
      }
    };

    loadPaymentsData();
  }, [selectedRange]);

  type AdminSession = {
    id: string;
    status: string;
    mentor: string;
    mentee: string;
    date: string; // pretty date
    isoDate: string; // raw ISO date
    topic: string;
    document: string;
    size: string | number;
    rawPath: string | null;
    parsedDate?: Date;
    // 🔥 TAMBAHAN
    endIsoDate: string; // buat cek "sudah lewat" pakai jam SELESAI, bukan jam mulai
    meetingLink: string;
    meetingId: string;
    passcode: string;
    hasSession: boolean; // false = booking ini belum punya Session record beneran
  };

  function useAdminBookings() {
    const [sessions, setSessions] = useState<AdminSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function fetchData() {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/admin/bookings`,
            {
              params: {
                page: 1,
                limit: 100,
                sortBy: "createdAt",
                sortOrder: "desc",
              },
              withCredentials: true,
            },
          );

          const bookings = res.data.data.data;

          // === MAPPING AWAL ===
          const mapped: AdminSession[] = bookings.flatMap((b: any) => {
            const mentorName =
              b.mentoringService?.mentors?.[0]?.mentorProfile?.user?.fullName ||
              "Tidak ada mentor";

            const supportDocs = b.supportDocument
              ? JSON.parse(b.supportDocument)
              : [];

            const rawPath = supportDocs.length ? supportDocs[0] : null;
            const docName = rawPath ? rawPath.split("/").pop() : "-";

            const fileSize = b.fileSizes?.[0] || null;

            const formatSize = fileSize
              ? fileSize > 1_000_000
                ? `${(fileSize / 1_000_000).toFixed(1)}MB`
                : `${(fileSize / 1000).toFixed(1)}KB`
              : "-";

            const sessions = b.mentoringService?.mentoringSessions || [];

            const serviceType = b.mentoringService?.serviceType;
            let topic = "";
            if (serviceType === "one-on-one" || serviceType === "group") {
              topic = b.material ?? "Tidak Disertakan Oleh Mentee";
            } else {
              topic = b.mentoringService?.serviceName || "-";
            }

            if (sessions.length > 0) {
              return sessions.map(
                (s: any): AdminSession => ({
                  id: s.id,

                  // === STATUS DARI SESSIONS, BUKAN BOOKING ===
                  status: s.status === "completed" ? "completed" : "scheduled",

                  mentor: mentorName,
                  mentee: b.mentee.fullName,
                  isoDate: s.startTime,
                  date: new Date(s.startTime).toLocaleString("id-ID"),

                  topic,
                  document: docName,
                  size: formatSize,
                  rawPath,
                  // 🔥 TAMBAHAN
                  endIsoDate: s.endTime || s.startTime,
                  meetingLink: s.meetingLink || "",
                  meetingId: s.meetingId || "",
                  passcode: s.passcode || "",
                  hasSession: true,
                }),
              );
            }

            // booking tanpa sesi → otomatis dianggap scheduled
            const iso = b.bookingDate;
            return {
              id: `${b.id}-default`,
              status: "scheduled",
              mentor: mentorName,
              mentee: b.mentee.fullName,
              isoDate: iso,
              date: new Date(iso).toLocaleString("id-ID"),
              topic,
              document: docName,
              size: formatSize,
              rawPath,
              // 🔥 TAMBAHAN
              endIsoDate: iso,
              meetingLink: "",
              meetingId: "",
              passcode: "",
              hasSession: false,
            };
          });

          // === DEDUPE & MERGE (ditempatkan setelah mapped) =============
          const grouped = new Map<
            string,
            AdminSession & { mentees: string[] }
          >();

          for (const item of mapped) {
            const key = `${item.isoDate}-${item.mentor}-${item.topic}`;

            if (!grouped.has(key)) {
              grouped.set(key, {
                ...item,
                mentees: [item.mentee],
              });
            } else {
              const g = grouped.get(key)!;
              g.mentees.push(item.mentee);
            }
          }

          const merged: AdminSession[] = Array.from(grouped.values()).map(
            (s) => {
              let menteeLabel = s.mentees[0];
              if (s.mentees.length > 1) {
                menteeLabel = `${s.mentees[0]} ...`;
              }

              return {
                ...s,
                mentee: menteeLabel,
              };
            },
          );

          // ============================================================
          // === SORTING + AMBIL 10 TERDEKAT =============================
          // ============================================================

          const now = new Date();

          const withParsedDate = merged.map((s) => ({
            ...s,
            parsedDate: new Date(s.isoDate),
          }));

          // 🔥 DIUBAH: dulu kalau sesi mendatang kurang dari 10, "bolong"-nya
          // ditambal pakai sesi yang SUDAH LEWAT (pastSessions) biar tetap
          // nampilin 10 kartu. Sekarang sesi yang sudah lewat dari sekarang
          // dibuang total — cuma sesi yang jadwalnya masih akan datang yang
          // ditampilkan, walau jumlahnya kurang dari 10.
          const futureSessions = withParsedDate
            .filter((s) => s.parsedDate! >= now)
            .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());

          // 🔥 DIUBAH: dihapus batas .slice(0, 10) — semua sesi yang belum
          // lewat ditampilkan, berapa pun jumlahnya.
          setSessions(futureSessions.map(({ parsedDate, ...rest }) => rest));
        } catch (err) {
          console.error("Error fetch bookings:", err);
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }, []);

    return { sessions, setSessions, loading };
  }

  const { sessions, setSessions, loading } = useAdminBookings();

  // 🔥 BARU: state buat modal Edit Sesi
  const [editingSession, setEditingSession] = useState<AdminSession | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    meetingLink: "",
    meetingId: "",
    passcode: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // 🔥 BARU: sesi dianggap "sudah lewat" kalau jam SELESAI-nya sudah
  // lewat dari sekarang — dipakai buat auto-ubah badge jadi "Completed"
  // tanpa perlu admin update manual.
  const isSessionPast = (session: AdminSession) =>
    new Date(session.endIsoDate).getTime() < Date.now();

  const getDisplayStatus = (session: AdminSession) =>
    session.status === "completed" || isSessionPast(session)
      ? "completed"
      : "scheduled";

  // 🔥 BARU: state buat popup konfirmasi hapus (ganti toast.warning lama)
  const [sessionToDelete, setSessionToDelete] = useState<AdminSession | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // 🔥 DIUBAH: dulu langsung nampilin toast.warning + jalanin delete di
  // fungsi yang sama. Sekarang fungsi ini CUMA buka popup konfirmasi —
  // eksekusi hapus beneran dipindah ke confirmDeleteSession() di bawah.
  function requestDeleteSession(session: AdminSession) {
    if (!session.hasSession) {
      toast.error("Booking ini belum punya sesi mentoring untuk dihapus.");
      return;
    }
    setSessionToDelete(session);
  }

  // 🔥 BARU: dipanggil dari tombol "Ya, Hapus" di popup konfirmasi.
  // Isi logic-nya SAMA PERSIS dengan handleDeleteSession lama (axios
  // delete + update state + toast) — cuma dipindah ke sini.
  async function confirmDeleteSession() {
    if (!sessionToDelete) return;
    setDeleting(true);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions/${sessionToDelete.id}`,
        { withCredentials: true },
      );

      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));

      toast.success("Sesi mentoring berhasil dihapus!");
      setSessionToDelete(null);
    } catch (err: any) {
      console.error(err);

      toast.error("Gagal menghapus sesi", {
        description: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setDeleting(false);
    }
  }

  // 🔥 BARU: buka modal edit, isi form dari data sesi yang dipilih
  function openEditDialog(session: AdminSession) {
    const start = new Date(session.isoDate);
    const end = new Date(session.endIsoDate);
    const pad = (n: number) => String(n).padStart(2, "0");

    setEditForm({
      date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
      startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      meetingLink: session.meetingLink,
      meetingId: session.meetingId,
      passcode: session.passcode,
    });
    setEditingSession(session);
  }

  // 🔥 BARU: simpan perubahan lewat PATCH /admin/mentoring-sessions/:id
  async function handleSaveEdit() {
    if (!editingSession) return;
    setSavingEdit(true);

    try {
      const [year, month, day] = editForm.date.split("-");
      const [startHour, startMinute] = editForm.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = editForm.endTime.split(":").map(Number);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions/${editingSession.id}`,
        {
          date: `${day}-${month}-${year}`,
          startTime: { hour: startHour, minute: startMinute },
          endTime: { hour: endHour, minute: endMinute },
          meetingLink: editForm.meetingLink || undefined,
          meetingId: editForm.meetingId || undefined,
          passcode: editForm.passcode || undefined,
        },
        { withCredentials: true },
      );

      const pad = (n: number) => String(n).padStart(2, "0");
      const newStart = new Date(
        `${year}-${month}-${day}T${pad(startHour)}:${pad(startMinute)}:00`,
      );
      const newEnd = new Date(
        `${year}-${month}-${day}T${pad(endHour)}:${pad(endMinute)}:00`,
      );

      // update langsung di state, biar kelihatan tanpa nunggu refresh
      setSessions((prev) =>
        prev.map((s) =>
          s.id === editingSession.id
            ? {
                ...s,
                isoDate: newStart.toISOString(),
                endIsoDate: newEnd.toISOString(),
                date: newStart.toLocaleString("id-ID"),
                meetingLink: editForm.meetingLink,
                meetingId: editForm.meetingId,
                passcode: editForm.passcode,
              }
            : s,
        ),
      );

      toast.success("Sesi mentoring berhasil diperbarui!");
      setEditingSession(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memperbarui sesi", {
        description: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setSavingEdit(false);
    }
  }

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const [activities, setActivities] = useState<any[]>([]);
  const [loadingAct, setLoadingAct] = useState(true);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin_activity_logs/activity-logs`,
          { withCredentials: true },
        );

        const items = response.data.data.data;

        const formatted = items.map((log: any) => ({
          title: (log.action || "Aktivitas")?.replace(/_/g, " "),
          description: (
            log.description || `Admin melakukan aksi: ${log.action}`
          )?.replace(/\bundefined\b/g, "-"), //
          time: formatTimeAgo(log.createdAt),
          type: log.type?.toUpperCase() || "OTHER",
        }));

        // Hanya ambil 5 terbaru
        const latestThree = formatted.slice(0, 5);

        setActivities(latestThree);
      } catch (error) {
        console.error("Gagal mengambil activity logs:", error);
      } finally {
        setLoadingAct(false);
      }
    };

    fetchActivities();
  }, []);

  const formatRupiahShort = (value: number) => {
    if (value >= 1_000_000_000_000) {
      return `Rp${(value / 1_000_000_000_000).toFixed(1)}T`;
    }
    if (value >= 1_000_000_000) {
      return `Rp${(value / 1_000_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000_000) {
      return `Rp${(value / 1_000_000).toFixed(1)}Jt`;
    }
    if (value >= 1_000) {
      return `Rp${(value / 1_000).toFixed(0)}Rb`;
    }
    return `Rp${value}`;
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pl-2">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Overview
          </h1>
          <p className="text-gray-600">Overview</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white border-gray-300 
                 px-4 py-2 text-sm font-medium hover:bg-gray-50 
                 h-11 rounded-md shadow-sm"
            >
              <span>{selectedRange}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40 bg-white">
            <DropdownMenuItem onClick={() => setSelectedRange("Semua")}>
              Semua
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setSelectedRange("Minggu Ini")}>
              Minggu Ini
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setSelectedRange("Bulan Ini")}>
              Bulan Ini
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setSelectedRange("3 Bulan Terakhir")}
            >
              3 Bulan Terakhir
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setSelectedRange("1 Tahun Terakhir")}
            >
              1 Tahun Terakhir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            onClick={() => router.push(stat.href)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(stat.href);
              }
            }}
            className="
        w-full flex flex-col justify-between
        px-0 py-1.5
        shadow-sm hover:shadow
        hover:-translate-y-0.5
        transition-all duration-200
        cursor-pointer rounded-md bg-white
      "
          >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-3 pt-2 pb-1">
              <div className="flex items-center gap-1.5">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={16}
                  height={16}
                  className="opacity-90"
                />
                <CardTitle className="text-xs font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-500" />
            </CardHeader>

            {/* Content */}
            <CardContent className="px-3 pt-0 pb-2">
              <div className="flex items-center gap-2">
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
                  {stat.value}
                </p>

                {stat.change && (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-6">
        {/* Status Pembayaran */}
        <Card className="bg-white rounded-md shadow-sm col-span-1 lg:col-span-2">
          <CardHeader className="pb-1 pr-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/admin/moneyoverviewchart.svg"
                  alt="Status"
                  width={12}
                  height={12}
                />
                <CardTitle className="text-sm font-semibold text-gray-500">
                  Status Pembayaran
                </CardTitle>
              </div>
              <span className="text-[10px] text-gray-400 font-normal whitespace-nowrap">
                {selectedRange}
              </span>
            </div>
          </CardHeader>

          <CardContent className="h-[200px] pt-1 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentStatus}
                barCategoryGap="25%"
                margin={{ top: 0, right: 5, left: -20, bottom: -5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="status"
                  tickFormatter={(value) =>
                    value.charAt(0).toUpperCase() + value.slice(1)
                  }
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  formatter={(value: any, name: any) => [
                    value,
                    capitalize(name),
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: 6,
                    border: "1px solid #E5E7EB",
                    fontSize: 10,
                  }}
                />

                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pendapatan */}
        <Card className="bg-white rounded-md shadow-sm col-span-1 lg:col-span-3">
          <CardHeader className="pb-1 pr-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 pt-[-10px]">
              <Image
                src="/assets/admin/overviewpendapatan.svg"
                alt="Revenue"
                width={10}
                height={10}
              />
              <CardTitle className="text-sm font-semibold text-gray-500">
                Pendapatan
              </CardTitle>
              <span className="text-[10px] text-gray-400 font-normal whitespace-nowrap">
                • {selectedRange}
              </span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea]" />
                <span className="text-gray-500">Mentoring</span>
              </div>

              {/* <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
                <span className="text-gray-500">Practice</span>
              </div> */}

              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                <span className="text-gray-500">E-Learning</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="text-gray-500">AYCL</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="h-[200px] pt-1 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 5, right: 5, left: 0, bottom: -5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                  padding={{ left: 5, right: 5 }}
                  tickMargin={6}
                />

                <YAxis
                  tickFormatter={(value) => formatRupiahShort(value)}
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={4}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: 6,
                    border: "1px solid #E5E7EB",
                    fontSize: 10,
                  }}
                  formatter={(value: number, name: string) => {
                    const labelMap: Record<string, string> = {
                      mentoring: "Mentoring",
                      e_learning: "E-Learning",
                      aycl: "AYCL",
                    };
                    return [
                      `Rp ${value.toLocaleString("id-ID")}`,
                      labelMap[name] ?? name,
                    ];
                  }}
                  labelFormatter={(label) => `Periode: ${label}`}
                />

                <Line
                  type="monotone"
                  dataKey="mentoring"
                  name="mentoring"
                  stroke="#9333ea"
                  strokeWidth={2}
                  dot={false}
                />
                {/* <Line
                  type="monotone"
                  dataKey="practice"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                /> */}
                <Line
                  type="monotone"
                  dataKey="e_learning"
                  name="e_learning"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="aycl"
                  name="aycl"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {loading ? (
          <p className="text-sm">Loading...</p>
        ) : (
          <Card className="shadow-sm rounded-md">
            {/* HEADER */}
            <CardHeader className="pb-1 pl-5 pr-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/dashboard/user/jadwal.svg"
                  alt="Status"
                  width={14}
                  height={14}
                />
                <CardTitle className="text-sm font-semibold text-gray-500">
                  Sesi Mentoring
                </CardTitle>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400" />
            </CardHeader>

            {/* CONTENT */}
            {/* CONTENT */}
            <CardContent className="px-5 pb-4">
              <div className="overflow-x-auto pb-2 thin-scroll">
                <div className="flex gap-4 min-w-max">
                  {sessions.map((session) => {
                    // 🔥 TAMBAHAN: hitung status tampilan (auto "Completed"
                    // kalau sudah lewat jam selesainya)
                    const displayStatus = getDisplayStatus(session);

                    return (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-xl p-4 w-[310px] shrink-0 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Status + Action */}
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                          <Badge
                            className={`${statusColors[displayStatus]} px-2.5 py-1 text-xs font-medium rounded-full`}
                          >
                            {displayStatus.charAt(0).toUpperCase() +
                              displayStatus.slice(1)}
                          </Badge>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={!session.hasSession}
                              title={
                                !session.hasSession
                                  ? "Booking ini belum punya sesi terjadwal"
                                  : "Edit sesi"
                              }
                              onClick={() => openEditDialog(session)}
                              className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={!session.hasSession}
                              title={
                                !session.hasSession
                                  ? "Booking ini belum punya sesi terjadwal"
                                  : "Hapus sesi"
                              }
                              onClick={() => requestDeleteSession(session)}
                              className="flex items-center justify-center w-7 h-7 rounded-md border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Keterangan yang SELALU kelihatan (bukan cuma tooltip
                            hover) — biar jelas kenapa Edit/Hapus disabled buat
                            booking yang belum punya sesi mentoring beneran. */}
                        {!session.hasSession && (
                          <p className="text-xs text-amber-600 bg-amber-50 rounded-md px-2 py-1 mb-3">
                            Booking ini belum punya sesi mentoring terjadwal.
                          </p>
                        )}

                        {/* Mentor & Mentee */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <Image
                                src="/assets/admin/bluementor.svg"
                                alt="Mentor"
                                width={14}
                                height={14}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-400">Mentor</p>
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {session.mentor}
                              </p>
                            </div>
                          </div>

                          {session.mentee && (
                            <div className="flex items-start gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Image
                                  src="/assets/admin/bluementee.svg"
                                  alt="Mentee"
                                  width={14}
                                  height={14}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-gray-400">Mentee</p>
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {session.mentee}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tanggal & Topik */}
                        <div className="space-y-3 pb-4 mb-4 border-b border-gray-100">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <Image
                                src="/assets/admin/bluetanggal.svg"
                                alt="Tanggal"
                                width={14}
                                height={14}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-400">
                                Tanggal & Waktu
                              </p>
                              <p className="text-sm font-medium text-gray-800">
                                {session.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <Image
                                src="/assets/admin/bluetopik.svg"
                                alt="Topik"
                                width={14}
                                height={14}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-400">Topik</p>
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {session.topic}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Document */}
                        <div>
                          <p className="text-xs text-gray-400 mb-1.5">
                            Dokumen
                          </p>

                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                <Image
                                  src="/assets/admin/overviewdokumen.svg"
                                  alt="Dokumen"
                                  width={14}
                                  height={14}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {session.document}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {session.size}
                                </p>
                              </div>
                            </div>

                            {session.rawPath && (
                              <Button
                                variant="link"
                                className="text-emerald-600 p-0 h-auto text-xs mt-2"
                                onClick={() =>
                                  window.open(
                                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/${session.rawPath}`,
                                    "_blank",
                                  )
                                }
                              >
                                Lihat Dokumen
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Aktivitas */}
        <Card>
          <CardHeader className="pb-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/dashboard/user/jadwal.svg"
                alt="Status"
                width={15}
                height={15}
                className="relative bottom-0.5"
              />
              <CardTitle className="text-sm font-semibold text-gray-500">
                History Aktivitas
              </CardTitle>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </CardHeader>

          <CardContent>
            <div className="max-h-100 overflow-y-auto scroll-thin pr-2 space-y-5 relative">
              {loadingAct ? (
                <p className="text-gray-500 text-sm">Memuat aktivitas...</p>
              ) : activities.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada aktivitas.</p>
              ) : (
                activities.map((activity, index) => (
                  <div
                    key={index}
                    className="relative flex items-start space-x-4"
                  >
                    {index !== activities.length - 1 && (
                      <div
                        className="absolute left-1 top-3 w-[2px] bg-gray-300"
                        style={{ height: "calc(100% + 24px)" }}
                      />
                    )}

                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 z-10 ${
                        activity.type === "AUTH"
                          ? "bg-amber-800" // coklat
                          : activity.type === "EXPORT"
                            ? "bg-black"
                            : activity.type === "CREATE"
                              ? "bg-green-500"
                              : activity.type === "UPDATE"
                                ? "bg-yellow-400"
                                : activity.type === "DELETE"
                                  ? "bg-red-500"
                                  : "bg-pink-400" // default
                      }`}
                    />

                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 leading-snug">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 🔥 BARU: Popup Konfirmasi Hapus — tema emerald + putih */}
        <Dialog
          open={!!sessionToDelete}
          onOpenChange={(open) =>
            !open && !deleting && setSessionToDelete(null)
          }
        >
          <DialogContent
            className="sm:max-w-sm text-center p-6"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            {/* Ikon */}
            <div className="flex justify-center mb-1">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Trash2 className="w-4.5 h-4.5 text-emerald-600" />
                </div>
              </div>
            </div>

            <DialogHeader>
              <DialogTitle className="text-center text-base font-semibold text-gray-800">
                Hapus Sesi Mentoring?
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-gray-500 mt-1">
              Tindakan ini tidak bisa dibatalkan. Data sesi akan hilang secara
              permanen.
            </p>

            {/* Ringkasan sesi yang mau dihapus */}
            {sessionToDelete && (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-left space-y-1">
                <p className="text-xs text-gray-500">
                  Mentor:{" "}
                  <span className="font-medium text-gray-800">
                    {sessionToDelete.mentor}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Mentee:{" "}
                  <span className="font-medium text-gray-800">
                    {sessionToDelete.mentee}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Jadwal:{" "}
                  <span className="font-medium text-gray-800">
                    {sessionToDelete.date}
                  </span>
                </p>
              </div>
            )}

            {/* Tombol */}
            <div className="flex gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => setSessionToDelete(null)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={confirmDeleteSession}
                disabled={deleting}
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 🔥 BARU: Modal Edit Sesi Mentoring */}
        <Dialog
          open={!!editingSession}
          onOpenChange={(open) => !open && setEditingSession(null)}
        >
          <DialogContent
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Edit Sesi Mentoring</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Link Meeting
                </label>
                <input
                  type="text"
                  value={editForm.meetingLink}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, meetingLink: e.target.value }))
                  }
                  placeholder="https://zoom.us/..."
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    value={editForm.meetingId}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, meetingId: e.target.value }))
                    }
                    className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Passcode
                  </label>
                  <input
                    type="text"
                    value={editForm.passcode}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, passcode: e.target.value }))
                    }
                    className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSession(null)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {savingEdit ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
