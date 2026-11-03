"use client";

import {
  Download,
  Image as ImageIcon,
  Layers,
  PlusCircle,
  Type,
  Video,
  type LucideIcon,
} from "lucide-react";

interface Props {
  onAddQuestion: () => void;
  onAddTitle: () => void;
  onAddImage: () => void;
  onAddVideo: () => void;
  onAddSection: () => void;
  onImport: () => void;
}

interface Entry {
  key: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  onClick: () => void;
}

export default function ElementPalette({
  onAddQuestion,
  onAddTitle,
  onAddImage,
  onAddVideo,
  onAddSection,
  onImport,
}: Props) {
  const entries: Entry[] = [
    {
      key: "question",
      title: "Add Question",
      desc: "Tambah pertanyaan baru",
      Icon: PlusCircle,
      onClick: onAddQuestion,
    },
    {
      key: "title",
      title: "Title & Description",
      desc: "Tambahkan judul atau deskripsi",
      Icon: Type,
      onClick: onAddTitle,
    },
    {
      key: "image",
      title: "Gambar",
      desc: "Unggah gambar",
      Icon: ImageIcon,
      onClick: onAddImage,
    },
    {
      key: "video",
      title: "Video",
      desc: "Tambahkan video",
      Icon: Video,
      onClick: onAddVideo,
    },
    {
      key: "section",
      title: "Section",
      desc: "Pisahkan form ke beberapa bagian",
      Icon: Layers,
      onClick: onAddSection,
    },
    {
      key: "import",
      title: "Import Question",
      desc: "Ambil pertanyaan dari form lain",
      Icon: Download,
      onClick: onImport,
    },
  ];

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4 xl:sticky xl:top-4 xl:self-start">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        Tambah Elemen
      </h2>
      <div className="space-y-2">
        {entries.map(({ key, title, desc, Icon, onClick }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-gray-900">
                {title}
              </span>
              <span className="block text-xs text-gray-500">{desc}</span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
