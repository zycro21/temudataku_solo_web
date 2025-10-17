"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import PengumpulanBelumModal from "./pengumpulanBelumModal";
import PengumpulanSelesaiModal from "./pengumpulanSelesaiModal";
import PengumpulanSudahModal from "./pengumpulanSudahModal";
import PengumpulanRevisiModal from "./pengumpulanRevisiModal";

interface Submission {
  id: string;
  title: string;
  filePaths: string[];
  projectLink?: string | null;
  submissionDate: string;
  fileDetails?: {
    filePath: string;
    size: string;
  }[];

  // properti untuk hasil review
  briefScore?: string;
  technicalScore?: string;
  creativityScore?: string;
  completenessScore?: string;
  mentorFeedback?: string;
  mentorSuggestion?: string;
  isRevisedRequired?: boolean;
  revisionDeadline?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  program: string;
  periode: string;
  image: string;
  status: string;
  detailLink?: string;
  submissions?: Submission[];
}

interface PengumpulanWrapperProps {
  projects: Project[];
}

export default function PengumpulanWrapper({
  projects,
}: PengumpulanWrapperProps) {
  const [openBelum, setOpenBelum] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (id: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!projects || projects.length === 0) {
    return <p className="text-gray-500 text-sm">Belum ada project.</p>;
  }

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Daftar Project Kamu
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const isExpanded = expandedProjects[project.id] || false;
          const showLoadMore = project.description.length > 180; // kira-kira 3 baris

          return (
            <Card
              key={project.id}
              className="p-0 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative w-full h-56">
                <Image
                  src={
                    project.image?.trim()
                      ? project.image
                      : "/assets/dashboard/user/kokok.png"
                  }
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>

              <CardContent className="py-4 flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {project.title}
                </h3>

                <p
                  className={`text-sm text-gray-600 mt-2 ${
                    !isExpanded ? "line-clamp-3" : ""
                  }`}
                >
                  {project.description}
                  {project.detailLink && (
                    <Link
                      href={project.detailLink}
                      target="_blank"
                      className="text-emerald-600 font-semibold hover:underline hover:text-emerald-700 cursor-pointer ml-1"
                    >
                      Detail Project
                    </Link>
                  )}
                </p>

                {showLoadMore && (
                  <button
                    onClick={() => toggleExpand(project.id)}
                    className="text-sm text-emerald-600 hover:underline mt-1"
                  >
                    {isExpanded ? "Lebih Sedikit" : "Selengkapnya"}
                  </button>
                )}
              </CardContent>

              <CardFooter className="flex flex-col items-start gap-4 pb-4 mt-auto">
                <div className="flex items-center text-sm gap-2">
                  <Calendar className="w-4 h-4 text-gray-800" />
                  <span className="text-black">{project.periode}</span>
                </div>

                {project.status === "Belum Dikumpulkan" && (
                  <PengumpulanBelumModal
                    open={openBelum === project.id}
                    setOpen={(val) => setOpenBelum(val ? project.id : null)}
                    withTrigger={true}
                    projectId={project.id}
                  />
                )}

                {project.status === "Sudah Dikumpulkan" &&
                  (() => {
                    const submissions = project.submissions ?? []; // pastikan tidak undefined
                    if (submissions.length === 0) return null;

                    const first = submissions[0];

                    return (
                      <PengumpulanSelesaiModal
                        projectId={first.id}
                        bootcampTitle={project.title}
                        schedule={project.periode}
                        projectTitle={first.title}
                        fileName={
                          first.filePaths?.length > 0
                            ? first.filePaths[0].split("/").pop()
                            : undefined
                        }
                        fileSize={
                          first.fileDetails && first.fileDetails.length > 0
                            ? first.fileDetails[0].size
                            : "-"
                        }
                        fileUrl={
                          first.filePaths?.length > 0
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${first.filePaths[0]}`
                            : undefined
                        }
                        url={first.projectLink || ""}
                        withTrigger={true}
                      />
                    );
                  })()}

                {project.status === "Sudah Direview" &&
                  (() => {
                    const first = project.submissions?.[0];
                    if (!first) return null;

                    return (
                      <PengumpulanSudahModal
                        open={openBelum === project.id}
                        setOpen={(val) => setOpenBelum(val ? project.id : null)}
                        bootcampTitle={project.program}
                        schedule={project.periode}
                        projectTitle={project.title}
                        reviewData={{
                          briefScore: first.briefScore,
                          technicalScore: first.technicalScore,
                          creativityScore: first.creativityScore,
                          completenessScore: first.completenessScore,
                          mentorFeedback: first.mentorFeedback,
                          mentorSuggestion: first.mentorSuggestion,
                          isRevisedRequired: first.isRevisedRequired,
                        }}
                      />
                    );
                  })()}

                {project.status === "Perlu Revisi" &&
                  (() => {
                    const first = project.submissions?.[0];
                    if (!first) return null;

                    return (
                      <PengumpulanRevisiModal
                        submissionId={first.id}
                        bootcampTitle={project.title}
                        schedule={project.periode}
                        projectTitle={project.title}
                        reviewData={{
                          briefScore: first.briefScore,
                          technicalScore: first.technicalScore,
                          creativityScore: first.creativityScore,
                          completenessScore: first.completenessScore,
                          mentorFeedback: first.mentorFeedback,
                          mentorSuggestion: first.mentorSuggestion,
                          isRevisedRequired: first.isRevisedRequired,
                          revisionDeadline: first.revisionDeadline,
                        }}
                        withTrigger={true}
                      />
                    );
                  })()}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
