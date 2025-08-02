import Image from "next/image";
import ask from "@/assets/mentoringPage/ask.svg";
import chat from "@/assets/mentoringPage/chat.svg";
import book from "@/assets/mentoringPage/book.svg";
import gps from "@/assets/mentoringPage/gps.svg";

export default function WhySection() {
  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="mb-12 flex gap-2">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                            Kenapa Harus Ikut Mentoring di TemuDataku?
                        </h2>
                        <p className="text-sm sm:text-md text-gray-600 max-w-xl mx-auto text-end">
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
    );
}