"use client";

import axios from "axios";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import StatusBadge from "../streams/StatusBadge";
import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Pencil,
  Copy,
  Archive,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface CoursesTableProps {
  search: string;
  streamId: string;
  refreshKey: number;
  onCourseUpdated?: () => void;
}

type SortDirection = "desc" | "asc" | null;
type SortKey = string | null;

export default function CoursesTable({
  search,
  streamId,
  refreshKey,
  onCourseUpdated,
}: CoursesTableProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [editModal, setEditModal] = useState<{
    courseId: number;
    name: string;
    description: string;
    thumbnail: string;
    status: string;
    estimatedTime: string;
  } | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    estimatedTime: "",
    status: "",
  });
  const [editVisible, setEditVisible] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [editSuccessVisible, setEditSuccessVisible] = useState(false);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<
    string | null
  >(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const [actionModal, setActionModal] = useState<{
    type: "publish" | "unpublish";
    courseId: number;
  } | null>(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    type: "publish" | "unpublish";
  } | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  const [duplicateModal, setDuplicateModal] = useState<{
    courseId: string;
    name: string;
  } | null>(null);
  const [duplicateVisible, setDuplicateVisible] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [deleteVisible, setDeleteVisible] = useState(false);

  const openDeleteModal = (id: string) => {
    setDeleteModal({ open: true, id });
    setTimeout(() => setDeleteVisible(true), 10);
  };

  const closeDeleteModal = () => {
    setDeleteVisible(false);
    setTimeout(() => setDeleteModal({ open: false, id: null }), 250);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/subchapters/${deleteModal.id}`,
        { withCredentials: true },
      );

      toast.success("Sub-chapter berhasil dihapus");
      closeDeleteModal();
      await fetchCoursesData();
      onCourseUpdated?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Gagal menghapus sub-chapter";
      toast.error(message);
    }
  };

  const fetchCoursesData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/courses/${streamId}/subchapters`,
        { withCredentials: true },
      );

      const result = res.data;

      if (result.success) {
        const mapped = result.data.subChapters.map((sc: any) => {
          const modulesCount = sc.subBabs.length;

          const materialsCount = sc.subBabs.reduce(
            (acc: number, sb: any) => acc + (sb.texts?.length || 0),
            0,
          );

          // AUTO TASK TYPE (kalau backend belum handle)
          let assessment = "None";
          const hasQuiz = sc.subBabs.some((sb: any) => sb.quiz);
          const hasProject = sc.subBabs.some((sb: any) => sb.assignment);

          if (hasQuiz && hasProject) assessment = "Quiz & Project";
          else if (hasQuiz) assessment = "Quiz";
          else if (hasProject) assessment = "Project";

          return {
            id: sc.id,
            order: sc.orderNumber,
            name: sc.title,
            description: sc.description,
            thumbnail: sc.coverImage,
            modules: modulesCount,
            materials: materialsCount,
            assessment,
            duration: Number(sc.estimatedTime || 0),
            status: sc.status?.toUpperCase(),
            created: sc.createdAt,
          };
        });

        setCourses(mapped);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (streamId) fetchCoursesData();
  }, [streamId, refreshKey]);

  const filteredCourses = courses.filter((course: any) => {
    const query = search.toLowerCase();
    return (
      (course.name ?? "").toLowerCase().includes(query) ||
      (course.description ?? "").toLowerCase().includes(query)
    );
  });

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortDir("asc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey || !sortDir) return null;
    return sortDir === "desc" ? (
      <ChevronDown size={14} className="inline ml-1 shrink-0" />
    ) : (
      <ChevronUp size={14} className="inline ml-1 shrink-0" />
    );
  };

  const thBase = (colKey: SortKey) =>
    `px-4 py-3 cursor-pointer select-none transition-colors text-[13px] font-semibold ${
      sortKey === colKey
        ? "bg-emerald-200 text-emerald-800"
        : "text-gray-700 hover:bg-emerald-100"
    }`;

  const sortedCourses = [...filteredCourses].sort((a: any, b: any) => {
    if (!sortKey || !sortDir) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    const modifier = sortDir === "asc" ? 1 : -1;
    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * modifier;
    }
    return String(valA).localeCompare(String(valB)) * modifier;
  });

  // Pagination
  const totalData = sortedCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalData);
  const pagedCourses = sortedCourses.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, perPage]);

  const getPaginationItems = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, safePage - 2);
    let end = start + 4;
    if (end > totalPages) {
      end = totalPages;
      start = end - 4;
    }
    const items: (number | "...")[] = [];
    if (start > 1) items.push("...");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages) items.push("...");
    return items;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) return `${m}M`;
    if (m === 0) return `${h}H`;

    return `${h}H ${String(m).padStart(2, "0")}M`;
  };

  const formatDateTime = (dateString: string) => {
    const dateObj = new Date(dateString);

    const date = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const time = dateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { date, time };
  };

  const openEditModal = (course: any) => {
    setEditModal({
      courseId: course.id,
      name: course.name,
      description: course.description,
      thumbnail: course.thumbnail,
      status: course.status,
      estimatedTime: String(course.duration || ""),
    });
    setEditForm({
      name: course.name,
      description: course.description,
      estimatedTime: String(course.duration || ""),
      status: course.status,
    });
    setEditThumbnailFile(null);
    setEditThumbnailPreview(null);
    setTimeout(() => setEditVisible(true), 10);
  };

  const closeEditModal = () => {
    setEditVisible(false);
    setTimeout(() => {
      setEditModal(null);
      setEditThumbnailFile(null);
      setEditThumbnailPreview(null);
    }, 250);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditThumbnailFile(file);
    setEditThumbnailPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const openActionModal = (type: "publish" | "unpublish", courseId: number) => {
    setActionModal({ type, courseId });
    setTimeout(() => setActionVisible(true), 10);
  };

  const closeActionModal = () => {
    setActionVisible(false);
    setTimeout(() => setActionModal(null), 250);
  };

  const confirmAction = async () => {
    try {
      if (!actionModal) return;

      const newStatus =
        actionModal.type === "publish" ? "PUBLISHED" : "ARCHIVED";

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/subchapters/${actionModal.courseId}`,
        { status: newStatus },
        { withCredentials: true },
      );

      toast.success(
        newStatus === "PUBLISHED"
          ? "Course berhasil dipublish"
          : "Course berhasil di-archive",
      );

      const type = actionModal.type;
      setActionVisible(false);
      setTimeout(() => {
        setActionModal(null);
        setSuccessModal({ type });
        setTimeout(() => setSuccessVisible(true), 10);
      }, 250);

      await fetchCoursesData();
      onCourseUpdated?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Gagal update status course (publish/archive)",
      );
    }
  };

  const closeSuccessModal = () => {
    setSuccessVisible(false);
    setTimeout(() => setSuccessModal(null), 250);
  };

  const openDuplicateModal = (course: any) => {
    setDuplicateModal({ courseId: course.id, name: course.name });
    setTimeout(() => setDuplicateVisible(true), 10);
  };

  const closeDuplicateModal = () => {
    setDuplicateVisible(false);
    setTimeout(() => setDuplicateModal(null), 250);
  };

  return (
    <div className="bg-white rounded-xl border overflow-visible mb-20">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#DDF6EC" }}>
            <th
              className={`${thBase("id")} text-left`}
              onClick={() => handleSort("id")}
            >
              Order <SortIcon colKey="id" />
            </th>
            <th className="px-4 py-3 text-left text-gray-700 text-[13px] font-semibold">
              Thumbnail
            </th>
            <th
              className={`${thBase("name")} text-left`}
              onClick={() => handleSort("name")}
            >
              Course Name <SortIcon colKey="name" />
            </th>
            <th
              className={`${thBase("description")} text-left`}
              onClick={() => handleSort("description")}
            >
              Description <SortIcon colKey="description" />
            </th>
            <th
              className={`${thBase("modules")} text-center`}
              onClick={() => handleSort("modules")}
            >
              Modules <SortIcon colKey="modules" />
            </th>
            <th
              className={`${thBase("materials")} text-center`}
              onClick={() => handleSort("materials")}
            >
              Materials <SortIcon colKey="materials" />
            </th>
            <th
              className={`${thBase("assessment")} text-center`}
              onClick={() => handleSort("assessment")}
            >
              Assessment <SortIcon colKey="assessment" />
            </th>
            <th
              className={`${thBase("duration")} text-center`}
              onClick={() => handleSort("duration")}
            >
              Duration <SortIcon colKey="duration" />
            </th>
            <th
              className={`${thBase("status")} text-center`}
              onClick={() => handleSort("status")}
            >
              Status <SortIcon colKey="status" />
            </th>
            <th
              className={`${thBase("created")} text-center`}
              onClick={() => handleSort("created")}
            >
              Created At <SortIcon colKey="created" />
            </th>
            <th className="px-4 py-3 text-center text-gray-700 text-[13px] font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={11} className="text-center py-10 text-gray-400">
                Loading...
              </td>
            </tr>
          ) : courses.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                No courses available in this stream
              </td>
            </tr>
          ) : pagedCourses.length > 0 ? (
            pagedCourses.map((course: any, index: number) => (
              <tr
                key={course.id}
                onClick={() => {
                  if (openMenu || editModal || actionModal) return;
                  router.push(
                    `/admin/elearning/streams/${streamId}/courses/${course.id}/modules`,
                  );
                }}
                className="border-t hover:bg-gray-50 transition cursor-pointer"
              >
                <td className="px-4 py-3 text-[12px] text-gray-600">
                  # {startIndex + index + 1}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 relative">
                      {(() => {
                        const thumbnail = course.thumbnail
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${course.thumbnail}`
                          : "";

                        return (
                          <Image
                            src={thumbnail || "/images/Navbar_logo.png"}
                            alt="thumbnail"
                            fill
                            className="object-cover rounded-md"
                            unoptimized
                          />
                        );
                      })()}
                    </div>
                    <span className="text-[9px] text-gray-400 max-w-[60px] truncate">
                      {(() => {
                        if (!course.thumbnail) return "no image";
                        const match = course.thumbnail.match(
                          /([^/]+\.(jpg|jpeg|png|gif|webp|svg))(\?|$)/i,
                        );
                        return match ? match[1] : "course.jpg";
                      })()}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-[12px] font-medium text-gray-800">
                  {course.name}
                </td>

                <td className="px-4 py-3 text-[12px] text-gray-500 max-w-[250px]">
                  <span className="line-clamp-3">{course.description}</span>
                </td>

                <td className="px-4 py-3 text-[12px] text-center">
                  {course.modules}
                </td>
                <td className="px-4 py-3 text-[12px] text-center">
                  {course.materials}
                </td>
                <td className="px-4 py-3 text-[12px] text-center">
                  {course.assessment}
                </td>
                <td className="px-4 py-3 text-[12px] text-center">
                  {formatDuration(course.duration)}
                </td>

                <td className="px-4 py-3 text-center">
                  <StatusBadge
                    status={
                      course.status === "PUBLISHED" ? "Published" : "Archived"
                    }
                  />
                </td>

                <td className="px-4 py-3 text-center text-gray-500">
                  {(() => {
                    const { date, time } = formatDateTime(course.created);
                    return (
                      <div className="flex flex-col items-center leading-tight">
                        <span className="text-[12px]">{date}</span>
                        <span className="text-[10px] text-gray-400">
                          {time}
                        </span>
                      </div>
                    );
                  })()}
                </td>

                <td className="px-4 py-3 text-center relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === course.id ? null : course.id);
                    }}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <MoreVertical size={15} />
                  </button>

                  {openMenu === course.id && (
                    <div
                      ref={menuRef}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-6 mt-2 w-40 bg-white border rounded-lg shadow-md z-50 text-sm"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          openEditModal(course);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                      >
                        <Pencil size={15} /> Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          openDuplicateModal(course);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                      >
                        <Copy size={15} /> Duplicate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          openActionModal(
                            course.status === "ARCHIVED"
                              ? "publish"
                              : "unpublish",
                            course.id,
                          );
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                      >
                        <Archive size={15} />
                        {course.status === "ARCHIVED" ? "Publish" : "Archive"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          openDeleteModal(course.id);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={11}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                No courses found matching &quot;{search}&quot;
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex items-center justify-between px-5 py-3 border-t text-[13px] text-gray-600">
        <span>
          Menampilkan {totalData === 0 ? 0 : startIndex + 1} – {endIndex} dari{" "}
          {totalData} data
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border rounded px-2 py-1 text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {getPaginationItems().map((item, idx) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-[13px] text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-7 h-7 rounded text-[13px] font-medium transition-colors ${
                    item === safePage
                      ? "bg-emerald-500 text-white"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            editVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[540px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pt-6 px-7 pb-10 transform transition-all duration-300 ${
              editVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Course
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Update the details of this course.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition mt-0.5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 mt-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Course Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  value={editForm.estimatedTime}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      estimatedTime: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Thumbnail
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="border border-emerald-500 text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
                  >
                    Choose Files
                  </button>
                  <span className="text-sm text-gray-400">
                    {editThumbnailFile
                      ? editThumbnailFile.name
                      : "No file chosen"}
                  </span>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditFileChange}
                  />
                </div>
                {(editThumbnailPreview || editModal.thumbnail) && (
                  <div className="mt-4 border border-gray-200 rounded-lg p-3 w-fit">
                    {(() => {
                      const thumbnail = editThumbnailPreview
                        ? editThumbnailPreview
                        : editModal.thumbnail
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${editModal.thumbnail}`
                          : "";

                      return (
                        <img
                          src={thumbnail}
                          alt="Thumbnail preview"
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      );
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={closeEditModal}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!editModal) return;

                    const formData = new FormData();

                    if (editForm.name) formData.append("title", editForm.name);

                    if (editForm.description)
                      formData.append("description", editForm.description);

                    if (editForm.estimatedTime)
                      formData.append(
                        "estimatedTime",
                        String(editForm.estimatedTime),
                      );

                    if (editForm.status)
                      formData.append("status", editForm.status);

                    if (editThumbnailFile) {
                      formData.append("thumbnail", editThumbnailFile);
                    }

                    await axios.put(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/subchapters/${editModal.courseId}`,
                      formData,
                      { withCredentials: true },
                    );

                    toast.success("Course berhasil diupdate");

                    setEditVisible(false);
                    setTimeout(() => {
                      setEditModal(null);
                      setEditThumbnailFile(null);
                      setEditThumbnailPreview(null);
                      setShowEditSuccess(true);
                      setTimeout(() => setEditSuccessVisible(true), 10);
                    }, 250);

                    await fetchCoursesData();
                    onCourseUpdated?.();
                  } catch (err: any) {
                    console.error(err);
                    toast.error(
                      err?.response?.data?.message || "Gagal update course",
                    );
                  }
                }}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Success Modal */}
      {showEditSuccess && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            editSuccessVisible
              ? "bg-black/60 opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              editSuccessVisible
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
              Course Updated Successfully!
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              The course details have been saved.
            </p>
            <button
              onClick={() => {
                setEditSuccessVisible(false);
                setTimeout(() => setShowEditSuccess(false), 250);
              }}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Archive/Publish Confirmation Modal */}
      {actionModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            actionVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              actionVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                  <Archive className="w-7 h-7 text-amber-500" />
                </div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {actionModal.type === "unpublish"
                ? "Archive this Course?"
                : "Publish this Course?"}
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              {actionModal.type === "unpublish"
                ? "This course will be archived and hidden from learners."
                : "This course will be published and visible to learners."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeActionModal}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 transition"
              >
                {actionModal.type === "unpublish" ? "Archive" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive/Publish Success Modal */}
      {successModal && (
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
              {successModal.type === "unpublish"
                ? "Course Archived!"
                : "Course Published!"}
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              {successModal.type === "unpublish"
                ? "The course has been successfully archived."
                : "The course is now live and visible to learners."}
            </p>
            <button
              onClick={closeSuccessModal}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {/* Duplicate Confirmation Modal */}
      {duplicateModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            duplicateVisible
              ? "bg-black/60 opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              duplicateVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Copy className="w-7 h-7 text-emerald-500" />
                </div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Duplicate Course?
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Course <b className="text-gray-600">{duplicateModal.name}</b> akan
              diduplikasi beserta seluruh kontennya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDuplicateModal}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/subchapters/${duplicateModal.courseId}/duplicate`,
                      {},
                      { withCredentials: true },
                    );
                    toast.success("Course berhasil diduplikasi");
                    closeDuplicateModal();
                    await fetchCoursesData();
                    onCourseUpdated?.();
                  } catch (err: any) {
                    console.error(err);
                    toast.error(
                      err?.response?.data?.message || "Gagal duplicate course",
                    );
                  }
                }}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            deleteVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              deleteVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Hapus Sub-chapter?
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Data yang dihapus tidak dapat dikembalikan. Semua konten di
              dalamnya juga akan ikut terhapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
