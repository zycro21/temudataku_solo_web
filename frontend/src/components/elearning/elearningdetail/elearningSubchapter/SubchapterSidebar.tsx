"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  practice: any;
  subChapterId: string;
  activeModuleId?: string | number;
  activeSubModuleId?: number;
  navigationSource?: "manual" | "footer";

  activeTaskType?: "quiz" | "assignment" | null; // ⬅️ TAMBAH INI

  onSelectSubModule?: (sm: any) => void;
  onSelectTask?: (task: { type: "quiz" | "assignment"; data: any }) => void;
}

export default function ModuleSidebar({
  practice,
  subChapterId,
  activeModuleId,
  activeSubModuleId,
  navigationSource,
  activeTaskType,
  onSelectSubModule,
  onSelectTask,
}: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const subChapter = practice?.subChapters?.find(
    (sc: any) => String(sc.id) === String(subChapterId),
  );

  useEffect(() => {
    if (navigationSource !== "footer" || !activeSubModuleId || !subChapter)
      return;

    const activeModule = subChapter.modules.find((m: any) =>
      m.subModules?.some((sm: any) => sm.id === activeSubModuleId),
    );

    if (!activeModule) return;

    setOpenModules({
      [activeModule.id]: true,
    });
  }, [activeSubModuleId, navigationSource, subChapter]);

  const timeAgo = (dateString?: string) => {
    if (!dateString) return "-";

    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes} menit lalu`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;

    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  if (!subChapter) return null;

  const progressPercent = subChapter.progressPercent ?? 0;
  const lastAccessed = timeAgo(subChapter.lastActivityAt);
  const isCertificateUnlocked =
    progressPercent === 100 && !!subChapter.certificateTemplateLink;

  const filteredModules = useMemo(() => {
    if (!keyword) return subChapter.modules;
    const key = keyword.toLowerCase();

    return subChapter.modules.filter(
      (m: any) =>
        m.title.toLowerCase().includes(key) ||
        m.subModules.some((sm: any) => sm.title.toLowerCase().includes(key)),
    );
  }, [keyword, subChapter]);

  /* ================= TASKS (QUIZ & ASSIGNMENT) ================= */

  const tasks = useMemo(() => {
    if (!subChapter.modules?.length) return [];

    const lastModule = subChapter.modules[subChapter.modules.length - 1];
    if (!lastModule) return [];

    const result: any[] = [];

    if (lastModule.quiz) {
      result.push({
        type: "quiz",
        label: "Penilaian Quiz",
        title: lastModule.quiz.title,
        icon: "/assets/elearning/penilaian.svg",
        data: lastModule.quiz,
      });
    }

    if (lastModule.assignment) {
      result.push({
        type: "assignment",
        label: "Penilaian Proyek",
        title: lastModule.assignment.title,
        icon: "/assets/elearning/penilaian.svg",
        data: lastModule.assignment,
      });
    }

    return result;
  }, [subChapter]);

  return (
    <aside
      className="w-[270px] sticky top-0 bg-white border-r hidden lg:flex flex-col"
      style={{ height: "calc(100vh - 60px)" }}
    >
      {/* HEADER */}
      <div className="p-5 border-b">
        <button
          onClick={() => router.push(`/elearning/${practice.id}`)}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer transition-colors mb-6"
        >
          <Image
            src="/assets/elearning/arrowback.svg"
            alt="back"
            width={8}
            height={8}
          />
          Kembali
        </button>

        <h2 className="text-[24px] font-bold text-gray-900 mb-5 text-left">
          {subChapter.title}
        </h2>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-bold text-gray-600">
            <span>Progress: {progressPercent}%</span>
            <span>Terakhir diakses: {lastAccessed}</span>
          </div>

          <div className="h-2 w-full bg-gray-100 rounded-full">
            <div
              className="h-2 bg-emerald-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="relative mt-8">
          <Image
            src="/assets/elearning/search.svg"
            alt="search"
            width={14}
            height={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
          />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 text-sm pb-10">
        {filteredModules.map((module: any) => {
          const isOpen =
            openModules[module.id] ??
            String(module.id) === String(activeModuleId);

          const isModuleDone = module.subModules.every(
            (sm: any) => sm.progress === 100,
          );

          return (
            <div key={module.id} className="space-y-2">
              <button
                onClick={() =>
                  setOpenModules((p) => ({
                    ...p,
                    [module.id]: !isOpen,
                  }))
                }
                className="flex items-center justify-between w-full px-2 py-1 rounded-md text-left
                cursor-pointer transition hover:bg-gray-100"
              >
                <div className="flex items-center gap-3 text-[12px] text-black">
                  <Image
                    src="/assets/elearning/arrowup.svg"
                    alt="toggle"
                    width={10}
                    height={10}
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                  {module.title}
                </div>

                {isModuleDone && (
                  <Image
                    src="/assets/elearning/ceklismodule.svg"
                    alt="done"
                    width={14}
                    height={14}
                  />
                )}
              </button>

              {isOpen && (
                <ul className="pl-6 space-y-2">
                  {module.subModules.map((sm: any) => {
                    const isActive =
                      !activeTaskType &&
                      String(sm.id) === String(activeSubModuleId);

                    return (
                      <li
                        key={sm.id}
                        onClick={() => onSelectSubModule?.(sm)}
                        className={`flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer transition
${
  isActive
    ? "bg-emerald-500 text-white font-bold py-2"
    : "text-gray-900 hover:text-gray-600 hover:bg-gray-100"
}`}
                      >
                        <div className="flex items-center justify-center w-[14px] h-[14px]">
                          <Image
                            src={
                              sm.progress === 100
                                ? "/assets/elearning/ceklismodule.svg"
                                : "/assets/elearning/submodule-unfinished.svg"
                            }
                            alt="status"
                            width={10}
                            height={10}
                            className={isActive ? "brightness-0 invert" : ""}
                          />
                        </div>

                        <span className="text-[10px] leading-relaxed text-left">
                          {sm.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {/* PENILAIAN */}
        {tasks.map((task) => {
          const isTaskActive = activeTaskType === task.type;

          return (
            <button
              key={task.type}
              onClick={() =>
                onSelectTask?.({
                  type: task.type,
                  data: task.data,
                })
              }
              className={`w-full text-left rounded-lg px-3 py-3 transition cursor-pointer
        ${
          isTaskActive
            ? "bg-emerald-500 text-white"
            : "hover:bg-gray-100 text-gray-800"
        }`}
            >
              {/* LABEL */}
              <div
                className={`flex items-center gap-2 text-[11px] font-semibold uppercase
          ${isTaskActive ? "text-white" : "text-gray-500"}`}
              >
                <Image
                  src={task.icon}
                  alt={task.type}
                  width={14}
                  height={14}
                  className={isTaskActive ? "brightness-0 invert" : ""}
                />
                <span>{task.label}</span>
              </div>

              {/* TITLE */}
              <div className="pl-[22px] mt-1 text-sm font-semibold">
                {task.title}
              </div>
            </button>
          );
        })}

        {/* CERTIFICATE */}
        <div className="pt-4 mb-2">
          <button
            disabled={!isCertificateUnlocked}
            onClick={() => {
              if (!isCertificateUnlocked) return;

              const linkUrl = subChapter.certificateTemplateLink!;

              // ===== PILIH SALAH SATU MODE =====

              // 🔹 MODE 1: BUKA LINK (redirect ke certificateTemplateLink)
              window.open(linkUrl, "_blank");

              // 🔹 MODE 2: DOWNLOAD LANGSUNG
              // const link = document.createElement("a");
              // link.href = linkUrl;
              // link.download = `${subChapter.title}-certificate.pdf`;
              // link.target = "_blank";
              // link.click();
            }}
            className={`flex items-center gap-2 pl-2 text-sm font-medium transition
      ${
        isCertificateUnlocked
          ? "cursor-pointer hover:text-emerald-600 hover:underline text-gray-800"
          : "cursor-not-allowed text-gray-400"
      }`}
            title={
              !isCertificateUnlocked
                ? "Selesaikan semua materi untuk membuka sertifikat"
                : "Unduh Sertifikat"
            }
          >
            <Image
              src="/assets/elearning/unduhsertifikat.svg"
              alt="certificate"
              width={14}
              height={14}
              className={!isCertificateUnlocked ? "opacity-40" : ""}
            />
            Unduh Sertifikat
          </button>
        </div>
      </div>
    </aside>
  );
}
