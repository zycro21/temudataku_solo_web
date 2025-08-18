"use client";

import { useState, useEffect } from "react";
import {
    ChevronDown,
    ChevronRight,
    BookCheck,
    ChartNoAxesCombined,
    Flag,
    UserRound,
} from "lucide-react";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function ProgramDetailSection() {
    const [expandedSection, setExpandedSection] = useState<number | null>(1);
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [projectApi, setProjectApi] = useState<CarouselApi>();
    const [projectCurrent, setProjectCurrent] = useState(0);
    const [projectCount, setProjectCount] = useState(0);

    const programItems = [
        "Deskripsi Bootcamp",
        "Benefit Bootcamp",
        "Mekanisme Bootcamp",
        "Modul dan Silabus Bootcamp",
        "Tools yang Digunakan",
        "Peserta Bootcamp",
        "Jadwal Bootcamp",
        "Portofolio Alumni",
        "Testimoni Alumni",
    ];

    const sectionContents = {
        1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        2: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        3: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    };

    const toggleSection = (index: number) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    const testimonials = [
        {
            id: 1,
            name: "John Drake Lane",
            role: "Alumni Latihan Data Science",
            status: "Mahasiswa Aktif",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&crop=face",
            quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
        {
            id: 2,
            name: "Sarah Johnson",
            role: "Alumni Latihan Data Science",
            status: "Mahasiswa Aktif",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&crop=face",
            quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
        {
            id: 3,
            name: "Michael Chen",
            role: "Alumni Latihan Data Science",
            status: "Mahasiswa Aktif",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&crop=face",
            quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
    ];

    const alumniProjects = [
        {
            id: 1,
            title: "Hubungan Positif antara Angka Stunting dan Faktor Ekonomi Provinsi Papua Barat Indonesia",
            description:
                "Project ini menganalisis hubungan angka stunting dengan faktor ekonomi di Papua Barat, dan menemukan korelasi positif di antara keduanya.",
            authors: ["John Drake Lane", "Mario Bros", "Lusiana Gomes"],
        },
        {
            id: 2,
            title: "Analisis Trend Pertumbuhan Ekonomi Digital Indonesia",
            description:
                "Penelitian mendalam tentang pertumbuhan sektor ekonomi digital di Indonesia dan dampaknya terhadap UMKM.",
            authors: ["Sarah Connor", "Bruce Wayne", "Diana Prince"],
        },
        {
            id: 3,
            title: "Prediksi Harga Saham Menggunakan Machine Learning",
            description:
                "Implementasi algoritma machine learning untuk memprediksi pergerakan harga saham berdasarkan data historis dan sentimen pasar.",
            authors: ["Alice Johnson", "Bob Smith", "Charlie Brown"],
        },
    ];

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    useEffect(() => {
        if (!projectApi) {
            return;
        }

        setProjectCount(projectApi.scrollSnapList().length);
        setProjectCurrent(projectApi.selectedScrollSnap() + 1);

        projectApi.on("select", () => {
            setProjectCurrent(projectApi.selectedScrollSnap() + 1);
        });
    }, [projectApi]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    Isi Bootcampnya Apa Aja? Yuk Simak!
                </h2>
                <p className="text-gray-600 text-lg max-w-4xl mx-auto leading-relaxed">
                    Di bootcamp ini, kamu akan langsung terjun ke praktik:
                    memahami dasar analisis data, mengenal tools yang sering
                    dipakai di industri, dan membangun proyek yang bisa kamu
                    tunjukkan ke HR atau klien.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column - Detail Program */}
                <div>
                    <div className="bg-gray-50 rounded-sm p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">
                            Detail Program
                        </h3>

                        <div className="space-y-1">
                            {programItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="border-b border-gray-200"
                                >
                                    <button
                                        onClick={() => toggleSection(index + 1)}
                                        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {expandedSection === index + 1 ? (
                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-600" />
                                            )}
                                            <span className="text-gray-700 font-medium">
                                                {index + 1}. {item}
                                            </span>
                                        </div>
                                    </button>

                                    {expandedSection === index + 1 &&
                                        sectionContents[
                                            (index +
                                                1) as keyof typeof sectionContents
                                        ] && (
                                            <div className="pb-4 pl-8">
                                                <p className="text-gray-600 leading-relaxed">
                                                    {
                                                        sectionContents[
                                                            (index +
                                                                1) as keyof typeof sectionContents
                                                        ]
                                                    }
                                                </p>
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>

                        {/* Register Button */}
                        <div className="mt-8">
                            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                                Daftar Sekarang
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Two Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 1 - Tentang Latihan Ini */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    1. Tentang Bootcamp Ini
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6 space-y-4">
                            <p className="text-gray-700 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                                consequat.
                            </p>

                            <p className="text-gray-700 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                                consequat.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 - Apa Aja yang Kamu Dapat */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    2. Apa Aja yang Kamu Dapat di Sini?
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-gray-700 leading-relaxed mb-6">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua.
                            </p>

                            {/* Benefits Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4 bg-gray-50 rounded-sm p-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                            <ChartNoAxesCombined className="w-5 h-5 text-brand-color-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-2">
                                            Benefit1
                                        </h5>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 bg-gray-50 rounded-sm p-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                            <ChartNoAxesCombined className="w-5 h-5 text-brand-color-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-2">
                                            Benefit3
                                        </h5>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 bg-gray-50 rounded-sm p-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                            <ChartNoAxesCombined className="w-5 h-5 text-brand-color-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-2">
                                            Benefit2
                                        </h5>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 bg-gray-50 rounded-sm p-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                            <ChartNoAxesCombined className="w-5 h-5 text-brand-color-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-2">
                                            Benefit4
                                        </h5>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 - Gimana Bootcamp Ini Berjalan? */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    3. Gimana Bootcamp Ini Berjalan?
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-gray-700 leading-relaxed mb-6">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua.
                            </p>

                            {/* Tasks Section with Gray Background */}
                            <div className="p-6 rounded-sm space-y-8">
                                {/* Task 1 */}
                                <div className="flex gap-4 bg-gray-50 rounded-sm p-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                            <BookCheck
                                                fill="#0CAF6F"
                                                className="w-8 h-8 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 text-lg mb-2">
                                            Task 1: Data cleaning
                                        </h5>
                                        <p className="text-gray-600 leading-relaxed">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magna aliqua.
                                        </p>
                                    </div>
                                </div>

                                {/* Task 2 */}
                                <div className="flex gap-4 bg-gray-50 rounded-sm p-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                            <BookCheck
                                                fill="#0CAF6F"
                                                className="w-8 h-8 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 text-lg mb-2">
                                            Task 2: Exploratory Data Analysis
                                        </h5>
                                        <p className="text-gray-600 leading-relaxed">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magna aliqua.
                                        </p>
                                    </div>
                                </div>

                                {/* Task 3 */}
                                <div className="flex gap-4 bg-gray-50 rounded-sm p-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                            <BookCheck
                                                fill="#0CAF6F"
                                                className="w-8 h-8 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 text-lg mb-2">
                                            Task 3: Interpret and Visualize
                                            Results
                                        </h5>
                                        <p className="text-gray-600 leading-relaxed">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magna aliqua.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 - Modul dan Silabus yang Akan Kamu Pelajari */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    4. Modul dan Silabus yang Akan Kamu Pelajari
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-gray-700 leading-relaxed mb-6">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua.
                            </p>

                            {/* Collapsible Items */}
                            <div className="space-y-4">
                                {/* Item 1 */}
                                <div className="bg-gray-50 rounded-sm p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                                <Flag className="w-5 h-5 text-brand-color-primary" />
                                            </div>
                                            <h5 className="font-semibold text-gray-900 text-lg">
                                                Tabel Data Bersih Hasil
                                                Transformasi
                                            </h5>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="bg-gray-50 rounded-sm p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                                <Flag className="w-5 h-5 text-brand-color-primary" />
                                            </div>
                                            <h5 className="font-semibold text-gray-900 text-lg">
                                                Dashboard Mini untuk Analisis
                                                Sentimen
                                            </h5>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="bg-gray-50 rounded-sm p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                                <Flag className="w-5 h-5 text-brand-color-primary" />
                                            </div>
                                            <h5 className="font-semibold text-gray-900 text-lg">
                                                Analisis Kebijakan untuk
                                                Perusahaan
                                            </h5>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5 - Peralatan Tempur Selama Belajar */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    5. Peralatan Tempur Selama Belajar
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                                consequat.
                            </p>

                            <ol className="space-y-2 text-gray-700">
                                <li>1. Lorem ipsum</li>
                                <li>2. Lorem ipsum</li>
                                <li>3. Lorem ipsum</li>
                                <li>4. Lorem ipsum</li>
                                <li>5. Lorem ipsum</li>
                            </ol>
                        </div>
                    </div>

                    {/* Section 6 - Latihan Ini Cocok untuk Siapa? */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    6. Bootcamp Ini Cocok untuk Siapa?
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-gray-700 leading-relaxed mb-8">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua.
                            </p>

                            {/* Participant Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Participant 1 */}
                                <div className="text-center bg-gray-50 rounded-sm p-6">
                                    <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-emerald-400 flex items-center justify-center">
                                        <Image
                                            src="https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?fit=crop&crop=face"
                                            alt="Peserta 1"
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h5 className="font-bold text-gray-900 text-lg mb-2">
                                        Peserta 1
                                    </h5>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit.
                                    </p>
                                </div>

                                {/* Participant 2 */}
                                <div className="text-center bg-gray-50 rounded-sm p-6">
                                    <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-emerald-400 flex items-center justify-center">
                                        <Image
                                            src="https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?fit=crop&crop=face"
                                            alt="Peserta 1"
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h5 className="font-bold text-gray-900 text-lg mb-2">
                                        Peserta 2
                                    </h5>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit.
                                    </p>
                                </div>

                                {/* Participant 3 */}
                                <div className="text-center bg-gray-50 rounded-sm p-6">
                                    <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-emerald-400 flex items-center justify-center">
                                        <Image
                                            src="https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?fit=crop&crop=face"
                                            alt="Peserta 1"
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h5 className="font-bold text-gray-900 text-lg mb-2">
                                        Peserta 3
                                    </h5>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 7 - Berapa Lama Waktu yang Dibutuhkan untuk Latihan Ini? */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    7. Belajarnya Kapan Aja, Sih?
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6 space-y-4">
                            <p className="text-gray-700 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                                consequat.
                            </p>

                            <p className="text-gray-700 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                                consequat.
                            </p>
                        </div>
                    </div>

                    {/* Section 8 - Intip Karya Alumni dari Bootcamp Ini */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    8. Intip Karya Alumni dari Bootcamp Ini
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-gray-700 leading-relaxed mb-8">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>

                            {/* Alumni Projects Carousel */}
                            <div className="relative">
                                <Carousel
                                    setApi={setProjectApi}
                                    className="w-full"
                                    opts={{
                                        align: "start",
                                        loop: true,
                                        skipSnaps: false,
                                        dragFree: true,
                                    }}
                                >
                                    <CarouselContent className="py-2 md:py-5 -ml-2 md:-ml-4">
                                        {alumniProjects.map((project) => (
                                            <CarouselItem
                                                key={project.id}
                                                className="pl-2 md:pl-4 basis-[85%] sm:basis-[75%] md:basis-1/2 lg:basis-[45%]"
                                            >
                                                <div className="bg-gray-50 rounded-lg md:rounded-xl overflow-hidden h-full flex flex-col">
                                                    {/* Project Image */}
                                                    <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
                                                        <Image
                                                            src="/assets/mentoringPage/laptop.svg"
                                                            alt="laptop"
                                                            width={400}
                                                            height={300}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Project Content */}
                                                    <div className="p-4 md:p-6 flex flex-col flex-1">
                                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight line-clamp-3">
                                                            {project.title}
                                                        </h3>

                                                        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed line-clamp-3 flex-1">
                                                            {project.description}
                                                        </p>

                                                        {/* Authors */}
                                                        <div className="flex items-center mb-4 md:mb-6 gap-3">
                                                            <UserRound className="w-4 h-4" />
                                                            <span className="text-xs md:text-sm text-gray-700 line-clamp-1">
                                                                {project.authors.join(", ")}
                                                            </span>
                                                        </div>

                                                        {/* Button */}
                                                        <Button className="w-fit bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base">
                                                            Jelajahi Proyek
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>

                                    {/* Navigation Arrows */}
                                    <CarouselPrevious className="left-2 bg-white border-gray-200 hover:bg-gray-50 shadow-md" />
                                    <CarouselNext className="right-2 bg-white border-gray-200 hover:bg-gray-50 shadow-md" />
                                </Carousel>

                                {/* Dots Indicator */}
                                <div className="flex justify-center mt-4 md:mt-6 space-x-2">
                                    {Array.from({ length: projectCount }).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => projectApi?.scrollTo(index)}
                                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors touch-manipulation ${
                                                index + 1 === projectCurrent
                                                    ? "bg-emerald-500"
                                                    : "bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
                                            }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 9 - Apa Kata Mereka Setelah Bootcamp? */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    9. Apa Kata Mereka Setelah Bootcamp?
                                </h4>
                            </div>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-gray-700 leading-relaxed mb-8">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua.
                            </p>

                            {/* Testimonial Carousel */}
                            <div className="px-12">
                                <Carousel
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                    setApi={setApi}
                                    className="w-full"
                                >
                                    <CarouselContent>
                                        {testimonials.map((testimonial) => (
                                            <CarouselItem
                                                key={testimonial.id}
                                                className="md:basis-1/2 lg:basis-1/2"
                                            >
                                                <div className="bg-gray-50 rounded-sm p-6 h-full">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-400 flex-shrink-0">
                                                            <Image
                                                                src={
                                                                    testimonial.image
                                                                }
                                                                alt={
                                                                    testimonial.name
                                                                }
                                                                width={64}
                                                                height={64}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900 text-lg">
                                                                {
                                                                    testimonial.name
                                                                }
                                                            </h5>
                                                            <p className="text-gray-600 text-sm">
                                                                {
                                                                    testimonial.role
                                                                }
                                                            </p>
                                                            <p className="text-gray-500 text-xs">
                                                                {
                                                                    testimonial.status
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        &quot;
                                                        {testimonial.quote}
                                                        &quot;
                                                    </p>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>

                                    {/* Navigation Arrows - Positioned Outside */}
                                    <CarouselPrevious className="-left-12" />
                                    <CarouselNext className="-right-12" />
                                </Carousel>
                            </div>

                            {/* Dot Indicators */}
                            <div className="flex justify-center mt-8 gap-2">
                                {Array.from({ length: count }, (_, index) => (
                                    <button
                                        key={index}
                                        className={`w-3 h-3 rounded-full transition-colors ${
                                            index + 1 === current
                                                ? "bg-emerald-500"
                                                : "bg-gray-300 hover:bg-gray-400"
                                        }`}
                                        onClick={() => api?.scrollTo(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
