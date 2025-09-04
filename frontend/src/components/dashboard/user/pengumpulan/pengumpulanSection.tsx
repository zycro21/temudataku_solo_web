"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import PengumpulanBelumModal from "./pengumpulanBelumModal";
import PengumpulanSelesaiModal from "./pengumpulanSelesaiModal";
import PengumpulanSudahModal from "./pengumpulanSudahModal";

interface Project {
  id: string;
  title: string;
  description: string;
  program: string;
  periode: string;
  image: string;
  status: string; // Belum Dikumpulkan, Selesai, Sudah Direview
  detailLink?: string; // link ke drive / detail project
}

interface PengumpulanSectionProps {
  title: string;
  projects: Project[];
}

export default function PengumpulanSection({
  title,
  projects,
}: PengumpulanSectionProps) {
  const [openBelum, setOpenBelum] = useState<string | null>(null);

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>

      {projects.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada project.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-0 overflow-hidden flex flex-col justify-between"
            >
              {/* Gambar */}
              <div className="relative w-full h-56">
                <Image
                  src={
                    project.image && project.image.trim() !== ""
                      ? project.image
                      : "/assets/dashboard/user/kokok.png"
                  }
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Konten */}
              <CardContent className="py-4 flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
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
              </CardContent>

              {/* Footer */}
              <CardFooter className="flex flex-col items-start gap-4 pb-4 mt-auto">
                <div className="flex items-center text-sm gap-2">
                  <Calendar className="w-4 h-4 text-gray-800" />
                  <span className="text-black">{project.periode}</span>
                </div>

                {project.status === "Belum Dikumpulkan" && (
                  <PengumpulanBelumModal
                    open={openBelum === project.id}
                    setOpen={(val) => setOpenBelum(val ? project.id : null)}
                    withTrigger={true} // default, bisa dihapus juga
                  />
                )}

                {project.status === "Selesai" && (
                  <PengumpulanSelesaiModal
                    bootcampTitle={project.program}
                    schedule={project.periode}
                    projectTitle={project.title}
                    fileName="Prediction.pdf"
                    fileSize="200 KB"
                    fileUrl="/uploads/prediction.pdf"
                    url={project.detailLink}
                  />
                )}

                {project.status === "Sudah Direview" && (
                  <PengumpulanSudahModal
                    open={openBelum === project.id}
                    setOpen={(val) => setOpenBelum(val ? project.id : null)}
                    bootcampTitle={project.program}
                    schedule={project.periode}
                    projectTitle={project.title}
                  />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
