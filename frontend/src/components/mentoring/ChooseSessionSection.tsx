"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import MentorSelectionModal from "./MentorSelectionModal";


export default function ChooseSessionSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const oneOnOneFeatures = [
        "Mentoring 45 menit",
        "Tanya apapun permasalahan dalam bidang data science",
        "Rekaman sesi mentoring",
        "Garansi kepuasan*",
        "Dapatkan akses ke praktik data science**",
    ];

    const groupFeatures = [
        "Mentoring 90 menit",
        "Tanya apapun permasalahan dalam bidang data science",
        "Rekaman sesi mentoring",
        "Garansi kepuasan*",
        "Dapatkan akses ke praktik data science**",
    ];



    return (
        <section className="py-16 px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Pilih Gaya Belajar Sesuai Vibenya Kamu!
                    </h2>
                    <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Mau belajar bareng mentor secara intensif atau fleksibel
                        sesuai waktu kamu? TemuDataku punya beberapa pilihan
                        mentoring yang bisa disesuaikan sama kebutuhan dan ritme
                        belajar kamu. Yuk, pilih yang paling cocok buat kamu!
                    </p>
                </div>

                {/* Mentoring Cards Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* 1-on-1 Mentoring Card */}
                    <Card className="relative overflow-hidden py-0">
                        <div className="relative">
                            {/* Card Image */}
                            <div className="relative h-64 rounded-t-xl overflow-hidden">
                                <Image
                                    src={"/assets/mentoringPage/mentoring1on1.svg"}
                                    alt="1-on-1 Mentoring"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Best Session Badge */}
                            <div className="absolute bottom-0 left-0 right-0 w-full">
                                <Badge className="w-full bg-brand-color-secondary text-white text-center justify-center py-3 text-sm font-semibold rounded-none">
                                    BEST SESSION
                                </Badge>
                            </div>
                        </div>

                        <CardContent className="p-6">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Mentoring 1 on 1
                                </CardTitle>
                            </CardHeader>

                            {/* Pricing */}
                            <div className="mb-6 flex gap-5 items-center">
                                <div className="text-sm text-gray-500 line-through">
                                    Rp 45.000
                                </div>
                                <div className="text-3xl font-bold text-gray-900">
                                    Rp 40.000
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3 mb-8">
                                {oneOnOneFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm text-gray-700">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-base font-medium"
                            >
                                Ikuti Sesi
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Group Mentoring Card */}
                    <Card className="overflow-hidden py-0">
                        <div className="relative">
                            {/* Card Image */}
                            <div className="relative h-64 rounded-t-xl overflow-hidden">
                                <Image
                                    src={"/assets/mentoringPage/mentoringgroup.svg"}
                                    alt="Group Mentoring"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        <CardContent className="p-6 flex flex-col h-full">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Mentoring Group
                                </CardTitle>
                            </CardHeader>

                            {/* Pricing */}
                            <div className="mb-6">
                                <div className="text-3xl font-bold text-gray-900">
                                    Rp 70.000
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3 mb-8">
                                {groupFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm text-gray-700">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-base font-medium mt-auto"
                            >
                                Ikuti Sesi
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Disclaimers */}
                <div className="mt-12 text-start space-y-2">
                    <p className="text-sm text-gray-600">
                        * Garansi kepuasan bisa didapatkan jika peserta tidak
                        puas dan mengisi form untuk melakukan klaim garansi
                        serta memberikan bukti valid.
                    </p>
                    <p className="text-sm text-gray-600">
                        ** Untuk peserta yang pertama kali mengikuti mentoring
                        akan mendapatkan akses ke praktik data science.
                    </p>
                </div>

                {/* Mentor Selection Modal */}
                <MentorSelectionModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </div>
        </section>
    );
}
