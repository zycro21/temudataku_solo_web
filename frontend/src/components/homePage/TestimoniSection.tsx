import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React, { useRef, useEffect, useState } from "react";

const TestimonialSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // State untuk track testimonial yang di-expand
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  // State untuk track apakah tombol load more perlu ditampilkan
  const [showButton, setShowButton] = useState<{ [key: number]: boolean }>({});

  const testimonialRefs = useRef<{
    [key: number]: HTMLParagraphElement | null;
  }>({});

  useEffect(() => {
    if (!api) return;

    setCount(testimonials.length);

    const updateCurrent = () => {
      const selected = api.selectedScrollSnap();
      setCurrent(selected + 1);
    };

    updateCurrent();
    api.on("select", updateCurrent);

    return () => {
      api.off("select", updateCurrent);
    };
  }, [api]);

  const testimonials = [
    {
      id: 1,
      name: "Hidieo Rizan",
      status: "Mahasiswa Teknik Informatika",
      testimonial:
        "Ikut Short Class 'All You Need to Know for Data Scientist' di TemuDataku daging banget! Materinya mudah dipahami dan sangat membantu saya memetakan skill yang harus dipelajari pertama kali.",
    },
    {
      id: 2,
      name: "Riani Purnamasari Eka Putri",
      status: "Career Switcher (Background Akuntansi)",
      testimonial:
        "Program Bootcamp-nya keren banget. Penjelasannya sistematis sehingga mudah dipahami bahkan untuk pemula seperti saya. Hands-on project-nya sangat bermanfaat untuk portofolio kerja. Wajib ikut lagi sih!",
    },
    {
      id: 3,
      name: "Ega Adit Laksono",
      status: "Mahasiswa Sistem Informasi",
      testimonial:
        "Pengalaman belajar bareng TemuDataku seru sekali! Saya jadi tahu cara implementasi Python untuk Data Science dan diajarkan banyak hal teknis yang belum pernah saya dapatkan di kampus.",
    },
    {
      id: 4,
      name: "Setya Araryo Kalingga",
      status: "Mahasiswa Statistika",
      testimonial:
        "Sesi mentoring-nya sangat membantu saya memahami konsep machine learning yang sebelumnya terasa sulit. Sekarang saya lebih percaya diri mengerjakan project analisis data.",
    },
    {
      id: 5,
      name: "Siti Aminah Nurhayati",
      status: "Fresh Graduate",
      testimonial:
        "Group Mentoring-nya interaktif! Meskipun belajar bareng-bareng, tiap orang tetap dapat giliran untuk review code. Sangat efektif buat yang ingin belajar kolaborasi tim di GitHub.",
    },
    {
      id: 6,
      name: "Hendra Albert Kusuma",
      status: "Fresh Graduate",
      testimonial:
        "Materi visualisasi data di Bootcamp ini sangat mendalam. Tidak cuma belajar cara pakai tools-nya, tapi juga diajarkan storytelling agar insight mudah dipahami stakeholder.",
    },
    {
      id: 7,
      name: "Bagas Wiratama",
      status: "Mahasiswa Teknik Komputer",
      testimonial:
        "Mentoring privat di sini bener-bener membuka wawasan saya tentang deployment model dan praktik nyata di industri. Insight yang diberikan sangat aplikatif dan tidak hanya teori.",
    },
  ];

  useEffect(() => {
    const checkOverflow = () => {
      const updatedState: { [key: number]: boolean } = {};

      testimonials.forEach((t) => {
        const el = testimonialRefs.current[t.id];
        if (el) {
          const computed = window.getComputedStyle(el);
          const lineHeight = parseFloat(computed.lineHeight);
          const maxHeight = lineHeight * 5; // 🔥 kita pakai 5 baris sesuai requirement

          updatedState[t.id] = el.scrollHeight > maxHeight + 1;
        }
      });

      setShowButton(updatedState);
    };

    const timeout = setTimeout(checkOverflow, 100); // tunggu layout settle
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  return (
    <section className="py-12 mt-8 bg-[#E5E7EB] relative overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-5 lg:px-6 relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm font-semibold text-[#243A77] mb-2">
              Testimoni
            </p>
            <h2 className="text-[26px] md:text-[30px] font-bold text-gray-900">
              Apa Kata Mereka?
            </h2>
          </div>
          <div className="hidden md:flex gap-2"></div>
        </div>

        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: true,
          }}
        >
          <CarouselContent className="py-4 md:py-6 px-0">
            {testimonials.map((person) => {
              const isExpanded = expanded[person.id] ?? false;
              const needsButton = showButton[person.id];

              return (
                <CarouselItem
                  key={person.id}
                  className="pl-2 md:pl-3 basis-[85%] sm:basis-[65%] md:basis-1/2 lg:basis-1/3"
                >
                  <div className="bg-white rounded-md overflow-hidden h-full flex flex-col p-4">
                    {/* TEXT */}
                    <p
                      ref={(el) => {
                        testimonialRefs.current[person.id] = el;
                      }}
                      className={`text-gray-700 text-sm leading-relaxed mb-3 ${
                        !isExpanded ? "line-clamp-5" : ""
                      }`}
                    >
                      &ldquo;{person.testimonial}&rdquo;
                    </p>

                    {/* BUTTON */}
                    {needsButton && (
                      <button
                        className="text-[#0CA678] font-medium text-xs mb-3 self-start hover:underline"
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [person.id]: !prev[person.id],
                          }))
                        }
                      >
                        {isExpanded ? "Load Less" : "Load More"}
                      </button>
                    )}

                    {/* USER */}
                    <div className="mt-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                        {person.name}
                      </h3>
                      <p className="text-xs text-gray-600">{person.status}</p>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* NAV BUTTON (diperkecil & dirapetin) */}
          <div className="absolute -top-12 right-10 md:flex gap-1.5 z-10">
            <CarouselPrevious className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 shadow-sm w-9 h-9" />
            <CarouselNext className="bg-[#0CA678] hover:bg-[#08916C] text-white shadow-sm w-9 h-9" />
          </div>
        </Carousel>

        {/* DOTS */}
        <div className="flex justify-center mt-3 md:mt-5 space-x-1.5">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index + 1 === current
                  ? "bg-emerald-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
