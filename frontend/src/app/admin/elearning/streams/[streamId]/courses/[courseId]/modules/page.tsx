"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ModulesHeader from "@/components/admin/elearning/modules/ModulesHeader";
import ModulesTable from "@/components/admin/elearning/modules/ModulesTable";

export default function ModulesPage() {
  const [search, setSearch] = useState("");
  const [streamName, setStreamName] = useState<string>("Loading...");
  const [courseName, setCourseName] = useState<string>("Loading...");
  const [refreshKey, setRefreshKey] = useState(0);

  const params = useParams();
  const streamId = params?.streamId as string;
  const courseId = params?.courseId as string;

  useEffect(() => {
    // Fetch streamName: gunakan API list courses (elearningCourse),
    // ambil title dari course/stream yang sesuai streamId
    const fetchStream = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
          {
            withCredentials: true,
            params: { limit: 10000 },
          },
        );
        const list = res.data.data ?? [];
        const found = list.find((c: any) => c.id === streamId);
        if (found) setStreamName(found.title);
        else setStreamName("Unknown Stream");
      } catch (err) {
        console.error("Gagal fetch stream di modules page:", err);
        toast.error("Gagal memuat data stream");
      }
    };

    // Fetch courseName: gunakan API subchapters dari streamId,
    // ambil title dari subchapter yang sesuai courseId
    const fetchCourse = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/courses/${streamId}/subchapters`,
          { withCredentials: true },
        );
        const subChapters = res.data.data?.subChapters ?? [];
        const found = subChapters.find((sc: any) => sc.id === courseId);
        if (found) setCourseName(found.title);
        else setCourseName("Unknown Course");
      } catch (err) {
        console.error("Gagal fetch course di modules page:", err);
        toast.error("Gagal memuat data course");
      }
    };

    if (streamId) fetchStream();
    if (streamId && courseId) fetchCourse();
  }, [streamId, courseId]);

  return (
    <div className="space-y-6">
      <ModulesHeader
        search={search}
        onSearchChange={setSearch}
        courseName={courseName}
        streamName={streamName}
        courseId={courseId}
        onModuleCreated={() => setRefreshKey((prev) => prev + 1)}
      />
      <ModulesTable
        search={search}
        refreshKey={refreshKey}
        onModuleUpdated={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
