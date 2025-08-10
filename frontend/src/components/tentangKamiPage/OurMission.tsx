export default function OurMission() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-8 md:px-[100px]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Logo */}
          <div className="">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-6">Misi Kami?</h2>
            <div className=" font-bold text-[#243A77] leading-relaxed">
              <p>Lorem ipsum dolor sit amet consectetur. Dui sed turpis egestas a. Scelerisque dolor sed vitae tortor. Vel in bibendum volutpat senectus. </p>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex justify-center lg:justify-start">
            <div className="bg-white rounded-3xl max-w-md">
              <div className="flex items-center justify-center">
                {/* TemuDataku Logo */}
                <div className="flex items-center">
                  <span className="relative bg-emerald-600 rounded-3xl w-[400px] h-[200px] "></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
