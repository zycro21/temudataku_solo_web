import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Search, Calendar } from "lucide-react";

export default function PracticeSelection() {
    // Sample bootcamp data - in real app this would come from props or API
    const bootcamps = [
        {
            id: 1,
            title: "Bootcamp - Data Science",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
            quota: "<10 Kuota Tersisa",
            level: "Level 2 - Skill Booster: Saatnya Upgrade Skill!",
            type: "Bootcamp",
            skill: "Data Science",
            startDate: "15 Maret 2025",
            endDate: "17 Maret 2025",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "python", "powerbi", "mysql"],
        },
        {
            id: 2,
            title: "Short Class - Data Science",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
            quota: "<10 Kuota Tersisa",
            level: "Level 2 - Skill Booster: Saatnya Upgrade Skill!",
            type: "Short Class",
            skill: "Data Science",
            startDate: "15 Maret 2025",
            endDate: "17 Maret 2025",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "python", "powerbi", "mysql"],
        },
        {
            id: 3,
            title: "Live Class - Data Analysis",
            image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
            quota: "<10 Kuota Tersisa",
            level: "Level 2 - Skill Booster: Saatnya Upgrade Skill!",
            type: "Live Class",
            skill: "Data Analysis",
            startDate: "15 Maret 2025",
            endDate: "17 Maret 2025",
            originalPrice: "Rp 550.000",
            currentPrice: "Rp 500.000",
            tools: ["excel", "python", "powerbi", "mysql"],
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
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Pilih Bootcamp yang Pas Untuk Kamu!
                    </h2>
                    <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                        Nggak semua orang punya cara belajar yang sama, makanya
                        TemuDataku nyediain pilihan bootcamp yang bisa kamu
                        sesuaikan sama kebutuhan, waktu, dan goals kamu. Yuk,
                        cari yang paling pas buat perjalanan belajarmu!
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="mb-8 space-y-8">
                    {/* Search Bar and Level Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar - Full width */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari bootcamp-mu di sini"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Level Filter Dropdown */}
                        <div className="md:w-48">
                            <Select defaultValue="Semua">
                                <SelectTrigger className="w-full !h-full px-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 bg-white">
                                    <SelectValue placeholder="Semua" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Semua">Semua</SelectItem>
                                    <SelectItem value="Bootcamp">
                                        Bootcamp
                                    </SelectItem>
                                    <SelectItem value="Short Class">
                                        Short Class
                                    </SelectItem>
                                    <SelectItem value="Live Class">
                                        Live Class
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Jenis Program Filter */}
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center text-gray-700 font-medium">
                            Jenis Program:
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Semua",
                                "Bootcamp",
                                "Short Class",
                                "Live Class",
                            ].map((program, index) => (
                                <Button
                                    key={program}
                                    variant={
                                        index === 0 ? "default" : "outline"
                                    }
                                    className={`px-6 py-2 rounded-md ${
                                        index === 0
                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {program}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Jenis Keterampilan Filter */}
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center text-gray-700 font-medium">
                            Jenis Keterampilan:
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Semua",
                                "Data Analysis",
                                "Data Science",
                                "Machine Learning",
                            ].map((skill, index) => (
                                <Button
                                    key={skill}
                                    variant={
                                        index === 0 ? "default" : "outline"
                                    }
                                    className={`px-6 py-2 rounded-md ${
                                        index === 0
                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {skill}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bootcamp Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bootcamps.map((bootcamp) => (
                        <Card
                            key={bootcamp.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 rounded-lg p-0 gap-0"
                        >
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

                            <CardContent className="p-6">
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
                                    <span>
                                        {bootcamp.startDate} -{" "}
                                        {bootcamp.endDate}
                                    </span>
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

                                {/* Action Buttons */}
                                <div className="space-y-3">
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
                    ))}
                </div>
            </div>
        </section>
    );
}
