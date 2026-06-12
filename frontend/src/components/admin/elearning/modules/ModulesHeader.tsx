"use client";

import axios from "axios";
import { toast } from "sonner";
import { Plus, Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ModulesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  courseName: string;
  streamName: string;
  courseId: string;
  onModuleCreated: () => void;
}

export default function ModulesHeader({
  search,
  onSearchChange,
  courseName,
  streamName,
  courseId,
  onModuleCreated,
}: ModulesHeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formEstimatedTime, setFormEstimatedTime] = useState("");
  const [formStatus, setFormStatus] = useState("");

  const openCreateModal = () => {
    setFormTitle("");
    setFormEstimatedTime("");
    setFormStatus("");
    setShowCreateModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      setShowCreateModal(false);
    }, 250);
  };

  const handleCreate = async () => {
    // VALIDASI WAJIB ISI
    if (!formTitle.trim()) {
      toast.error("Module name belum diisi, harap isi terlebih dahulu");
      return;
    }

    if (!formEstimatedTime.trim()) {
      toast.error("Duration belum diisi, harap isi terlebih dahulu");
      return;
    }

    if (!formStatus) {
      toast.error("Status belum dipilih, harap pilih terlebih dahulu");
      return;
    }

    try {
      const body: Record<string, string> = {
        title: formTitle.trim(),
        estimatedTime: formEstimatedTime,
        status: formStatus,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubBab/subchapters/${courseId}/subbabs`,
        body,
        { withCredentials: true },
      );

      setModalVisible(false);
      onModuleCreated();
      setTimeout(() => {
        setShowCreateModal(false);
        setShowSuccessModal(true);
        setTimeout(() => setSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal membuat module");
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    setTimeout(() => setShowSuccessModal(false), 250);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Modules</h1>
          <p className="text-lg text-gray-500 mt-1">
            Manage modules within this course.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-3 px-6 py-5 text-base rounded-lg"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
            <Plus size={16} className="text-emerald-600" strokeWidth={3} />
          </span>
          Create Module
        </Button>
      </div>

      {/* Course + Stream Info Banner */}
      <div className="bg-emerald-100 px-6 py-4 rounded-lg flex items-center gap-6">
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
          <span className="text-[15px] font-semibold text-emerald-800">
            Part of Course: {courseName}
          </span>
          <span className="text-[13px] text-emerald-600 mt-0.5">
            Part of Stream: {streamName}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-[60rem]">
        <Input
          placeholder="Search modules..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 py-3 text-base bg-white h-auto"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Create Module Modal */}
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
                <h2 className="text-xl font-semibold text-gray-800">
                  Create New Module
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Modules group related materials into structured learning
                  units.
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
                {/* Module Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Module Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter module name"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                {/* Duration (in minutes) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 60"
                    value={formEstimatedTime}
                    onChange={(e) => setFormEstimatedTime(e.target.value)}
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
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white ${
                        formStatus ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="PUBLISHED" className="text-gray-700">
                        Published
                      </option>
                      <option value="ARCHIVED" className="text-gray-700">
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

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Module Created Successfully!
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Your new module has been created and is ready to use.
              <br />
              You can now add materials to it.
            </p>

            <button
              onClick={handleSuccessClose}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              View Modules
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
