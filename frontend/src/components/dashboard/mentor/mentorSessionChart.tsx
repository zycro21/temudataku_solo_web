"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MentorSessionChart() {
  const data = [
    { name: "Mentoring 1 on 1", mentee: 40, session: 2 },
    { name: "Mentoring Group", mentee: 18, session: 4 },
    { name: "Bootcamp", mentee: 32, session: 46 },
    { name: "Short Class", mentee: 12, session: 13 },
  ];

  return (
    <Card className="w-full h-full px-0 py-2 flex flex-col justify-between hover:shadow-md transition-all duration-200">
      {/* Header */}
      <CardHeader className="flex items-center justify-between px-6 pt-2 pb-0">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <CardTitle className="text-sm font-medium text-gray-700">
            Rekapitulasi Sesi dan Mentee
          </CardTitle>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-600" />
      </CardHeader>

      {/* Content */}
      <CardContent className="px-6 py-4">
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="mentee" fill="#10b981" name="Jumlah Mentee" />
              <Bar dataKey="session" fill="#6ee7b7" name="Jumlah Sesi" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
