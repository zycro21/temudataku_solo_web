import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Instagram, Linkedin } from "lucide-react";

export default function NeedHelp() {
  return (
    <section className="py-6 md:py-12 bg-gray-50">
      <div className="max-w-[1100px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
          {/* Left Content */}
          <div className="lg:max-w-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Butuh Bantuan?
            </h2>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-5 md:mb-6">
              Masih bingung pilih mentoring yang pas? Atau ada pertanyaan soal
              program? Tenang, tim kami siap bantu jawab semua kebingunganmu.
              Jangan ragu buat hubungi kami, ya!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <Button
                className="text-brand-color-primary border-emerald-600 hover:bg-emerald-50 px-4 py-2 h-[36px] rounded-md font-medium text-sm"
                variant="outline"
              >
                Konsultasi Gratis
              </Button>

              {/* Social Media Icons */}
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.instagram.com/temudataku/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-md flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a
                  href="https://www.linkedin.com/company/temudataku/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-md flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="lg:max-w-md xl:max-w-lg flex-shrink-0">
            <div className="relative">
              <Image
                src="/assets/mentoringPage/trouble.svg"
                alt="Woman looking confused with question marks"
                width={340}
                height={260}
                className="w-full h-auto max-w-[340px] mx-auto lg:mx-0"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
