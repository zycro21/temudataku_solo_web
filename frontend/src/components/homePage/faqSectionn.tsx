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
    <div id="faq" className="bg-white py-20 pb-18 mt-10 px-4 scroll-smooth">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions (FAQ)
        </h1>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="bg-gray-100 rounded-lg shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-6 mb-1 text-left text-lg md:text-xl font-semibold text-gray-900 hover:no-underline hover:bg-gray-200 rounded-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-3 text-base md:text-lg text-gray-700 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
