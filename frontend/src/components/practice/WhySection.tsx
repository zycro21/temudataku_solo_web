import Image from "next/image";
import case1 from "@/assets/practicePage/case.svg";
import db from "@/assets/practicePage/db.svg";
import stair from "@/assets/practicePage/stair.svg";
import work from "@/assets/practicePage/work.svg";

export default function WhySection() {
  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="mb-12 flex gap-2">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                            Kenapa Harus Ikut Latihan Bareng TemuDataku?
                        </h2>
                        <p className="text-sm sm:text-md text-gray-600 max-w-xl mx-auto text-end">
                            Latihan di TemuDataku dirancang bukan buat sekadar bisa, tapi biar kamu siap. Mulai dari
                            dataset real, challenge yang menantang, sampai simulasi dunia kerja—semuanya disiapin
                            biar kamu gak kaget pas terjun langsung.
                        </p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-2 gap-2 lg:gap-6">
                        {/* Benefit 1 */}
                        <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Image
                                        src={stair}
                                        alt="stair"
                                        className="w-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Tantangan Step-by-Step
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Dari basic sampai advance, kamu bakal ngelewatin latihan bertahap
                                    yang bikin belajar gak kerasa berat.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 2 */}
                        <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Image
                                        src={db}
                                        alt="db"
                                        className="w-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Data Nyata, Skill Nyata
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Latihan pakai dataset real yang relevan sama dunia kerja, bukan data
                                    yang asal-asalan.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 3 */}
                        <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Image
                                        src={work}
                                        alt="work"
                                        className="w-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Simulasi Dunia Kerja
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Ngerjain soal latihan kayak kamu lagi handle project beneran—biar gak
                                    kaget pas disuruh bikin insight di kantor.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 4 */}
                        <div className="flex items-start gap-4 bg-gray-50 rounded-lg px-6 py-8 flex-col">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Image
                                        src={case1}
                                        alt="case1"
                                        className="w-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Siap Buat Tes Rekrutmen
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Format latihan disesuain sama real-case interview & test dari
                                    perusahaan tech/data. Jadi gak cuma belajar, tapi juga siap tempur!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
    );
}