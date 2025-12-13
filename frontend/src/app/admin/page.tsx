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
  ChevronDown,
  User,
  Calendar,
  FileText,
  ChevronRight,
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

  const [selectedRange, setSelectedRange] = useState("Minggu Ini");
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
          { withCredentials: true }
        );

        const users = res.data.data.users;
        const totalUsers = res.data.data.total;

        // Hitung mentor
        const totalMentors = users.filter((user: any) =>
          user.userRoles?.some((r: any) => r.role?.roleName === "mentor")
        ).length;

        // === HITUNG USER 7 HARI TERAKHIR ===
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const growthUsers = users.filter((user: any) => {
          if (!user.registrationDate) return false;
          const regDate = new Date(user.registrationDate);
          return regDate >= sevenDaysAgo;
        }).length;

        // === FETCH TOTAL TRANSAKSI MENTORING ===
        const mentorRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/admin/bookings?limit=10000`,
          { withCredentials: true }
        );

        const allMentorBookings =
          mentorRes.data.data.data || mentorRes.data.data; // jaga struktur

        const mentorTransactions = allMentorBookings.filter(
          (b: any) => b.status !== "cancelled"
        ).length;

        // === FETCH TOTAL TRANSAKSI PRACTICE ===
        const practiceRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/practice/admin/practice-purchases?limit=10000`,
          { withCredentials: true }
        );

        const allPracticePurchases =
          practiceRes.data.data.data || practiceRes.data.data; // jaga struktur

        const practiceTransactions = allPracticePurchases.filter(
          (p: any) => p.status !== "cancelled"
        ).length;

        // === TOTAL TRANSAKSI AKHIR ===
        const totalTransactions = mentorTransactions + practiceTransactions;

        // === SET SEMUA DATA ===
        setStatData({
          totalUsers,
          totalMentors,
          growthUsers,
          totalTransactions,
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
    },
    {
      title: "Jumlah Mentor",
      value: statData.totalMentors,
      image: "/assets/dashboard/mentor/report.svg",
    },
    {
      title: "Total Transaksi",
      value: statData.totalTransactions,
      image: "/assets/admin/trans.svg",
    },
  ];

  const [paymentStatus, setPaymentStatus] = useState([
    { status: "pending", total: 0 },
    { status: "confirmed", total: 0 },
    { status: "failed", total: 0 },
  ]);

  useEffect(() => {
    async function fetchPaymentStatus() {
      try {
        // === FETCH PAYMENT LANGSUNG DARI API BARU ===
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments?limit=10000`,
          { withCredentials: true }
        );

        const payments = res.data.data || [];

        // Status yang diizinkan
        type AllowedStatus = "pending" | "confirmed" | "failed";

        const allowedStatuses: AllowedStatus[] = [
          "pending",
          "confirmed",
          "failed",
        ];

        // Counter awal
        const statusCount: Record<AllowedStatus, number> = {
          pending: 0,
          confirmed: 0,
          failed: 0,
        };

        // Hitung status dari payment.status
        payments.forEach((p: any) => {
          const status = p.status?.toLowerCase();

          if (allowedStatuses.includes(status)) {
            statusCount[status as AllowedStatus] += 1;
          }
        });

        // Update state
        setPaymentStatus([
          { status: "pending", total: statusCount.pending },
          { status: "confirmed", total: statusCount.confirmed },
          { status: "failed", total: statusCount.failed },
        ]);
      } catch (err) {
        console.error("Error loading payment status:", err);
      }
    }

    fetchPaymentStatus();
  }, []);

  const colors: Record<string, string> = {
    pending: "#F59F00", // oranye
    confirmed: "#0CA678", // hijau
    failed: "#E03131", // merah
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
    practice: number;
    e_learning: number;
  }

  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);

  // --- 1. Generate 12 bulan terakhir ---
  const getLast12Months = () => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const now = new Date();
    const result = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      result.push({
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
        month: monthNames[date.getMonth()],
        mentoring: 0,
        practice: 0,
        e_learning: 0,
      });
    }

    return result;
  };

  // --- 2. Fetch mentoring ---
  const fetchMentoringRevenue = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/admin/bookings?page=1&limit=9999`,
      { withCredentials: true }
    );
    return res.data.data.data;
  };

  // --- 3. Fetch practice ---
  const fetchPracticeRevenue = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/practice/admin/practice-purchases?page=1&limit=9999`,
      { withCredentials: true }
    );
    return res.data.data.data;
  };

  // --- 4. Hitung mentoring ---
  const calculateMentoringRevenue = (bookings: any[]) => {
    const months = getLast12Months();

    bookings.forEach((b) => {
      if (b.status !== "confirmed" && b.status !== "completed") return;
      if (!b.payment) return;
      if (!b.payment.paymentDate) return;

      const payDate = new Date(b.payment.paymentDate);
      const key = `${payDate.getFullYear()}-${payDate.getMonth() + 1}`;

      const target = months.find((m) => m.key === key);
      if (target) target.mentoring += Number(b.payment.amount);
    });

    return months;
  };

  // --- 5. Hitung practice ---
  const calculatePracticeRevenue = (
    practicePurchases: any[],
    months: RevenueItem[]
  ) => {
    practicePurchases.forEach((p) => {
      if (p.status !== "confirmed" && p.status !== "completed") return;
      if (!p.payment) return;
      if (!p.payment.paymentDate) return;

      const payDate = new Date(p.payment.paymentDate);
      const key = `${payDate.getFullYear()}-${payDate.getMonth() + 1}`;

      const target = months.find((m) => m.key === key);
      if (target) target.practice += Number(p.payment.amount);
    });

    return months;
  };

  // E-Learning masih pakai dummy karena API belum selesai
  const generateELearningDummy = (months: RevenueItem[]) => {
    months.forEach((m) => {
      // Dummy pendapatan 50rb – 300rb
      const randomValue =
        Math.floor(Math.random() * (300000 - 50000 + 1)) + 50000;
      m.e_learning = randomValue;
    });

    return months;
  };

  // --- 6. Load data ---
  useEffect(() => {
    const loadRevenue = async () => {
      try {
        const mentoringBookings = await fetchMentoringRevenue();
        let months = calculateMentoringRevenue(mentoringBookings);

        const practicePurchases = await fetchPracticeRevenue();
        months = calculatePracticeRevenue(practicePurchases, months);

        // Tambahkan dummy e-learning
        months = generateELearningDummy(months);

        setRevenueData(months);
      } catch (err) {
        console.error("Failed to load revenue:", err);
      }
    };

    loadRevenue();
  }, []);

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
            }
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
                })
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
            }
          );

          // ============================================================
          // === SORTING + AMBIL 10 TERDEKAT =============================
          // ============================================================

          const now = new Date();

          const withParsedDate = merged.map((s) => ({
            ...s,
            parsedDate: new Date(s.isoDate),
          }));

          const futureSessions = withParsedDate
            .filter((s) => s.parsedDate! >= now)
            .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());

          const pastSessions = withParsedDate
            .filter((s) => s.parsedDate! < now)
            .sort((a, b) => b.parsedDate!.getTime() - a.parsedDate!.getTime());

          const final10 = [
            ...futureSessions.slice(0, 10),
            ...pastSessions.slice(0, 10 - futureSessions.length),
          ].slice(0, 10);

          setSessions(final10.map(({ parsedDate, ...rest }) => rest));
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

  async function handleDeleteSession(sessionId: string) {
    // Konfirmasi pakai toast modal kecil
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.warning("Yakin ingin menghapus sesi mentoring ini?", {
        description: "Tindakan ini tidak bisa dibatalkan.",
        action: {
          label: "Hapus",
          onClick: () => resolve(true),
        },
        cancel: {
          label: "Batal",
          onClick: () => resolve(false),
        },
        duration: Infinity,
      });
    });

    if (!confirmed) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions/${sessionId}`,
        { withCredentials: true }
      );

      toast.success("Sesi mentoring berhasil dihapus!", {
        description: "Halaman akan diperbarui...",
      });

      // 🟩 Langsung refresh page
      router.refresh();
    } catch (err: any) {
      console.error(err);

      toast.error("Gagal menghapus sesi", {
        description: err.response?.data?.error || "Terjadi kesalahan.",
      });
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
          { withCredentials: true }
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
      <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="max-w-[340px] w-full flex flex-col justify-between px-0 py-2
           shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
           cursor-pointer rounded-lg bg-white"
          >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-2">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={20}
                  height={20}
                  className="opacity-90"
                />
                <CardTitle className="text-md font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-500" />
            </CardHeader>

            {/* Content */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p className="text-4xl font-bold text-gray-900 leading-tight">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Status Pembayaran Chart (Clean Version Improved) */}
        <Card className="bg-white rounded-xl shadow-sm col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/admin/moneyoverviewchart.svg"
                alt="Status"
                width={20}
                height={20}
              />
              <CardTitle className="text-lg font-semibold text-gray-400">
                Status Pembayaran
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="h-[260px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentStatus}
                barCategoryGap="20%"
                margin={{ top: 5, right: 0, left: -40, bottom: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="status"
                  tickFormatter={(value) =>
                    value.charAt(0).toUpperCase() + value.slice(1)
                  }
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  // tanda tipe any supaya TS tidak ngeluh, lalu kita aman-kan value/name di helper
                  formatter={(value: any, name: any) => [
                    value,
                    capitalize(name),
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />

                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pendapatan Chart */}
        <Card className="bg-white rounded-xl shadow-sm col-span-1 lg:col-span-3">
          <CardHeader className="pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/admin/overviewpendapatan.svg"
                alt="Revenue"
                width={12}
                height={12}
              />
              <CardTitle className="text-lg font-semibold text-gray-400">
                Pendapatan
              </CardTitle>
            </div>

            {/* Legend Custom */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full block bg-[#9333ea]"></span>
                <span className="text-gray-500">Mentoring</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full block bg-[#16a34a]"></span>
                <span className="text-gray-500">Practice</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full block bg-[#06b6d4]"></span>
                <span className="text-gray-500">E-Learning</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="h-[260px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 5, right: 10, left: 5, bottom: -5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                  tickMargin={8}
                />

                <YAxis
                  tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}Rb`}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={5}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [
                    `Rp ${value.toLocaleString("id-ID")}`,
                    "Pendapatan",
                  ]}
                  labelFormatter={(label) => `Bulan: ${label}`}
                />

                {/* <Legend /> */}

                <Line
                  type="monotone"
                  dataKey="mentoring"
                  stroke="#9333ea"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="practice"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="e_learning"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Card>
            <CardHeader className="pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/dashboard/user/jadwal.svg"
                  alt="Status"
                  width={15}
                  height={15}
                />
                <CardTitle className="text-lg font-semibold text-gray-400">
                  Sesi Mentoring
                </CardTitle>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400" />
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto pb-2 thin-scroll">
                <div className="flex gap-4 min-w-max">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border rounded-xl p-4 w-[320px] bg-white shadow-sm"
                    >
                      {/* Status + Action */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge
                          className={`${
                            statusColors[session.status]
                          } px-3 py-1 text-sm rounded-md`}
                        >
                          {session.status.charAt(0).toUpperCase() +
                            session.status.slice(1)}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 bg-transparent"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>

                      {/* Konten */}
                      <div className="space-y-4 text-base">
                        {/* Mentor & Mentee */}
                        <div className="flex items-start gap-8">
                          {/* Mentor */}
                          <div className="flex gap-2 w-1/2">
                            <Image
                              src="/assets/admin/bluementor.svg"
                              alt="Mentor"
                              width={16}
                              height={16}
                            />
                            <div className="pl-1 w-full">
                              <p className="text-gray-500 text-sm">Mentor</p>
                              <p className="font-medium truncate">
                                {session.mentor}
                              </p>
                            </div>
                          </div>

                          {/* Mentee */}
                          {session.mentee && (
                            <div className="flex gap-2 w-1/2">
                              <Image
                                src="/assets/admin/bluementee.svg"
                                alt="Mentee"
                                width={16}
                                height={16}
                              />
                              <div className="pl-1 w-full">
                                <p className="text-gray-500 text-sm">Mentee</p>
                                <p className="font-medium truncate">
                                  {session.mentee}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Date */}
                        <div className="flex gap-3">
                          <Image
                            src="/assets/admin/bluetanggal.svg"
                            alt="Tanggal"
                            width={16}
                            height={16}
                          />
                          <div>
                            <p className="text-gray-500 text-sm">
                              Tanggal & Waktu
                            </p>
                            <p className="font-medium">{session.date}</p>
                          </div>
                        </div>

                        {/* Topic */}
                        <div className="flex gap-3">
                          <Image
                            src="/assets/admin/bluetopik.svg"
                            alt="Topik"
                            width={16}
                            height={16}
                          />
                          <div className="w-full">
                            <p className="text-gray-500 text-sm">
                              Topik Pembahasan
                            </p>
                            <p className="font-medium truncate">
                              {session.topic}
                            </p>
                          </div>
                        </div>

                        {/* Document */}
                        <div className="space-y-2">
                          <p className="text-gray-600 text-sm">
                            Dokumen Diajukan
                          </p>

                          <div className="bg-gray-100 p-3 rounded-lg">
                            <div className="flex gap-3 items-center">
                              <Image
                                src="/assets/admin/overviewdokumen.svg"
                                alt="Dokumen"
                                width={16}
                                height={16}
                              />

                              <div className="w-full">
                                <p className="font-medium truncate">
                                  {session.document}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {session.size}
                                </p>
                              </div>
                            </div>

                            {session.rawPath && (
                              <Button
                                variant="link"
                                className="text-[#0CA678] p-0 h-auto text-sm mt-1"
                                onClick={() =>
                                  window.open(
                                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/${session.rawPath}`,
                                    "_blank"
                                  )
                                }
                              >
                                Lihat Dokumen
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Aktivitas */}
        <Card>
          <CardHeader className="pb-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/dashboard/user/jadwal.svg"
                alt="Status"
                width={15}
                height={15}
                className="relative bottom-0.5"
              />
              <CardTitle className="text-lg font-semibold text-gray-400">
                History Aktivitas
              </CardTitle>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </CardHeader>

          <CardContent>
            <div className="max-h-100 overflow-y-auto scroll-thin pr-2 space-y-6 relative">
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
                      <h4 className="text-[15px] font-semibold text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-[14px] text-gray-600 mt-1 leading-snug">
                        {activity.description}
                      </p>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
