"use client";

import { useState, useEffect } from "react";
import {
    ChevronDown,
    ChevronRight,
    BookCheck,
    ChartNoAxesCombined,
    Flag,
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

export default function ProgramDetailSection() {
    const [expandedSection, setExpandedSection] = useState<number | null>(1);
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    const programItems = [
        "Deskripsi Latihan",
        "Benefit Latihan",
        "Tools yang Digunakan",
        "Dataset Informasi",
        "Challenge yang akan Diselesaikan",
        "Ekspektasi Keluaran",
        "Estimasi Pengerjaan",
        "Peserta Latihan",
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

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    Isi Latihannya Apa Aja? Yuk Simak!
                </h2>
                <p className="text-gray-600 text-lg max-w-4xl mx-auto leading-relaxed">
                    Di latihan ini, kamu akan langsung terjun ke praktik:
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
                                    1. Tentang Latihan Ini
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
                                    2. Apa Aja yang Kamu Dapat melalui Latihan
                                    Ini?
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

                    {/* Section 3 - Peralatan dan Aplikasi Tempur Selama Latihan */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    3. Peralatan dan Aplikasi Tempur Selama
                                    Latihan
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

                    {/* Section 4 - Gambaran Dataset yang Digunakan di Latihan Ini */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    4. Gambaran Dataset yang Digunakan di
                                    Latihan Ini
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

                    {/* Section 5 - Gimana Latihan Ini Berjalan? */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    5. Gimana Latihan Ini Berjalan?
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

                    {/* Section 6 - Keluaran yang Kamu Capai di Latihan Ini! */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    6. Keluaran yang Kamu Capai di Latihan Ini!
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

                    {/* Section 7 - Berapa Lama Waktu yang Dibutuhkan untuk Latihan Ini? */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    7. Berapa Lama Waktu yang Dibutuhkan untuk
                                    Latihan Ini?
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

                    {/* Section 8 - Latihan Ini Cocok untuk Siapa? */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    8. Latihan Ini Cocok untuk Siapa?
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

                    {/* Section 9 - Apa Kata Mereka Setelah Menyelesaikan Latihan? */}
                    <div>
                        <div className="bg-blue-900 text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5" />
                                <h4 className="text-xl font-semibold">
                                    9. Apa Kata Mereka Setelah Menyelesaikan
                                    Latihan?
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
