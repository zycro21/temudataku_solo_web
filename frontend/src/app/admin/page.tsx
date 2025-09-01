"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, User, Calendar, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts";

export default function AdminPage() {
  const stats = [
    { title: "Jumlah Pengguna", value: "408", change: "+3 minggu ini" },
    { title: "Jumlah Mentor", value: "12" },
    { title: "Total Transaksi", value: "120" },
  ];

  const sessions = [
    {
      id: 1,
      status: "Terjadwal",
      mentor: "Laura Ayu",
      mentee: "Gilang Dirga",
      date: "1-05-2025, 20:00",
      topic: "SQL Query Optimization",
      document: "Lorem Ipsum Dolor.pdf",
      size: "2MB",
    },
  ];

  const statusPembayaran = [
    { status: "Berhasil", total: 120 },
    { status: "Proses", total: 45 },
    { status: "Pending", total: 20 },
    { status: "Gagal", total: 10 },
  ];

  const colors: Record<string, string> = {
    Berhasil: "#0CA678", // hijau
    Proses: "#228BE6", // biru
    Pending: "#F59F00", // oranye
    Gagal: "#E03131", // merah
  };

  const activities = [
    {
      title: "Hapus Sesi Mentoring",
      description: "Admin menghapus sesi mentoring dengan mentor Laura Ayu",
      time: "2 jam lalu",
      type: "delete",
    },
    {
      title: "Tambah Mentor Baru",
      description: "Admin menambahkan mentor baru: Budi Santoso",
      time: "5 jam lalu",
      type: "add",
    },
  ];

  // 🔹 Fake data pendapatan
  const revenueData = [
    { month: "Jan", mentoring: 5000000, bootcamp: 7000000, praktik: 3000000 },
    { month: "Feb", mentoring: 6000000, bootcamp: 8000000, praktik: 4000000 },
    { month: "Mar", mentoring: 7000000, bootcamp: 10000000, praktik: 4500000 },
    { month: "Apr", mentoring: 5500000, bootcamp: 7500000, praktik: 3500000 },
    { month: "May", mentoring: 8000000, bootcamp: 12000000, praktik: 5000000 },
    { month: "Jun", mentoring: 9000000, bootcamp: 11000000, praktik: 6000000 },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-600">Overview</p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
          <span>Minggu Ini</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        {stat.change}
                      </Badge>
                    )}
                    
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Pembayaran Chart */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusPembayaran}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {statusPembayaran.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pendapatan Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`} />
                  <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="mentoring" stroke="#9333ea" strokeWidth={3} />
                  <Line type="monotone" dataKey="bootcamp" stroke="#16a34a" strokeWidth={3} />
                  <Line type="monotone" dataKey="praktik" stroke="#06b6d4" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sesi Mentoring */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Sesi Mentoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-green-100 text-green-800">{session.status}</Badge>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 bg-transparent">
                        Hapus
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Mentor: {session.mentor}</span>
                    </div>
                    {session.mentee && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Mentee: {session.mentee}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Tanggal & Waktu: {session.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Topik Pembahasan: {session.topic}</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">Dokumen Diajukan</p>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{session.document}</span>
                        <span className="text-xs text-gray-500">{session.size}</span>
                      </div>
                      <Button variant="link" className="text-[#0CA678] p-0 h-auto text-sm">
                        Lihat Dokumen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* History Aktivitas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">History Aktivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === "delete" ? "bg-red-500" : "bg-blue-500"}`}></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
