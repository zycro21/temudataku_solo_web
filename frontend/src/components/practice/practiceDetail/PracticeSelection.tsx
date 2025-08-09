import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Clock, Database } from "lucide-react";

export default function PracticeSelection() {
    // Sample practice data - in real app this would come from props or API
    const practices = [
        {
            id: 1,
            title: "Analisis Sentimen Media Sosial Tahun 2025",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=200&fit=crop",
            badge: "BEST PRACTICE",
            level: "Pemula",
            dataset: "Dataset berisi 10.000 ulasan pelanggan dari e-commerce",
            duration: "Estimasi pengerjaan ± 3-5 jam",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "powerbi", "python", "mysql"],
            category: "Data Analysis",
        },
        {
            id: 2,
            title: "Analisis Sentimen Media Sosial Tahun 2025",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=200&fit=crop",
            badge: "BEST PRACTICE",
            level: "Pemula",
            dataset: "Dataset berisi 10.000 ulasan pelanggan dari e-commerce",
            duration: "Estimasi pengerjaan ± 3-5 jam",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "powerbi", "python", "mysql"],
            category: "Data Science",
        },
        {
            id: 3,
            title: "Analisis Sentimen Media Sosial Tahun 2025",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=200&fit=crop",
            badge: "BEST PRACTICE",
            level: "Pemula",
            dataset: "Dataset berisi 10.000 ulasan pelanggan dari e-commerce",
            duration: "Estimasi pengerjaan ± 3-5 jam",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "powerbi", "python", "mysql"],
            category: "Machine Learning",
        },
    ];

    const getToolIcon = (tool: string) => {
        const toolColors = {
            excel: "bg-green-100 text-green-600",
            powerbi: "bg-yellow-100 text-yellow-600",
            python: "bg-blue-100 text-blue-600",
            mysql: "bg-orange-100 text-orange-600",
        };

        const toolNames = {
            excel: "Excel",
            powerbi: "BI",
            python: "Py",
            mysql: "SQL",
        };

        return (
            <div
                key={tool}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                    toolColors[tool as keyof typeof toolColors]
                }`}
            >
                {toolNames[tool as keyof typeof toolNames]}
            </div>
        );
    };

    return (
        <section className="py-16 px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-start mb-12">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Latihan Lainnya yang Bisa Kamu Coba
                    </h2>
                    <p className="text-lg text-gray-600 ">
                        Masih eksplor? Tenang, TemuDataku punya banyak pilihan
                        latihan sesuai kebutuhan dan minat kamu. Cek yang lain,
                        siapa tahu lebih cocok!
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
                            {practices.map((practice) => (
                                <CarouselItem key={practice.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow py-0 gap-0 h-full">
                                        <div className="relative">
                                            <Image
                                                src={practice.image}
                                                alt={practice.title}
                                                width={400}
                                                height={200}
                                                className="w-full object-cover"
                                            />
                                            <Badge className="absolute bottom-0 w-full bg-brand-color-secondary text-white rounded-none py-2">
                                                {practice.badge}
                                            </Badge>
                                            <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-md text-sm font-medium text-gray-700">
                                                {practice.level}
                                            </div>
                                        </div>

                                        <CardContent className="p-6 flex flex-col h-full">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                                {practice.title}
                                            </h3>

                                            {/* Practice Details */}
                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-start gap-2 text-gray-600 text-sm">
                                                    <Database className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <span>{practice.dataset}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                                    <span>{practice.duration}</span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-gray-400 text-sm line-through">
                                                    {practice.originalPrice}
                                                </span>
                                                <span className="text-xl font-bold text-gray-900">
                                                    {practice.currentPrice}
                                                </span>
                                            </div>

                                            {/* Tools */}
                                            <div className="flex gap-2 mb-6">
                                                {practice.tools.map((tool) =>
                                                    getToolIcon(tool)
                                                )}
                                            </div>

                                            {/* Action Buttons - Push to bottom */}
                                            <div className="space-y-3 mt-auto">
                                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                                    Mulai Latihan
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
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
