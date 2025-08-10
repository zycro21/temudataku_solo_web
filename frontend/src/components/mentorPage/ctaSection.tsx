"use client";

import Image from "next/image";

export default function CTASection() {
  return (
    <section className="relative py-16 mx-5 my-5 md:mx-12 md:my-12 lg:mx-20 lg:my-20 rounded-2xl overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src={"/assets/homePage/ctavector.svg"} alt="CTA Background" fill className="object-cover object-center " priority />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Siap Tingkatkan Karier di
          <br />
          Dunia Data?
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Bergabunglah dengan TemuDataku dan mulai perjalananmu sekarang!</p>
        <button className="text-white bg-[#0CA678] hover:bg-[#08916C]/80 hover:cursor-pointer font-semibold px-8 py-3 rounded-lg transition-colors duration-200">Gabung Sekarang</button>
      </div>
    </section>
  );
}
