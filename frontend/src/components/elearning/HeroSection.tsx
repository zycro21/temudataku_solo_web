import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

export default function HeroSection() {
  // Sample mentor data - in real app this would come from props or API
  const mentors = [
    {
      id: 1,
      name: "Mentor 1",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Mentor 2",
      image:
        "https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Mentor 3",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Mentor 4",
      image:
        "https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Mentor 5",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  ];
  return (
    <section className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <Image
        src="/assets/mentoringPage/vectorHeroSection.svg"
        alt="vector background"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center">
            <Image
              src="/assets/practicePage/practiceGroup.svg"
              alt="ilustration"
              width={600}
              height={400}
              className="w-full h-full"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                Upgrade Pengetahuan Anda,
                <br /> Kapan Saja, Dimana Saja.
              </h1>

              <p className="text-xl font-semibold leading-relaxed max-w-2xl">
                #LangkahKecilHasilBesar
              </p>

              {/* Description */}
              <p className="max-sm:text-sm text-md text-gray-600 leading-relaxed max-w-2xl">
                Skill itu tumbuh kalau dipraktikkan. Yuk, tonton video
                pembelajaran dan coba sendiri langkah-langkahnya!
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 mt-8">
              <Button
                size="lg"
                className="
      bg-emerald-600 
      hover:bg-emerald-700 
      text-white 
      px-6 py-6 
      text-base 
      font-semibold 
      shadow-lg 
      transition-all duration-300 
      hover:scale-105 
      hover:shadow-2xl
      hover:cursor-pointer
    "
              >
                Pilihan E-Learning
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="
      border-emerald-600 
      text-emerald-600 
      hover:bg-emerald-50 
      px-6 py-6 
      text-base 
      font-medium 
      transition-all duration-300
      hover:cursor-pointer
    "
              >
                Konsultasi Gratis
              </Button>
            </div>

            {/* Mentor Avatars and Stats */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {/* Avatar Stack */}
                <div className="flex gap-2 flex-wrap">
                  {mentors.map((mentor, index) => (
                    <Avatar key={mentor.id} className="w-12 h-12 shadow-md">
                      <AvatarImage src={mentor.image} alt={mentor.name} />
                      <AvatarFallback className="bg-emerald-200 text-emerald-700 font-medium">
                        M{index + 1}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>

                {/* Count */}
                <div className="text-gray-500 font-medium transition-all duration-300 hover:text-gray-700">
                  + 112 mentee telah mendaftar
                </div>
              </div>

              {/* Testimonial Link */}
              <div className="pt-2">
                <button
                  className="
      text-gray-500 
      font-medium 
      underline 
      underline-offset-4 
      transition-all duration-300
      hover:text-gray-700
      hover:underline-offset-8
    "
                >
                  Apa yang mereka katakan?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
