import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import vector from "@/assets/mentoringPage/vectorHeroSection.svg";
import ilustration from "@/assets/mentoringPage/mentoringIlust.svg";
import ask from "@/assets/mentoringPage/ask.svg";
import chat from "@/assets/mentoringPage/chat.svg";
import book from "@/assets/mentoringPage/book.svg";
import gps from "@/assets/mentoringPage/gps.svg";

export default function Mentoring() {
    // Sample mentor data - in real app this would come from props or API
    const mentors = [
        {
            id: 1,
            name: "Mentor 1",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        },
        {
            id: 2,
            name: "Mentor 2",
            image: "https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?w=100&h=100&fit=crop&crop=face",
        },
        {
            id: 3,
            name: "Mentor 3",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        },
        {
            id: 4,
            name: "Mentor 4",
            image: "https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?w=100&h=100&fit=crop&crop=face",
        },
        {
            id: 5,
            name: "Mentor 5",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        },
    ];

    return (
        <>
            <section className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
                <Image
                    src={vector}
                    alt="vector background"
                    fill
                    className="object-cover object-center z-0"
                    priority
                />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left side - Illustration */}
                        <div className="relative flex items-center justify-center">
                            <Image
                                src={ilustration}
                                alt="ilustration"
                                className="w-full h-full"
                            />
                        </div>

                        {/* Right side - Content */}
                        <div className="space-y-6 order-1 lg:order-2">
                            {/* Main Heading */}
                            <div className="space-y-2">
                                <h1 className="text-xl md:text-2xl lg:text-4xl font-semibold text-gray-900 leading-tight">
                                    Bimbingan Langsung dari <br /> Praktisi Data
                                </h1>

                                <p className="text-xl font-semibold leading-relaxed max-w-2xl">
                                    #MentoringBiarNggakError
                                </p>

                                {/* Description */}
                                <p className="max-sm:text-sm text-md text-gray-600 leading-relaxed max-w-2xl">
                                    Belajar data tuh gak harus sendirian. Di
                                    TemuDataku, kamu bisa dapat insight langsung
                                    dari praktisi yang udah terjun di dunia data
                                    analyst, machine learning, dan AI industry.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-6 text-base font-medium shadow-lg hover:cursor-pointer"
                                >
                                    Pilihan Mentoring
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-6 text-base font-medium hover:cursor-pointer"
                                >
                                    Konsultasi Gratis
                                </Button>
                            </div>

                            {/* Mentor Avatars and Stats */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    {/* Avatar Stack */}
                                    <div className="flex gap-2">
                                        {mentors.map((mentor, index) => (
                                            <Avatar
                                                key={mentor.id}
                                                className="w-12 h-12 shadow-md"
                                            >
                                                <AvatarImage
                                                    src={mentor.image}
                                                    alt={mentor.name}
                                                />
                                                <AvatarFallback className="bg-emerald-200 text-emerald-700 font-medium">
                                                    M{index + 1}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>

                                    {/* Count */}
                                    <div className="text-gray-600 font-medium">
                                        + 95 mentee telah mendaftar
                                    </div>
                                </div>

                                {/* Testimonial Link */}
                                <div className="pt-2">
                                    <button className="text-secondary-text-color hover:text-emerald-700 font-medium underline underline-offset-4 transition-colors">
                                        Apa yang mereka katakan?
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Mentor at TemuDataku Section */}
            <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="mb-12 flex gap-2">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                            Kenapa Harus Ikut Mentoring di TemuDataku?
                        </h2>
                        <p className="text-md text-gray-600 max-w-xl mx-auto text-end">
                            Karena belajar data sendirian tuh bikin
                            overthinking. Di sini, kamu bisa dapat arahan
                            langsung dari praktisi yang udah pernah ngerasain
                            struggle-nya. Lebih cepat, lebih jelas, dan pastinya
                            gak se-error itu.
                        </p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-2 gap-2 lg:gap-6">
                        {/* Benefit 1 */}
                        <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Image
                                        src={ask}
                                        alt="ask"
                                        className="w-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Tanya Apa Aja, Bebas Judgment
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Gak ngerti SQL? Bingung project portofolio?
                                    Pengen curhat soal gagal interview? Boleh
                                    banget. Mentor di sini no-judge zone 100%.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 2 */}
                        <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Image
                                        src={book}
                                        alt="book"
                                        className="w-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Portofolio Gak Cuma Cakep, Tapi Powerful
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Mentor bantuin review, benerin, bahkan kasih
                                    ide project biar portofoliomu bisa
                                    &ldquo;speak louder&rdquo; ke recruiter.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 3 */}
                        <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Image
                                        src={chat}
                                        alt="chat"
                                        className="w-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    1-on-1 Session, Biar Kamu Fokus Sama Dirimu
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Gak perlu rebutan mic atau malu ditanya.
                                    Kamu dapat sesi pribadi, jadi bisa all out
                                    tanya dan eksplor skill-mu sendiri.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 4 */}
                        <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Image
                                        src={gps}
                                        alt="gps"
                                        className="w-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Mentor = Support System + Career GPS
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Mentor bukan cuma ngarahin, tapi juga
                                    nyemangatin. Karena belajar data itu emang
                                    berat, tapi gak harus kamu lewatin sendiri.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
