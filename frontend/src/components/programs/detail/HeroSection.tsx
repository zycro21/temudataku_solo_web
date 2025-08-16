import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

import { Clock, Tag } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
            <Image
                src="/assets/mentoringPage/vectorHeroSection.svg"
                alt="vector background"
                fill
                className="object-cover object-center z-0"
                priority
            />
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
                <nav className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Bootcamp</span>
                    <span>&gt;</span>
                    <span className="text-gray-900 font-medium">Detail Bootcamp Data Science for Beginner</span>
                </nav>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left side - Original Illustration */}
                    <div className="relative flex items-center justify-center">
                        <Image
                            src="/assets/programsPage/programsIllustration.svg"
                            alt="programs illustration"
                            width={600}
                            height={400}
                            className="w-full h-full"
                        />
                    </div>

                    {/* Right side - Content */}
                    <div className="space-y-6">
                        {/* Level Badge */}
                        <Badge className="bg-blue-900 text-white px-4 py-2 text-sm font-medium">
                            Level 2 - Skill Booster
                        </Badge>

                        {/* Title */}
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Bootcamp - Data Science
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed max-w-xl">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                            exercitation ullamco.
                        </p>

                        {/* Duration and Price */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-gray-600" />
                                <span className="text-gray-700">Estimasi pengerjaan + 3-5 jam</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Tag className="w-6 h-6 text-gray-600" />
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 line-through">Rp 550.000</span>
                                    <span className="text-2xl font-bold text-gray-900">Rp 500.000</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-base font-medium"
                            >
                                Daftar Sekarang
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3 text-base font-medium"
                            >
                                Konsultasi Gratis
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
