import { AyclSection } from "@/app/aycl/AyclClient";

interface AboutSectionProps {
  title: string;
  programInfo: AyclSection | null;
}

export default function AboutSection({
  title,
  programInfo,
}: AboutSectionProps) {
  // Jika tidak ada section PROGRAM_INFO, section ini tidak dirender
  if (!programInfo) return null;

  const text: string = programInfo.content?.text ?? "";

  return (
    <section
      id="tentang"
      className="py-14 sm:py-20 px-4 bg-white relative overflow-hidden"
    >
      {/* subtle background decoration */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 sm:p-8 md:p-12 text-white shadow-lg text-center sm:text-left">
          {/* Label */}
          <p className="text-emerald-200 font-medium text-xs sm:text-sm uppercase tracking-widest mb-2 sm:mb-3">
            Ini Program Apa?
          </p>

          {/* Heading — title dari ayclbatch */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 leading-snug">
            <span className="bg-white/10 px-2 py-0.5 sm:py-1 rounded-md inline-block mb-1 sm:mb-0">
              {title}
            </span>{" "}
            adalah program belajar yang dirancang untuk membantu peserta
            memahami skill inti yang dibutuhkan di dunia kerja saat ini.
          </h2>

          {/* Description — text dari PROGRAM_INFO section */}
          {text && (
            <p className="text-emerald-100 font-medium text-sm sm:text-base leading-relaxed max-w-3xl mx-auto sm:mx-0">
              {text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
