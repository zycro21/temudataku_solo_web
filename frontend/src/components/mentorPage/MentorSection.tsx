/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Briefcase, Calendar, Code } from "lucide-react";
import React from "react";
import Image from "next/image";
import johnDoe from "@/assets/homePage/mentors/johnDoe.svg";
import jefri from "@/assets/homePage/mentors/jefri.svg";
import laura from "@/assets/homePage/mentors/laura.svg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

// Bagi mentor ke dalam grup isi 6
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const MentorSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const [selectedMentor, setSelectedMentor] = React.useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const mentors = [
    { id: 1, name: "John Doe", role: "Data Scientist di Lorem Ipsum", experience: "2 Tahun", skills: "Python, Excel, BI, SQL", image: johnDoe },
    { id: 2, name: "Jefri Nichol", role: "Data Scientist di Lorem Ipsum", experience: "2 Tahun", skills: "Python, Excel, BI, SQL", image: jefri },
    { id: 3, name: "Laura", role: "Data Scientist di Lorem Ipsum", experience: "3 Tahun", skills: "Python, Excel, BI, SQL", image: laura },
    { id: 4, name: "Mentor 4", role: "Data Engineer", experience: "4 Tahun", skills: "Python, Spark", image: johnDoe },
    { id: 5, name: "Mentor 5", role: "ML Engineer", experience: "2 Tahun", skills: "TensorFlow, Python", image: jefri },
    { id: 6, name: "Mentor 6", role: "Data Analyst", experience: "3 Tahun", skills: "SQL, Power BI", image: laura },
    { id: 7, name: "Mentor 7", role: "AI Specialist", experience: "5 Tahun", skills: "NLP, LLM", image: johnDoe },
    { id: 8, name: "Mentor 8", role: "Statistician", experience: "6 Tahun", skills: "R, Python", image: jefri },
  ];

  const mentorGroups = chunkArray(mentors, 6);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className="py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm font-semibold text-[#243A77] mb-2">Mentor</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Perkenalkan Mentor-Mentor
              <br />
              Berpengalaman Kami
            </h2>
          </div>
        </div>

        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: false,
          }}
        >
          <CarouselContent>
            {mentorGroups.map((group, groupIndex) => (
              <CarouselItem key={groupIndex}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-5">
                  {group.map((mentor) => (
                    <div key={mentor.id} className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                        <Image src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{mentor.name}</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            <span>{mentor.role}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{mentor.experience}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Code className="w-4 h-4" />
                            <span>{mentor.skills}</span>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => {
                                setSelectedMentor(mentor);
                                setIsDialogOpen(true);
                              }}
                              className="text-[#0CA678] font-medium text-sm hover:underline hover:cursor-pointer"
                            >
                              Lihat Profil Lengkap
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogDescription>
                                <div className="mt-4">
                                  <Image src={selectedMentor?.image} alt={selectedMentor?.name} className="w-full h-60 object-cover rounded-t-md mb-4" />
                                  <div className="mb-4">
                                    <span className="text-xl font-bold text-gray-900 mb-2">{selectedMentor?.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="w-4 h-4" />
                                    <span>{selectedMentor?.role}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm ">
                                    <Calendar className="w-4 h-4" />
                                    <span>{selectedMentor?.experience}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm ">
                                    <Code className="w-4 h-4" />
                                    <span>{selectedMentor?.skills}</span>
                                  </div>
                                </div>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="hidden md:flex gap-2 mt-6 justify-center">
            <CarouselPrevious className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 shadow-md w-10 h-10" />
            <CarouselNext className="bg-[#0CA678] hover:bg-[#08916C] text-white shadow-md w-10 h-10" />
          </div>
        </Carousel>

        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: count }).map((_, index) => (
            <button key={index} onClick={() => api?.scrollTo(index)} className={`w-3 h-3 rounded-full transition-colors ${index + 1 === current ? "bg-emerald-500" : "bg-gray-300 hover:bg-gray-400"}`} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorSection;
