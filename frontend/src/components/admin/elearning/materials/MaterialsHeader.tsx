"use client";

import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";

interface MaterialsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  moduleName: string;
  courseName: string;
  streamName: string;
}

export default function MaterialsHeader({
  search,
  onSearchChange,
  moduleName,
  courseName,
  streamName,
}: MaterialsHeaderProps) {
  const params = useParams();
  const router = useRouter();
  const streamId = params?.streamId;
  const courseId = params?.courseId;
  const moduleId = params?.moduleId;

  const handleCreateMaterial = () => {
    const { streamId, courseId, moduleId } = params;

    router.push(
      `/admin/elearning/streams/${streamId}/courses/${courseId}/modules/${moduleId}/materials/create?mode=create`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Materials</h1>
          <p className="text-lg text-gray-500 mt-1">
            Manage learning content inside this module.
          </p>
        </div>

        <Button
          onClick={handleCreateMaterial}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-3 px-6 py-5 text-base rounded-lg"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
            <Plus size={16} className="text-emerald-600" strokeWidth={3} />
          </span>
          Create Material
        </Button>
      </div>

      {/* Module + Course + Stream Info Banner */}
      <div className="bg-emerald-100 px-6 py-4 rounded-lg flex items-center gap-3">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 shrink-0 mt-0.5">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M2 5.5L4.5 8L9 3"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-gray-900">
            Part of Module: {moduleName}
          </span>
          <span className="text-[13px] text-gray-600 mt-1.5">
            Part of Course: {courseName}
          </span>
          <span className="text-[12px] text-gray-400 mt-1.5">
            Part of Stream: {streamName}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-[60rem]">
        <Input
          placeholder="Search materials..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 py-3 text-base bg-white h-auto"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}
