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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function MentorSessionChart() {
  const data = {
    labels: ["Mentoring 1 on 1", "Mentoring Group", "Bootcamp", "Short Class"],
    datasets: [
      {
        label: "Jumlah Mentee",
        data: [82, 18, 32, 12],
        backgroundColor: "#10b981",
        borderRadius: 4,
        barPercentage: 0.8,
        categoryPercentage: 0.7,
      },
      {
        label: "Jumlah Sesi",
        data: [2, 4, 46, 13],
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
            ];
            return labels[index];
          },
        },
        grid: {
          display: true,
          drawTicks: false,
          drawOnChartArea: true,
          color: "#e5e7eb", // garis abu tipis
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
          boxWidth: 6, // ✅ lebih kecil
          boxHeight: 6,
          padding: 12, // ✅ jarak antar legend
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
