import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Calendar } from "lucide-react";

export default function ProgramSelection() {
    // Sample bootcamp data - in real app this would come from props or API
    const bootcamps = [
        {
            id: 1,
            title: "Bootcamp Data Science",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
            quota: "<10 Kuota Tersisa",
            level: "Level 2 - Skill Booster: Saatnya Upgrade Skill!",
            startDate: "15 Maret 2025",
            endDate: "17 Maret 2025",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "python", "powerbi", "mysql"],
            category: "Data Science",
        },
        {
            id: 2,
            title: "Bootcamp Data Analysis",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
            quota: "<10 Kuota Tersisa",
            level: "Level 2 - Skill Booster: Saatnya Upgrade Skill!",
            startDate: "15 Maret 2025",
            endDate: "17 Maret 2025",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "python", "powerbi", "mysql"],
            category: "Data Analysis",
        },
        {
            id: 3,
            title: "Bootcamp Machine Learning",
            image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
            quota: "<10 Kuota Tersisa",
            level: "Level 2 - Skill Booster: Saatnya Upgrade Skill!",
            startDate: "15 Maret 2025",
            endDate: "17 Maret 2025",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "python", "powerbi", "mysql"],
            category: "Machine Learning",
        },
    ];

    const getToolIcon = (tool: string) => {
        const toolPaths = {
            excel: "/assets/toolIcons/excel.svg",
            python: "/assets/toolIcons/python.svg",
            powerbi: "/assets/toolIcons/powerbi.svg",
            mysql: "/assets/toolIcons/mysql.svg",
        };

        const toolNames = {
            excel: "Excel",
            python: "Python",
            powerbi: "Power BI",
            mysql: "MySQL",
        };

        return (
            <div
                key={tool}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-200"
                title={toolNames[tool as keyof typeof toolNames]}
            >
                <Image
                    src={toolPaths[tool as keyof typeof toolPaths]}
                    alt={toolNames[tool as keyof typeof toolNames]}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                />
            </div>
        );
    };

    return (
        <section className="py-16 px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-start mb-12">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Bootcamp Lainnya yang Bisa Kamu Coba
                    </h2>
                    <p className="text-lg text-gray-600 ">
                        Masih eksplor? Tenang, TemuDataku punya banyak pilihan bootcamp sesuai kebutuhan dan minat kamu. Cek yang lain, siapa tahu lebih cocok!
                    </p>
                </div>

                {/* Practice Cards Carousel */}
                <div className="px-12">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {bootcamps.map((bootcamp) => (
                                <CarouselItem key={bootcamp.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 rounded-lg p-0 gap-0 h-full">
                                        <div className="relative">
                                            <Image
                                                src={bootcamp.image}
                                                alt={bootcamp.title}
                                                width={400}
                                                height={200}
                                                className="w-full h-48 object-cover"
                                            />
                                            {/* Quota Badge */}
                                            <div className="absolute top-0 right-0 bg-gray-500 text-white px-3 p-2 rounded-bl-lg text-sm font-medium">
                                                {bootcamp.quota}
                                            </div>
                                            {/* Level Badge */}
                                            <div className="absolute bottom-0 w-full bg-brand-color-secondary text-white px-4 py-2 text-sm font-medium">
                                                {bootcamp.level}
                                            </div>
                                        </div>

                                        <CardContent className="p-6 flex flex-col h-full">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                                {bootcamp.title}
                                            </h3>

                                            {/* Tools Icons */}
                                            <div className="flex gap-2 mb-4">
                                                {bootcamp.tools.map((tool) =>
                                                    getToolIcon(tool)
                                                )}
                                            </div>

                                            {/* Date Range */}
                                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                                <span>{bootcamp.startDate} - {bootcamp.endDate}</span>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-6">
                                                <span className="text-gray-400 text-sm line-through">
                                                    {bootcamp.originalPrice}
                                                </span>
                                                <span className="text-xl font-bold text-gray-900">
                                                    {bootcamp.currentPrice}
                                                </span>
                                            </div>

                                            {/* Action Buttons - Push to bottom */}
                                            <div className="space-y-3 mt-auto">
                                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3">
                                                    Daftar Sekarang
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-3"
                                                >
                                                    Lihat Detail
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Navigation Arrows - Positioned Outside */}
                        <CarouselPrevious className="-left-12" />
                        <CarouselNext className="-right-12" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
