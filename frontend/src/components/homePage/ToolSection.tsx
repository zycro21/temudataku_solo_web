"use client";
import Image from "next/image";

// Tool logos from public assets

const tools = [
  {
    id: 1,
    name: "TensorFlow",
    logo: "/assets/homePage/toolSection/tensorflow.svg",
  },
  {
    id: 2,
    name: "NumPy",
    logo: "/assets/homePage/toolSection/numphy.svg",
  },
  {
    id: 3,
    name: "Pandas",
    logo: "/assets/homePage/toolSection/pandas.svg",
  },
  {
    id: 4,
    name: "Scikit-learn",
    logo: "/assets/homePage/toolSection/sckitlearn.svg",
  },
  {
    id: 5,
    name: "Seaborn",
    logo: "/assets/homePage/toolSection/seaborn.svg",
  },
];

export default function ToolsSection() {
  // Duplicate array to simulate infinite scroll
  const duplicatedTools = [...tools, ...tools];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-8 md:px-[100px]">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#243A77] mb-2">Tools</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Kuasai Tools di bidang
            <br />
            Data Science
          </h2>
        </div>

        {/* Infinite Scroll Container */}
        <div className="relative">
          <div className="scroll-wrapper overflow-hidden relative">
            <div className="flex scroll-track animate-scroll-left hover:pause-scroll">
              {duplicatedTools.map((tool, index) => (
                <div key={`${tool.id}-${index}`} className="flex-shrink-0 mx-8 flex items-center justify-center" style={{ minWidth: "100px" }}>
                  <Image src={tool.logo} alt={`${tool.name} logo`} width={80} height={80} className="h-12 md:h-16 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Gradient overlays */}
          <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10"></div>
        </div>
      </div>

      {/* CSS animation via tailwind and custom class */}
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }

        .pause-scroll {
          animation-play-state: paused;
        }

        .scroll-wrapper:hover .scroll-track {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
