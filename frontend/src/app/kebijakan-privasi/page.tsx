import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Database,
  Settings2,
  Cookie,
  Share2,
  Clock,
  Lock,
  UserCheck,
  Baby,
  Globe2,
  FileClock,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi — Temudataku",
  description: "Kebijakan privasi dan penggunaan cookies di Temudataku.",
};

const sections = [
  { id: "pendahuluan", title: "Pendahuluan", icon: ShieldCheck },
  {
    id: "informasi-dikumpulkan",
    title: "Informasi yang Kami Kumpulkan",
    icon: Database,
  },
  {
    id: "penggunaan-informasi",
    title: "Bagaimana Kami Menggunakan Informasi",
    icon: Settings2,
  },
  { id: "dasar-hukum", title: "Dasar Hukum Pemrosesan Data", icon: FileClock },
  { id: "cookies", title: "Penggunaan Cookies", icon: Cookie },
  {
    id: "berbagi-data",
    title: "Berbagi Informasi dengan Pihak Ketiga",
    icon: Share2,
  },
  { id: "retensi", title: "Berapa Lama Data Disimpan", icon: Clock },
  { id: "keamanan", title: "Keamanan Data", icon: Lock },
  { id: "hak-pengguna", title: "Hak Kamu sebagai Pengguna", icon: UserCheck },
  { id: "privasi-anak", title: "Privasi Anak di Bawah Umur", icon: Baby },
  {
    id: "transfer-internasional",
    title: "Transfer Data Internasional",
    icon: Globe2,
  },
  { id: "perubahan", title: "Perubahan Kebijakan Privasi", icon: FileClock },
  { id: "kontak", title: "Hubungi Kami", icon: Mail },
];

const cookieTypes = [
  {
    name: "Esensial",
    desc: "Wajib agar situs bisa berjalan — login, sesi, keranjang belajar.",
    canReject: "Tidak bisa dinonaktifkan",
  },
  {
    name: "Analitik",
    desc: "Membantu kami memahami cara kamu menggunakan situs untuk perbaikan produk.",
    canReject: "Bisa ditolak",
  },
  {
    name: "Iklan / Marketing",
    desc: "Dipakai bersama mitra seperti Meta untuk menampilkan promosi relevan.",
    canReject: "Bisa ditolak",
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Decorative dot-grid + blobs */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#a7e3cc 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute -top-28 -right-16 w-72 h-72 md:w-96 md:h-96 bg-emerald-100 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-12 md:pt-12 md:pb-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-6 md:mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-8 items-center">
            {/* Text content */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                Berlaku untuk seluruh layanan Temudataku
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-3">
                Kebijakan <span className="text-emerald-600">Privasi</span>
              </h1>

              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl mb-4">
                Privasi kamu penting buat kami. Halaman ini menjelaskan secara
                lengkap data apa saja yang kami kumpulkan, untuk apa, dan hak
                apa saja yang kamu punya sebagai pengguna Temudataku.
              </p>

              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                Terakhir diperbarui: 15 Juli 2026
              </div>
            </div>

            {/* Decorative document mockup with floating trust badges */}
            <div className="relative hidden md:flex justify-center items-center h-72">
              <div className="relative w-56 aspect-[3/4] bg-white rounded-2xl border border-emerald-100 shadow-xl rotate-3 p-5 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-gray-100 w-4/5" />
                  <div className="h-2 rounded-full bg-gray-100 w-full" />
                  <div className="h-2 rounded-full bg-gray-100 w-3/5" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 rounded-full bg-gray-100 w-full" />
                  <div className="h-2 rounded-full bg-gray-100 w-2/3" />
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="h-2 rounded-full bg-emerald-100 w-1/2" />
                </div>
              </div>

              <div className="absolute left-0 top-2 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 -rotate-6">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">
                  Data terenkripsi
                </span>
              </div>

              <div className="absolute right-0 bottom-4 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 rotate-6">
                <Cookie className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">
                  Cookies transparan
                </span>
              </div>

              <div className="absolute right-6 top-0 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 -rotate-3">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">
                  Kamu punya kontrol
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">
          {/* ===== TABLE OF CONTENTS (sticky, desktop only) ===== */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Daftar Isi
              </p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-700 py-1.5 rounded-md transition-colors"
                  >
                    <s.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="leading-snug">{s.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ===== CONTENT ===== */}
          <div className="min-w-0">
            <div className="space-y-10 text-gray-700 leading-relaxed">
              <div id="pendahuluan" className="scroll-mt-24">
                <SectionHeading icon={ShieldCheck} title="1. Pendahuluan" />
                <p className="text-sm md:text-base">
                  Temudataku (&quot;kami&quot;) menghargai privasi setiap
                  pengguna yang mengakses dan menggunakan platform pembelajaran
                  data kami. Kebijakan Privasi ini menjelaskan bagaimana kami
                  mengumpulkan, menggunakan, menyimpan, dan melindungi informasi
                  pribadi kamu saat menggunakan website dan layanan Temudataku.
                  Dengan menggunakan layanan kami, kamu dianggap telah membaca
                  dan memahami kebijakan ini.
                </p>
              </div>

              <div id="informasi-dikumpulkan" className="scroll-mt-24">
                <SectionHeading
                  icon={Database}
                  title="2. Informasi yang Kami Kumpulkan"
                />
                <p className="text-sm md:text-base mb-3">
                  Kami dapat mengumpulkan beberapa jenis informasi, antara lain:
                </p>
                <ul className="space-y-2">
                  <ListItem>
                    <b>Data akun</b> — nama, alamat email, nomor telepon, dan
                    foto profil saat kamu mendaftar atau login (termasuk melalui
                    Google).
                  </ListItem>
                  <ListItem>
                    <b>Data penggunaan</b> — halaman yang kamu kunjungi, progres
                    belajar, modul yang diselesaikan, dan interaksi dengan fitur
                    di platform.
                  </ListItem>
                  <ListItem>
                    <b>Data teknis</b> — alamat IP, jenis perangkat, browser,
                    dan cookies (lihat bagian 5).
                  </ListItem>
                  <ListItem>
                    <b>Data transaksi</b> — informasi terkait pembelian kelas,
                    mentoring, atau layanan berbayar lainnya.
                  </ListItem>
                  <ListItem>
                    <b>Data komunikasi</b> — riwayat percakapan saat kamu
                    menghubungi tim support atau mentor melalui platform.
                  </ListItem>
                </ul>
              </div>

              <div id="penggunaan-informasi" className="scroll-mt-24">
                <SectionHeading
                  icon={Settings2}
                  title="3. Bagaimana Kami Menggunakan Informasi"
                />
                <ul className="space-y-2">
                  <ListItem>
                    Menyediakan, mengoperasikan, dan meningkatkan layanan
                    e-learning dan mentoring kami.
                  </ListItem>
                  <ListItem>
                    Memproses pendaftaran, login, dan transaksi pembayaran.
                  </ListItem>
                  <ListItem>
                    Mengirim informasi penting terkait akun, progres belajar,
                    atau perubahan layanan.
                  </ListItem>
                  <ListItem>
                    Menganalisis penggunaan situs untuk pengembangan produk dan
                    konten.
                  </ListItem>
                  <ListItem>
                    Menampilkan iklan dan promosi yang relevan, termasuk melalui
                    mitra seperti Meta (Facebook) dan Google.
                  </ListItem>
                  <ListItem>
                    Mendeteksi, mencegah, dan menangani aktivitas mencurigakan
                    atau penyalahgunaan platform.
                  </ListItem>
                </ul>
              </div>

              <div id="dasar-hukum" className="scroll-mt-24">
                <SectionHeading
                  icon={FileClock}
                  title="4. Dasar Hukum Pemrosesan Data"
                />
                <p className="text-sm md:text-base mb-3">
                  Kami memproses data pribadi kamu berdasarkan salah satu dari
                  dasar berikut, sesuai dengan Undang-Undang Perlindungan Data
                  Pribadi (UU PDP):
                </p>
                <ul className="space-y-2">
                  <ListItem>
                    <b>Persetujuan kamu</b> — misalnya saat menyetujui cookies
                    non-esensial atau mendaftar newsletter.
                  </ListItem>
                  <ListItem>
                    <b>Pelaksanaan kontrak</b> — untuk memproses pendaftaran
                    kelas, mentoring, dan transaksi pembayaran.
                  </ListItem>
                  <ListItem>
                    <b>Kepentingan sah kami</b> — seperti menjaga keamanan
                    platform dan meningkatkan kualitas layanan.
                  </ListItem>
                  <ListItem>
                    <b>Kewajiban hukum</b> — apabila diwajibkan oleh peraturan
                    perundang-undangan yang berlaku.
                  </ListItem>
                </ul>
              </div>

              <div id="cookies" className="scroll-mt-24">
                <SectionHeading icon={Cookie} title="5. Penggunaan Cookies" />
                <p className="text-sm md:text-base mb-4">
                  Kami menggunakan cookies dan teknologi serupa untuk mengingat
                  preferensi kamu, menjaga sesi login tetap aktif, memahami
                  bagaimana situs digunakan, dan mengukur efektivitas kampanye
                  pemasaran kami (misalnya melalui Meta Pixel). Kamu bisa
                  memilih untuk menerima atau menolak cookies non-esensial
                  melalui banner persetujuan yang muncul saat pertama kali
                  mengakses situs.
                </p>

                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-xs md:text-sm text-left">
                    <thead className="bg-emerald-50 text-emerald-800">
                      <tr>
                        <th className="px-3 md:px-4 py-2.5 font-semibold">
                          Jenis
                        </th>
                        <th className="px-3 md:px-4 py-2.5 font-semibold">
                          Fungsi
                        </th>
                        <th className="px-3 md:px-4 py-2.5 font-semibold">
                          Kontrol
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cookieTypes.map((c) => (
                        <tr key={c.name}>
                          <td className="px-3 md:px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                            {c.name}
                          </td>
                          <td className="px-3 md:px-4 py-2.5 text-gray-600">
                            {c.desc}
                          </td>
                          <td className="px-3 md:px-4 py-2.5 text-gray-500 whitespace-nowrap">
                            {c.canReject}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="berbagi-data" className="scroll-mt-24">
                <SectionHeading
                  icon={Share2}
                  title="6. Berbagi Informasi dengan Pihak Ketiga"
                />
                <p className="text-sm md:text-base">
                  Kami tidak menjual data pribadi kamu. Kami hanya membagikan
                  informasi terbatas kepada penyedia layanan tepercaya (misalnya
                  payment gateway, penyedia hosting, dan platform analitik/iklan
                  seperti Google dan Meta) sejauh diperlukan untuk menjalankan
                  layanan kami, dan selalu berdasarkan perjanjian kerahasiaan
                  yang sesuai. Kami juga dapat membagikan data apabila
                  diwajibkan oleh hukum, misalnya atas permintaan resmi dari
                  aparat penegak hukum.
                </p>
              </div>

              <div id="retensi" className="scroll-mt-24">
                <SectionHeading
                  icon={Clock}
                  title="7. Berapa Lama Data Disimpan"
                />
                <p className="text-sm md:text-base">
                  Kami menyimpan data pribadi kamu selama akun kamu aktif atau
                  selama diperlukan untuk memberikan layanan. Setelah kamu
                  menghapus akun, kami akan menghapus atau menganonimkan data
                  pribadi kamu dalam jangka waktu yang wajar, kecuali ada
                  kewajiban hukum yang mengharuskan kami menyimpannya lebih lama
                  (misalnya untuk catatan transaksi/pajak).
                </p>
              </div>

              <div id="keamanan" className="scroll-mt-24">
                <SectionHeading icon={Lock} title="8. Keamanan Data" />
                <p className="text-sm md:text-base">
                  Kami menerapkan langkah-langkah teknis dan organisasi yang
                  wajar untuk melindungi data kamu dari akses, perubahan, atau
                  pengungkapan yang tidak sah, termasuk enkripsi data saat
                  transit dan pembatasan akses internal. Namun, tidak ada metode
                  transmisi atau penyimpanan data melalui internet yang 100%
                  aman, sehingga kami tidak dapat menjamin keamanan mutlak.
                </p>
              </div>

              <div id="hak-pengguna" className="scroll-mt-24">
                <SectionHeading
                  icon={UserCheck}
                  title="9. Hak Kamu sebagai Pengguna"
                />
                <p className="text-sm md:text-base mb-3">
                  Sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU
                  PDP), kamu berhak untuk:
                </p>
                <ul className="space-y-2">
                  <ListItem>
                    Mengakses dan meminta salinan data pribadi yang kami simpan.
                  </ListItem>
                  <ListItem>
                    Meminta koreksi atas data yang tidak akurat.
                  </ListItem>
                  <ListItem>
                    Meminta penghapusan data pribadi kamu, sesuai ketentuan yang
                    berlaku.
                  </ListItem>
                  <ListItem>
                    Menarik persetujuan atas pemrosesan data tertentu, termasuk
                    cookies non-esensial, kapan saja.
                  </ListItem>
                  <ListItem>
                    Mengajukan keberatan atau keluhan terkait pemrosesan data
                    pribadi kamu kepada kami.
                  </ListItem>
                </ul>
              </div>

              <div id="privasi-anak" className="scroll-mt-24">
                <SectionHeading
                  icon={Baby}
                  title="10. Privasi Anak di Bawah Umur"
                />
                <p className="text-sm md:text-base">
                  Layanan Temudataku tidak ditujukan untuk anak di bawah usia 13
                  tahun, dan kami tidak dengan sengaja mengumpulkan data pribadi
                  dari mereka. Apabila kamu adalah orang tua/wali dan mengetahui
                  anak kamu memberikan data pribadi kepada kami tanpa
                  persetujuanmu, silakan hubungi kami agar dapat segera kami
                  tindak lanjuti.
                </p>
              </div>

              <div id="transfer-internasional" className="scroll-mt-24">
                <SectionHeading
                  icon={Globe2}
                  title="11. Transfer Data Internasional"
                />
                <p className="text-sm md:text-base">
                  Beberapa penyedia layanan pihak ketiga yang kami gunakan
                  (misalnya untuk hosting, analitik, atau iklan) dapat memproses
                  data di server yang berlokasi di luar Indonesia. Kami
                  memastikan mitra tersebut menerapkan standar perlindungan data
                  yang memadai sesuai peraturan yang berlaku.
                </p>
              </div>

              <div id="perubahan" className="scroll-mt-24">
                <SectionHeading
                  icon={FileClock}
                  title="12. Perubahan Kebijakan Privasi"
                />
                <p className="text-sm md:text-base">
                  Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke
                  waktu mengikuti perkembangan layanan atau regulasi. Perubahan
                  signifikan akan kami informasikan melalui halaman ini dengan
                  tanggal pembaruan terbaru, atau melalui notifikasi di
                  platform.
                </p>
              </div>

              <div id="kontak" className="scroll-mt-24">
                <SectionHeading icon={Mail} title="13. Hubungi Kami" />
                <p className="text-sm md:text-base">
                  Kalau kamu punya pertanyaan seputar Kebijakan Privasi ini atau
                  ingin menggunakan hak-hak di atas, silakan hubungi kami
                  melalui halaman{" "}
                  <Link
                    href="/tentang-kami"
                    className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
                  >
                    Kontak
                  </Link>{" "}
                  kami.
                </p>
              </div>
            </div>

            {/* Back to home footer CTA */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-emerald-700" />
      </div>
      <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm md:text-base">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
