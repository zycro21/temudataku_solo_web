"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";

const transactions = [
  {
    id: "ABCD01",
    date: "01-03-2025",
    program: "Bootcamp AI",
    price: "2.000.000",
    status: "Berhasil",
  },
  {
    id: "ABCD02",
    date: "15-03-2025",
    program: "Bootcamp Web",
    price: "1.750.000",
    status: "Gagal",
  },
  {
    id: "ABCD03",
    date: "27-03-2025",
    program: "Bootcamp Python",
    price: "1.500.000",
    status: "Pending",
  },
  {
    id: "ABCD04",
    date: "02-04-2025",
    program: "SQL Short Class",
    price: "200.000",
    status: "Berhasil",
  },
  {
    id: "ABCD05",
    date: "13-04-2025",
    program: "Webinar Data Science",
    price: "30.000",
    status: "Berhasil",
  },
  {
    id: "ABCD06",
    date: "20-04-2025",
    program: "Data Visualization",
    price: "750.000",
    status: "Berhasil",
  },
  {
    id: "ABCD07",
    date: "25-04-2025",
    program: "Cloud Computing",
    price: "1.200.000",
    status: "Pending",
  },
  {
    id: "ABCD08",
    date: "28-04-2025",
    program: "DevOps Class",
    price: "1.100.000",
    status: "Gagal",
  },
  {
    id: "ABCD09",
    date: "01-05-2025",
    program: "Big Data",
    price: "1.900.000",
    status: "Berhasil",
  },
  {
    id: "ABCD10",
    date: "04-05-2025",
    program: "Bootcamp Data Science",
    price: "1.750.000",
    status: "Berhasil",
  },
  {
    id: "ABCD11",
    date: "05-05-2025",
    program: "AI Research Class",
    price: "2.500.000",
    status: "Pending",
  },
];

export default function TransactionSection() {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof (typeof transactions)[0];
    direction: "asc" | "desc" | "default";
  } | null>(null);

  // toggle cycle status filter
  const statusOptions = ["all", "Berhasil", "Pending", "Gagal"];
  const [statusIndex, setStatusIndex] = useState(0);
  const statusFilter = statusOptions[statusIndex];

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting
  const sortedData = [...transactions].sort((a, b) => {
    if (!sortConfig || sortConfig.direction === "default") return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Filtering
  const filteredData = sortedData.filter(
    (t) =>
      (t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.program.toLowerCase().includes(search.toLowerCase()) ||
        t.status.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" ? true : t.status === statusFilter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const toggleSort = (key: keyof (typeof transactions)[0]) => {
    setSortConfig((prev) => {
      // kalau belum ada sort → set asc
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      // kalau sebelumnya asc → ganti desc
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      // kalau sebelumnya desc → reset (default)
      return null;
    });
  };

  const toggleStatusFilter = () => {
    setStatusIndex((prev) => (prev + 1) % statusOptions.length);
    setCurrentPage(1);
  };

  // Helper ikon sort + warna header aktif
  const getSortIcon = (key: keyof (typeof transactions)[0]) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="inline w-4 h-4 ml-1 text-gray-400" />;
    }
    if (sortConfig.direction === "asc") {
      return <ArrowUp className="inline w-4 h-4 ml-1 text-green-600" />;
    }
    return <ArrowDown className="inline w-4 h-4 ml-1 text-green-600" />;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Search */}
      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Cari berdasarkan ID, program dan status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => toggleSort("id")}
                className={`cursor-pointer font-semibold py-4 px-3 ${
                  sortConfig?.key === "id" ? "text-green-600" : "text-gray-500"
                }`}
              >
                No Transaksi {getSortIcon("id")}
              </TableHead>

              <TableHead
                onClick={() => toggleSort("date")}
                className={`cursor-pointer font-semibold py-4 ${
                  sortConfig?.key === "date" ? "text-green-600" : "text-gray-500"
                }`}
              >
                Tanggal Daftar {getSortIcon("date")}
              </TableHead>

              <TableHead
                onClick={() => toggleSort("program")}
                className={`cursor-pointer font-semibold py-4 ${
                  sortConfig?.key === "program"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                Program {getSortIcon("program")}
              </TableHead>

              <TableHead
                onClick={() => toggleSort("price")}
                className={`cursor-pointer font-semibold py-4 ${
                  sortConfig?.key === "price"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                Harga {getSortIcon("price")}
              </TableHead>

              <TableHead
                onClick={toggleStatusFilter}
                className="cursor-pointer text-gray-500 font-semibold py-4"
              >
                Status Pembayaran
                {statusFilter !== "all" && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">
                    - {statusFilter}
                  </span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((t, idx) => (
              <TableRow key={idx} className="border-b border-gray-200">
                <TableCell className="py-3 px-3">{t.id}</TableCell>
                <TableCell className="py-3">{t.date}</TableCell>
                <TableCell className="py-3">{t.program}</TableCell>
                <TableCell className="py-3">{t.price}</TableCell>
                <TableCell className="py-3">
                  <span
                    className={`px-2 py-1 rounded-md text-sm font-medium ${
                      t.status === "Berhasil"
                        ? "bg-green-100 text-green-600"
                        : t.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {t.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <p>
          Menampilkan {(currentPage - 1) * rowsPerPage + 1}–
          {Math.min(currentPage * rowsPerPage, filteredData.length)} dari{" "}
          {filteredData.length} data
        </p>

        {/* Centered navigation */}
        <div className="flex items-center gap-4 mx-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </Button>
          <span>{currentPage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            {">"}
          </Button>
        </div>

        {/* Rows per page with label */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Tampilkan per halaman</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(val) => {
              setRowsPerPage(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
