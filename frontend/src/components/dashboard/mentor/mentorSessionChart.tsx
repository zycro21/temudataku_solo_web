"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SERVICE_TYPES = [
  "one-on-one",
  "group",
  "bootcamp",
  "shortclass",
  "live class",
];

export default function MentorSessionChart() {
  const [menteeData, setMenteeData] = useState<number[]>([0, 0, 0, 0, 0]);
  const [sessionData, setSessionData] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentorStat/bookings`,
          { withCredentials: true }
        );

        const apiData = res.data.data as {
          serviceType: string;
          totalMentees: number;
          totalSessions: number;
        }[];

        // Map default (0 semua)
        const mappedMentee: Record<string, number> = {};
        const mappedSession: Record<string, number> = {};
        SERVICE_TYPES.forEach((type) => {
          mappedMentee[type] = 0;
          mappedSession[type] = 0;
        });

        // Isi dari API
        apiData.forEach((item) => {
          const type = item.serviceType.toLowerCase();
          if (mappedMentee[type] !== undefined) {
            mappedMentee[type] = item.totalMentees;
            mappedSession[type] = item.totalSessions;
          }
        });

        setMenteeData(SERVICE_TYPES.map((type) => mappedMentee[type]));
        setSessionData(SERVICE_TYPES.map((type) => mappedSession[type]));
      } catch (error) {
        console.error("Gagal fetch data chart:", error);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels: [
      "Mentoring 1 on 1",
      "Mentoring Group",
      "Bootcamp",
      "Short Class",
      "Live Class",
    ],
    datasets: [
      {
        label: "Jumlah Mentee",
        data: menteeData,
        backgroundColor: "#10b981",
        borderRadius: 4,
        barPercentage: 0.8,
        categoryPercentage: 0.7,
      },
      {
        label: "Jumlah Sesi",
        data: sessionData,
        backgroundColor: "#6ee7b7",
        borderRadius: 4,
        barPercentage: 0.8,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "#000000",
          font: { weight: "bold" },
          maxRotation: 0,
          minRotation: 0,
          padding: 10,
          callback: function (val, index) {
            const labels = [
              ["Mentoring", "1 on 1"],
              ["Mentoring", "Group"],
              ["Bootcamp"],
              ["Short", "Class"],
              ["Live", "Class"],
            ];
            return labels[index];
          },
        },
        grid: {
          display: true,
          drawTicks: false,
          drawOnChartArea: true,
          color: "#e5e7eb",
        },
        border: {
          color: "#000000",
          width: 2,
        },
      },
      y: {
        ticks: {
          color: "#000000",
          font: { weight: "normal" },
          stepSize: 15,
          padding: 6,
        },
        grid: {
          display: true,
          drawTicks: false,
          color: "#e5e7eb",
        },
        border: {
          color: "#000000",
          width: 2,
        },
      },
    },
    plugins: {
      legend: {
        position: "right",
        align: "start",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          boxHeight: 6,
          padding: 12,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <Card className="w-full h-full px-0 py-2 flex flex-col justify-between hover:shadow-md transition-all duration-200 rounded-md">
      <CardHeader className="flex items-center justify-between px-6 pt-4 pb-0">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/dashboard/mentor/person.svg"
            alt="icon"
            width={12}
            height={12}
            className="relative top-[-1px]"
          />
          <CardTitle className="text-md font-medium text-gray-500 leading-none">
            Rekapitulasi Sesi dan Mentee
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-4 pt-0">
        <div className="w-full h-[282px]">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
