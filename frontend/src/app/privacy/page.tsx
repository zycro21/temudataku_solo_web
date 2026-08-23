"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Informasi yang Kami Kumpulkan",
      content:
        "Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar, seperti nama lengkap, alamat email, nomor telepon, dan foto profil. Selain itu, kami juga dapat mengumpulkan data penggunaan seperti riwayat sesi mentoring, feedback, dan aktivitas Anda di platform untuk meningkatkan kualitas layanan.",
    },
    {
      title: "2. Penggunaan Informasi",
      content:
        "Informasi yang kami kumpulkan digunakan untuk menyediakan, memelihara, dan meningkatkan layanan kami, memproses transaksi, mengirimkan notifikasi terkait akun atau sesi mentoring, serta memberikan dukungan pelanggan. Kami tidak akan menggunakan data Anda untuk tujuan di luar yang telah dijelaskan tanpa persetujuan Anda.",
    },
    {
      title: "3. Berbagi Informasi dengan Pihak Ketiga",
      content:
        "Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga mana pun. Informasi hanya dapat dibagikan kepada mitra layanan tepercaya (seperti penyedia pembayaran) sejauh diperlukan untuk menjalankan fungsi platform, dan selalu tunduk pada kewajiban kerahasiaan yang ketat.",
    },
    {
      title: "4. Keamanan Data",
      content:
        "Kami menerapkan langkah-langkah teknis dan organisasi yang wajar untuk melindungi data pribadi Anda dari akses tidak sah, kehilangan, penyalahgunaan, atau perubahan. Meskipun demikian, tidak ada metode transmisi data melalui internet yang sepenuhnya aman, sehingga kami tidak dapat menjamin keamanan mutlak.",
    },
    {
      title: "5. Cookie dan Teknologi Pelacakan",
      content:
        "Platform kami dapat menggunakan cookie dan teknologi serupa untuk mengingat preferensi Anda, menjaga sesi login tetap aktif, dan menganalisis pola penggunaan guna meningkatkan pengalaman pengguna. Anda dapat mengatur browser untuk menolak cookie, namun beberapa fitur mungkin tidak berfungsi optimal.",
    },
    {
      title: "6. Hak Anda atas Data Pribadi",
      content:
        "Anda berhak untuk mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja melalui pengaturan akun. Anda juga dapat menghubungi tim kami apabila ingin mengajukan permintaan terkait portabilitas data atau pembatasan pemrosesan data pribadi Anda.",
    },
    {
      title: "7. Perubahan Kebijakan Privasi",
      content:
        "Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu untuk mencerminkan perubahan pada praktik kami atau untuk alasan operasional, hukum, maupun peraturan lainnya. Kami akan menginformasikan perubahan signifikan melalui platform atau email terdaftar Anda.",
    },
    {
      title: "8. Hubungi Kami",
      content:
        "Jika Anda memiliki pertanyaan, keluhan, atau masukan terkait kebijakan privasi ini, silakan hubungi tim dukungan kami melalui halaman bantuan atau email resmi yang tertera pada platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-emerald-100 bg-emerald-50/60">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            Kebijakan Privasi
          </h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Terakhir diperbarui: 24 Agustus 2026. Kebijakan ini menjelaskan
          bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi
          pribadi Anda saat menggunakan platform kami.
        </p>

        {/* Intro */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700 leading-relaxed">
            Privasi Anda penting bagi kami. Kebijakan privasi ini berlaku untuk
            seluruh layanan yang kami sediakan dan menjelaskan hak serta pilihan
            yang Anda miliki terkait data pribadi Anda. Dengan menggunakan
            platform ini, Anda menyetujui pengumpulan dan penggunaan informasi
            sesuai kebijakan ini.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-base font-semibold text-emerald-700 mb-1.5">
                {section.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Dengan terus menggunakan layanan kami, Anda dianggap telah membaca
            dan menyetujui Kebijakan Privasi ini.
          </p>
        </div>
      </div>
    </div>
  );
}
