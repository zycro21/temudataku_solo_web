import Image from "next/image";

export default function WhySection() {
    return (
        <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="mb-12 flex gap-2">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        Kenapa Harus Ikut Bootcamp di TemuDataku?
                    </h2>
                    <p className="text-sm sm:text-md text-gray-600 max-w-xl mx-auto text-end">
                        Bootcamp ini nggak cuma ngasih teori, tapi juga
                        pengalaman belajar yang real dan relevan. Kamu bakal
                        dapet akses ke mentor kece, materi yang udah dikurasi,
                        project beneran, dan pastinya komunitas seru buat tumbuh
                        bareng!
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 gap-2 lg:gap-6">
                    {/* Benefit 1 */}
                    <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <Image
                                    src={"/assets/mentoringPage/ask.svg"}
                                    alt="Ask questions icon"
                                    width={36}
                                    height={36}
                                    className="w-9 h-9"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Belajar Langsung Bareng Mentor
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Dapet insight & feedback langsung dari praktisi
                                yang udah berpengalaman di dunia data.
                            </p>
                        </div>
                    </div>

                    {/* Benefit 2 */}
                    <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <Image
                                    src={"/assets/programsPage/slides.svg"}
                                    alt="slides icon"
                                    width={36}
                                    height={36}
                                    className="w-9 h-9"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Project Beneran, Bukan Cuma Teori
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Langsung praktik ngerjain studi kasus biar
                                portofolio kamu makin stand out.
                            </p>
                        </div>
                    </div>

                    {/* Benefit 3 */}
                    <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <Image
                                    src={"/assets/mentoringPage/book.svg"}
                                    alt="Book icon"
                                    width={36}
                                    height={36}
                                    className="w-9 h-9"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Materi Terstruktur & Nggak Ngebosenim
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Disusun step-by-step biar kamu nggak bingung,
                                cocok buat pemula sampai yang mau leveling up.
                            </p>
                        </div>
                    </div>

                    {/* Benefit 4 */}
                    <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <Image
                                    src={"/assets/programsPage/community.svg"}
                                    alt="community icon"
                                    width={36}
                                    height={36}
                                    className="w-9 h-9"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Komunitas Supportive Buat Tumbuh Bareng
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Nggak belajar sendirian! Ada teman diskusi,
                                semangat bareng, dan networking juga.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
