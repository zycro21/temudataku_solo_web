"use client";

import { Search, Plus, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StreamsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function StreamsHeader({
  search,
  onSearchChange,
}: StreamsHeaderProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "",
    status: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    // reset input agar bisa upload file yang sama lagi
    e.target.value = "";
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      setShowCreateModal(false);
      setThumbnailFile(null);
      setThumbnailPreview(null);

      // ✅ TAMBAHAN
      setForm({
        title: "",
        description: "",
        level: "",
        status: "",
      });
    }, 250);
  };

  const handleCreate = async () => {
    // VALIDASI WAJIB ISI
    if (!form.title.trim()) {
      return toast.error("Stream Name wajib diisi");
    }

    if (!form.description.trim()) {
      return toast.error("Description wajib diisi");
    }

    if (!form.level) {
      return toast.error("Level wajib dipilih");
    }

    if (!form.status) {
      return toast.error("Status wajib dipilih");
    }

    if (!thumbnailFile) {
      return toast.error("Thumbnail wajib diupload");
    }

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("level", form.level);
      formData.append(
        "status",
        form.status === "published" ? "PUBLISHED" : "ARCHIVED",
      );

      // ⚠️ sementara HARDCODE (nanti ambil dari user login)
      formData.append("mentorId", "Mentor-000008");

      // thumbnail
      if (thumbnailFile) {
        formData.append("thumbnailImages", thumbnailFile);
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
        formData,
        {
          withCredentials: true,
        },
      );

      // SUCCESS UI (pakai logic kamu)
      setModalVisible(false);
      setTimeout(() => {
        setShowCreateModal(false);
        setThumbnailFile(null);
        setThumbnailPreview(null);

        // ✅ TAMBAHAN
        setForm({
          title: "",
          description: "",
          level: "",
          status: "",
        });

        setShowSuccessModal(true);
        setTimeout(() => setSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Failed create stream",
      );
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    setTimeout(() => {
      setShowSuccessModal(false);

      // TAMBAHAN REFRESH DI SINI
      router.refresh();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Streams</h1>
          <p className="text-lg text-gray-500 mt-1">
            Organize your learning structure by grouping courses into streams.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-3 px-6 py-5 text-base rounded-lg"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
            <Plus size={16} className="text-emerald-600" strokeWidth={3} />
          </span>
          Create Stream
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-[28rem]">
        <Input
          placeholder="Search streams..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 py-3 text-base bg-white h-auto"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Create Stream Modal */}
      {showCreateModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            modalVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[540px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pt-6 px-7 pb-10 transform transition-all duration-300 ${
              modalVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Create New Stream
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

            <div className="space-y-5 mt-5">
              {/* Stream Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2.5">
                  Stream Name
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  type="text"
                  placeholder="Enter stream name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Briefly describe the focus of this stream"
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2.5">
                  Level
                </label>
                <div className="relative">
                  <select
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                  >
                    <option value="" disabled>
                      Select difficulty level
                    </option>
                    <option value="beginner" className="text-gray-700">
                      Beginner
                    </option>
                    <option value="intermediate" className="text-gray-700">
                      Intermediate
                    </option>
                    <option value="advanced" className="text-gray-700">
                      Advanced
                    </option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2.5">
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

                {/* Preview */}
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2.5">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
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
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
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
            {/* Icon */}
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

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Stream Created Successfully!
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Your new stream has been created and is ready to use.
              <br />
              You can now add courses to it.
            </p>

            <button
              onClick={handleSuccessClose}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              View Streams
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
