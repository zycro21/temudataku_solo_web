"use client";

import Image from "next/image";

export default function DetailSection({ data }: { data: any }) {
  const totalWeeks = data?.totalWeeks ?? 0;
  const totalProjects = data?.totalProjects ?? 0;

  return (
    <div className="max-w-[1100px] mx-auto px-4 mb-10">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Stat 1 - Duration */}
        <div
          className="group flex items-center gap-6 bg-gray-50 rounded-lg p-5 w-full shadow-sm 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white"
        >
          <div
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
        transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          >
            <Image
              src="/assets/programsPage/calendar.svg"
              alt="calendar"
              width={30}
              height={30}
            />
          </div>

          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {totalWeeks}
            </div>
            <div className="text-sm text-gray-600 leading-snug">
              Minggu belajar intensif dan
              <br />
              seru bersama mentor
            </div>
          </div>
        </div>

        {/* Stat 2 - Mentoring */}
        <div
          className="group flex items-center gap-6 bg-gray-50 rounded-lg p-5 w-full shadow-sm 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white"
        >
          <div
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
        transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          >
            <Image
              src="/assets/programsPage/lesson.svg"
              alt="lesson"
              width={30}
              height={30}
            />
          </div>

          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">Live Session</div>
            <div className="text-sm text-gray-600 leading-snug">
              Dengan Mentor
              <br />
              Setiap Pertemuan
            </div>
          </div>
        </div>

        {/* Stat 3 - Projects */}
        <div
          className="group flex items-center gap-6 bg-gray-50 rounded-lg p-5 w-full shadow-sm 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white"
        >
          <div
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
        transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          >
            <Image
              src="/assets/programsPage/diagram.svg"
              alt="diagram"
              width={30}
              height={30}
            />
          </div>

          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {totalProjects}+
            </div>
            <div className="text-sm text-gray-600 leading-snug">
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
