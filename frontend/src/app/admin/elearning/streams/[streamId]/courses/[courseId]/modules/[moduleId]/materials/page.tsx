"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import MaterialsHeader from "@/components/admin/elearning/materials/MaterialsHeader";
import MaterialsTable from "@/components/admin/elearning/materials/MaterialsTable";

export default function MaterialsPage() {
  const [search, setSearch] = useState("");
  const [streamName, setStreamName] = useState<string>("Loading...");
  const [courseName, setCourseName] = useState<string>("Loading...");
  const [moduleName, setModuleName] = useState<string>("Loading...");

  const params = useParams();
  const streamId = params?.streamId as string;
  const courseId = params?.courseId as string;
  const moduleId = params?.moduleId as string;

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
        console.error("Gagal fetch stream di materials page:", err);
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
        console.error("Gagal fetch course di materials page:", err);
        toast.error("Gagal memuat data course");
      }
    };

    // Fetch moduleName: gunakan API subbabs dari courseId,
    // ambil title dari subbab yang sesuai moduleId
    const fetchModule = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubBab/subchapters/${courseId}/subbabs`,
          {
            withCredentials: true,
            params: { limit: 10000 },
          },
        );
        const subBabs = res.data.data?.subBabs ?? [];
        const found = subBabs.find((sb: any) => sb.id === moduleId);
        if (found) setModuleName(found.title);
        else setModuleName("Unknown Module");
      } catch (err) {
        console.error("Gagal fetch module di materials page:", err);
        toast.error("Gagal memuat data module");
      }
    };

    if (streamId) fetchStream();
    if (streamId && courseId) fetchCourse();
    if (courseId && moduleId) fetchModule();
  }, [streamId, courseId, moduleId]);

  return (
    <div className="space-y-6">
      <MaterialsHeader
        search={search}
        onSearchChange={setSearch}
        moduleName={moduleName}
        courseName={courseName}
        streamName={streamName}
      />
      <MaterialsTable search={search} />
    </div>
  );
}
