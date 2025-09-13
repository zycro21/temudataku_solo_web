"use client";

import { Card } from "@/components/ui/card";
import {
  ClipboardList,
  FileText,
  FolderKanban,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentorTasks() {
  const tasks = [
    {
      id: 1,
      title: "Sesi Mentoring",
      description: "Terdapat 2 sesi mentoring Anda pada minggu ini",
      icon: <ClipboardList className="h-5 w-5 text-emerald-600" />,
    },
    {
      id: 2,
      title: "Laporan Mentor",
      description: "Terdapat 3 sesi yang belum Anda isi laporan mentornya",
      icon: <FileText className="h-5 w-5 text-emerald-600" />,
    },
    {
      id: 3,
      title: "Proyek Mentee",
      description: "Terdapat 12 proyek mentee yang belum Anda review",
      icon: <FolderKanban className="h-5 w-5 text-emerald-600" />,
    },
  ];

  return (
    <Card className="w-full h-full px-0 py-3 flex flex-col justify-between hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 pb-2 border-b">
        <AlertTriangle className="h-4 w-4 text-gray-500" />
        <h2 className="text-sm font-medium text-gray-700">Tanggungan Mentor</h2>
      </div>

      {/* Tasks list */}
      <div className="flex flex-col gap-3 px-6 pt-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex justify-between items-center border rounded-lg px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg">{task.icon}</div>
              <div>
                <h3 className="font-medium text-gray-800">{task.title}</h3>
                <p className="text-sm text-gray-500">
                  {task.description.split(" ").map((word, i) =>
                    /^\d+$/.test(word) ? (
                      <span key={i} className="text-red-500 font-medium">
                        {word}{" "}
                      </span>
                    ) : (
                      word + " "
                    )
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 text-sm"
            >
              Lihat Detail
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
