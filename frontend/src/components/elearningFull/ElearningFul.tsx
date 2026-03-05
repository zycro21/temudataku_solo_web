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
  progressSummary: PracticeProgressSummary;
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
}

// Jenis tugas di kelas
export type TaskType = "quiz" | "project" | "quiz_and_project";

// Modul kecil di dalam subchapter
export interface Module {
  id: number;
  title: string;
  estimatedMinutes: number; // estimasi pengerjaan
  completed: boolean;
}

// Summary progress untuk practice
export interface PracticeProgressSummary {
  completedSubChapters: number; // kelas selesai 100%
  totalSubChapters: number;
}

export default function ElearningSelection() {
  const practices = [
    {
      id: 1,
      tipe: "data",
      title: "Data Science Fundamental",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      deskripsi:
        "Pengenalan data science mulai dari konsep dasar, alur kerja, hingga pemahaman data untuk pemula",
      level: "Pemula",
      keywords: [
        "data science",
        "data analyst",
        "data processing",
        "python",
        "statistik dasar",
        "pemula",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 18,
      rating: 4.6,
      JumlahPerating: "98 ulasan",
      jumlahPembeli: "980 peserta",
      subChapters: [
        {
          id: 1,
          coverImage:
            "https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=400&h=200",
          title: "Introduction to Data Science",
          description:
            "Pengantar data science, peran data scientist, dan contoh penerapannya di dunia nyata.",
          taskType: "quiz",
          modules: [
            {
              id: 1,
              title: "What is Data Science?",
              estimatedMinutes: 15,
              completed: true,
            },
            {
              id: 2,
              title: "Data Scientist Role & Skills",
              estimatedMinutes: 20,
              completed: true,
            },
            {
              id: 3,
              title: "Data Science Use Cases",
              estimatedMinutes: 25,
              completed: true,
            },
          ],
          progressPercent: 100,
          lastActivityAt: "2026-01-08T10:20:00Z",
        },
        {
          id: 2,
          coverImage:
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200",
          title: "Data Types & Data Collection",
          description:
            "Memahami jenis-jenis data dan cara pengumpulan data yang umum digunakan.",
          taskType: "quiz",
          modules: [
            {
              id: 4,
              title: "Structured vs Unstructured Data",
              estimatedMinutes: 20,
              completed: true,
            },
            {
              id: 5,
              title: "Data Sources",
              estimatedMinutes: 20,
              completed: true,
            },
            {
              id: 6,
              title: "Data Collection Methods",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 7,
              title: "Case Study: Data Collection",
              estimatedMinutes: 30,
              completed: false,
            },
          ],
          progressPercent: 50,
          lastActivityAt: "2026-01-15T09:40:00Z",
        },
        {
          id: 3,
          coverImage:
            "https://images.unsplash.com/photo-1581091870627-3c1b79c5d2c9?w=400&h=200",
          title: "Data Cleaning & Preparation",
          description:
            "Tahapan penting dalam membersihkan dan menyiapkan data sebelum analisis.",
          taskType: "quiz_and_project",
          modules: [
            {
              id: 8,
              title: "Handling Missing Values",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 9,
              title: "Data Formatting",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 10,
              title: "Outlier Detection",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 11,
              title: "Mini Project: Clean Dataset",
              estimatedMinutes: 40,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 4,
          coverImage:
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200",
          title: "Data Analysis Basics",
          description:
            "Dasar-dasar analisis data untuk menemukan insight awal dari dataset.",

          taskType: "project",

          modules: [
            {
              id: 12,
              title: "Exploratory Data Analysis",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 13,
              title: "Data Visualization Basics",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 14,
              title: "Simple Statistical Analysis",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 15,
              title: "Final Project: Analyze Dataset",
              estimatedMinutes: 45,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 2,
      tipe: "machine learning",
      title: "Mathematics for Machine Learning - Beginner",
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
      deskripsi:
        "Belajar matematika dasar yang dibutuhkan untuk machine learning seperti aljabar, statistik, dan probabilitas",
      level: "Pemula",
      keywords: [
        "matematika",
        "linear algebra",
        "statistika",
        "probabilitas",
        "kalkulus",
        "gradient descent",
        "dasar ml",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 12,
      rating: 4.8,
      JumlahPerating: "150 ulasan",
      jumlahPembeli: "1.430 peserta",
      subChapters: [
        {
          id: 5,
          coverImage:
            "https://images.unsplash.com/photo-1509228463558-399364a71109?w=400&h=200",
          title: "Linear Algebra Foundations",
          description:
            "Memahami konsep vektor dan matriks sebagai fondasi representasi data di ML.",
          taskType: "quiz",
          modules: [
            {
              id: 16,
              title: "Introduction to Vectors",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 17,
              title: "Matrix Operations and Properties",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 18,
              title: "Dot Product and Matrix Multiplication",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 6,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Descriptive Statistics",
          description:
            "Mempelajari cara meringkas dan mendeskripsikan data menggunakan statistik dasar.",
          taskType: "quiz",
          modules: [
            {
              id: 19,
              title: "Mean, Median, and Mode",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 20,
              title: "Variance and Standard Deviation",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 21,
              title: "Data Distributions and Outliers",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 7,
          coverImage:
            "https://images.unsplash.com/photo-1454165833767-027ffea70c1e?w=400&h=200",
          title: "Probability Theory",
          description:
            "Konsep peluang dan bagaimana mesin menangani ketidakpastian dalam data.",
          taskType: "quiz",
          modules: [
            {
              id: 22,
              title: "Basic Probability Rules",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 23,
              title: "Conditional Probability",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 24,
              title: "Introduction to Bayes' Theorem",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 8,
          coverImage:
            "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&h=200",
          title: "Calculus for Optimization",
          description:
            "Mengenal turunan yang digunakan untuk melatih algoritma machine learning.",
          taskType: "project",
          modules: [
            {
              id: 25,
              title: "Introduction to Derivatives",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 26,
              title: "The Role of Gradient in ML",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 27,
              title: "Mini Project: Optimization with Gradient Descent",
              estimatedMinutes: 45,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 3,
      tipe: "machine learning",
      title: "AI for Productivity",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
      deskripsi:
        "Mengoptimalkan pekerjaan harian dengan bantuan AI untuk riset, penulisan, dan manajemen waktu",
      level: "Pemula",
      keywords: [
        "produktivitas",
        "generative ai",
        "chatgpt",
        "prompt engineering",
        "automation",
        "time management",
        "content creation",
      ],
      jumlahSubChapter: 4, // Disesuaikan agar tidak terlalu panjang
      jumlahModul: 10, // Total modul di bawah ini
      rating: 4.5,
      JumlahPerating: "210 ulasan",
      jumlahPembeli: "2.100 peserta",
      subChapters: [
        {
          id: 9,
          coverImage:
            "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=200",
          title: "AI for Writing & Content",
          description:
            "Menggunakan AI untuk mempercepat proses penulisan draf, email, dan artikel.",
          taskType: "quiz",
          modules: [
            {
              id: 28,
              title: "Introduction to LLMs for Writing",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 29,
              title: "Effective Prompting for Drafts",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 30,
              title: "Editing and Fact-Checking AI Output",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 10,
          coverImage:
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200",
          title: "AI for Research & Synthesis",
          description:
            "Teknik merangkum dokumen panjang dan melakukan riset cepat dengan AI.",
          taskType: "quiz",
          modules: [
            {
              id: 31,
              title: "Summarizing Long Documents",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 32,
              title: "AI-Powered Search Engines",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 33,
              title: "Data Extraction with AI Tools",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 11,
          coverImage:
            "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=200",
          title: "Time Management & Automation",
          description:
            "Otomasi jadwal dan pengelolaan tugas harian menggunakan asisten AI.",
          taskType: "quiz",
          modules: [
            {
              id: 34,
              title: "AI for Meeting Transcription",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 35,
              title: "Automating Daily To-Do Lists",
              estimatedMinutes: 15,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 12,
          coverImage:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200",
          title: "Final Project: AI Workflow",
          description:
            "Membangun sistem alur kerja produktivitas pribadi yang terintegrasi AI.",
          taskType: "project",
          modules: [
            {
              id: 36,
              title: "Designing Your AI Workflow",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 37,
              title: "Final Project Submission",
              estimatedMinutes: 45,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 4,
      tipe: "programming",
      title: "Programming Language",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop",
      deskripsi:
        "Dasar-dasar pemrograman untuk membangun logika berpikir dan memahami berbagai bahasa pemrograman",
      level: "Pemula",
      keywords: [
        "coding dasar",
        "logika pemrograman",
        "computational thinking",
        "variabel",
        "control flow",
        "algoritma pemula",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 10,
      rating: 4.4,
      JumlahPerating: "87 ulasan",
      jumlahPembeli: "760 peserta",
      subChapters: [
        {
          id: 13,
          coverImage:
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=200",
          title: "Building Blocks of Code",
          description:
            "Mengenal variabel, tipe data, dan bagaimana komputer memproses instruksi sederhana.",
          taskType: "quiz",
          modules: [
            {
              id: 38,
              title: "Introduction to Computational Thinking",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 39,
              title: "Variables and Constants",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 40,
              title: "Data Types: Strings, Numbers, and Booleans",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 14,
          coverImage:
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200",
          title: "Control Flow & Logic",
          description:
            "Mempelajari pengkondisian dan perulangan untuk membuat program yang dinamis.",
          taskType: "quiz",
          modules: [
            {
              id: 41,
              title: "Conditional Statements (If-Else)",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 42,
              title: "Loops: For and While",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 43,
              title: "Logic Operators (AND, OR, NOT)",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 15,
          coverImage:
            "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200",
          title: "Functions & Reusability",
          description:
            "Cara menulis kode yang efisien dan dapat digunakan kembali melalui fungsi.",
          taskType: "quiz",
          modules: [
            {
              id: 44,
              title: "Defining and Calling Functions",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 45,
              title: "Parameters and Return Values",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 16,
          coverImage:
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200",
          title: "Basic Data Structures & Project",
          description:
            "Menyimpan kumpulan data dalam array dan membangun logika program pertama.",
          taskType: "project",
          modules: [
            {
              id: 46,
              title: "Working with Arrays/Lists",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 47,
              title: "Final Mini Project: Logic Builder",
              estimatedMinutes: 50,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 5,
      tipe: "machine learning",
      title: "AI Automation",
      image:
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=200&fit=crop",
      deskripsi:
        "Membangun workflow otomatis menggunakan AI untuk meningkatkan efisiensi proses bisnis",
      level: "Menengah",
      keywords: [
        "automation",
        "workflow",
        "zapier",
        "make.com",
        "ai integration",
        "efficiency",
        "business process",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.7,
      JumlahPerating: "64 ulasan",
      jumlahPembeli: "540 peserta",
      subChapters: [
        {
          id: 17,
          coverImage:
            "https://images.unsplash.com/photo-1518433278981-2ad264ac1794?w=400&h=200",
          title: "Introduction to AI Automation",
          description:
            "Memahami ekosistem automasi dan alat bantu seperti Zapier dan Make yang terintegrasi AI.",
          taskType: "quiz",
          modules: [
            {
              id: 48,
              title: "Understanding Workflow Automation",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 49,
              title: "Connecting AI with External Tools",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 18,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Automating Content & Email",
          description:
            "Membangun sistem yang secara otomatis menghasilkan dan mengirimkan konten menggunakan AI.",
          taskType: "quiz",
          modules: [
            {
              id: 50,
              title: "Automated Email Classification",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 51,
              title: "AI Auto-Response Systems",
              estimatedMinutes: 30,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 19,
          coverImage:
            "https://images.unsplash.com/photo-1504868584819-f8e90526354a?w=400&h=200",
          title: "Data Processing Automation",
          description:
            "Otomasi pengolahan data besar dan ekstraksi informasi penting secara otomatis.",
          taskType: "quiz",
          modules: [
            {
              id: 52,
              title: "Extracting Data from Documents",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 53,
              title: "Automatic Report Generation",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 20,
          coverImage:
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200",
          title: "Project: End-to-End Business Automation",
          description:
            "Membangun satu alur kerja bisnis otomatis dari awal hingga akhir.",
          taskType: "project",
          modules: [
            {
              id: 54,
              title: "System Design & Architecture",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 55,
              title: "Final Project Implementation",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 6,
      tipe: "data",
      title: "Microsoft Excel and Spreadsheet",
      image:
        "https://images.unsplash.com/photo-1616628182506-0fd5a34a5c90?w=400&h=200&fit=crop",
      deskripsi:
        "Menguasai Excel dan spreadsheet untuk analisis data, laporan, dan kebutuhan kerja profesional",
      level: "Pemula",
      keywords: [
        "excel",
        "spreadsheet",
        "data management",
        "vlookup",
        "pivot table",
        "data analysis",
        "reporting",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.6,
      JumlahPerating: "175 ulasan",
      jumlahPembeli: "1.820 peserta",
      subChapters: [
        {
          id: 21,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "Excel Essentials",
          description:
            "Pengenalan antarmuka Excel, navigasi, dan operasi aritmatika dasar.",
          taskType: "quiz",
          modules: [
            {
              id: 56,
              title: "Interface and Basic Formatting",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 57,
              title: "Basic Formulas (Sum, Average, Min, Max)",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 22,
          coverImage:
            "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=200",
          title: "Data Management",
          description:
            "Teknik merapikan data menggunakan fitur Sort, Filter, dan Conditional Formatting.",
          taskType: "quiz",
          modules: [
            {
              id: 58,
              title: "Sorting and Filtering Data",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 59,
              title: "Cleaning Messy Data",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 23,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Logical & Lookup Functions",
          description:
            "Menggunakan fungsi logika (IF) dan pencarian data (VLOOKUP/HLOOKUP).",
          taskType: "quiz",
          modules: [
            {
              id: 60,
              title: "Understanding IF & Nested IF",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 61,
              title: "Mastering VLOOKUP and XLOOKUP",
              estimatedMinutes: 30,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 24,
          coverImage:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200",
          title: "Analysis with Pivot Tables",
          description:
            "Merangkum ribuan baris data menjadi laporan ringkas dengan Pivot Table.",
          taskType: "project",
          modules: [
            {
              id: 62,
              title: "Introduction to Pivot Tables",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 63,
              title: "Creating Charts & Dashboards",
              estimatedMinutes: 40,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 7,
      tipe: "data",
      title: "Introduction to Data Analysis",
      image:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=200&fit=crop",
      deskripsi:
        "Belajar dasar analisis data mulai dari pengolahan, visualisasi, hingga interpretasi data untuk kebutuhan bisnis",
      level: "Pemula",
      keywords: [
        "analisis data",
        "data cleaning",
        "visualisasi data",
        "business intelligence",
        "data storytelling",
        "interpretasi data",
        "data analyst",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.5,
      JumlahPerating: "112 ulasan",
      jumlahPembeli: "1.050 peserta",
      subChapters: [
        {
          id: 25,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Data Analysis Fundamentals",
          description:
            "Memahami peran data analyst dan siklus hidup analisis data dalam bisnis.",
          taskType: "quiz",
          modules: [
            {
              id: 64,
              title: "The Data Analysis Process",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 65,
              title: "Defining Business Problems",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 26,
          coverImage:
            "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=200",
          title: "Data Discovery & Preparation",
          description:
            "Cara mengidentifikasi sumber data dan memastikan kualitas data sebelum diolah.",
          taskType: "quiz",
          modules: [
            {
              id: 66,
              title: "Data Sources & Types",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 67,
              title: "Introduction to Data Cleaning",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 27,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "Storytelling with Visualization",
          description:
            "Mengubah angka menjadi grafik yang mudah dipahami oleh pemangku kepentingan.",
          taskType: "quiz",
          modules: [
            {
              id: 68,
              title: "Choosing the Right Chart",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 69,
              title: "Principles of Visual Perception",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 28,
          coverImage:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200",
          title: "Insights and Interpretation",
          description:
            "Menarik kesimpulan yang dapat ditindaklanjuti dari hasil analisis data.",
          taskType: "project",
          modules: [
            {
              id: 70,
              title: "Describing Data Insights",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 71,
              title: "Final Case Study: Business Insight",
              estimatedMinutes: 50,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 8,
      tipe: "programming",
      title: "Python for Data Science",
      image:
        "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=400&h=200&fit=crop",
      deskripsi:
        "Menguasai Python untuk data science dengan fokus pada NumPy, Pandas, dan analisis data praktis",
      level: "Pemula",
      keywords: [
        "python",
        "data science",
        "numpy",
        "pandas",
        "jupyter notebook",
        "exploratory data analysis",
        "manipulasi data",
        "coding for data",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 9,
      rating: 4.7,
      JumlahPerating: "190 ulasan",
      jumlahPembeli: "1.760 peserta",
      subChapters: [
        {
          id: 29,
          coverImage:
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200",
          title: "Python Environment for DS",
          description:
            "Persiapan tools utama seperti Jupyter Notebook dan pengenalan sintaks Python.",
          taskType: "quiz",
          modules: [
            {
              id: 72,
              title: "Setting Up Jupyter & Anaconda",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 73,
              title: "Python Basics Refresher",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 30,
          coverImage:
            "https://images.unsplash.com/photo-1509228463558-399364a71109?w=400&h=200",
          title: "Numerical Computing with NumPy",
          description:
            "Bekerja dengan array multidimensi dan operasi matematika tingkat lanjut.",
          taskType: "quiz",
          modules: [
            {
              id: 74,
              title: "NumPy Arrays and Indexing",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 75,
              title: "Vectorized Operations",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 31,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "Data Manipulation with Pandas",
          description:
            "Teknik memproses dan membersihkan dataset menggunakan DataFrame.",
          taskType: "quiz",
          modules: [
            {
              id: 76,
              title: "Loading and Inspecting Data",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 77,
              title: "Filtering and Aggregating Data",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 78,
              title: "Handling Missing Data in Pandas",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 32,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Exploratory Data Project",
          description:
            "Proyek akhir melakukan analisis data eksploratif menggunakan dataset nyata.",
          taskType: "project",
          modules: [
            {
              id: 79,
              title: "Defining EDA Objectives",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 80,
              title: "Final Project: Python Data Analysis",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 9,
      tipe: "data",
      title: "Statistics for Data & AI",
      image:
        "https://images.unsplash.com/photo-1581091012184-5c8f5b7a3c9c?w=400&h=200&fit=crop",
      deskripsi:
        "Memahami statistik penting untuk data science dan AI seperti distribusi, regresi, dan inferensi",
      level: "Pemula",
      keywords: [
        "statistik",
        "probabilitas",
        "distribusi normal",
        "uji hipotesis",
        "regresi linear",
        "korelasi",
        "p-value",
        "statistik bisnis",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.6,
      JumlahPerating: "134 ulasan",
      jumlahPembeli: "1.220 peserta",
      subChapters: [
        {
          id: 33,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Probability & Distributions",
          description:
            "Dasar probabilitas dan jenis distribusi data yang sering ditemui dalam AI.",
          taskType: "quiz",
          modules: [
            {
              id: 81,
              title: "Introduction to Probability",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 82,
              title: "Normal and Binomial Distributions",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 34,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "Hypothesis Testing",
          description:
            "Belajar mengambil keputusan berbasis data menggunakan uji statistik.",
          taskType: "quiz",
          modules: [
            {
              id: 83,
              title: "P-Value and Significance Level",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 84,
              title: "T-Tests and ANOVA",
              estimatedMinutes: 30,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 35,
          coverImage:
            "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=200",
          title: "Correlation & Regression",
          description:
            "Memahami hubungan antar variabel dan memprediksi nilai melalui regresi.",
          taskType: "quiz",
          modules: [
            {
              id: 85,
              title: "Linear Correlation (Pearson & Spearman)",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 86,
              title: "Introduction to Linear Regression",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 36,
          coverImage:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200",
          title: "Final Stats Project",
          description:
            "Menerapkan uji statistik pada dataset nyata untuk menarik kesimpulan.",
          taskType: "project",
          modules: [
            {
              id: 87,
              title: "Statistical Analysis Case Study",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 88,
              title: "Interpreting Results for Business",
              estimatedMinutes: 40,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 10,
      tipe: "machine learning",
      title: "Machine Learning Basics",
      image:
        "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=400&h=200&fit=crop",
      deskripsi:
        "Pengenalan machine learning mulai dari supervised, unsupervised, hingga evaluasi model",
      level: "Menengah",
      keywords: [
        "machine learning",
        "supervised learning",
        "unsupervised learning",
        "clustering",
        "model evaluation",
        "decision tree",
        "random forest",
        "ai model",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 9,
      rating: 4.7,
      JumlahPerating: "168 ulasan",
      jumlahPembeli: "1.340 peserta",
      subChapters: [
        {
          id: 37,
          coverImage:
            "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=200",
          title: "Supervised Learning",
          description: "Membangun model prediksi menggunakan data berlabel.",
          taskType: "quiz",
          modules: [
            {
              id: 89,
              title: "Classification vs Regression",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 90,
              title: "Decision Trees and Random Forest",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 91,
              title: "Introduction to K-Nearest Neighbors",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 38,
          coverImage:
            "https://images.unsplash.com/photo-1518186239751-03e779743580?w=400&h=200",
          title: "Unsupervised Learning",
          description: "Menemukan pola tersembunyi dalam data tanpa label.",
          taskType: "quiz",
          modules: [
            {
              id: 92,
              title: "K-Means Clustering",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 93,
              title: "Dimensionality Reduction (PCA)",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 39,
          coverImage:
            "https://images.unsplash.com/photo-1454165833767-027ffea70c1e?w=400&h=200",
          title: "Model Evaluation",
          description: "Mengukur seberapa akurat model yang telah dibuat.",
          taskType: "quiz",
          modules: [
            {
              id: 94,
              title: "Confusion Matrix & F1-Score",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 95,
              title: "Overfitting vs Underfitting",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 40,
          coverImage:
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200",
          title: "ML Capstone Project",
          description:
            "Membangun pipeline Machine Learning lengkap dari data hingga evaluasi.",
          taskType: "project",
          modules: [
            {
              id: 96,
              title: "Building Your ML Pipeline",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 97,
              title: "Final Submission: Predict & Evaluate",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 11,
      tipe: "programming",
      title: "SQL for Data Analyst",
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
      deskripsi:
        "Belajar SQL dari dasar hingga query kompleks untuk analisis dan pengolahan database",
      level: "Pemula",
      keywords: [
        "sql",
        "database",
        "relational database",
        "query",
        "data aggregation",
        "table join",
        "subqueries",
        "postgresql",
        "mysql",
        "data manipulation",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.5,
      JumlahPerating: "102 ulasan",
      jumlahPembeli: "890 peserta",
      subChapters: [
        {
          id: 41,
          coverImage:
            "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=200",
          title: "SQL Fundamentals",
          description:
            "Mengenal struktur database relasional dan perintah SELECT dasar.",
          taskType: "quiz",
          modules: [
            {
              id: 98,
              title: "Introduction to Relational Databases",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 99,
              title: "Filtering Data with WHERE",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 42,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Data Aggregation",
          description:
            "Mengelompokkan dan menghitung data menggunakan fungsi agregat.",
          taskType: "quiz",
          modules: [
            {
              id: 100,
              title: "GROUP BY and HAVING Clauses",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 101,
              title: "Statistical Functions in SQL",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 43,
          coverImage:
            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=200",
          title: "Joining Tables",
          description:
            "Menggabungkan informasi dari berbagai tabel menggunakan teknik JOIN.",
          taskType: "quiz",
          modules: [
            {
              id: 102,
              title: "Inner, Left, and Right Joins",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 103,
              title: "Handling Multiple Joins",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 44,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "SQL Capstone: Analyzing Sales",
          description:
            "Menyelesaikan tantangan analisis bisnis menggunakan query SQL kompleks.",
          taskType: "project",
          modules: [
            {
              id: 104,
              title: "Complex Subqueries",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 105,
              title: "Final Project: Database Insight",
              estimatedMinutes: 50,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 12,
      tipe: "data",
      title: "Data Visualization with Tools",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      deskripsi:
        "Membuat visualisasi data yang informatif menggunakan berbagai tools populer",
      level: "Pemula",
      keywords: [
        "visualisasi data",
        "tableau",
        "power bi",
        "dashboard",
        "data storytelling",
        "business intelligence",
        "reporting",
        "grafik data",
        "infografis",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.4,
      JumlahPerating: "76 ulasan",
      jumlahPembeli: "640 peserta",
      subChapters: [
        {
          id: 45,
          coverImage:
            "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=200",
          title: "Visual Encoding & Design",
          description:
            "Prinsip desain visual agar data mudah dibaca dan tidak menyesatkan.",
          taskType: "quiz",
          modules: [
            {
              id: 106,
              title: "The Art of Data Storytelling",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 107,
              title: "Color Theory for Data",
              estimatedMinutes: 15,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 46,
          coverImage:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200",
          title: "Working with BI Tools",
          description:
            "Pengenalan tools seperti Tableau atau Power BI untuk membuat laporan.",
          taskType: "quiz",
          modules: [
            {
              id: 108,
              title: "Connecting Data Sources",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 109,
              title: "Building Your First Sheet",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 47,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "Interactive Dashboards",
          description:
            "Membuat dashboard interaktif dengan filter dan navigasi.",
          taskType: "quiz",
          modules: [
            {
              id: 110,
              title: "Adding Interactivity & Filters",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 111,
              title: "Dashboard Best Practices",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 48,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Visualization Project",
          description:
            "Membangun dashboard profesional menggunakan dataset publik.",
          taskType: "project",
          modules: [
            {
              id: 112,
              title: "Data Preparation for Viz",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 113,
              title: "Final Project: Interactive Report",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 13,
      tipe: "machine learning",
      title: "Prompt Engineering for AI",
      image:
        "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?w=400&h=200&fit=crop",
      deskripsi:
        "Belajar teknik membuat prompt efektif untuk memaksimalkan hasil dari model AI generatif",
      level: "Menengah",
      keywords: [
        "visualisasi data",
        "tableau",
        "power bi",
        "dashboard",
        "data storytelling",
        "business intelligence",
        "reporting",
        "grafik data",
        "infografis",
      ],
      jumlahSubChapter: 3,
      jumlahModul: 7,
      rating: 4.8,
      JumlahPerating: "95 ulasan",
      jumlahPembeli: "1.110 peserta",
      subChapters: [
        {
          id: 49,
          coverImage:
            "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=200",
          title: "Foundations of Prompting",
          description:
            "Memahami struktur prompt yang baik menggunakan framework context-task-constraint.",
          taskType: "quiz",
          modules: [
            {
              id: 114,
              title: "Anatomy of a Perfect Prompt",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 115,
              title: "Zero-shot vs Few-shot Prompting",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 50,
          coverImage:
            "https://images.unsplash.com/photo-1675557009875-436f595b1614?w=400&h=200",
          title: "Advanced Prompting Techniques",
          description:
            "Teknik tingkat lanjut seperti Chain of Thought (CoT) untuk logika yang lebih baik.",
          taskType: "quiz",
          modules: [
            {
              id: 116,
              title: "Iterative Refinement Process",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 117,
              title: "Implementing Chain of Thought",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 118,
              title: "Handling Hallucinations",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 51,
          coverImage:
            "https://images.unsplash.com/photo-1673187127815-5853514a60b9?w=400&h=200",
          title: "Final Challenge: AI Assistant Design",
          description:
            "Merancang instruksi sistem (system prompt) untuk asisten AI yang spesifik.",
          taskType: "project",
          modules: [
            {
              id: 119,
              title: "Designing System Persona",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 120,
              title: "Final Submission: Optimized Prompt",
              estimatedMinutes: 45,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 14,
      tipe: "data",
      title: "Business Intelligence Fundamentals",
      image:
        "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=200&fit=crop",
      deskripsi:
        "Dasar-dasar business intelligence untuk mendukung pengambilan keputusan berbasis data",
      level: "Menengah",
      keywords: [
        "business intelligence",
        "bi",
        "kpi",
        "data warehouse",
        "etl",
        "star schema",
        "snowflake schema",
        "data modeling",
        "decision support system",
      ],
      jumlahSubChapter: 3,
      jumlahModul: 7,
      rating: 4.6,
      JumlahPerating: "88 ulasan",
      jumlahPembeli: "720 peserta",
      subChapters: [
        {
          id: 52,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "BI Ecosystem & Strategy",
          description:
            "Memahami peran BI dalam perusahaan dan arsitektur data warehouse.",
          taskType: "quiz",
          modules: [
            {
              id: 121,
              title: "Introduction to BI Life Cycle",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 122,
              title: "Identifying Key Performance Indicators (KPIs)",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 53,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Data Modeling for Business",
          description:
            "Teknik mengorganisir data agar siap digunakan untuk pelaporan bisnis.",
          taskType: "quiz",
          modules: [
            {
              id: 123,
              title: "Star Schema vs Snowflake Schema",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 124,
              title: "Introduction to ETL Process",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 125,
              title: "Basic Data Dimensionality",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 54,
          coverImage:
            "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=200",
          title: "Reporting & Decision Making",
          description:
            "Menyusun laporan eksekutif yang membantu manajemen mengambil tindakan.",
          taskType: "project",
          modules: [
            {
              id: 126,
              title: "Effective Executive Reporting",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 127,
              title: "Final Case: BI Strategy Roadmap",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 15,
      tipe: "programming",
      title: "Web Development Fundamentals",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop",
      deskripsi:
        "Pengenalan dasar web development meliputi HTML, CSS, dan JavaScript untuk membangun website modern",
      level: "Pemula",
      keywords: [
        "web development",
        "frontend",
        "html",
        "css",
        "javascript",
        "responsive design",
        "flexbox",
        "dom manipulation",
        "website programming",
        "coding dasar",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.6,
      JumlahPerating: "142 ulasan",
      jumlahPembeli: "1.120 peserta",
      subChapters: [
        {
          id: 55,
          coverImage:
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=200",
          title: "Structure with HTML",
          description:
            "Mempelajari anatomi website dan elemen-elemen dasar HTML5.",
          taskType: "quiz",
          modules: [
            {
              id: 128,
              title: "Introduction to HTML Tags",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 129,
              title: "Forms and Input Elements",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 56,
          coverImage:
            "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=200",
          title: "Styling with CSS",
          description:
            "Membuat tampilan website menarik dengan selektor, warna, dan layouting.",
          taskType: "quiz",
          modules: [
            {
              id: 130,
              title: "CSS Box Model & Flexbox",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 131,
              title: "Responsive Design with Media Queries",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 57,
          coverImage:
            "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=200",
          title: "Logic with JavaScript",
          description:
            "Memberikan interaktivitas pada web menggunakan logika pemrograman JavaScript.",
          taskType: "quiz",
          modules: [
            {
              id: 132,
              title: "DOM Manipulation Dasar",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 133,
              title: "Event Listeners & Functions",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 58,
          coverImage:
            "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=200",
          title: "Final Project: Personal Landing Page",
          description:
            "Membangun satu halaman website utuh yang responsif dan interaktif.",
          taskType: "project",
          modules: [
            {
              id: 134,
              title: "Project Planning & Wireframing",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 135,
              title: "Building & Deploying Website",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 16,
      tipe: "data",
      title: "Data Cleaning & Preprocessing",
      image:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=200&fit=crop",
      deskripsi:
        "Belajar teknik membersihkan, memvalidasi, dan menyiapkan data sebelum digunakan untuk analisis atau AI",
      level: "Menengah",
      keywords: [
        "data cleaning",
        "preprocessing",
        "missing values",
        "imputation",
        "data transformation",
        "scaling",
        "normalization",
        "outlier detection",
        "z-score",
        "iqr method",
        "one-hot encoding",
        "data validation",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.5,
      JumlahPerating: "89 ulasan",
      jumlahPembeli: "730 peserta",
      subChapters: [
        {
          id: 59,
          coverImage:
            "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200",
          title: "Handling Missing Values",
          description:
            "Teknik mengidentifikasi dan menangani data yang hilang (null/NaN).",
          taskType: "quiz",
          modules: [
            {
              id: 136,
              title: "Detection of Missing Data",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 137,
              title: "Imputation vs Deletion Techniques",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 60,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Data Transformation",
          description:
            "Menyiapkan format data yang tepat melalui scaling dan encoding.",
          taskType: "quiz",
          modules: [
            {
              id: 138,
              title: "Normalization & Standardization",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 139,
              title: "Categorical Encoding (One-Hot, Label)",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 61,
          coverImage:
            "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=200",
          title: "Outlier Detection",
          description:
            "Mendeteksi data anomali yang dapat merusak hasil analisis atau model AI.",
          taskType: "quiz",
          modules: [
            {
              id: 140,
              title: "Z-Score and IQR Method",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 141,
              title: "Handling Outliers in Dataset",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 62,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "Final Cleaning Project",
          description:
            "Membersihkan dataset mentah yang kotor hingga siap untuk tahap modeling.",
          taskType: "project",
          modules: [
            {
              id: 142,
              title: "Data Audit & Cleaning Plan",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 143,
              title: "Final Implementation & Validation",
              estimatedMinutes: 50,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 17,
      tipe: "machine learning",
      title: "Supervised Learning in Practice",
      image:
        "https://images.unsplash.com/photo-1526378722484-cc5c510e06da?w=400&h=200&fit=crop",
      deskripsi:
        "Implementasi algoritma supervised learning seperti regresi dan klasifikasi dengan studi kasus nyata",
      level: "Menengah",
      keywords: [
        "machine learning",
        "supervised learning",
        "regression",
        "classification",
        "linear regression",
        "logistic regression",
        "svm",
        "model tuning",
        "hyperparameter",
        "cross validation",
        "grid search",
        "r-squared",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.7,
      JumlahPerating: "121 ulasan",
      jumlahPembeli: "980 peserta",
      subChapters: [
        {
          id: 63,
          coverImage:
            "https://images.unsplash.com/photo-1509228463558-399364a71109?w=400&h=200",
          title: "Regression Mastery",
          description:
            "Memprediksi nilai kontinu menggunakan Linear dan Multiple Regression.",
          taskType: "quiz",
          modules: [
            {
              id: 144,
              title: "Linear Regression Implementation",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 145,
              title: "Evaluating Regression Models (MSE, R2)",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 64,
          coverImage:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
          title: "Classification Algorithms",
          description:
            "Mengklasifikasikan data menggunakan Logistic Regression dan SVM.",
          taskType: "quiz",
          modules: [
            {
              id: 146,
              title: "Logistic Regression for Binary Class",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 147,
              title: "Introduction to Support Vector Machines",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 65,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "Model Tuning & Selection",
          description: "Optimasi performa model melalui Hyperparameter Tuning.",
          taskType: "quiz",
          modules: [
            {
              id: 148,
              title: "Cross Validation Techniques",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 149,
              title: "Grid Search & Random Search",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 66,
          coverImage:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200",
          title: "Supervised Learning Case Study",
          description:
            "Proyek akhir: Membangun sistem prediksi harga rumah atau churn rate.",
          taskType: "project",
          modules: [
            {
              id: 150,
              title: "Project Setup & EDA",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 151,
              title: "Final Model Deployment",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 18,
      tipe: "programming",
      title: "Backend Development with Node.js",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop",
      deskripsi:
        "Membangun backend application menggunakan Node.js, REST API, dan konsep server-side modern",
      level: "Menengah",
      keywords: [
        "backend",
        "nodejs",
        "expressjs",
        "rest api",
        "javascript server",
        "npm",
        "middleware",
        "crud",
        "mongodb",
        "postgresql",
        "jwt authentication",
        "api security",
        "server side",
      ],
      jumlahSubChapter: 4,
      jumlahModul: 8,
      rating: 4.6,
      JumlahPerating: "104 ulasan",
      jumlahPembeli: "860 peserta",
      subChapters: [
        {
          id: 67,
          coverImage:
            "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=200",
          title: "Node.js Fundamentals",
          description:
            "Memahami arsitektur event-driven dan Non-blocking I/O pada Node.js.",
          taskType: "quiz",
          modules: [
            {
              id: 152,
              title: "Introduction to NPM & Package.json",
              estimatedMinutes: 15,
              completed: false,
            },
            {
              id: 153,
              title: "CommonJS vs ES Modules",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 68,
          coverImage:
            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=200",
          title: "Web Server with Express.js",
          description:
            "Membangun routing dan middleware menggunakan framework Express.",
          taskType: "quiz",
          modules: [
            {
              id: 154,
              title: "Routing & Request Handling",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 155,
              title: "Middleware and Error Handling",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 69,
          coverImage:
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200",
          title: "RESTful API Design",
          description:
            "Mendesain API yang baik dengan prinsip REST dan integrasi database.",
          taskType: "quiz",
          modules: [
            {
              id: 156,
              title: "CRUD Operations with MongoDB/Postgres",
              estimatedMinutes: 35,
              completed: false,
            },
            {
              id: 157,
              title: "JWT Authentication & Security",
              estimatedMinutes: 30,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 70,
          coverImage:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200",
          title: "Backend Project: API Service",
          description:
            "Membangun sistem backend lengkap untuk aplikasi manajemen tugas.",
          taskType: "project",
          modules: [
            {
              id: 158,
              title: "Database Schema Design",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 159,
              title: "Final Submission: Functional REST API",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 19,
      tipe: "data",
      title: "Dashboard & Reporting for Business",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      deskripsi:
        "Mendesain dashboard interaktif dan laporan data untuk kebutuhan monitoring dan keputusan bisnis",
      level: "Menengah",
      keywords: [
        "business intelligence",
        "dashboard",
        "reporting",
        "kpi",
        "north star metric",
        "data storytelling",
        "drill-down",
        "automated reports",
        "business insight",
        "data visualization",
        "stakeholder communication",
      ],
      jumlahSubChapter: 3,
      jumlahModul: 7,
      rating: 4.5,
      JumlahPerating: "73 ulasan",
      jumlahPembeli: "610 peserta",
      subChapters: [
        {
          id: 71,
          coverImage:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200",
          title: "Metric Selection & Framework",
          description:
            "Menentukan North Star Metric dan KPI yang relevan untuk performa bisnis.",
          taskType: "quiz",
          modules: [
            {
              id: 160,
              title: "Defining Business Requirements",
              estimatedMinutes: 20,
              completed: false,
            },
            {
              id: 161,
              title: "KPI Tree Framework",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 72,
          coverImage:
            "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=200",
          title: "Interactive Visualization",
          description:
            "Teknik drill-down dan filter untuk eksplorasi data yang lebih mendalam.",
          taskType: "quiz",
          modules: [
            {
              id: 162,
              title: "Advanced Filtering Techniques",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 163,
              title: "Creating Automated Reports",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 164,
              title: "Data Storytelling for Stakeholders",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 73,
          coverImage:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200",
          title: "Final Reporting Project",
          description:
            "Membangun dashboard monitoring bisnis real-time dari dataset mentah.",
          taskType: "project",
          modules: [
            {
              id: 165,
              title: "ETL to Dashboard Pipeline",
              estimatedMinutes: 35,
              completed: false,
            },
            {
              id: 166,
              title: "Final Submission: Business Insight Report",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
    {
      id: 20,
      tipe: "machine learning",
      title: "Model Evaluation & Optimization",
      image:
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=200&fit=crop",
      deskripsi:
        "Memahami evaluasi performa model dan teknik optimasi untuk meningkatkan akurasi machine learning",
      level: "Lanjutan",
      keywords: [
        "machine learning evaluation",
        "model optimization",
        "confusion matrix",
        "roc-auc",
        "k-fold cross validation",
        "bias-variance tradeoff",
        "regularization",
        "l1 l2 lasso ridge",
        "hyperparameter tuning",
        "accuracy improvement",
      ],
      jumlahSubChapter: 3,
      jumlahModul: 7,
      rating: 4.8,
      JumlahPerating: "66 ulasan",
      jumlahPembeli: "540 peserta",
      subChapters: [
        {
          id: 74,
          coverImage:
            "https://images.unsplash.com/photo-1509228463558-399364a71109?w=400&h=200",
          title: "Deep Model Evaluation",
          description:
            "Analisis performa model menggunakan teknik validasi yang ketat.",
          taskType: "quiz",
          modules: [
            {
              id: 167,
              title: "Confusion Matrix & ROC-AUC",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 168,
              title: "K-Fold Cross Validation",
              estimatedMinutes: 20,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 75,
          coverImage:
            "https://images.unsplash.com/photo-1518186239751-03e779743580?w=400&h=200",
          title: "Advanced Optimization",
          description:
            "Mengoptimalkan hyperparameter dan arsitektur untuk hasil terbaik.",
          taskType: "quiz",
          modules: [
            {
              id: 169,
              title: "Bias-Variance Tradeoff",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 170,
              title: "Grid & Random Search Optimization",
              estimatedMinutes: 30,
              completed: false,
            },
            {
              id: 171,
              title: "Regularization Techniques (L1 & L2)",
              estimatedMinutes: 25,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
        {
          id: 76,
          coverImage:
            "https://images.unsplash.com/photo-1454165833767-027ffea70c1e?w=400&h=200",
          title: "ML Optimization Project",
          description:
            "Meningkatkan performa model dasar (baseline) melalui serangkaian optimasi.",
          taskType: "project",
          modules: [
            {
              id: 172,
              title: "Performance Debugging Plan",
              estimatedMinutes: 25,
              completed: false,
            },
            {
              id: 173,
              title: "Final Submission: Optimized ML Model",
              estimatedMinutes: 60,
              completed: false,
            },
          ],
          progressPercent: 0,
          lastActivityAt: null,
        },
      ],
    },
  ];

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

  const INITIAL_COUNT = 12;

  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const totalPractices = filteredPractices.length;
  const visiblePractices = filteredPractices.slice(0, visibleCount);

  const isExpanded = visibleCount >= totalPractices;
  const canExpand = totalPractices > INITIAL_COUNT;

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
                <Card className="group rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-0 cursor-pointer">
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
                onClick={() => setVisibleCount(totalPractices)}
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
          </div>
        )}
      </div>
    </section>
  );
}
