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
    <div className="bg-white p-6 rounded-xl shadow-sm">
      {/* Header section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Aktivitas Terkini
        </h2>
      </div>

      {/* Activity list with fixed height + scroll */}
      <div className="space-y-4 ml-3 h-[210px] max-h-[210px] overflow-y-auto pr-2 scroll-thin">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">
            Belum ada aktivitas terbaru.
          </p>
        ) : (
          activities.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-100"
            >
              <div className="flex flex-col">
                <span className="text-base font-medium text-gray-800">
                  {item.title}
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  {item.status}
                </span>
              </div>
              <button
                onClick={() => handleView(item)}
                className="bg-emerald-500 text-white font-medium text-sm px-4 py-1.5 rounded-full hover:bg-emerald-600 transition-colors"
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
