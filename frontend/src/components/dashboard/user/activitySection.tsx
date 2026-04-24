"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Activity = {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  status: string;
  project?: any;
};

export default function ActivitySection() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        // Ambil bookings saja
        const bookingsRes = await axios.get(
          `${baseUrl}/api/booking/mentee/bookings`,
          {
            params: { page: 1, limit: 100, status: "confirmed" },
            withCredentials: true,
          },
        );

        /** ---------------- Mentoring Section ---------------- **/
        const bookingsRaw = bookingsRes.data?.data?.data || [];

        // hanya ambil booking yang punya project
        const bookings = bookingsRaw
          .filter(
            (b: any) =>
              Array.isArray(b.mentoringService?.projects) &&
              b.mentoringService.projects.length > 0,
          )
          .map((b: any) => {
            // ambil project terbaru (berdasarkan deadline atau createdAt)
            const latestProject = [...b.mentoringService.projects].sort(
              (a, b) => {
                const da = new Date(a.deadline || a.createdAt || 0).getTime();
                const db = new Date(b.deadline || b.createdAt || 0).getTime();
                return db - da;
              },
            )[0];

            return {
              id: b.id,
              type: "Mentoring",
              title: b.mentoringService?.serviceName || "Mentoring Service",
              createdAt: latestProject?.createdAt || b.createdAt,
              status: "Project Mentoring",
              project: latestProject,
            };
          });

        /** ---------------- Sort ---------------- **/

        const sorted = bookings.sort(
          (a: Activity, b: Activity) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        // ambil hanya 3 terbaru
        const latestThree = sorted.slice(0, 3);

        setActivities(latestThree);
      } catch (err) {
        console.error("Gagal mengambil aktivitas:", err);
        setActivities([]);
      }
    };

    fetchActivities();
  }, []);

  const handleView = (activity: any) => {
    if (activity.type === "Mentoring" && activity.project) {
      router.push(`/dashboard/projects/${activity.project.id}`);
    } else {
      console.warn("Tidak ada target halaman untuk aktivitas ini.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm w-full overflow-hidden">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-800">
          Aktivitas Terkini
        </h2>
      </div>

      <div className="space-y-3 h-[180px] max-h-[180px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-[12px] text-center">
            Belum ada aktivitas terbaru.
          </p>
        ) : (
          activities.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {item.title}
                </span>
                <span className="text-[12px] text-gray-500 mt-0.5">
                  {item.status}
                </span>
              </div>

              <button
                onClick={() => handleView(item)}
                className="bg-emerald-500 text-white text-[12px] px-3 py-1 rounded-full hover:bg-emerald-600 transition"
              >
                Lihat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
