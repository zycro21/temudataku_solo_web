import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Instagram, Linkedin } from "lucide-react";

export default function NeedHelp() {
  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="lg:max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
              Butuh Bantuan?
            </h2>

            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6 md:mb-8">
              Masih bingung pilih mentoring yang pas? Atau ada pertanyaan soal
              program? Tenang, tim kami siap bantu jawab semua kebingunganmu.
              Jangan ragu buat hubungi kami, ya!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <Button
                className="text-brand-color-primary border-emerald-600 hover:bg-emerald-50 px-6 py-3 h-[40px] rounded-lg font-medium"
                variant="outline"
              >
                Konsultasi Gratis
              </Button>

              {/* Social Media Icons */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/temudataku/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://www.linkedin.com/company/temudataku/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="lg:max-w-lg xl:max-w-xl flex-shrink-0">
            <div className="relative">
              <Image
                src="/assets/mentoringPage/trouble.svg"
                alt="Woman looking confused with question marks"
                width={400}
                height={300}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
