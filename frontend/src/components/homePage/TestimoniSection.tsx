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

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const testimonials = [
    {
      id: 1,
      name: "Hidieo Riz’n",
      status: "Fresh Graduate",
      testimonial:
        "Ikut Short Class All You Need to Know for Data Scientist di TemuDataku daging banget dan materinya mudah dipahami.",
    },
    {
      id: 2,
      name: "Riani Purnamasari",
      status: "Career Switcher",
      testimonial:
        "Keren banget programnya, materinya daging dan penjelasannya disusun sistematis sehingga mudah dipahami bahkan untuk level pemula seperti saya. Hands on nya dan project bermanfaat utk buat portofolio. Wajib ikutan lagi sih kalau ada program dari TemuDataku.",
    },
    {
      id: 3,
      name: "Ega Adit Laksono",
      status: "Mahasiswa",
      testimonial:
        "Pengalaman yang aku dapatkan sangat seru karena bisa tahu banyak hal terkait bagaimana caranya menjadi data scientist lewat pemrograman python dan diajarkan beberapa hal yang belum pernah kutemui bersama TemuDataku.",
    },
    {
      id: 4,
      name: "Johan 2",
      status: "Mahasiswa",
      testimonial:
        "Lorem ipsum dolor sit amet consectetur. Elementum augue eget leo ut commodo morbi. Eget scelerisque aliquam turpis elementum in eu mattis posuere. Aliquam elit egestas est odio aenean mattis bibendum lorem.",
    },
  ];

  useEffect(() => {
    // cek apakah testimonial lebih panjang dari batas line-clamp (estimasi)
    testimonials.forEach((t) => {
      const el = testimonialRefs.current[t.id];
      if (el) {
        const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10);
        const maxHeight = lineHeight * 6; // line-clamp-6
        setShowButton((prev) => ({
          ...prev,
          [t.id]: el.scrollHeight > maxHeight,
        }));
      }
    });
  }, [testimonialRefs.current]);

  return (
    <section className="py-16 bg-[#E5E7EB] relative overflow-hidden">
      <div className="container mx-auto px-8 md:px-[100px] relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm font-semibold text-[#243A77] mb-2">
              Testimoni
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
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
          <CarouselContent className="py-6 md:py-8 px-0">
            {testimonials.map((person) => {
              const isExpanded = expanded[person.id] ?? false;
              const needsButton = showButton[person.id];

              return (
                <CarouselItem
                  key={person.id}
                  className="pl-2 md:pl-4 basis-[85%] sm:basis-[65%] md:basis-1/2 lg:basis-1/3"
                >
                  <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col p-6">
                    <p
                      ref={(el) => {
                        testimonialRefs.current[person.id] = el;
                      }}
                      className={`text-gray-700 text-lg leading-relaxed mb-4 ${
                        !isExpanded ? "line-clamp-6" : ""
                      }`}
                    >
                      &ldquo;{person.testimonial}&rdquo;
                    </p>
                    {needsButton && (
                      <button
                        className="text-[#0CA678] font-medium text-sm mb-4 self-start hover:underline"
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
                    <div className="mt-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600">{person.status}</p>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <div className="absolute -top-16 right-0 md:flex gap-2 z-10">
            <CarouselPrevious className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 shadow-md w-10 h-10" />
            <CarouselNext className="bg-[#0CA678] hover:bg-[#08916C] text-white shadow-md w-10 h-10" />
          </div>
        </Carousel>

        <div className="flex justify-center mt-4 md:mt-6 space-x-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors touch-manipulation ${
                index + 1 === current
                  ? "bg-emerald-500"
                  : "bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
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
