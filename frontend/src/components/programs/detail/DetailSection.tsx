import Image from "next/image";

export default function DetailSection() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-4 mb-8 px-4 max-w-7xl mx-auto">
            {/* Stat 1 - Duration */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-sm p-6 w-full">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/assets/programsPage/calendar.svg" alt="calendar" width={34} height={34} />
                </div>
                <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        12
                    </div>
                    <div className="text-sm text-gray-600 leading-tight">
                        Minggu belajar intensif dan
                        <br />
                        seru bersama mentor
                    </div>
                </div>
            </div>

            {/* Stat 2 - Mentoring */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-sm p-6 w-full">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/assets/programsPage/lesson.svg" alt="lesson" width={34} height={34} />
                </div>
                <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        1 on 1
                    </div>
                    <div className="text-sm text-gray-600 leading-tight">
                        Mentoring setiap minggu +
                        <br />
                        sesi review project
                    </div>
                </div>
            </div>

            {/* Stat 3 - Projects */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-sm p-6 w-full">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/assets/programsPage/diagram.svg" alt="diagram" width={34} height={34} />
                </div>
                <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        3+
                    </div>
                    <div className="text-sm text-gray-600 leading-tight">
                        Real case projects sebagai
                        <br />
                        portofolio yang relevan
                    </div>
                </div>
            </div>
        </div>
    );
}
