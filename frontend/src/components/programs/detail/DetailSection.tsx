"use client";

import Image from "next/image";

export default function DetailSection({ data }: { data: any }) {
  const totalWeeks = data?.totalWeeks ?? 0;
  const totalProjects = data?.totalProjects ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto px-6 mb-12">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Stat 1 - Duration */}
        <div className="flex items-center gap-10 bg-gray-50 rounded-xl p-8 w-full shadow-sm">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <Image
              src="/assets/programsPage/calendar.svg"
              alt="calendar"
              width={38}
              height={38}
            />
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {totalWeeks}
            </div>
            <div className="text-base text-gray-600 leading-snug">
              Minggu belajar intensif dan
              <br />
              seru bersama mentor
            </div>
          </div>
        </div>

        {/* Stat 2 - Mentoring */}
        <div className="flex items-center gap-10 bg-gray-50 rounded-xl p-8 w-full shadow-sm">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <Image
              src="/assets/programsPage/lesson.svg"
              alt="lesson"
              width={38}
              height={38}
            />
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">1 on 1</div>
            <div className="text-base text-gray-600 leading-snug">
              Mentoring setiap minggu +
              <br />
              sesi review project
            </div>
          </div>
        </div>

        {/* Stat 3 - Projects */}
        <div className="flex items-center gap-10 bg-gray-50 rounded-xl p-8 w-full shadow-sm">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <Image
              src="/assets/programsPage/diagram.svg"
              alt="diagram"
              width={38}
              height={38}
            />
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {totalProjects}+
            </div>
            <div className="text-base text-gray-600 leading-snug">
              Real case projects sebagai
              <br />
              portofolio yang relevan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
