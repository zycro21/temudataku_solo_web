"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  Search,
  Clock,
  Database,
  ChevronDown,
  ChevronUp,
  SearchX,
} from "lucide-react";
import { practices } from "@/data/practice";

// Practice utama
export interface Practice {
  id: number;
  tipe: string;
  title: string;
  image: string;
  deskripsi: string;
  level: string;
  keywords: string[];

  jumlahSubChapter: number;
  jumlahModul: number;

  rating: number;
  JumlahPerating: string;
  jumlahPembeli: string;

  subChapters: SubChapter[];
  // progressSummary?: PracticeProgressSummary;
}

// Subchapter / kelas
export interface SubChapter {
  id: number;
  coverImage: string;
  title: string;
  description: string;

  taskType: TaskType;

  modules: Module[];

  progressPercent: number; // 0 - 100
  lastActivityAt: string | null; // ISO date
  certificateTemplateLink?: string;
}

// Jenis tugas di kelas
export type TaskType = "quiz" | "project" | "quiz_and_project";

// Modul kecil di dalam subchapter
export interface Module {
  id: number;
  title: string;
  estimatedMinutes: number;
  completed?: boolean;

  subModules?: SubModule[];
  quiz?: Quiz; // max 1
  assignment?: Assignment; // max 1
}

// Summary progress untuk practice
// export interface PracticeProgressSummary {
//   completedSubChapters: number; // kelas selesai 100%
//   totalSubChapters: number;
// }

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  totalQuestions: number;
  timeLimitMinutes: number;

  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  textQuestion: string;
  options: string[];
  correctAnswers: string[];
  explanation?: string;
  orderNumber: number;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDays: number; // deadline dalam hari

  instruction?: string[];
  supportingFiles?: SupportingFile[];
}

export interface SupportingFile {
  id: number;
  name: string;
  type: "dataset" | "template" | "reference";
  url: string;
  pageCount?: number; // jumlah halaman
  format?: string; // PDF, CSV, IPYNB
  sizeKB?: number; // ukuran dalam KB
}

// Sub module (anak dari module)
export interface SubModule {
  id: number;
  title: string;
  progress?: number; // 0 - 100
  blocks?: ContentBlock[];
}

// Block utama (biasanya text / paragraf)
export interface ContentBlock {
  id: string;
  contents: BlockContent[];
  orderNumber?: number;
  progress?: number; // 0 - 100
  additionalContents?: AdditionalContent[];
}

export type BlockContent =
  | HeadingContent
  | ParagraphContent
  | AccordionContent
  | CarouselContent
  | ContentCardContent
  | TabNavigationContent
  | HighlightContent
  | SummaryContent;

export interface BaseContent {
  id: string;
  orderNumber?: number;
}

export interface HeadingContent extends BaseContent {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphContent extends BaseContent {
  type: "paragraph";
  text: string;
}

export interface HighlightContent extends BaseContent {
  type: "highlight";
  text: string; // max 100 char
}

export interface AccordionContent extends BaseContent {
  type: "accordion";
  title: string;
  description?: string;

  items: {
    title: string; // max 40
    content: string; // max 200
  }[];
}

export interface CarouselContent extends BaseContent {
  type: "carousel";
  title: string;
  description?: string;
  cardsPerSlide?: number;

  items: {
    title: string; // max 60
    image?: string;
    content?: string; // max 160
  }[];
}

export interface ContentCardContent extends BaseContent {
  type: "content_card";
  title: string;
  description?: string;
  disableExpandableContent: boolean;

  items: {
    title: string; // max 60
    content: string; // max 100
    expandableContent?: string; // max 200 (only if disableExpandableContent = false)
  }[];
}

export interface TabNavigationContent extends BaseContent {
  type: "tab_navigation";
  title: string;
  description?: string;

  tabs: {
    title: string; // max 30
    content: string; // max 200
  }[];
}

export interface SummaryContent extends BaseContent {
  type: "summary";
  comments: string[]; // setiap enter = push ke array
}

// Jenis konten tambahan
export type AdditionalContentType =
  | "image_video"
  | "multiple_choice"
  | "matching"
  | "interactive_code";

export interface AdditionalContent {
  id: string;
  type: AdditionalContentType;
  orderNumber?: number;
  position?: "before" | "after" | "inline";

  content:
    | ImageVideoContent
    | MultipleChoiceContent
    | MatchingContent
    | InteractiveCodeContent;
}

export interface ImageVideoContent {
  id: string;
  url: string;
  caption?: string;
}

export interface MultipleChoiceContent {
  id: string;
  question: string;
  description?: string;

  options: {
    id: string;
    text: string;
  }[];

  correctAnswers: string[]; // bisa 1 atau lebih
  explanation?: string;
}

export interface MatchingContent {
  id: string;
  question: string;
  description?: string;

  leftItems: {
    id: string;
    text: string;
  }[];

  rightItems: {
    id: string;
    text: string;
  }[];

  correctPairs: {
    leftId: string;
    rightId: string;
  }[];

  explanation?: string;
}

export interface InteractiveCodeContent {
  id: string;
  language: string;
  initialCode: string;
  expectedResult: string;
}

export default function ElearningSelection() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Semua");

  const categories = ["Semua", "Data", "Machine Learning", "Programming"];
  const categoryToTypeMap: Record<string, string | null> = {
    Semua: null,
    Data: "data",
    "Machine Learning": "machine learning",
    Programming: "programming",
  };
  const levels = ["Semua", "Pemula", "Menengah", "Lanjutan"];

  const filteredPractices = practices.filter((practice) => {
    // category
    const matchCategory =
      selectedCategory === "Semua" ||
      practice.tipe === categoryToTypeMap[selectedCategory];

    // level
    const matchLevel =
      selectedLevel === "Semua" || practice.level === selectedLevel;

    // search title
    const matchSearch = practice.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    return matchCategory && matchLevel && matchSearch;
  });

  const INITIAL_COUNT = 6;
  const EXPANDED_COUNT = 15;

  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const totalPractices = filteredPractices.length;
  const visiblePractices = filteredPractices.slice(0, visibleCount);

  const isExpanded = visibleCount > INITIAL_COUNT;
  const canExpand = totalPractices > INITIAL_COUNT;
  const canShowFull =
    visibleCount >= EXPANDED_COUNT && totalPractices > EXPANDED_COUNT;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(INITIAL_COUNT);
  };

  const estimateDuration = (totalModule: number) => {
    if (totalModule <= 0) return "0 jam";

    const minHours = (totalModule * 15) / 60;
    const maxHours = (totalModule * 20) / 60;

    const format = (val: number) => (val >= 1 ? val.toFixed(1) : "<1");

    const cappedMax = Math.min(maxHours, 200);

    return `${format(minHours)} – ${format(cappedMax)} jam`;
  };

  const renderStars = (rating: number) => {
    const safeRating = Math.max(0, Math.min(5, rating));

    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;

      const fillPercentage =
        safeRating >= starValue
          ? 100
          : safeRating > starValue - 1
            ? (safeRating - (starValue - 1)) * 100
            : 0;

      return (
        <div key={index} className="relative w-4 h-4">
          {/* Star base (gray) */}
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute inset-0 text-gray-300"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.049 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
          </svg>

          {/* Star fill (yellow) */}
          <div
            className="absolute inset-0 overflow-hidden text-amber-400"
            style={{ width: `${fillPercentage}%` }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.049 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
            </svg>
          </div>
        </div>
      );
    });
  };

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Kuasai Skill dengan E-Learning Praktis
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Dari nol sampai expert, e-learning ini siap temenin langkah
            belajarmu. Tinggal pilih modul, terus jalanin!
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-6">
          {/* Search Bar and Level Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar - Full width */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(INITIAL_COUNT); // reset pagination
                  }}
                  placeholder="Cari E-learning-mu di sini"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>

            {/* Level Filter Dropdown */}
            <div className="md:w-48">
              <Select
                value={selectedLevel}
                onValueChange={(value) => {
                  setSelectedLevel(value);
                  setVisibleCount(INITIAL_COUNT); // reset pagination
                }}
              >
                <SelectTrigger className="w-full !h-full px-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 bg-white">
                  <SelectValue placeholder="Pilih Level" />
                </SelectTrigger>

                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Filter - Left aligned */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <Button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  variant={isActive ? "default" : "outline"}
                  className={`px-6 py-2 rounded-md ${
                    isActive
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {category}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Practice Cards Grid / Empty State */}
        {totalPractices === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {/* Icon */}
            <SearchX className="w-16 h-16 text-gray-400 mb-4" />

            {/* Text */}
            <h3 className="text-lg font-semibold text-gray-700">
              Data tidak ditemukan
            </h3>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Coba ubah kata pencarian atau filter level dan kategori yang kamu
              pilih
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePractices.map((practice) => (
              <Link
                key={practice.id}
                href={`/elearning/${practice.id}`}
                className="block"
              >
                <Card className="group rounded-xl border border-gray-200 hover:shadow-lg transition-all p-0 cursor-pointer hover:-translate-y-1 duration-300">
                  {/* Image Section */}
                  <div className="relative px-2 pt-2">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={practice.image}
                        alt={practice.title}
                        width={381}
                        height={285}
                        className="w-full h-[240px] object-cover"
                      />

                      {/* Level Badge */}
                      <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                        {practice.level}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5 pt-0">
                    {/* Title */}
                    <h3 className="text-[1.375rem] leading-snug font-bold text-gray-900 mb-2 line-clamp-1 transition-colors group-hover:text-emerald-600">
                      {practice.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-5 line-clamp-2">
                      {practice.deskripsi}
                    </p>

                    {/* Class & Module Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                      {/* Kelas */}
                      <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                        <Image
                          src="/assets/elearning/class.svg"
                          alt="Kelas"
                          width={12}
                          height={12}
                        />
                        <span className="font-medium">
                          {practice.jumlahSubChapter} Kelas
                        </span>
                      </div>

                      {/* Modul */}
                      <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                        <Image
                          src="/assets/elearning/module.svg"
                          alt="Modul"
                          width={12}
                          height={12}
                        />
                        <span className="font-medium">
                          {practice.jumlahModul} Modul
                        </span>

                        {/* Estimasi waktu */}
                        <span className="ml-2 text-xs text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
                          ~ {estimateDuration(practice.jumlahModul)}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {renderStars(practice.rating)}
                        </div>

                        <span className="text-gray-700 font-medium">
                          {practice.rating.toFixed(1)}
                        </span>

                        <span className="text-gray-500">
                          ({practice.JumlahPerating})
                        </span>
                      </div>

                      {/* Students */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Image
                          src="/assets/elearning/peserta.svg"
                          alt="Peserta"
                          width={14}
                          height={14}
                        />
                        <span className="font-medium text-gray-400">
                          {practice.jumlahPembeli}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {canExpand && (
          <div className="flex justify-center mt-10 gap-4 flex-wrap">
            {/* Toggle Less / More */}
            {!isExpanded && (
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                onClick={() =>
                  setVisibleCount(Math.min(EXPANDED_COUNT, totalPractices))
                }
              >
                Lihat Lebih Banyak
                <ChevronDown className="w-4 h-4 transition-all duration-200" />
              </Button>
            )}

            {isExpanded && (
              <Button
                variant="ghost"
                className="
      px-6 py-2
      bg-gray-100 hover:bg-gray-200
      text-gray-700 hover:text-gray-900
      border border-gray-200
      rounded-xl
      flex items-center gap-2
      transition-all
    "
                onClick={() => setVisibleCount(INITIAL_COUNT)}
              >
                <ChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                Tampilkan Lebih Sedikit
              </Button>
            )}

            {/* Full Page */}
            {canShowFull && (
              <Link href="/elearningfull">
                <Button className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                  Lihat Lebih Lengkap
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
