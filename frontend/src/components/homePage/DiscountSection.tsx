/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import Image from "next/image";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

// Sample project data
const discounts = [
  {
    id: 1,
    amount: "20",
    description: "Lorem ipsum dolor sit amet consectetur. A egestas quam tincidunt proin egestas. Convallis amet arcu molestie curabitur. Metus nibh et eu mauris. Cursus massa arcu sed in nascetur elit tincidunt in diam.",
    image: "/images/project-laptop-1.jpg", // Placeholder image
  },
  {
    id: 2,
    amount: "30",
    description: "Lorem ipsum dolor sit amet consectetur. A egestas quam tincidunt proin egestas. Convallis amet arcu molestie curabitur. Metus nibh et eu mauris. Cursus massa arcu sed in nascetur elit tincidunt in diam.",
    image: "/images/project-laptop-2.jpg", // Placeholder image
  },
  {
    id: 3,
    amount: "50",
    description: "Lorem ipsum dolor sit amet consectetur. A egestas quam tincidunt proin egestas. Convallis amet arcu molestie curabitur. Metus nibh et eu mauris. Cursus massa arcu sed in nascetur elit tincidunt in diam.",
    image: "/images/project-laptop-3.jpg", // Placeholder image
  },
];

export default function DiscountSection() {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carousel */}
        <div className="relative">
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
            <CarouselContent className="py-2 md:py-5 -ml-2 md:-ml-4">
              {discounts.map((project) => (
                <CarouselItem key={project.id} className="pl-2 md:pl-4 basis-[85%]  sm:basis-[75%] md:basis-1/2 lg:basis-[75%] ">
                  <div className="bg-gradient-to-r from-[#243A77] to-[#436CDD] rounded-lg md:rounded-xl overflow-hidden h-full flex flex-col min-h-[300px] md:min-h-[100px] lg:min-h-[80px]">
                    <div className="grid lg:grid-cols-3 items-center h-full p-6 lg:px-6 lg:py-0">
                      {/* Left side - Person Image */}
                      <div className="hidden lg:flex justify-start order-2 lg:order-1 w-fit col-span-1">
                        <Image src="/assets/homePage/personDiscount.svg" alt="Professional woman" width={250} height={250} className="h-auto hidden lg:block lg:max-h-[250px] object-contain" />
                      </div>

                      {/* Right side - Content */}
                      <div className="text-white space-y-4 order-1 md:order-2 lg:col-span-2">
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold">Diskon {project.amount}%</h3>
                        <p className="text-blue-100 text-sm md:text-base leading-relaxed">{project.description}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows - Hidden on mobile, shown on tablet+ */}
            <CarouselPrevious className="hidden md:flex left-2 lg:-left-12 bg-white border-emerald-500 text-emerald-500  hover:bg-gray-50 hover:text-emerald-600 shadow-md" />
            <CarouselNext className="hidden md:flex right-2 lg:-right-12 bg-white border-emerald-500 text-emerald-500 hover:bg-gray-50  hover:text-emerald-600 shadow-md" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
