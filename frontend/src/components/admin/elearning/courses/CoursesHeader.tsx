"use client";

import { Plus, Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";

interface CoursesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  streamName: string;
  // ─── streamId dibutuhkan untuk POST ke API create subchapter ───────────────
  streamId: string;
  // ─── callback agar parent bisa refresh tabel setelah create berhasil ───────
  onCourseCreated?: () => void;
}

export default function CoursesHeader({
  search,
  onSearchChange,
  streamName,
  streamId,
  onCourseCreated,
}: CoursesHeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Form state ─────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const openCreateModal = () => {
    // reset form setiap kali buka modal
    setTitle("");
    setDescription("");
    setStatus("");
    setEstimatedTime("");
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setShowCreateModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      setShowCreateModal(false);
      setThumbnailFile(null);
      setThumbnailPreview(null);
    }, 250);
  };

  // ─── Create course → POST /api/elearningSubChapter/courses/:streamId/subchapters
  const handleCreate = async () => {
    // ─── Validasi semua kolom wajib ──────────────────────────────────────────
    const missing: string[] = [];
    if (!title.trim()) missing.push("Course Name");
    if (!description.trim()) missing.push("Description");
    if (!estimatedTime) missing.push("Estimated Time");
    if (!status) missing.push("Status");
    if (!thumbnailFile) missing.push("Thumbnail");

    if (missing.length > 0) {
      const list = missing.join(", ");
      toast.error(`${list} belum diisi. Harap lengkapi semua kolom.`);
      return;
    }

    try {
      setCreateLoading(true);

      // ─── Ambil orderNumber otomatis dari subchapters yang sudah ada ──────────
      let nextOrderNumber = 1;
      try {
        const existingRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/courses/${streamId}/subchapters`,
          {
            withCredentials: true,
            params: { page: 1, limit: 10000 },
          },
        );
        const subChapters: any[] = existingRes.data?.data?.subChapters ?? [];
        if (subChapters.length > 0) {
          const maxOrder = Math.max(
            ...subChapters.map((sc) => sc.orderNumber ?? 0),
          );
          nextOrderNumber = maxOrder + 1;
        }
      } catch {
        // Kalau gagal fetch, fallback ke 1
        nextOrderNumber = 1;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("orderNumber", String(nextOrderNumber));

      if (estimatedTime) {
        formData.append("estimatedTime", String(estimatedTime));
      }

      if (status) {
        const statusMap: Record<string, string> = {
          published: "PUBLISHED",
          archived: "ARCHIVED",
        };
        formData.append("status", statusMap[status] ?? "ARCHIVED");
      }

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/courses/${streamId}/subchapters`,
        formData,
        { withCredentials: true },
      );

      // ─── SUCCESS FLOW ──────────────────────────────────────────────────────
      setModalVisible(false);
      onCourseCreated?.();
      setTimeout(() => {
        setShowCreateModal(false);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setShowSuccessModal(true);
        setTimeout(() => setSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      console.error(err);

      // Parse Zod validation errors dari backend untuk pesan yang lebih jelas
      const responseData = err.response?.data;
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const fieldLabels: Record<string, string> = {
          title: "Course Name",
          description: "Description",
          orderNumber: "Order Number",
          estimatedTime: "Estimated Time",
          status: "Status",
          courseId: "Course ID",
        };
        const messages = responseData.errors
          .map((e: any) => {
            const field = e.path?.join(".") || "";
            const label = fieldLabels[field] || field;
            return label ? `${label}: ${e.message}` : e.message;
          })
          .join(" | ");
        toast.error(`Validasi gagal — ${messages}`);
      } else {
        toast.error(
          responseData?.message || err.message || "Gagal membuat course",
        );
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage courses within this learning stream.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
            <Plus size={16} className="text-emerald-600" strokeWidth={3} />
          </span>
          Create Course
        </Button>
      </div>

      {/* Stream Info Banner — nama stream (elearningcourse) induk dari courses ini */}
      <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-lg text-[13px] font-medium flex items-center gap-2.5">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 shrink-0">
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
        Part of Stream:{" "}
        <span className="font-semibold">{streamName || "Loading..."}</span>
      </div>

      {/* Search */}
      <div className="relative w-[60rem]">
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 py-2 text-sm bg-white h-auto"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            modalVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[540px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl transform transition-all duration-300 ${
              modalVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Sticky Header */}
            <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Create New Course
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Streams group related courses into a structured learning path.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition mt-0.5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-7 pb-10 flex-1">
              <div className="space-y-5 mt-5">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter course name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what learners will achieve"
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Thumbnail
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-emerald-500 text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
                    >
                      Choose Files
                    </button>
                    <span className="text-sm text-gray-400">
                      {thumbnailFile ? thumbnailFile.name : "No file chosen"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {thumbnailPreview && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-3 w-fit">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Estimated Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="Contoh: 30"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="published" className="text-gray-700">
                        Published
                      </option>
                      <option value="archived" className="text-gray-700">
                        Archived
                      </option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 mt-7">
                <button
                  onClick={handleClose}
                  className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createLoading}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            successVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              successVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Course Created Successfully!
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Your new course has been created and is ready to use.
              <br />
              You can now add modules to it.
            </p>

            <button
              onClick={handleSuccessClose}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              View Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
