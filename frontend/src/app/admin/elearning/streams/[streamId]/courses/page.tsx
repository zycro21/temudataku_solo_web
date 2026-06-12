"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CoursesHeader from "@/components/admin/elearning/courses/CoursesHeader";
import CoursesTable from "@/components/admin/elearning/courses/CoursesTable";

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [streamName, setStreamName] = useState<string>("Loading...");
  const [refreshKey, setRefreshKey] = useState(0);

  const params = useParams();
  const streamId = params?.streamId as string;

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${streamId}`,
          { withCredentials: true },
        );

        const result = res.data;

        if (result.success) {
          setStreamName(result.data.title);
        }
      } catch (err) {
        console.error("Gagal fetch stream:", err);
        toast.error("Gagal memuat data stream");
      }
    };

    if (streamId) fetchStream();
  }, [streamId]);

  return (
    <div className="space-y-6">
      <CoursesHeader
        search={search}
        onSearchChange={setSearch}
        streamName={streamName}
        streamId={streamId}
        onCourseCreated={() => setRefreshKey((prev) => prev + 1)}
      />

      <CoursesTable
        search={search}
        streamId={streamId}
        refreshKey={refreshKey}
        onCourseUpdated={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
