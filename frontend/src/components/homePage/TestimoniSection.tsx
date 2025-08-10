import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";

import React from "react";

const TestimonialSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
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
      name: "Johan",
      status: "Mahasiswa",
      image: "/assets/homePage/testimoni/johan.svg",
      testimonial: "Lorem ipsum dolor sit amet consectetur. Elementum augue eget leo ut commodo morbi. Eget scelerisque aliquam turpis elementum in eu mattis posuere. Aliquam elit egestas est odio aenean mattis bibendum lorem.",
    },
    {
      id: 2,
      name: "Mei",
      status: "Mahasiswa",
      image: "/assets/homePage/testimoni/mei.svg",
      testimonial: "Lorem ipsum dolor sit amet consectetur. Elementum augue eget leo ut commodo morbi. Eget scelerisque aliquam turpis elementum in eu mattis posuere. Aliquam elit egestas est odio aenean mattis bibendum lorem.",
    },
    {
      id: 3,
      name: "Mei",
      status: "Mahasiswa",
      image: "/assets/homePage/testimoni/mei.svg",
      testimonial: "Lorem ipsum dolor sit amet consectetur. Elementum augue eget leo ut commodo morbi. Eget scelerisque aliquam turpis elementum in eu mattis posuere. Aliquam elit egestas est odio aenean mattis bibendum lorem.",
    },
    {
      id: 4,
      name: "johan 2",
      status: "Mahasiswa",
      image: "/assets/homePage/testimoni/johan.svg",
      testimonial: "Lorem ipsum dolor sit amet consectetur. Elementum augue eget leo ut commodo morbi. Eget scelerisque aliquam turpis elementum in eu mattis posuere. Aliquam elit egestas est odio aenean mattis bibendum lorem.",
    },
  ];

  return (
    <section className="py-16 bg-[#E5E7EB] relative overflow-hidden">
      <div className="container mx-auto px-8 md:px-[100px] relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm font-semibold text-[#243A77] mb-2">Testimoni</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Apa Kata Mereka?</h2>
          </div>
          <div className="hidden md:flex gap-2"></div>
        </div>
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: false,
            skipSnaps: false,
            dragFree: true,
          }}
        >
          <CarouselContent className="py-2 md:py-5 -ml-2 md:-ml-4 px-4">
            {testimonials.map((person) => (
              <CarouselItem key={person.id} className="pl-2 md:pl-4 basis-[85%] sm:basis-[65%] md:basis-1/2 lg:basis-1/3">
                <div key={person.id} className="basis-[95%] sm:basis-[85%] md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col justify-between p-6">
                    <p className="text-gray-700 text-lg leading-relaxed mb-6 line-clamp-6">{person.testimonial}</p>
                    <div className="flex items-center gap-3">
                      <Image src={person.image} alt={person.name} width={40} height={40} className="w-10 h-10 object-cover rounded-full" />
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{person.name}</h3>
                        <p className="text-sm text-gray-600">{person.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 shadow-md w-10 h-10" />
          <CarouselNext className="bg-[#0CA678] hover:bg-[#08916C] text-white shadow-md w-10 h-10" />
        </Carousel>
        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 md:mt-6 space-x-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors touch-manipulation ${index + 1 === current ? "bg-emerald-500" : "bg-gray-300 hover:bg-gray-400 active:bg-gray-500"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
