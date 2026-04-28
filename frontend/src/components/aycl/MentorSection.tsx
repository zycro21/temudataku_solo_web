const companies = [
  {
    name: "Grab",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Grab_Logo.svg/1280px-Grab_Logo.svg.png",
  },
  {
    name: "Everpro",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQp-kcu1A7S1_YjPa1PBkA96_wUInZaC7ziw&s",
  },
  {
    name: "Sreeya",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Sreeya_Horizontal_Logo_Full_Colour_RGB.jpg",
  },
  {
    name: "KPSG",
    logo: "https://kpsg.com/wp-content/uploads/2025/11/logo-kpsg-website.webp",
  },
  {
    name: "Pancaran Group",
    logo: "https://i0.wp.com/disnakerja.com/wp-content/uploads/2021/12/Pancaran-Group.jpg",
  },
  {
    name: "SPIL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Logospil.png",
  },
  {
    name: "Berca",
    logo: "https://images.glints.com/unsafe/glints-dashboard.oss-ap-southeast-1.aliyuncs.com/company-logo/8c30a633faca77a9b46ec5c8036bdcdb.png",
  },
];

export default function MentorsSection() {
  const half = Math.ceil(companies.length / 2);
  const firstRow = companies.slice(0, half);
  const secondRow = companies.slice(half);

  return (
    <section className="py-14 sm:py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-emerald-600 font-medium text-sm uppercase tracking-widest mb-2">
          Mentor
        </p>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
          Mentor Berpengalaman Dari Berbagai Perusahaan
        </h2>

        <p className="text-gray-500 font-medium text-xs sm:text-sm max-w-xl mx-auto mb-8 sm:mb-12 leading-relaxed">
          Mentor kami memiliki pengalaman dari berbagai perusahaan dan industri,
          sehingga materi yang dibawakan lebih relevan dengan kebutuhan kerja
          saat ini.
        </p>

        {/* Row 1 */}
        <div className="flex justify-center gap-3 sm:gap-6 mb-3 sm:mb-6 flex-wrap">
          {firstRow.map((c, i) => (
            <div
              key={i}
              className="bg-white border border-emerald-100 rounded-xl px-4 sm:px-7 py-3 sm:py-5 h-16 sm:h-20 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <img
                src={c.logo}
                alt={c.name}
                className="max-h-8 sm:max-h-10 max-w-[110px] sm:max-w-[140px] object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition"
              />
            </div>
          ))}
        </div>

        {/* Row 2 (CENTERED) */}
        <div className="flex justify-center gap-3 sm:gap-6 flex-wrap">
          {secondRow.map((c, i) => (
            <div
              key={i}
              className="bg-white border border-emerald-100 rounded-xl px-4 sm:px-7 py-3 sm:py-5 h-16 sm:h-20 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <img
                src={c.logo}
                alt={c.name}
                className="max-h-8 sm:max-h-10 max-w-[110px] sm:max-w-[140px] object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
