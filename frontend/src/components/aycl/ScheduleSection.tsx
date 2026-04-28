import { AyclSchedule, AyclSection } from "@/app/aycl/AyclClient";

interface ScheduleSectionProps {
  title: string;
  schedules: AyclSchedule[];
  challenge: AyclSection | null;
}

// Helper: parse tanggal ISO ke { date, month, year }
function parseScheduleDate(isoDate: string) {
  const d = new Date(isoDate);
  const date = d.getDate().toString();
  const year = d.getFullYear().toString();
  const month = d.toLocaleDateString("id-ID", { month: "long" });
  return { date, month, year };
}

export default function ScheduleSection({
  title,
  schedules,
  challenge,
}: ScheduleSectionProps) {
  const challenges: string[] = challenge?.content?.items ?? [];

  return (
    <section className="py-14 sm:py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-5xl mx-auto space-y-14 sm:space-y-20">
        {/* ================= JADWAL ================= */}
        {schedules.length > 0 && (
          <div>
            <p className="text-emerald-600 font-medium text-sm uppercase tracking-widest mb-2 text-center">
              Pelaksanaan {title}
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
              Jadwal {title}
            </h2>

            <p className="text-gray-500 font-medium text-xs sm:text-sm mb-8 sm:mb-10 leading-relaxed text-center max-w-2xl mx-auto">
              {title} akan dilaksanakan secara{" "}
              <strong className="text-gray-700">
                live session melalui Google Meet
              </strong>
              , sehingga peserta bisa belajar langsung, bertanya, dan berdiskusi
              selama kelas berlangsung.
            </p>

            {/* Timeline */}
            <div className="space-y-8 sm:space-y-12">
              {Array.from({ length: Math.ceil(schedules.length / 4) }).map(
                (_, rowIndex) => {
                  const rowItems = schedules.slice(
                    rowIndex * 4,
                    rowIndex * 4 + 4,
                  );

                  return (
                    <div
                      key={rowIndex}
                      className="flex flex-wrap justify-center gap-6 sm:gap-8 relative"
                    >
                      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-200 sm:hidden"></div>
                      {rowItems.map((s, i) => {
                        const globalIndex = rowIndex * 4 + i;
                        const isLastInRow = i === rowItems.length - 1;

                        const { date, month, year } = parseScheduleDate(s.date);

                        return (
                          <div
                            key={globalIndex}
                            className="flex flex-col sm:flex-row items-center w-full sm:w-auto justify-center relative"
                          >
                            {/* ITEM */}
                            <div className="text-center relative">
                              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full mx-auto mb-3 sm:mb-4 z-10"></div>

                              <div className="bg-white border border-emerald-100 rounded-2xl px-6 sm:px-8 py-5 sm:py-6 shadow-sm hover:shadow-md transition min-w-[120px] sm:min-w-[140px]">
                                <p className="text-4xl font-bold text-emerald-600 leading-none">
                                  {date}
                                </p>
                                <p className="text-gray-600 font-semibold text-base mt-1">
                                  {month}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                  {year}
                                </p>
                              </div>
                            </div>

                            {/* GARIS */}
                            {!isLastInRow && (
                              <div className="hidden sm:block w-16 h-[2px] bg-emerald-200 mx-3"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* ================= TANTANGAN ================= */}
        {challenges.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-sm">
              <p className="text-emerald-600 font-medium text-xs sm:text-sm uppercase tracking-widest mb-1 sm:mb-2 text-center">
                Relatable?
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Biasanya Tantangannya Seperti Ini
              </h2>

              <ul className="space-y-4">
                {challenges.map((c, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      !
                    </span>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">
                      {c}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-gray-500 font-medium text-sm leading-relaxed border-l-4 border-emerald-400 pl-4">
                Program ini dibuat supaya proses belajarmu lebih terstruktur,
                lebih jelas, dan tetap bisa diikuti karena materi dan rekaman
                kelas dapat diakses kembali.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
