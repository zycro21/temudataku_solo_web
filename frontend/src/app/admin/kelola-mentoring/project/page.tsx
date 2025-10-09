// "use client";

// import { useState } from "react";
// import { FileText, Download, Clock, CheckCircle, Eye } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// import { DataTable } from "./data-table";
// import { columns, Project } from "./columns";

// export default function AdminMentorPage() {
//   const [projects] = useState<Project[]>([
//     {
//       id: "MNTG01",
//       mentee: "Jehan Ra",
//       mentor: "Gilang Dirga",
//       program: "Short Class",
//       date: "10-05-2025, 20:00",
//       projectFile: "",
//       topic: "Excel Untuk Pemula",
//       statusDetail: "Belum Dinilai",
//       score: "",
//       document: "",
//     },
//     {
//       id: "MNTG02",
//       mentee: "Galih B",
//       mentor: "Gilang Dirga",
//       program: "Bootcamp",
//       date: "10-05-2025, 20:00",
//       projectFile: "",
//       topic: "Introduction to Data Science",
//       statusDetail: "Belum Dinilai",
//       score: "",
//       document: "",
//     },
//     {
//       id: "MNTG03",
//       mentee: "Bonda Prakoso",
//       mentor: "Nina Pratiwi",
//       program: "Bootcamp",
//       date: "10-05-2025, 20:00",
//       projectFile: "",
//       topic: "Belajar Data Science dari Nol",
//       statusDetail: "Belum Dinilai",
//       score: "",
//       document: "",
//     },
//     {
//       id: "MNTG04",
//       mentee: "Kepa",
//       mentor: "Nina Pratiwi",
//       program: "Bootcamp",
//       date: "10-05-2025, 20:00",
//       projectFile: "Lorem Ipsum.pdf",
//       topic: "Visualisasi Data dengan Matplotlib",
//       statusDetail: "Belum Dinilai",
//       score: "",
//       document: "Lorem Ipsum.pdf",
//     },
//     {
//       id: "MNTG05",
//       mentee: "Darwin Nunez",
//       mentor: "Laura Ayu",
//       program: "Bootcamp",
//       date: "10-05-2025, 20:00",
//       projectFile: "Lorem Ipsum.pdf",
//       topic: "Visualisasi Data dengan Matplotlib",
//       statusDetail: "Sudah Dinilai",
//       score: "85",
//       document: "Lorem Ipsum.pdf",
//     },
//     {
//       id: "MNTG06",
//       mentee: "Marc Marquez",
//       mentor: "Gilang Dirga",
//       program: "Bootcamp",
//       date: "10-05-2025, 20:00",
//       projectFile: "Lorem Ipsum.pdf",
//       topic: "Visualisasi Data dengan Matplotlib",
//       statusDetail: "Sudah Dinilai",
//       score: "92",
//       document: "Lorem Ipsum.pdf",
//     },
//     {
//       id: "MNTG07",
//       mentee: "Rafael Struick",
//       mentor: "Laura Ayu",
//       program: "Bootcamp",
//       date: "10-05-2025, 20:00",
//       projectFile: "Lorem Ipsum.pdf",
//       topic: "Visualisasi Data dengan Matplotlib",
//       statusDetail: "Sudah Dinilai",
//       score: "88",
//       document: "Lorem Ipsum.pdf",
//     },
//     {
//       id: "MNTG08",
//       mentee: "Marteen Paes",
//       mentor: "Laura Ayu",
//       program: "Bootcamp",
//       date: "10-05-2025, 20:00",
//       projectFile: "Lorem Ipsum.pdf",
//       topic: "Visualisasi Data dengan Matplotlib",
//       statusDetail: "Sudah Dinilai",
//       score: "90",
//       document: "Lorem Ipsum.pdf",
//     },
//     {
//       id: "MNTG09",
//       mentee: "Kevin Mendoza",
//       mentor: "Laura Ayu",
//       program: "Short Class",
//       date: "10-05-2025, 20:00",
//       projectFile: "Lorem Ipsum Dolor.pdf",
//       topic: "Visualisasi Data dengan Matplotlib",
//       statusDetail: "Sudah Dinilai",
//       score: "99",
//       document: "Lorem Ipsum Dolor.pdf",
//     },
//     {
//       id: "MNTG10",
//       mentee: "Lorenzo",
//       mentor: "Nina Pratiwi",
//       program: "Short Class",
//       date: "10-05-2025, 20:00",
//       projectFile: "",
//       topic: "Excel Untuk Pemula",
//       statusDetail: "Belum Dinilai",
//       score: "",
//       document: "",
//     },
//   ]);

//   const stats = [
//     { title: "Total Project", value: "80", icon: FileText, color: "text-gray-900" },
//     { title: "Sudah Mengirim", value: "78", icon: CheckCircle, color: "text-green-600" },
//     { title: "Belum Mengirim", value: "2", icon: Clock, color: "text-orange-600" },
//     { title: "Sudah Direview", value: "78", icon: Eye, color: "text-green-600" },
//     { title: "Belum Direview", value: "2", icon: Clock, color: "text-orange-600" },
//   ];

//   return (
//     <>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Project</h1>
//           <p className="text-gray-600">Project</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
//             <Download className="w-4 h-4" />
//             <span>Export Data</span>
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
//         {stats.map((stat, index) => (
//           <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
//                   <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
//                 </div>
//                 <stat.icon className="w-8 h-8 text-gray-400" />
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* DataTable */}
//       <Card className="p-6">
//         <h2 className="text-lg font-semibold text-gray-900">Jadwal Sesi Mentoring</h2>
//         <DataTable columns={columns} data={projects} />
//       </Card>
//     </>
//   );
// }
