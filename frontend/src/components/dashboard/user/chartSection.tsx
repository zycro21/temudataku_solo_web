"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ScriptableContext,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function ChartSection() {
  const [activeTab, setActiveTab] = useState("Month");

  // === Hitung data week ===
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = Jan, 7 = Aug, dst
  const currentWeek = Math.ceil(now.getDate() / 7); // Minggu ke berapa

  // Dummy data bulanan (1 nilai per bulan)
  const monthlyData = [10, 8, 15, 12, 5, 20, 7, 25, 18, 16, 8, 5];

  // Dummy data mingguan untuk bulan aktif (misalnya dari API)
  // Jika minggu belum lewat, nilainya 0
  const weeklyValues = [5, 7, 10, 8]; // contoh isi, bisa diganti sesuai real data
  const weeklyData = weeklyValues.map((val, idx) =>
    idx + 1 <= currentWeek ? val : 0
  );

  // Tentukan dataset berdasarkan tab aktif
  const data =
    activeTab === "Month"
      ? {
          labels: [
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
          ],
          datasets: [
            {
              data: monthlyData,
              backgroundColor: (context: ScriptableContext<"bar">) => {
                const index = context.dataIndex;
                return index === currentMonth ? "#10B981" : "#D1FAE5";
              },
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
          ],
        }
      : {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              data: weeklyData,
              backgroundColor: (context: ScriptableContext<"bar">) => {
                const index = context.dataIndex;
                return index + 1 === currentWeek ? "#10B981" : "#D1FAE5";
              },
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
          ],
        };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ccc",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6B7280" },
        border: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Waktu Lihat</h2>
        <div className="flex bg-gray-100 p-1 rounded-full text-sm font-medium">
          <button
            onClick={() => setActiveTab("Week")}
            className={`px-4 py-1 rounded-full transition-colors ${
              activeTab === "Week"
                ? "bg-emerald-500 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setActiveTab("Month")}
            className={`px-4 py-1 rounded-full transition-colors ${
              activeTab === "Month"
                ? "bg-emerald-500 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Month
          </button>
        </div>
      </div>
      <div className="h-[208px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
