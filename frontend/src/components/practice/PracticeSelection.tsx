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
import { Search, Clock, Database } from "lucide-react";

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

    const categories = [
        "Semua",
        "Data Analysis",
        "Data Science",
        "Machine Learning",
    ];
    const levels = ["Semua", "Pemula", "Menengah", "Lanjutan"];

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
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Pilih Latihan Sesuai Levelmu!
                    </h2>
                    <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                        Dari yang baru kenal data sampai yang udah siap project,
                        semua bisa latihan di sini. Tinggal pilih tantangan yang
                        cocok, terus gaslin!
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
                                    placeholder="Cari latihan-mu di sini"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Level Filter Dropdown */}
                        <div className="md:w-48">
                            <Select defaultValue="Semua">
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
                        {categories.map((category, index) => (
                            <Button
                                key={category}
                                variant={index === 0 ? "default" : "outline"}
                                className={`px-6 py-2 rounded-md ${
                                    index === 0
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Practice Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {practices.map((practice) => (
                        <Card
                            key={practice.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow py-0 gap-0"
                        >
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

                            <CardContent className="p-6">
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

                                {/* Action Buttons */}
                                <div className="space-y-3">
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
                    ))}
                </div>
            </div>
        </section>
    );
}
