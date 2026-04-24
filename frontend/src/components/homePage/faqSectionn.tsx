import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      id: "item-1",
      question:
        "Apakah saya bisa belajar meskipun tidak memiliki background di data science?",
      answer:
        "Tidak perlu khawatir jika kamu belum memiliki background di data science. Program kami mencakup fondasi dasar hingga lanjutan, dan mentor akan menyesuaikan pembelajaran dengan kebutuhanmu.",
    },
    {
      id: "item-2",
      question: "Berapa lama waktu yang dibutuhkan untuk menyelesaikan kursus?",
      answer:
        "Durasi kursus bervariasi tergantung pada program yang dipilih dan kecepatan belajar individu. Umumnya berkisar antara 3-6 bulan untuk program komprehensif.",
    },
    {
      id: "item-3",
      question: "Apakah ada sertifikat setelah menyelesaikan kursus?",
      answer:
        "Ya, setiap peserta yang berhasil menyelesaikan kursus akan mendapatkan sertifikat resmi yang dapat digunakan untuk meningkatkan kredibilitas profesional.",
    },
    {
      id: "item-4",
      question: "Apakah saya bisa belajar secara fleksibel?",
      answer:
        "Tentu saja! Program kami dirancang dengan fleksibilitas tinggi. Kamu dapat mengatur jadwal belajar sesuai dengan waktu luang dan kebutuhan pribadi.",
    },
    {
      id: "item-5",
      question: "Apakah saya akan mendapatkan bimbingan langsung dari mentor?",
      answer:
        "Ya, setiap peserta akan mendapatkan bimbingan langsung dari mentor berpengalaman melalui sesi konsultasi reguler dan dukungan pembelajaran yang personal.",
    },
  ];

  return (
    <div id="faq" className="bg-white py-14 pb-14 mt-8 px-4 scroll-smooth">
      <div className="max-w-[900px] mx-auto px-4 sm:px-5 lg:px-6">
        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
          Frequently Asked Questions (FAQ)
        </h1>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="bg-gray-100 rounded-md shadow-sm overflow-hidden"
            >
              {/* QUESTION */}
              <AccordionTrigger className="px-4 py-4 mb-0.5 text-left text-sm md:text-base font-semibold text-gray-900 hover:no-underline hover:bg-gray-200 rounded-md">
                {faq.question}
              </AccordionTrigger>

              {/* ANSWER */}
              <AccordionContent className="px-4 pb-4 pt-2 text-sm text-gray-700 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
