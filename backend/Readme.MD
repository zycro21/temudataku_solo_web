# Dokumentasi Database TemuDataku

## 1. Pendahuluan

Dokumen ini berisi dokumentasi teknis untuk struktur database aplikasi
**TemuDataku** - platform mentoring & e-learning data science. Dokumentasi
ini disusun sebagai referensi bagi tim pengembang (backend, frontend,
maupun anggota baru yang onboarding) untuk memahami struktur data yang
digunakan aplikasi, tanpa perlu membaca langsung file `schema.prisma`.

## 2. Deskripsi

Database ini dibangun di atas **PostgreSQL**, dengan **Prisma ORM**
sebagai lapisan akses data dari sisi backend (Node.js/Express). Skema
mencakup seluruh domain bisnis aplikasi, di antaranya:

- **E-Learning** - course, sub-chapter, materi, quiz, assignment, progress
  belajar, sertifikat, hingga konten interaktif (accordion, carousel, tab
  navigation, kode eksekusi, dsb).
- **Article** - sistem artikel dengan block-based content editor (heading,
  paragraph, table, divider, link, table of content, media).
- **Mentoring** - booking sesi mentor, jadwal, program mentoring.
- **AYCL (All You Can Learn)** - paket akses belajar.
- **Affiliator** - program afiliasi, komisi, referral code.
- **User & Role Management** - akun, role, autentikasi.
- **Voucher & Redeem Code** - kode promo dan kode redeem akses gratis.
- **Payment & Withdrawal** - transaksi pembayaran dan penarikan dana.
- **Practice** - modul latihan mandiri (materi, submission, review).
- Serta modul pendukung lain: notifikasi, feedback, sertifikat, export log,
  dan lain-lain.

Per catatan terakhir, skema ini terdiri dari **123 model (tabel)** dan
**23 enum**, dikelola dalam satu file `schema.prisma`.

## 3. Cakupan & Cara Membaca Dokumen Ini

Setiap tabel dalam dokumen ini didokumentasikan dengan format yang
konsisten, mencakup:

1. **Fungsi tabel** - tabel ini dipakai untuk menyimpan data apa, dan
   berperan di bagian mana dari aplikasi.
2. **Penjelasan per kolom** - nama kolom, tipe data, apakah wajib diisi
   (`NOT NULL`) atau boleh kosong (`nullable`), beserta nilai default
   (kalau ada).
3. **Primary Key (PK) & Foreign Key (FK)** - kolom mana yang jadi kunci
   utama tabel, dan kolom mana yang mengacu ke tabel lain (beserta tabel
   tujuannya dan perilaku `onDelete`/`onUpdate`-nya kalau relevan).
4. **Catatan makna nilai** - khusus untuk kolom yang nilainya tidak
   langsung jelas hanya dari nama/tipe data-nya. Contoh: kolom `isActive`
   pada tabel `User` - `false` berarti akun dinonaktifkan/dihapus (soft
   delete), `true` berarti akun masih aktif dan bisa dipakai login.

### Legenda

| Simbol/Istilah | Arti |
|---|---|
| 🔑 PK | Primary Key |
| 🔗 FK | Foreign Key (relasi ke tabel lain) |
| `NOT NULL` | Kolom wajib diisi |
| `nullable` | Kolom boleh kosong (`NULL`) |
| `@default(...)` | Nilai default kalau tidak diisi saat insert |
| `@unique` | Nilai di kolom ini harus unik se-tabel |
| `onDelete: Cascade` | Kalau baris induk (parent) dihapus, baris ini ikut terhapus otomatis |
| `onDelete: SetNull` | Kalau baris induk dihapus, kolom FK ini otomatis jadi `NULL` |

## 4. Daftar Modul

*(Tiap modul di bawah akan didokumentasikan tabel-per-tabel di bagian
selanjutnya dari dokumen ini.)*

- [x] E-Learning
- [ ] Article
- [x] Mentoring & Booking
- [x] AYCL
- [ ] Affiliator & Referral
- [x] User & Role
- [ ] Voucher & Redeem Code
- [ ] Payment & Withdrawal
- [x] Practice
- [ ] Modul Pendukung (Notifikasi, Feedback, Sertifikat, dll)

---

## 5. Detail Tabel

### 5.1 `users`

**Fungsi tabel**: Tabel pusat/induk aplikasi - menyimpan data akun setiap
orang yang terdaftar (mentee, mentor, admin, dst - role-nya sendiri diatur
di tabel terpisah `UserRole`, bukan kolom di tabel ini). Hampir semua
modul lain (booking, e-learning, article, affiliator, dsb.) pada akhirnya
merujuk balik ke tabel ini untuk tahu "ini punya siapa".

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik user, digenerate otomatis. |
| `email` | VarChar | `NOT NULL`, `@unique` | – | Alamat email; dipakai untuk login & identitas unik akun. |
| `passwordHash` | VarChar | `nullable` | – | Hasil hashing password. `NULL` kalau user daftar/login lewat Google OAuth (tidak pernah set password manual). |
| `googleId` | VarChar | `nullable`, `@unique` | – | ID akun Google. Terisi kalau user pernah login/daftar pakai "Sign in with Google". |
| `fullName` | VarChar | `NOT NULL` | – | Nama lengkap user. |
| `phoneNumber` | VarChar | `nullable` | – | Nomor telepon/WhatsApp. |
| `profilePicture` | VarChar | `nullable` | – | Path atau nama file foto profil. |
| `city` | VarChar | `nullable` | – | Kota domisili. |
| `province` | VarChar | `nullable` | – | Provinsi domisili. |
| `isEmailVerified` | Boolean | `nullable` | `false` | `false` = email belum diverifikasi, `true` = sudah. |
| `verificationToken` | VarChar | `nullable` | – | Token yang dikirim ke email untuk proses verifikasi akun / reset password. |
| `verificationTokenExpires` | Timestamp(6) | `nullable` | – | Batas waktu berlakunya `verificationToken`. |
| `registrationDate` | Timestamp(6) | `nullable` | `now()` | Tanggal user pertama kali mendaftar. |
| `lastLogin` | Timestamp(6) | `nullable` | – | Waktu login terakhir tercatat. |
| `isActive` | Boolean | `nullable` | `true` | **Lihat catatan khusus di bawah.** |
| `fcmToken` | VarChar | `nullable` | – | Firebase Cloud Messaging token - dipakai buat kirim push notification ke device user. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu baris ini pertama kali dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Waktu baris ini terakhir diupdate. ⚠️ Tidak pakai `@updatedAt` bawaan Prisma, jadi kolom ini **tidak otomatis** ke-update - harus di-set manual di kode tiap kali ada perubahan. |
| `instagram` | VarChar | `nullable` | – | Link/username Instagram. |
| `twitter` | VarChar | `nullable` | – | Link/username Twitter/X. |
| `youtube` | VarChar | `nullable` | – | Link/username YouTube. |
| `tiktok` | VarChar | `nullable` | – | Link/username TikTok. |
| `otherSocialMedia` | VarChar | `nullable` | – | Link media sosial lain di luar 4 platform di atas. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: *(tidak ada)* - `users` adalah tabel induk. Semua kolom
  relasi yang tercantum di model Prisma-nya (`bookings`, `certificates`,
  `eLearningSubscriptions`, dst.) adalah **relasi balik** (reverse
  relation) - FK-nya justru ada di tabel-tabel *lain* yang menunjuk ke
  `users.id`, bukan kolom fisik di tabel `users` sendiri.

#### 📌 Catatan Makna Nilai: `isActive`

Kolom ini kemungkinan besar berfungsi sebagai **flag aktif/nonaktif akun**
(soft-deactivate), berdasarkan nama kolom dan nilai default-nya:

- `true` (default) → akun aktif, bisa dipakai login & mengakses aplikasi
  seperti biasa.
- `false` → akun dinonaktifkan (mis. oleh admin, atau user menutup
  akunnya sendiri). Baris datanya **tidak dihapus** dari database - cuma
  ditandai nonaktif, supaya riwayat & relasi ke tabel lain (booking,
  transaksi, dll.) tetap utuh dan tidak rusak.

  > ⚠️ Ini masih interpretasi berdasarkan konvensi penamaan & schema saja
  > (schema tidak menyimpan business logic). Untuk kepastian 100% -
  > terutama apakah `false` benar dipakai sebagai "akun dihapus" atau
  > cuma "akun di-suspend sementara" - perlu dicek ke controller/service
  > yang menangani update kolom ini (misal endpoint delete/deactivate
  > user). Kalau mau, kirim file controller-nya, nanti saya perbarui
  > catatan ini jadi pasti.

#### Relasi ke Tabel Lain (ringkasan)

Daftar tabel yang mereferensikan `users.id` (akan didokumentasikan
detail satu per satu di bagian selanjutnya):

| Modul | Tabel Terkait |
|---|---|
| Admin | `AdminActivityLog` |
| Mentoring/Booking | `Booking`, `BookingParticipant` |
| Sertifikat (mentoring) | `Certificate` |
| Feedback | `Feedback` |
| Mentor | `MentorProfile` (1:1) |
| Notifikasi | `NotificationRecipient` |
| Practice | `PracticeProgress`, `PracticePurchase`, `PracticeReview`, `PracticeSubmission` (sbg mentee & reviewer), `ProjectSubmission` (sbg mentee & grader) |
| Affiliator/Referral | `ReferralCode`, `ReferralUsage`, `AffiliatorProfile` (1:1), `WithdrawalMethod` |
| Aktivitas | `UserActivityLog`, `UserBehavior` |
| Role | `UserRole` |
| Short Link | `ShortLink` |
| E-Learning | `ELearningSubscription`, `ELearningReview`, `ELearningProgress`, `ELearningSubChapterProgress`, `ELearningBlockProgress`, `ELearningTextProgress`, `ELearningQuizAttempt`, `ELearningSubmission` (sbg pengumpul & reviewer), `ELearningCertificate`, `ELearningDiscussion`, `ELearningBookmark`, `ELearningCodeRun`, `ELearningAuditLog`, `ELearningCourseStreamCount` |
| AYCL | `AYCLBooking` |
| Voucher | `Voucher` (sbg pembuat), `VoucherUsage` |
| Redeem Code | `RedeemCode` (sbg pembuat), `RedeemCodeUsage`, `RedeemCodeAttempt` |
| Article | `Article`, `ArticleElementFavorite`, `ArticleLike`, `ArticleComment`, `ArticleCommentLike` |

---

### 5.2 `user_roles`

**Fungsi tabel**: Tabel pivot (junction table) untuk relasi
many-to-many antara `users` dan `roles`. Karena satu user bisa punya lebih
dari satu role sekaligus (contoh nyata: kasus akun `admin` + `mentee`
dobel role yang pernah kita bahas soal bug e-learning lock), hubungan
User↔Role tidak bisa langsung disimpan sebagai satu kolom di tabel
`users` - makanya dibikin tabel perantara ini, satu baris = satu
"user ini punya role ini".

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris penugasan role. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `users.id` - user mana yang dapat role ini. |
| `roleId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `roles.id` - role apa yang diberikan. |
| `assignedDate` | Timestamp(6) | `nullable` | `now()` | Tanggal role ini diberikan ke user. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu baris ini dibuat (biasanya sama dengan `assignedDate`). |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade` (kalau user
  dihapus permanen dari DB, semua baris penugasan role-nya ikut
  terhapus), `onUpdate: Cascade`.
- 🔗 **FK 2**: `roleId` → `roles.id` - `onDelete: Cascade` (kalau
  suatu role dihapus dari master data, semua penugasan role itu ke user
  manapun ikut terhapus), `onUpdate: Cascade`.

#### 📌 Catatan

Tidak ada constraint `@@unique([userId, roleId])` di tabel ini. Artinya,
**secara skema, tidak ada yang mencegah** kombinasi user+role yang sama
dimasukkan lebih dari sekali (baris duplikat). Kalau ternyata di aplikasi
mengandalkan `userRoles.length` atau semacamnya untuk logika apa pun,
baris duplikat bisa bikin hasilnya keliru. Perlu dicek ke kode
create/assign role apakah sudah ada pengecekan "sudah ada belum"
sebelum insert, atau perlu ditambahkan `@@unique` di skema untuk jaga-jaga.

---

### 5.3 `roles`

**Fungsi tabel**: Tabel master/lookup daftar role yang tersedia di
aplikasi (mis. admin, mentor, mentee, dst). Dipakai sebagai referensi
oleh `user_roles` untuk menentukan role apa saja yang bisa diberikan ke
user.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik role. |
| `roleName` | VarChar | `NOT NULL`, `@unique` | – | Nama role, mis. `admin`, `mentor`, `mentee`. |
| `description` | Text | `nullable` | – | Deskripsi/keterangan role, buat referensi tim (bukan dipakai logic). |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu role ini dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: *(tidak ada)* - `roles` adalah tabel master, tidak
  bergantung ke tabel lain manapun.

#### 📌 Catatan

Kolom `roleName` **tidak dibatasi lewat `enum` di level database** -
cuma `VarChar` biasa, jadi nilai apa pun bisa dimasukkan lewat baris
data, tidak ada validasi di level skema. Berdasarkan pemakaian
`authorizeRoles(...)` yang pernah kita temui di kode backend (bukan dari
schema ini), kemungkinan nilai yang dipakai di aplikasi antara lain:
`admin`, `mentor`, `mentee`, `cm`, `curdev`, `guest`, `cw` - tapi ini
observasi dari kode lain, bukan dari tabel ini. Untuk daftar yang pasti
dan lengkap, sebaiknya dicek langsung isi tabel `roles` di database.

---

### 5.4 `mentor_profiles`

**Fungsi tabel**: Data tambahan khusus untuk user yang berperan sebagai
mentor - relasi 1:1 dengan `users` (satu user maksimal punya satu profil
mentor). Ini tabel "hub" untuk sisi mentor, mirip perannya `users` untuk
seluruh aplikasi.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik profil mentor. |
| `userId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Menunjuk ke `users.id`. `@unique` di sini yang bikin relasinya 1:1 (bukan 1:banyak). |
| `expertise` | Text | `nullable` | – | Bidang keahlian mentor (mis. "Data Science", "Machine Learning"). |
| `bio` | Text | `nullable` | – | Deskripsi/bio singkat mentor. |
| `experience` | Text | `nullable` | – | Pengalaman kerja/mengajar mentor. |
| `availabilitySchedule` | JSONB | `nullable` | – | Jadwal ketersediaan mentor. Strukturnya bebas (JSON), tidak didefinisikan di skema - cek kode FE/BE buat tahu bentuk pastinya. |
| `hourlyRate` | Decimal | `nullable` | – | Tarif per jam mentor. |
| `isVerified` | Boolean | `nullable` | `false` | Kemungkinan status "sudah diverifikasi admin" - `false` = belum diverifikasi (belum boleh tampil publik/terima booking?), `true` = sudah. *(interpretasi dari nama kolom, perlu dicek ke kode kalau mau pasti)* |
| `linkedin` | Text | `nullable` | – | Link profil LinkedIn mentor. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu profil dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Waktu terakhir diupdate. Tidak pakai `@updatedAt`, jadi tidak auto-update. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `userId` → `users.id` - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`mentor_profiles` jadi rujukan untuk: `mentoring_service_mentors`,
`mentoring_session_mentors`, `Practice` (belum dibahas), `mentor_report`,
`ELearningCourse` (mentor pengajar course - relasi `"MentorCourses"`),
dan `MentorEarningSummary` (1:1, belum dibahas - nanti menyusul).

---

### 5.5 `mentor_report`

**Fungsi tabel**: Laporan evaluasi yang diisi mentor setelah selesai satu
sesi mentoring (`MentoringSession`) - semacam catatan "bagaimana
peserta di sesi ini".

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik laporan. |
| `sessionId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_sessions.id`. |
| `mentorProfileId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentor_profiles.id` - mentor yang menulis laporan. |
| `understanding` | Text | `nullable` | – | Catatan tingkat pemahaman peserta. |
| `participation` | Text | `nullable` | – | Catatan keaktifan/partisipasi peserta. |
| `challenges` | Text | `nullable` | – | Kendala yang ditemui selama sesi. |
| `commonQuestions` | Text | `nullable` | – | Pertanyaan yang sering muncul dari peserta. |
| `nextFocus` | Text | `nullable` | – | Rencana fokus untuk sesi berikutnya. |
| `additionalNotes` | Text | `nullable` | – | Catatan tambahan bebas. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu laporan dibuat. |
| `updatedAt` | DateTime | `NOT NULL` | auto | Pakai `@updatedAt` - **otomatis** ter-update Prisma tiap ada perubahan baris (beda dari kebanyakan tabel lain di skema ini yang harus di-set manual). |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `sessionId` → `mentoring_sessions.id` - `onDelete`/`onUpdate` **tidak didefinisikan eksplisit** di skema (pakai default provider, umumnya `RESTRICT` - sesi tidak bisa dihapus kalau masih ada laporan yang menunjuk ke situ).
- 🔗 **FK 2**: `mentorProfileId` → `mentor_profiles.id` - sama, tidak ada `onDelete`/`onUpdate` eksplisit.

#### 📌 Catatan

Kolom `sessionId` dan `mentorProfileId` di tabel ini **tidak pakai
`@map`**, jadi nama kolom fisik di database persis camelCase
(`sessionId`, `mentorProfileId`) - beda dari konvensi snake_case
(`session_id`, dst.) yang dipakai mayoritas tabel lain di skema ini.
Bukan masalah fungsional, tapi baik diketahui kalau nanti ada yang query
manual pakai raw SQL.

---

### 5.6 `mentoring_services`

**Fungsi tabel**: Tabel produk/program mentoring utama - satu baris =
satu program mentoring yang dijual (mis. Bootcamp, Short Class, Group
Mentoring). Ini tabel induk untuk seluruh konten pendukung halaman detail
program (section, tools, jadwal, portofolio, testimoni) serta booking dan
sesi-sesinya.

> ℹ️ Skema modelnya diberi komentar otomatis oleh Prisma
> (`/// This model ... has comments in the database`) - ini artefak dari
> proses introspeksi database (ada `COMMENT ON` langsung di level
> PostgreSQL untuk model/kolom ini), bukan bug ataupun catatan dari
> developer.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik program. |
| `serviceName` | VarChar | `NOT NULL` | – | Nama program mentoring. |
| `description` | Text | `nullable` | – | Deskripsi program. |
| `price` | Decimal | `NOT NULL` | – | Harga jual program. |
| `strikePrice` | Decimal | `nullable` | – | "Harga coret" - harga asal sebelum diskon, ditampilkan dicoret di UI (komentar developer di skema). |
| `serviceType` | VarChar | `nullable` | – | Jenis/kategori layanan (nilai bebas, tidak di-enum). |
| `maxParticipants` | Int | `nullable` | – | Kapasitas maksimal peserta. |
| `durationDays` | Int | `NOT NULL` | – | Lama program berjalan (hari). |
| `startDate` | Timestamp | `nullable` | – | Tanggal mulai program. |
| `endDate` | Timestamp | `nullable` | – | Tanggal selesai program. |
| `thumbnail` | VarChar | `nullable` | – | Path/nama file gambar thumbnail. |
| `whatsappGroup` | VarChar | `nullable` | – | Link grup WhatsApp untuk peserta program ini. |
| `programAbout` | Text | `nullable` | – | Ringkasan "tentang program". |
| `totalWeeks` | Int | `nullable` | – | Total durasi program dalam minggu. |
| `totalProjects` | Int | `nullable` | – | Total jumlah project dalam program. |
| `slug` | VarChar | `nullable`, `@unique` | – | Slug URL untuk halaman detail program. |
| `isFeatured` | Boolean | `NOT NULL` | `false` | `true` = program ditandai unggulan/ditampilkan menonjol di listing. |
| `difficultyOrder` | Int | `nullable` | – | Angka urutan untuk sorting berdasarkan tingkat kesulitan. |
| `category` | VarChar | `nullable` | – | Kategori program. |
| `level` | VarChar | `nullable` | – | Level kesulitan (nilai bebas, tidak di-enum). |
| `isActive` | Boolean | `nullable` | `true` | Kemungkinan toggle publish/tayang - `false` = program disembunyikan dari listing publik, `true` = tampil. *(pola sama seperti `isActive` di `users`, sebaiknya dikonfirmasi ke kode)* |
| `installmentAvailable` | Boolean | `NOT NULL` | `false` | `true` = program ini bisa dibayar dengan cicilan. |
| `maxInstallmentMonths` | Int | `nullable` | – | Jumlah bulan cicilan maksimal, kalau `installmentAvailable` true. |
| `createdAt` | Timestamp | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp | `nullable` | – | Waktu terakhir diupdate (tidak auto). |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: *(tidak ada)* - tabel induk/master produk mentoring.

---

### Enum: `MentoringSectionType`

Dipakai di kolom `type` pada tabel `mentoring_sections`.

| Nilai | Keterangan |
|---|---|
| `BENEFIT` | Section berisi manfaat/keuntungan ikut program. |
| `MECHANISM` | Section berisi mekanisme/cara program berjalan. |
| `SYLLABUS` | Section berisi silabus/materi yang diajarkan. |
| `TARGET` | Section berisi target peserta yang cocok ikut program. |

---

### 5.7 `mentoring_sections`

**Fungsi tabel**: Blok konten deskriptif yang tampil di halaman detail
`mentoring_services` - satu baris = satu section (benefit, mekanisme,
silabus, atau target peserta).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik section. |
| `serviceId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_services.id`. |
| `type` | Enum `MentoringSectionType` | `NOT NULL` | – | Jenis section - lihat tabel enum di atas. |
| `title` | Text | `NOT NULL` | – | Judul section. |
| `content` | JSON | `NOT NULL` | – | Isi section. Strukturnya menurut komentar developer di skema: untuk **semua** nilai `type` saat ini selalu berbentuk `{ title: string, description: string }`. |
| `order` | Int | `NOT NULL` | – | Urutan tampil section di halaman. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `serviceId` → `mentoring_services.id` - `onDelete: Cascade` (service dihapus → semua section-nya ikut terhapus).

#### 📌 Catatan

Ada index tambahan `@@index([serviceId, order])` (bukan PK/FK) - dipasang
supaya query "ambil semua section milik satu service, terurut sesuai
`order`" lebih cepat. Kolom `serviceId` juga **tidak pakai `@map`** (sama
seperti kasus di `mentor_report`).

---

### 5.8 `mentoring_tools`

**Fungsi tabel**: Daftar tools/teknologi yang diajarkan/dipakai dalam
suatu program mentoring (mis. "Python", "Tableau", "Excel") - ditampilkan
sebagai badge/list di halaman detail program.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris tool. |
| `serviceId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_services.id`. |
| `name` | Text | `NOT NULL` | – | Nama tool. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `serviceId` → `mentoring_services.id` - `onDelete: Cascade`.

---

### 5.9 `mentoring_schedules`

**Fungsi tabel**: Daftar tanggal pelaksanaan untuk suatu program
mentoring (mis. tanggal-tanggal sesi live yang dijadwalkan).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris jadwal. |
| `serviceId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_services.id`. |
| `date` | Timestamp | `NOT NULL` | – | Tanggal pelaksanaan. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `serviceId` → `mentoring_services.id` - `onDelete: Cascade`.

---

### 5.10 `mentoring_portfolios`

**Fungsi tabel**: Contoh portofolio/hasil karya mentee dari program ini -
dipakai sebagai social proof/bukti hasil belajar di halaman detail
program.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik portofolio. |
| `serviceId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_services.id`. |
| `title` | Text | `NOT NULL` | – | Judul portofolio. |
| `description` | Text | `nullable` | – | Deskripsi portofolio. |
| `menteeName` | Text | `NOT NULL` | – | Nama mentee pemilik portofolio (teks bebas, bukan FK ke `users` - jadi tidak wajib akun mentee itu masih terdaftar/ada). |
| `projectLink` | Text | `NOT NULL` | – | Link menuju hasil karya/project. |
| `thumbnail` | Text | `nullable` | – | Gambar thumbnail portofolio. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `serviceId` → `mentoring_services.id` - `onDelete: Cascade`.

---

### 5.11 `mentoring_testimonials`

**Fungsi tabel**: Testimoni peserta untuk suatu program mentoring
tertentu - ditampilkan di halaman detail program (beda dari testimoni
umum lain kalau ada modul testimoni terpisah).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik testimoni. |
| `serviceId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_services.id`. |
| `name` | Text | `NOT NULL` | – | Nama pemberi testimoni (teks bebas, bukan FK ke `users`). |
| `role` | Text | `nullable` | – | Keterangan peran/status pemberi testimoni (mis. "Mahasiswa", "Career Switcher"). |
| `comment` | Text | `NOT NULL` | – | Isi testimoni. |
| `rating` | Int | `NOT NULL` | – | Rating angka. Tidak ada batas min/max di level skema - validasi rentang (mis. 1–5) kemungkinan di level aplikasi. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `serviceId` → `mentoring_services.id` - `onDelete: Cascade`.

---

### 5.12 `mentoring_service_mentors`

**Fungsi tabel**: Tabel pivot many-to-many antara `mentoring_services`
dan `mentor_profiles` - menentukan mentor mana saja yang mengampu suatu
program mentoring (satu program bisa punya banyak mentor, satu mentor
bisa mengampu banyak program).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris penugasan. |
| `mentoringServiceId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_services.id`. |
| `mentorProfileId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentor_profiles.id`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `mentoringServiceId` → `mentoring_services.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `mentorProfileId` → `mentor_profiles.id` - `onDelete: Cascade`.

#### 📌 Catatan

Ada `@@unique([mentoringServiceId, mentorProfileId])` - **beda dari**
`user_roles` yang tidak punya constraint serupa. Di sini kombinasi
service+mentor yang sama **tidak bisa** dimasukkan dua kali; database
akan menolak (constraint violation) kalau dicoba.

---

### 5.13 `mentoring_sessions`

**Fungsi tabel**: Satu sesi pertemuan/kelas live untuk suatu
`mentoring_services`, pada tanggal & jam tertentu - termasuk link
meeting, rekaman, dan materi presentasinya.

> ℹ️ Sama seperti `mentoring_services`, model ini juga punya komentar
> introspeksi (`/// This model ... has comments in the database`) -
> artefak dari `COMMENT ON` di PostgreSQL, bukan catatan developer.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik sesi. |
| `serviceId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_services.id`. |
| `date` | **String** | `NOT NULL` | – | Tanggal sesi. ⚠️ Disimpan sebagai **teks bebas**, bukan tipe `Date`/`Timestamp` asli Postgres - format & validasinya sepenuhnya tanggung jawab aplikasi. |
| `startTime` | **String** | `NOT NULL` | – | Jam mulai. ⚠️ Sama seperti `date`, bertipe teks bebas, bukan `Time`. |
| `endTime` | **String** | `NOT NULL` | – | Jam selesai. ⚠️ Sama, teks bebas. |
| `durationMinutes` | Int | `NOT NULL` | – | Durasi sesi dalam menit. |
| `meetingLink` | VarChar | `nullable` | – | Link meeting (mis. Zoom/Google Meet). |
| `meetingId` | VarChar | `nullable` | – | ID meeting. |
| `passcode` | VarChar | `nullable` | – | Passcode/kode akses meeting. |
| `status` | VarChar | `nullable` | – | Status sesi. Nilai bebas (bukan enum) - cek kode aplikasi untuk daftar nilai pastinya (kemungkinan mis. "scheduled", "completed", "cancelled"). |
| `notes` | Text | `nullable` | – | Catatan tambahan tentang sesi. |
| `pptLink` | VarChar | `nullable` | – | Link slide presentasi sesi. |
| `recordingLink` | VarChar | `nullable` | – | Link rekaman sesi. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu baris dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Waktu terakhir diupdate (tidak auto). |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `serviceId` → `mentoring_services.id` - `onDelete: Cascade`, `onUpdate: Cascade`.

#### 📌 Catatan

Kolom `date`, `startTime`, `endTime` semuanya bertipe **String**, bukan
tipe tanggal/waktu native PostgreSQL. Implikasinya: tidak ada validasi
format di level database (mis. mencegah string bukan-tanggal masuk),
dan query yang butuh perbandingan tanggal (mis. "sesi minggu ini")
harus dilakukan lewat parsing string di level aplikasi, bukan operator
tanggal SQL langsung.

---

### 5.14 `mentoring_session_mentors`

**Fungsi tabel**: Tabel pivot many-to-many antara `mentoring_sessions`
dan `mentor_profiles` - menentukan mentor mana yang bertugas di satu
sesi spesifik (beda dari `mentoring_service_mentors` yang levelnya per
*program*, ini levelnya per *sesi individual*).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris penugasan. |
| `mentoringSessionId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentoring_sessions.id`. |
| `mentorProfileId` | String | `NOT NULL`, 🔗 FK | – | Menunjuk ke `mentor_profiles.id`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `mentoringSessionId` → `mentoring_sessions.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `mentorProfileId` → `mentor_profiles.id` - `onDelete: Cascade`.

#### 📌 Catatan

Sama seperti `mentoring_service_mentors`, ada
`@@unique([mentoringSessionId, mentorProfileId])` - mentor yang sama
tidak bisa ditugaskan dobel ke sesi yang sama.

---

### 5.15 `bookings`

**Fungsi tabel**: Transaksi booking - satu baris dibuat saat mentee
mendaftar/memesan satu `mentoring_services` tertentu. Ini tabel order
utama untuk sisi mentoring (analog dengan "keranjang yang sudah checkout"
untuk satu program).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik booking. |
| `menteeId` | String | `NOT NULL`, 🔗 FK | – | Mentee yang melakukan booking. |
| `mentoringServiceId` | String | `NOT NULL`, 🔗 FK | – | Program mentoring yang dibooking. |
| `referralUsageId` | String | `nullable`, `@unique`, 🔗 FK | – | Terisi kalau booking ini pakai kode referral (relasi opsional 1:1 ke `ReferralUsage`, modul Affiliator & Referral - belum dibahas). |
| `bookingDate` | Timestamp | `nullable` | `now()` | Tanggal booking dibuat. |
| `status` | VarChar | `nullable` | – | Status booking. Nilai bebas (bukan enum) - perlu dicek ke kode untuk daftar pastinya (kemungkinan `pending`/`confirmed`/`cancelled`, dsb). |
| `specialRequests` | Text | `nullable` | – | Permintaan khusus dari mentee. |
| `material` | Text | `nullable` | – | Catatan materi yang diminta/dibawa. |
| `expectedOutput` | Text | `nullable` | – | Ekspektasi hasil/output dari mentee. |
| `supportDocument` | Text | `nullable` | – | Dokumen pendukung (path/link). |
| `createdAt` | Timestamp | `nullable` | `now()` | Waktu baris dibuat. |
| `updatedAt` | Timestamp | `nullable` | – | Tidak `@updatedAt` - manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `menteeId` → `users.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 2**: `mentoringServiceId` → `mentoring_services.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 3**: `referralUsageId` → `referral_usages.id` (relasi `"ReferralUsageBooking"`) - `onDelete: Cascade`, `onUpdate: Cascade`. Opsional (`nullable` + `@unique` = 1:1 kalau terisi).

#### 📌 Catatan

- `menteeId` **tidak pakai `@map`**, jadi nama kolom fisiknya persis
  `menteeId` (camelCase) - sama seperti kasus `mentor_report` sebelumnya,
  beda dari konvensi snake_case mayoritas tabel lain.
- Selain `participants` (dibahas di bawah), `bookings` juga jadi rujukan
  untuk `voucherUsage` (relasi `"VoucherUsageBooking"`, 1:1, modul Voucher
  & Redeem Code - belum dibahas) dan `invoice` (`BookingInvoice`, 1:1,
  sudah dibahas di 5.82).

---

### 5.16 `booking_participants`

**Fungsi tabel**: Daftar peserta individual dalam satu `bookings` -
relevan untuk booking bertipe grup (mis. Group Mentoring) di mana satu
transaksi booking bisa punya banyak peserta, masing-masing dengan status
pembayaran sendiri-sendiri.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris peserta. |
| `bookingId` | String | `NOT NULL`, 🔗 FK | – | Booking mana yang diikuti peserta ini. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | User yang jadi peserta. |
| `paymentStatus` | String | `NOT NULL` | – | Status pembayaran peserta ini. Menurut komentar developer di skema: contoh nilainya `'pending'`, `'confirmed'`, dsb - tapi tetap bukan `enum` (bebas, tidak divalidasi database). |
| `paymentId` | String | `nullable`, 🔗 FK | – | Menunjuk ke transaksi `Payment` terkait peserta ini (sudah dibahas di 5.81). |
| `isLeader` | Boolean | `NOT NULL` | `false` | Lihat catatan di bawah. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `bookingId` → `bookings.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 3**: `paymentId` → `payments.id` (relasi `"ParticipantPayment"`) - *(tidak ada `onDelete` eksplisit, pakai default provider.)*

#### 📌 Catatan Makna Nilai: `isLeader`

Kemungkinan besar menandai **siapa pemesan utama/kontak utama** dalam
satu booking grup - `true` = peserta ini yang jadi "ketua" (biasanya yang
pertama kali melakukan booking), `false` = peserta tambahan biasa yang
ikut ditambahkan ke booking yang sama.

---

### 5.17 `certificates`

**Fungsi tabel**: Sertifikat kelulusan untuk program **mentoring**
(bukan e-learning - e-learning punya tabel sertifikat sendiri,
`ct_e_learning_certificates`, yang sudah/akan dibahas terpisah di modul
E-Learning). Diterbitkan untuk mentee yang sudah menyelesaikan satu
`mentoring_services`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik sertifikat. |
| `menteeId` | String | `NOT NULL`, 🔗 FK | – | Mentee penerima sertifikat. |
| `serviceId` | String | `NOT NULL`, 🔗 FK | – | Program mentoring yang diselesaikan. |
| `certificateNumber` | VarChar | `NOT NULL`, `@unique` | – | Nomor sertifikat, dipakai juga di halaman verifikasi publik. |
| `issueDate` | Timestamp(6) | `nullable` | `now()` | Tanggal sertifikat diterbitkan. |
| `certificatePath` | VarChar | `nullable` | – | Path file sertifikat di server. |
| `googleDriveUrl` | VarChar | `nullable` | – | Link Google Drive sertifikat (pola sama seperti sertifikat e-learning yang sudah kita bahas - dipakai untuk preview `/preview` di iframe). |
| `projectCertificatePath` | VarChar | `nullable` | – | Path sertifikat halaman ke-2 (kompetensi/project) - mirip pola dokumen 2-halaman "Sertifikat & Kompetensi" di e-learning. |
| `status` | VarChar | `nullable` | – | Menurut komentar developer di skema: nilainya `generated`, `sent`, atau `viewed`. Bukan `enum` - tidak divalidasi database, harus konsisten dijaga di kode. |
| `verifiedBy` | VarChar | `nullable` | – | ID admin/mentor yang memverifikasi (opsional). ⚠️ **Bukan foreign key sungguhan** - cuma kolom teks biasa yang menyimpan ID, tidak ada relasi/`onDelete` yang menjaga integritasnya ke tabel `users`. |
| `note` | VarChar | `nullable` | – | Catatan internal admin (tidak untuk publik). |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu baris dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Tidak `@updatedAt` - manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `menteeId` → `users.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 2**: `serviceId` → `mentoring_services.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- **Constraint tambahan**: `@@unique([menteeId, serviceId])` - satu
  mentee cuma bisa punya **satu** sertifikat per program (tidak bisa
  diterbitkan dobel untuk program yang sama).

#### 📌 Catatan

Nilai `status` (`generated`/`sent`/`viewed`) di tabel ini **konsisten**
dengan pola `StatusBadge` yang sudah pernah kita lihat di komponen
`CertificateVerifiedCard.tsx` untuk sertifikat e-learning - kemungkinan
besar dua sistem sertifikat ini (mentoring & e-learning) memang dirancang
mengikuti alur status yang sama, meski disimpan di tabel terpisah.

---

### 5.18 `feedback`

**Fungsi tabel**: Feedback/rating dari peserta terhadap **satu sesi
mentoring spesifik** (`mentoring_sessions`) - bukan feedback untuk
keseluruhan program, tapi per pertemuan individual.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik feedback. |
| `sessionId` | String | `NOT NULL`, 🔗 FK | – | Sesi mentoring yang diberi feedback. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | User yang memberi feedback. |
| `rating` | Decimal(3,1) | `NOT NULL` | – | Angka rating, mendukung 1 desimal (mis. `4.5`). Rentang nilai tidak dibatasi `CHECK` di database. |
| `comment` | Text | `nullable` | – | Isi komentar/feedback. |
| `submittedDate` | Timestamp(6) | `nullable` | `now()` | Tanggal feedback dikirim. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu baris dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Tidak `@updatedAt` - manual. |
| `isAnonymous` | Boolean | `NOT NULL` | `false` | Sesuai komentar developer di skema: **"Jika true, nama user tidak ditampilkan"**. |
| `isVisible` | Boolean | `NOT NULL` | `true` | Sesuai komentar developer di skema: **"Bisa di-hide admin dari publik"** - jadi `false` berarti feedback ini sengaja disembunyikan admin dari tampilan publik, bukan dihapus. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `sessionId` → `mentoring_sessions.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- **Constraint tambahan**: `@@unique([sessionId, userId])` - sesuai
  komentar developer di skema: **"Satu user hanya bisa beri satu
  feedback untuk satu session"**.

---

### 5.19 `mentor_earning_summaries`

**Fungsi tabel**: Ringkasan/rekap pendapatan seorang mentor - tabel
**cache agregat** (bukan sumber transaksi mentah) yang dipakai untuk
menampilkan dashboard earning mentor tanpa perlu menghitung ulang dari
seluruh riwayat transaksi setiap kali halaman dibuka.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik ringkasan. |
| `mentorProfileId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Mentor pemilik ringkasan ini (1:1). |
| `totalEarnings` | Decimal | `NOT NULL` | – | Total pendapatan *all-time*. Sesuai komentar developer: **sudah dipotong bagi hasil (share) platform**, jadi ini angka net, bukan gross transaksi. |
| `totalThisMonth` | Decimal | `NOT NULL` | – | Total pendapatan bulan berjalan (net, sudah dipotong share). |
| `totalLastMonth` | Decimal | `NOT NULL` | – | Total pendapatan bulan lalu (net, sudah dipotong share). |
| `growthPercent` | Int | `NOT NULL` | – | Persentase pertumbuhan, kemungkinan dihitung dari perbandingan `totalThisMonth` vs `totalLastMonth`. |
| `updatedAt` | DateTime | `NOT NULL` | *(auto)* | Pakai `@updatedAt` - **otomatis** ter-update Prisma. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu baris dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `mentorProfileId` → `mentor_profiles.id` - `onDelete: Cascade`, `onUpdate: Cascade`.

#### 📌 Catatan

`updatedAt` di tabel ini **otomatis** (`@updatedAt`) - menambah daftar
tabel dengan perilaku ini selain `mentor_report`, berbeda dari mayoritas
tabel lain di modul Mentoring (`users`, `mentor_profiles`,
`mentoring_services`, `bookings`, `certificates`, `feedback`) yang
`updatedAt`-nya **manual**. Kalau ada kebutuhan audit lintas tabel
berbasis `updatedAt`, penting diingat tidak semua tabel berperilaku sama.

---

*(Modul **Mentoring & Booking** sudah lengkap dengan ini. Tabel-tabel
yang direferensikan tapi belum dibahas - `Payment`, `BookingInvoice`,
`ReferralUsage`, `VoucherUsage` - masing-masing masuk ke modul lain dan
akan dibahas di bagiannya sendiri.)*

## Modul: AYCL (All You Can Learn)

> ℹ️ **Catatan pola untuk seluruh modul ini**: Berbeda dari
> mayoritas tabel lain (`users`, `mentoring_*`, dst.) yang rajin pakai
> `@map(...)` untuk konversi ke snake_case, **seluruh tabel AYCL sama
> sekali tidak pakai `@map` di level kolom** - cuma nama tabelnya saja
> yang di-`@map` ke snake_case (`aycl_batches`, dst). Artinya nama kolom
> fisik di database modul ini **persis camelCase** seperti nama field di
> Prisma-nya (`batchId`, `startTime`, `whatsappGroupLink`, dst) - bukan
> `batch_id`, `start_time`. Ini konsisten di seluruh 6 tabel di bawah,
> jadi tidak saya ulang-ulang di tiap tabel.

### 5.20 `aycl_batches`

**Fungsi tabel**: Master data satu batch/angkatan program AYCL - mirip
peran `mentoring_services` di modul Mentoring, tapi untuk program AYCL.
Berisi info landing page (headline, sub-headline) sekaligus harga & masa
aktif program.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik batch. |
| `title` | Text | `NOT NULL` | – | Nama batch. |
| `slug` | Text | `NOT NULL`, `@unique` | – | Slug URL-friendly untuk halaman detail. |
| `headline` | Text | `NOT NULL` | – | Judul besar di hero landing page. Contoh dari komentar developer: *"All You Can Learn • Data Analyst Program"*. |
| `subHeadline` | Text | `nullable` | – | Sub-judul pendukung headline. Contoh: *"Upgrade skill Data Analyst..."*. |
| `description` | Text | `nullable` | – | Intro singkat program. |
| `whatsappGroupLink` | Text | `nullable` | – | Link grup WhatsApp peserta. |
| `price` | Decimal | `NOT NULL` | – | Harga program. |
| `startDate` | DateTime | `nullable` | – | Tanggal mulai batch. |
| `endDate` | DateTime | `nullable` | – | Tanggal selesai batch. |
| `isActive` | Boolean | `NOT NULL` | `true` | `false` = batch tidak ditampilkan/tidak bisa dibooking lagi. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu baris dibuat. |
| `updatedAt` | DateTime | `nullable` | *(auto)* | Pakai `@updatedAt` - otomatis ter-update Prisma (walau tipe kolomnya tetap nullable di skema). |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: *(tidak ada)* - tabel induk modul AYCL.

#### Relasi ke Tabel Lain (ringkasan)

`schedules` (→ `aycl_schedules`), `bookings` (→ `aycl_bookings`),
`sections` (→ `aycl_sections`), `materials` (→ `aycl_materials`).

---

### 5.21 `aycl_sections`

**Fungsi tabel**: Konten section pada halaman landing satu
`aycl_batches` - mirip peran `mentoring_sections`, tapi dengan struktur
JSON yang **berbeda-beda per tipe** (lihat catatan di bawah - ini beda
dari `mentoring_sections` yang formatnya seragam untuk semua tipe).

**Enum `AYCLSectionType`** (dengan makna dari komentar developer di
skema):

| Nilai | Makna (label yang ditampilkan) |
|---|---|
| `PROGRAM_INFO` | "Ini Program Apa?" |
| `CHALLENGE` | "Biasanya Tantangannya..." |
| `TARGET` | "Cocok untuk Siapa?" |
| `DIFFERENTIATOR` | "Kenapa AYCL .... berbeda?" |
| `BENEFIT` | "Apa yang kamu dapatkan?" |
| `CLOSING` | Penutup |

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik section. |
| `batchId` | String | `NOT NULL`, 🔗 FK | – | Section ini milik batch yang mana. |
| `type` | Enum `AYCLSectionType` | `NOT NULL` | – | Jenis section (lihat tabel makna di atas). |
| `title` | Text | `NOT NULL` | – | Judul section. |
| `content` | Json | `NOT NULL` | – | Struktur **berbeda tiap `type`** - lihat catatan di bawah. |
| `order` | Int | `NOT NULL` | – | Urutan tampil section. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `batchId` → `aycl_batches.id` - `onDelete: Cascade`.
- **Index tambahan**: `@@index([batchId, order])`.

#### 📌 Catatan Penting: Struktur `content` per `type`

⚠️ Berbeda dari `mentoring_sections.content` yang formatnya **seragam**
(`{title, description}`) untuk semua tipe, di tabel ini struktur JSON-nya
**beda-beda tergantung nilai `type`** (langsung dari komentar developer
di skema):

| `type` | Struktur `content` |
|---|---|
| `PROGRAM_INFO` | `{ text: string }` |
| `CHALLENGE` | `{ items: string[] }` |
| `TARGET` | `{ items: string[] }` |
| `DIFFERENTIATOR` | `{ items: { title: string, desc: string }[] }` |
| `BENEFIT` | `{ items: string[] }` |
| `CLOSING` | `{ text: string }` |

Kode yang membaca kolom ini **wajib** cek `type` dulu sebelum parsing
`content`, karena bentuknya tidak seragam.

---

### 5.22 `aycl_materials`

**Fungsi tabel**: Daftar materi/silabus ringkas yang ditampilkan di
halaman promosi satu batch AYCL (judul + deskripsi topik) - bukan konten
belajar lengkap seperti `ELearningText`, ini lebih ke daftar topik untuk
landing page.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik materi. |
| `batchId` | String | `NOT NULL`, 🔗 FK | – | Materi ini milik batch yang mana. |
| `title` | Text | `NOT NULL` | – | Judul materi/topik. |
| `description` | Text | `nullable` | – | Deskripsi singkat topik. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `batchId` → `aycl_batches.id` - `onDelete: Cascade`.

#### 📌 Catatan

Tabel ini **tidak punya kolom `order`** (beda dengan `aycl_sections`)
dan juga **tidak punya `createdAt`**. Urutan tampil materi kemungkinan
cuma mengikuti urutan baris di database (insert order) - kalau butuh
urutan yang bisa diatur manual, perlu ditambahkan kolom `order` di masa
depan.

---

### 5.23 `aycl_schedules`

**Fungsi tabel**: Jadwal sesi pertemuan untuk satu batch AYCL - mirip
peran `mentoring_sessions`, plus kolom kuota peserta per jadwal.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik jadwal. |
| `batchId` | String | `NOT NULL`, 🔗 FK | – | Jadwal ini bagian dari batch yang mana. |
| `title` | Text | `NOT NULL` | – | Judul sesi. |
| `date` | **DateTime** | `NOT NULL` | – | Tanggal sesi. |
| `startTime` | **DateTime** | `NOT NULL` | – | Jam mulai. |
| `endTime` | **DateTime** | `NOT NULL` | – | Jam selesai. |
| `googleMeetLink` | Text | `nullable` | – | Link Google Meet. |
| `quota` | Int | `nullable` | – | Kapasitas maksimal peserta jadwal ini. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu baris dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `batchId` → `aycl_batches.id` - `onDelete: Cascade`.
- **Index tambahan**: `@@index([batchId])`.

#### 📌 Catatan Perbandingan dengan `mentoring_sessions`

Menariknya, tabel ini pakai tipe **`DateTime` asli** untuk `date`,
`startTime`, `endTime` - **kebalikan** dari `mentoring_sessions` (modul
Mentoring) yang menyimpan ketiganya sebagai `String` biasa. Dua modul
dengan konsep serupa (jadwal sesi), tapi pendekatan tipe datanya beda -
baik untuk diketahui kalau ada rencana menyeragamkan pola di masa depan.

#### Relasi ke Tabel Lain

`participants` (→ `aycl_participants`).

---

### 5.24 `aycl_bookings`

**Fungsi tabel**: Transaksi booking/pendaftaran peserta untuk satu
`aycl_batches` - mirip peran `bookings` (Mentoring), tapi dilengkapi
data profiling pendaftar (institusi, semester, usia, alasan mendaftar,
dsb.) yang tampak seperti bagian dari form screening peserta.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik booking. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | User yang mendaftar. |
| `batchId` | String | `NOT NULL`, 🔗 FK | – | Batch yang didaftar. |
| `referralUsageId` | String | `nullable`, `@unique`, 🔗 FK | – | Terisi kalau booking ini pakai kode referral (opsional 1:1). |
| `status` | String | `NOT NULL` | – | Sesuai komentar developer di skema: nilainya `pending`, `confirmed`, `completed`, atau `cancelled`. Bukan `enum` - tetap tidak divalidasi database. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu booking dibuat. |
| `currentStatus` | Text | `nullable` | – | Status pendaftar saat ini (freetext, mis. "Mahasiswa"/"Fresh Graduate"). |
| `institution` | Text | `nullable` | – | Nama institusi/kampus pendaftar. |
| `studyProgram` | Text | `nullable` | – | Program studi pendaftar. |
| `semester` | Text | `nullable` | – | Semester pendaftar (bertipe teks, bukan angka - kemungkinan supaya bisa diisi nilai non-angka seperti "Sudah Lulus"). |
| `age` | Int | `nullable` | – | Usia pendaftar. |
| `reason` | Text | `nullable` | – | Alasan mendaftar (freetext panjang). |
| `familiarity` | Text | `nullable` | – | Tingkat familiaritas pendaftar dengan topik program (freetext). |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `batchId` → `aycl_batches.id` - `onDelete: Cascade`.
- 🔗 **FK 3**: `referralUsageId` → `referral_usages.id` (relasi
  `"ReferralUsageAYCL"`) - *(tidak ada `onDelete` eksplisit)*. Opsional
  1:1.

#### 📌 Catatan

- Field profiling (`currentStatus`, `institution`, `studyProgram`,
  `semester`, `age`, `reason`, `familiarity`) **tidak ada** di
  `bookings` (modul Mentoring) - jadi form pendaftaran AYCL memang
  dirancang beda dari booking mentoring biasa, kemungkinan untuk
  keperluan seleksi/screening calon peserta.
- Berbeda dari `bookings.status` (modul Mentoring) yang tidak dikasih
  contoh nilai sama sekali di komentar developer, `status` di sini
  **eksplisit** disebutkan 4 nilainya di skema - jadi lebih pasti untuk
  didokumentasikan.

#### Relasi ke Tabel Lain (ringkasan)

`payment` (→ `Payment`, 1:1, modul Payment & Withdrawal - belum
dibahas), `voucherUsage` (→ `VoucherUsage`, relasi `"VoucherUsageAYCL"`,
1:1, modul Voucher & Redeem Code - belum dibahas), `participants` (→
`aycl_participants`).

---

### 5.25 `aycl_participants`

**Fungsi tabel**: Tabel pivot yang menghubungkan satu `aycl_bookings` ke
jadwal (`aycl_schedules`) spesifik yang diikuti - karena satu booking
bisa mengikuti lebih dari satu jadwal sesi dalam batch yang sama.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris partisipasi. |
| `bookingId` | String | `NOT NULL`, 🔗 FK | – | Booking mana yang berpartisipasi. |
| `scheduleId` | String | `NOT NULL`, 🔗 FK | – | Jadwal sesi yang diikuti. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu baris dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `bookingId` → `aycl_bookings.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `scheduleId` → `aycl_schedules.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([bookingId, scheduleId])` - satu
  booking tidak bisa terdaftar dobel di jadwal yang sama.

---

*(Modul **AYCL** sudah lengkap dengan ini. Tabel `Payment` dan
`VoucherUsage` yang direferensikan akan dibahas di modul masing-masing.)*
## Modul: E-Learning

> ℹ️ **Catatan pola untuk seluruh modul ini**: Modul E-Learning punya struktur
> berlapis: `ELearningCourse` → `ELearningSubChapter` → `ELearningSubBab` →
> `ELearningText`, lalu tiap `Text` dipecah jadi `ELearningTextBlock`
> (kontainer urutan), dan tiap block berisi kombinasi **konten struktural**
> (`ELearningContentBlock` - heading/paragraph/accordion/dst, 8 tipe) dan/atau
> **konten interaktif** (`ELearningAdditionalContent` - video/kuis
> pilihan-ganda/matching/kode, 4 tipe). Dua-duanya pakai pola "polimorfik"
> Prisma yang sama: kolom `type` menyimpan tipe kontennya, lalu ada 4-8
> relasi 1:1 opsional (satu per tipe) di mana cuma **satu** yang benar-benar
> terisi untuk satu baris - kode aplikasi wajib cek `type` dulu sebelum
> mengambil relasi yang sesuai, karena Prisma/DB tidak memaksakan
> eksklusivitas ini.
>
> Penamaan tabel fisik juga tidak seragam: tabel struktur inti & tracking
> (`e_learning_courses`, `e_learning_sub_babs`, `e_learning_progress`, dst)
> pakai prefix `e_learning_`, sedangkan tabel-tabel "tipe konten" di dalam
> block (heading, paragraph, accordion, quiz, assignment, dst) pakai prefix
> `ct_e_learning_` (kemungkinan "**c**ontent **t**ype") - kecuali
> `e_learning_code_runs`, yang walau termasuk keluarga "tipe konten" (log
> eksekusi kode) tetap pakai prefix `e_learning_` biasa. Pemakaian `@map`
> di level kolom juga tidak konsisten antar tabel (sebagian tabel mapping
> penuh ke snake_case, sebagian membiarkan nama kolom fisik tetap camelCase)
> - dicatat per tabel kalau relevan.

### 5.26 `e_learning_audit_logs`

**Fungsi tabel**: Log audit khusus modul E-Learning - mencatat setiap
perubahan (create/update/delete/publish/archive) yang dilakukan mentor/admin
terhadap `COURSE`, `SUB_CHAPTER`, `SUB_BAB`, atau `TEXT`, lengkap dengan
snapshot nilai lama & baru.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris log. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | User (mentor/admin) yang melakukan aksi. |
| `entityType` | Enum `ELearningAuditEntityType` | `NOT NULL` | – | Entitas yang diaudit: `COURSE`, `SUB_CHAPTER`, `SUB_BAB`, atau `TEXT`. |
| `entityId` | String | `NOT NULL` | – | ID baris entitas yang diaudit. **Bukan FK sungguhan** - lihat catatan. |
| `action` | Enum `ELearningAuditAction` | `NOT NULL` | – | `CREATE`, `UPDATE`, `DELETE`, `PUBLISH`, atau `ARCHIVE`. |
| `description` | VarChar | `nullable` | – | Deskripsi ringkas perubahan (biasanya teks dinamis, mis. "mengubah judul dari X ke Y"). |
| `oldValue` | Json | `nullable` | – | Snapshot nilai sebelum perubahan. |
| `newValue` | Json | `nullable` | – | Snapshot nilai setelah perubahan. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu aksi terjadi. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `userId` → `users.id` - `onDelete: Cascade`.
- **Index tambahan**: `@@index([entityType, entityId])`, `@@index([userId])`, `@@index([createdAt])`.

#### 📌 Catatan

`entityId` bersifat **polimorfik** - tabel tujuannya berbeda-beda tergantung
nilai `entityType` (bisa merujuk ke `e_learning_courses`, `e_learning_sub_chapters`,
`e_learning_sub_babs`, atau `e_learning_texts`). Karena itu tidak dideklarasikan
sebagai relasi Prisma/FK sungguhan - join ke tabel yang tepat harus dilakukan
manual di kode aplikasi berdasarkan `entityType`.

---

### 5.27 `e_learning_courses`

**Fungsi tabel**: Master data satu course E-Learning (dibuat oleh mentor) -
induk tertinggi dari struktur konten belajar di modul ini.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik course. |
| `mentorId` | String | `NOT NULL`, 🔗 FK | – | Mentor pembuat/pemilik course. |
| `title` | VarChar | `NOT NULL` | – | Judul course. |
| `description` | Text | `nullable` | – | Deskripsi course. |
| `thumbnailImages` | VarChar[] | `NOT NULL` | – | Array URL/path gambar thumbnail. |
| `category` | VarChar | `nullable` | – | Kategori course (freetext). |
| `tags` | VarChar[] | `NOT NULL` | – | Array tag/topik course. |
| `targetAudience` | VarChar | `nullable` | – | Target peserta yang dituju. |
| `level` | VarChar | `nullable` | – | Tingkat kesulitan (freetext, contoh dari komentar developer: Beginner/Intermediate/Advanced). |
| `estimatedDuration` | VarChar | `nullable` | – | Estimasi durasi belajar (freetext, mis. "4 minggu"). |
| `benefits` | Text | `nullable` | – | Manfaat mengikuti course. |
| `toolsUsed` | Text | `nullable` | – | Tools/software yang dipakai di course. |
| `isActive` | Boolean | `nullable` | `true` | `false` = course tidak ditampilkan/dinonaktifkan. |
| `slug` | String | `nullable`, `@unique` | – | Slug URL-friendly. Nullable + unique - boleh kosong sebelum course siap dipublikasikan. |
| `status` | Enum `CourseStatus` | `nullable` | `DRAFT` | `DRAFT`, `PUBLISHED`, atau `ARCHIVED`. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Waktu terakhir diupdate - manual, tidak pakai `@updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `mentorId` → `mentor_profiles.id` (relasi `"MentorCourses"`) - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`subChapters` (→ `e_learning_sub_chapters`), `discussions` (→
`e_learning_discussions`), `streamCounts` (→ `e_learning_course_stream_counts`).

#### 📌 Catatan

`level` di sini freetext dengan 3 contoh nilai (Beginner/Intermediate/Advanced),
sementara kolom `level` yang sama namanya di `e_learning_sub_chapters` (5.29)
punya 4 contoh nilai (ditambah "Professional") - keduanya tetap `VarChar`
biasa (bukan enum bersama), jadi konsistensi nilainya bergantung sepenuhnya
pada validasi di kode aplikasi, bukan DB.

---

### 5.28 `e_learning_course_stream_counts`

**Fungsi tabel**: Penghitung jumlah klik "stream"/tonton course per akun -
dipakai untuk menampilkan angka "jumlah peserta" di halaman course, dengan
cap anti-spam.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik baris. |
| `courseId` | String | `NOT NULL`, 🔗 FK | – | Course yang di-stream. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Akun yang melakukan klik stream. |
| `streamCount` | Int | `NOT NULL` | `0` | Jumlah klik stream akun ini untuk course ini. **Di-cap MAX 10 di level service** (bukan di DB). |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu baris pertama dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | *(auto)* | Pakai `@updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `courseId` → `e_learning_courses.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- **Constraint tambahan**: `@@unique([courseId, userId])`, `@@index([courseId])`.

#### 📌 Catatan

Sesuai komentar developer di skema: begitu `streamCount` sampai 10, klik
berikutnya dari akun yang sama jadi *no-op* (tidak menambah angka lagi),
supaya satu akun tidak bisa nge-spam angka "peserta" jadi tidak wajar. Satu
baris per pasangan (course, user) - ini yang membuat cap-nya gampang
di-enforce: service meng-*upsert* ke baris yang sama, bukan bikin baris baru
tiap klik.

---

### 5.29 `e_learning_sub_chapters`

**Fungsi tabel**: Modul/bab di dalam satu course - level ini juga yang jadi
tempat menempelnya rating (`ELearningReview`) dan sertifikat kelulusan
(`ELearningCertificate`), bukan di level `ELearningCourse`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik sub-chapter. |
| `courseId` | String | `NOT NULL`, 🔗 FK | – | Course induk. |
| `title` | VarChar | `NOT NULL` | – | Judul sub-chapter. |
| `coverImage` | Text | `nullable` | – | Gambar sampul. |
| `description` | Text | `nullable` | – | Deskripsi. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan tampil dalam course. |
| `estimatedTime` | VarChar | `nullable` | – | Estimasi waktu pengerjaan (freetext). |
| `taskType` | Enum `TaskType` | `nullable` | – | `QUIZ`, `PROJECT`, atau `QUIZ_AND_PROJECT` - jenis tugas yang ada di sub-chapter ini. |
| `status` | Enum `CourseStatus` | `NOT NULL` | `DRAFT` | `DRAFT`, `PUBLISHED`, atau `ARCHIVED`. |
| `level` | VarChar | `nullable` | – | Freetext, contoh: Beginner/Intermediate/Advanced/Professional. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual, tidak `@updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `courseId` → `e_learning_courses.id` - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`subBabs` (→ `e_learning_sub_babs`), `progresses` (→
`e_learning_sub_chapter_progress`), `reviews` (→ `e_learning_reviews`),
`certificates` (→ `e_learning_certificates`).

#### 📌 Catatan

`taskType` hanya kolom deskriptif ringkasan (tidak divalidasi silang oleh
DB) - relasi `Quiz`/`Assignment` yang sesungguhnya menempel di level
`ELearningText` (5.31), bukan di sini. Jadi nilai `taskType` harus dijaga
konsisten secara manual di kode aplikasi dengan `Text` mana saja di dalam
sub-chapter ini yang benar-benar punya `quiz`/`assignment` terisi.

---

### 5.30 `e_learning_sub_babs`

**Fungsi tabel**: Sub-bab di dalam satu sub-chapter - unit di bawah
sub-chapter, tempat bernaungnya materi (`ELearningText`) dan juga jadi
level granularitas untuk bookmark & satu varian progress tracking
(`ELearningProgress`).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik sub-bab. |
| `subChapterId` | String | `NOT NULL`, 🔗 FK | – | Sub-chapter induk. |
| `title` | VarChar | `NOT NULL` | – | Judul sub-bab. |
| `orderNumber` | Int | `nullable` | – | Urutan tampil. Nullable, berbeda dari `orderNumber` di `e_learning_sub_chapters` yang `NOT NULL`. |
| `estimatedTime` | VarChar | `nullable` | – | Estimasi waktu (freetext). |
| `status` | Enum `CourseStatus` | `NOT NULL` | `DRAFT` | `DRAFT`, `PUBLISHED`, atau `ARCHIVED`. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `subChapterId` → `e_learning_sub_chapters.id` - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`texts` (→ `e_learning_texts`), `progresses` (→ `e_learning_progress`),
`bookmarks` (→ `e_learning_bookmarks`).

---

### 5.31 `e_learning_texts`

**Fungsi tabel**: Unit materi terkecil dalam satu sub-bab. Sesuai komentar
developer di skema ("*Tabel baru untuk menyimpan teks/penjelasan materi per
SubBab*"), satu `Text` bisa berupa materi biasa (kumpulan `blocks`), ATAU
punya satu `quiz` terlampir, ATAU satu `assignment` terlampir (opsional
1:1, saling eksklusif secara konsep meski tidak dipaksakan DB).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik text. |
| `subBabId` | String | `NOT NULL`, 🔗 FK | – | Sub-bab induk. |
| `title` | VarChar | `nullable` | – | Judul unit materi. |
| `orderNumber` | Int | `nullable` | – | Urutan tampil. |
| `status` | Enum `CourseStatus` | `NOT NULL` | `DRAFT` | `DRAFT`, `PUBLISHED`, atau `ARCHIVED`. |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | DateTime | `nullable` | `now()` | ⚠️ Punya default `now()` tapi **bukan** `@updatedAt` - jadi tidak otomatis ter-update saat baris diubah, harus di-set manual di kode. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `subBabId` → `e_learning_sub_babs.id` - `onDelete: Cascade`.
- **Index tambahan**: `@@index([subBabId])`.

#### Relasi ke Tabel Lain (ringkasan)

`quiz` (→ `ct_e_learning_quizzes`, 1:1 opsional), `assignment` (→
`ct_e_learning_assignments`, 1:1 opsional), `blocks` (→
`e_learning_text_blocks`), `progresses` (→ `e_learning_text_progress`).

---

### 5.32 `e_learning_text_blocks`

**Fungsi tabel**: Kontainer urutan di dalam satu `Text` - tiap block bisa
membawa satu atau lebih `ContentBlock` (konten struktural) dan/atau
`AdditionalContent` (konten interaktif).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik block. |
| `textId` | String | `NOT NULL`, 🔗 FK | – | Text induk. |
| `orderNumber` | Int | `nullable` | – | Urutan block dalam text. |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `textId` → `e_learning_texts.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([textId, orderNumber])`.

#### Relasi ke Tabel Lain (ringkasan)

`contentBlocks` (→ `ct_e_learning_content_blocks`), `additionalContents` (→
`ct_e_learning_additional_contents`), `progresses` (→
`e_learning_block_progress`).

---

### 5.33 `ct_e_learning_content_blocks`

**Fungsi tabel**: Tabel "router" untuk konten struktural - kolom `type`
menentukan salah satu dari 8 tabel tipe-konten (5.34-5.46) mana yang
sungguh-sungguh terisi untuk baris ini.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik content block. |
| `blockId` | String | `NOT NULL`, 🔗 FK | – | Text block induk. |
| `type` | Enum `ContentBlockType` | `NOT NULL` | – | `HEADING`, `PARAGRAPH`, `ACCORDION`, `CAROUSEL`, `CONTENT_CARD`, `TAB_NAVIGATION`, `HIGHLIGHT`, atau `SUMMARY`. |
| `orderNumber` | Int | `nullable` | – | Urutan dalam block. |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `blockId` → `e_learning_text_blocks.id` - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

Delapan relasi 1:1 opsional, satu per nilai `type`: `headingContent` (→
5.34), `paragraphContent` (→ 5.35), `accordionContent` (→ 5.37),
`carouselContent` (→ 5.39), `contentCardContent` (→ 5.41), `tabContent`
(→ 5.43), `highlightContent` (→ 5.36), `summaryContent` (→ 5.45).

#### 📌 Catatan

Ini pola "polimorfik" khas Prisma: hanya **satu** dari 8 relasi di atas yang
benar-benar punya baris terkait, sesuai nilai `type`. Prisma/DB tidak
memvalidasi keselarasan ini - kalau ada bug di kode penyimpanan, bisa saja
`type = HEADING` tapi yang tersimpan justru baris di
`ct_e_learning_paragraph_contents`, tanpa DB menolaknya.

---

### 5.34 `ct_e_learning_heading_contents`

**Fungsi tabel**: Konten tipe heading/judul di dalam content block.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `contentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Content block induk (1:1). |
| `level` | Int | `NOT NULL` | – | Level heading (mis. setara h1-h6). |
| `text` | Text | `NOT NULL` | – | Teks heading. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `contentId` → `ct_e_learning_content_blocks.id`, `@unique` (1:1) - `onDelete: Cascade`.

---

### 5.35 `ct_e_learning_paragraph_contents`

**Fungsi tabel**: Konten tipe paragraf teks biasa di dalam content block.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `contentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Content block induk (1:1). |
| `text` | Text | `NOT NULL` | – | Isi paragraf. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `contentId` → `ct_e_learning_content_blocks.id`, `@unique` (1:1) - `onDelete: Cascade`.

---

### 5.36 `ct_e_learning_highlight_contents`

**Fungsi tabel**: Konten tipe kotak highlight/sorotan singkat di dalam
content block.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `contentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Content block induk (1:1). |
| `text` | VarChar(1250) | `NOT NULL` | – | Isi highlight. Satu-satunya konten teks di modul ini dengan **batas panjang eksplisit** (1250 karakter) - tipe konten teks lain (paragraph, dst.) pakai `Text` tanpa batas. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `contentId` → `ct_e_learning_content_blocks.id`, `@unique` (1:1) - `onDelete: Cascade`.

---

### 5.37 `ct_e_learning_accordion_contents`

**Fungsi tabel**: Wadah/header konten tipe accordion (dropdown yang bisa
dibuka-tutup); item-item accordion-nya sendiri ada di tabel terpisah (5.38).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `contentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Content block induk (1:1). |
| `title` | String | `NOT NULL` | – | Judul accordion. |
| `description` | String | `nullable` | – | Deskripsi accordion. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `contentId` → `ct_e_learning_content_blocks.id`, `@unique` (1:1) - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`items` (→ `ct_e_learning_accordion_items`).

---

### 5.38 `ct_e_learning_accordion_items`

**Fungsi tabel**: Satu item/panel di dalam accordion (5.37).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `accordionId` | String | `NOT NULL`, 🔗 FK | – | Accordion induk. |
| `title` | String | `NOT NULL` | – | Judul panel. |
| `content` | String | `NOT NULL` | – | Isi panel saat dibuka. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan panel. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `accordionId` → `ct_e_learning_accordion_contents.id` - `onDelete: Cascade`.

---

### 5.39 `ct_e_learning_carousel_contents`

**Fungsi tabel**: Wadah/header konten tipe carousel (slider kartu geser);
item-itemnya ada di tabel terpisah (5.40).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `contentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Content block induk (1:1). |
| `title` | String | `NOT NULL` | – | Judul carousel. |
| `description` | String | `nullable` | – | Deskripsi carousel. |
| `cardsPerSlide` | Int | `nullable` | – | Jumlah kartu yang tampil per slide. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `contentId` → `ct_e_learning_content_blocks.id`, `@unique` (1:1) - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`items` (→ `ct_e_learning_carousel_items`).

---

### 5.40 `ct_e_learning_carousel_items`

**Fungsi tabel**: Satu kartu/slide di dalam carousel (5.39).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `carouselId` | String | `NOT NULL`, 🔗 FK | – | Carousel induk. |
| `title` | String | `NOT NULL` | – | Judul kartu. |
| `image` | String | `nullable` | – | Gambar kartu. |
| `content` | String | `nullable` | – | Isi teks kartu. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan kartu. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `carouselId` → `ct_e_learning_carousel_contents.id` - `onDelete: Cascade`.

---

### 5.41 `ct_e_learning_content_card_contents`

**Fungsi tabel**: Wadah/header konten tipe kartu-konten (grid kartu dengan
opsi konten yang bisa di-expand); item-itemnya ada di tabel terpisah (5.42).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `contentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Content block induk (1:1). |
| `title` | String | `NOT NULL` | – | Judul grup kartu. |
| `description` | String | `nullable` | – | Deskripsi grup kartu. |
| `disableExpandableContent` | Boolean | `NOT NULL` | *(tidak ada)* | Mematikan fitur expand konten kartu. **Tidak punya `@default`** - berbeda dari mayoritas kolom Boolean lain di modul ini yang selalu punya default - jadi kode penyimpanan **wajib** selalu mengirim nilai eksplisit untuk kolom ini. |
| `items` | - | - | - | *(relasi, lihat di bawah)* |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `contentId` → `ct_e_learning_content_blocks.id`, `@unique` (1:1) - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`items` (→ `ct_e_learning_content_card_items`).

---

### 5.42 `ct_e_learning_content_card_items`

**Fungsi tabel**: Satu kartu di dalam grup kartu-konten (5.41).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `cardId` | String | `NOT NULL`, 🔗 FK | – | Grup kartu induk. |
| `title` | String | `NOT NULL` | – | Judul kartu. |
| `content` | String | `NOT NULL` | – | Isi ringkas kartu (selalu tampil). |
| `expandableContent` | String | `nullable` | – | Isi tambahan yang muncul saat kartu di-expand (kalau `disableExpandableContent` di induknya `false`). |
| `orderNumber` | Int | `NOT NULL` | – | Urutan kartu. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `cardId` → `ct_e_learning_content_card_contents.id` - `onDelete: Cascade`.

---

### 5.43 `ct_e_learning_tab_navigation_contents`

**Fungsi tabel**: Wadah/header konten tipe navigasi tab; tab-tabnya ada di
tabel terpisah (5.44).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `contentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Content block induk (1:1). |
| `title` | String | `NOT NULL` | – | Judul grup tab. |
| `description` | String | `nullable` | – | Deskripsi grup tab. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `contentId` → `ct_e_learning_content_blocks.id`, `@unique` (1:1) - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`tabs` (→ `ct_e_learning_tab_items`).

---

### 5.44 `ct_e_learning_tab_items`

**Fungsi tabel**: Satu tab di dalam grup navigasi tab (5.43).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `tabId` | String | `NOT NULL`, 🔗 FK | – | Grup tab induk. |
| `title` | String | `NOT NULL` | – | Judul/label tab. |
| `content` | String | `NOT NULL` | – | Isi konten tab. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan tab. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `tabId` → `ct_e_learning_tab_navigation_contents.id` - `onDelete: Cascade`.

---

### 5.45 `ct_e_learning_summary_contents`

**Fungsi tabel**: Wadah konten tipe ringkasan (biasanya di akhir materi);
poin-poin ringkasannya ada di tabel terpisah (5.46).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `contentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Content block induk (1:1). |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `contentId` → `ct_e_learning_content_blocks.id`, `@unique` (1:1) - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`comments` (→ `ct_e_learning_summary_comments`).

#### 📌 Catatan

Tabel ini tidak punya kolom teks sendiri (tidak ada `title`/`description`
seperti tipe konten lain) - isinya murni daftar poin dari
`ct_e_learning_summary_comments`.

---

### 5.46 `ct_e_learning_summary_comments`

**Fungsi tabel**: Satu poin/baris ringkasan di dalam konten summary (5.45).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `summaryId` | String | `NOT NULL`, 🔗 FK | – | Summary induk. |
| `comment` | String | `NOT NULL` | – | Isi poin ringkasan. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan poin. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `summaryId` → `ct_e_learning_summary_contents.id` - `onDelete: Cascade`.

---

### 5.47 `ct_e_learning_additional_contents`

**Fungsi tabel**: Tabel "router" untuk konten **interaktif** - pasangan dari
`ct_e_learning_content_blocks` (5.33), tapi untuk 4 tipe elemen interaktif
(video, pilihan ganda, matching, kode eksekusi) yang ditempelkan relatif
terhadap konten struktural di block yang sama.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `blockId` | String | `NOT NULL`, 🔗 FK | – | Text block induk. |
| `type` | Enum `AdditionalContentType` | `NOT NULL` | – | `IMAGE_VIDEO`, `MULTIPLE_CHOICE`, `MATCHING`, atau `INTERACTIVE_CODE`. |
| `position` | Enum `AnchorPosition` | `NOT NULL` | – | `BEFORE`, `AFTER`, atau `INLINE` - posisi elemen interaktif relatif terhadap konten struktural di block yang sama. |
| `orderNumber` | Int | `nullable` | – | Urutan bila ada beberapa additional content di block yang sama. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `blockId` → `e_learning_text_blocks.id` - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

Empat relasi 1:1 opsional, satu per nilai `type`: `video` (→ 5.52),
`multipleChoice` (→ 5.50), `matching` (→ 5.48), `code` (→ 5.53).

#### 📌 Catatan

Pola polimorfik yang sama seperti `ct_e_learning_content_blocks` (5.33),
tapi khusus elemen interaktif. `position` menentukan elemen ini dirender di
mana relatif terhadap urutan konten struktural (`ContentBlock`) di dalam
`ELearningTextBlock` yang sama.

---

### 5.48 `ct_e_learning_matching_questions`

**Fungsi tabel**: Soal tipe mencocokkan (matching) sebagai salah satu jenis
konten interaktif; pasangan kiri-kanannya ada di tabel terpisah (5.49).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `additionalContentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Additional content induk (1:1). |
| `title` | String | `nullable` | – | Judul soal. |
| `instruction` | String | `nullable` | – | Instruksi pengerjaan. |
| `maxScore` | Float | `nullable` | `100` | Skor maksimal soal. |
| `explanation` | Text | `nullable` | – | Penjelasan jawaban. |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `additionalContentId` → `ct_e_learning_additional_contents.id`, `@unique` (1:1) - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`items` (→ `ct_e_learning_matching_items`).

---

### 5.49 `ct_e_learning_matching_items`

**Fungsi tabel**: Satu item (baik dari sisi kiri maupun kanan) di dalam
soal matching (5.48).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `questionId` | String | `NOT NULL`, 🔗 FK | – | Soal matching induk. |
| `content` | Text | `NOT NULL` | – | Isi item. |
| `side` | Enum `MatchingItemSide` | `NOT NULL` | – | `LEFT` atau `RIGHT`. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan tampil dalam sisinya. |
| `matchWithId` | String | `nullable` | – | ID item pasangannya (di sisi lain) yang benar. **Bukan FK sungguhan** - lihat catatan. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `questionId` → `ct_e_learning_matching_questions.id` - `onDelete: Cascade`.

#### 📌 Catatan

`matchWithId` tidak dideklarasikan sebagai relasi/FK Prisma - cuma kolom
String biasa yang (kemungkinan besar) menyimpan `id` baris lain di tabel
yang sama untuk menandai pasangan LEFT-RIGHT yang benar. Karena bukan FK
sungguhan, integritas datanya (memastikan `matchWithId` valid & konsisten
dengan `side`-nya) sepenuhnya jadi tanggung jawab kode aplikasi, tidak
dipaksakan oleh DB.

---

### 5.50 `ct_e_learning_multiple_choice_questions`

**Fungsi tabel**: Soal pilihan ganda sebagai salah satu jenis konten
interaktif; opsi-opsinya ada di tabel terpisah (5.51). Berbeda dari
`ct_e_learning_questions` (5.56) yang dipakai khusus untuk `ELearningQuiz` -
ini dipakai untuk pilihan ganda yang ditempel langsung sebagai konten
interaktif di tengah materi.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `additionalContentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Additional content induk (1:1). |
| `question` | Text | `NOT NULL` | – | Teks pertanyaan. |
| `description` | String | `nullable` | – | Keterangan tambahan soal. |
| `allowMultiple` | Boolean | `NOT NULL` | `false` | `true` = boleh pilih lebih dari satu jawaban benar. |
| `explanation` | String | `nullable` | – | Penjelasan jawaban. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `additionalContentId` → `ct_e_learning_additional_contents.id`, `@unique` (1:1) - `onDelete: Cascade`. **Catatan**: kolom FK ini (dan `questionId` di 5.51) tidak pakai `@map` sama sekali - beda dari kebanyakan kolom `*Id` di modul ini yang di-`@map` ke snake_case.

#### Relasi ke Tabel Lain (ringkasan)

`options` (→ `ct_e_learning_multiple_choice_options`).

---

### 5.51 `ct_e_learning_multiple_choice_options`

**Fungsi tabel**: Satu opsi jawaban di dalam soal pilihan ganda (5.50).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `questionId` | String | `NOT NULL`, 🔗 FK | – | Soal induk. |
| `content` | String | `NOT NULL` | – | Teks opsi jawaban. |
| `isCorrect` | Boolean | `NOT NULL` | `false` | `true` = opsi ini jawaban benar. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan tampil opsi. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `questionId` → `ct_e_learning_multiple_choice_questions.id` - `onDelete: Cascade`.

---

### 5.52 `ct_e_learning_image_video_contents`

**Fungsi tabel**: Elemen gambar atau video sebagai konten interaktif - satu
tabel menangani dua-duanya lewat kolom diskriminator `mediaType`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `additionalContentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Additional content induk (1:1). Tidak pakai `@map`. |
| `title` | String | `nullable` | – | Judul media. |
| `caption` | String | `nullable` | – | Keterangan/caption media. |
| `description` | String | `nullable` | – | Deskripsi media. |
| `mediaType` | Enum `MediaType` | `NOT NULL` | – | `IMAGE` atau `VIDEO`. |
| `url` | String | `NOT NULL` | – | URL/path file media. |
| `thumbnailUrl` | String | `nullable` | – | URL thumbnail (relevan terutama untuk video). |
| `durationSeconds` | Int | `nullable` | – | Durasi video dalam detik - hanya relevan kalau `mediaType = VIDEO`. |
| `widthPercent` | Int | `nullable` | `100` | Lebar tampilan media (persen dari kontainer). |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `additionalContentId` → `ct_e_learning_additional_contents.id`, `@unique` (1:1) - `onDelete: Cascade`.

---

### 5.53 `ct_e_learning_executable_codes`

**Fungsi tabel**: Elemen kode yang bisa dijalankan langsung (interactive
code playground) sebagai konten interaktif; riwayat tiap kali dijalankan
tersimpan di tabel terpisah (5.54).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `additionalContentId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Additional content induk (1:1). Pakai `@map` (`additional_content_id`) - berbeda dari 5.50/5.52 yang tidak. |
| `title` | VarChar | `nullable` | – | Judul latihan kode. |
| `description` | Text | `nullable` | – | Instruksi/deskripsi latihan. |
| `language` | Enum `CodeLanguage` | `NOT NULL` | – | `PYTHON`, `JAVASCRIPT`, `CPP`, `SQL`, atau `R`. |
| `initialCode` | Text | `NOT NULL` | – | Kode awal yang ditampilkan ke peserta. |
| `isEditable` | Boolean | `NOT NULL` | `true` | `false` = kode read-only, peserta cuma bisa run tanpa edit. |
| `expectedResult` | Text | `nullable` | – | Output yang diharapkan, kemungkinan dipakai untuk auto-check hasil eksekusi. |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | DateTime | `nullable` | `now()` | Punya default `now()` tapi bukan `@updatedAt` - manual, sama seperti pola di 5.31. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `additionalContentId` → `ct_e_learning_additional_contents.id`, `@unique` (1:1) - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`runs` (→ `e_learning_code_runs`).

---

### 5.54 `e_learning_code_runs`

**Fungsi tabel**: Log tiap kali peserta menjalankan (run) kode di elemen
kode interaktif (5.53) - satu baris per percobaan run, tidak di-upsert/cap
seperti `e_learning_course_stream_counts`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `executableId` | String | `NOT NULL`, 🔗 FK | – | Elemen kode yang dijalankan. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta yang menjalankan. |
| `input` | Text | `nullable` | – | Input yang dipakai saat run (kalau ada). |
| `output` | Text | `nullable` | – | Output hasil eksekusi. |
| `error` | Text | `nullable` | – | Pesan error kalau eksekusi gagal. |
| `executedAt` | DateTime | `nullable` | `now()` | Waktu eksekusi. |
| `executionTime` | Int | `nullable` | – | Lama eksekusi (kemungkinan dalam milidetik). |
| `isSuccess` | Boolean | `nullable` | `false` | Status berhasil/tidaknya eksekusi. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `executableId` → `ct_e_learning_executable_codes.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` - `onDelete: Cascade`.
- **Index tambahan**: `@@index([executableId])`, `@@index([userId])`.

#### 📌 Catatan

Walau secara konsep termasuk keluarga tabel "tipe konten" (`ct_e_learning_*`),
tabel ini tetap dipetakan dengan prefix `e_learning_` biasa - kemungkinan
karena sifatnya log transaksional (mirip `e_learning_quiz_attempts`,
`e_learning_submissions`), bukan definisi konten statis.

---

### 5.55 `ct_e_learning_quizzes`

**Fungsi tabel**: Kuis yang menempel pada satu `ELearningText` (1:1
opsional) - berisi kumpulan soal (5.56) dan riwayat pengerjaan peserta
(5.57).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik kuis. |
| `textId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Text induk (1:1). |
| `title` | VarChar | `NOT NULL` | – | Judul kuis. |
| `description` | String | `nullable` | – | Deskripsi kuis. |
| `totalQuestions` | Int | `nullable` | – | Jumlah soal - **disimpan manual**, bukan hasil hitung otomatis dari relasi `questions`, jadi bisa tidak sinkron kalau tidak dijaga di kode aplikasi. |
| `timeLimitMinutes` | Int | `nullable` | – | Batas waktu pengerjaan (menit). |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `textId` → `e_learning_texts.id`, `@unique` (1:1) - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`questions` (→ `ct_e_learning_questions`), `quizAttempts` (→
`e_learning_quiz_attempts`).

---

### 5.56 `ct_e_learning_questions`

**Fungsi tabel**: Satu soal di dalam kuis (5.55). Lebih sederhana dari
`ct_e_learning_multiple_choice_questions` (5.50) - opsi jawaban & jawaban
benar langsung disimpan sebagai array string, bukan tabel opsi terpisah.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `quizId` | String | `NOT NULL`, 🔗 FK | – | Kuis induk. |
| `questionText` | Text | `NOT NULL` | – | Teks pertanyaan. |
| `options` | VarChar[] | `NOT NULL` | – | Array pilihan jawaban. |
| `correctAnswers` | VarChar[] | `NOT NULL` | – | Array jawaban benar - bentuk array (bukan tunggal) berarti soal multi-jawaban didukung di sini tanpa perlu flag `allowMultiple` terpisah. |
| `explanation` | String | `nullable` | – | Penjelasan jawaban. |
| `orderNumber` | Int | `nullable` | – | Urutan soal dalam kuis. |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `quizId` → `ct_e_learning_quizzes.id` - `onDelete: Cascade`.

---

### 5.57 `e_learning_quiz_attempts`

**Fungsi tabel**: Riwayat satu kali pengerjaan kuis oleh peserta - mendukung
retake (percobaan ulang bernomor) dan grading hybrid (auto atau manual oleh
mentor).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `quizId` | String | `NOT NULL`, 🔗 FK | – | Kuis yang dikerjakan. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta. |
| `score` | Int | `nullable` | – | Skor hasil pengerjaan. |
| `startedAt` | DateTime | `nullable` | `now()` | Waktu mulai mengerjakan. |
| `completedAt` | DateTime | `nullable` | – | Waktu selesai mengerjakan. |
| `answers` | Json | `nullable` | – | Jawaban peserta (format bebas, disimpan sebagai JSON). |
| `attemptNumber` | Int | `NOT NULL` | `1` | Nomor percobaan ke berapa. |
| `isAutoGraded` | Boolean | `nullable` | `true` | `false` = butuh review manual dari mentor. |
| `gradedBy` | String | `nullable` | – | Mentor/admin yang menilai manual (freetext ID, bukan FK - lihat catatan). |
| `gradedAt` | DateTime | `nullable` | – | Waktu penilaian manual. |
| `remarks` | String | `nullable` | – | Catatan mentor kalau ada review manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `quizId` → `ct_e_learning_quizzes.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([quizId, userId, attemptNumber])`.

#### 📌 Catatan

`isAutoGraded` menandai apakah kuis ini dinilai otomatis (kemungkinan
dengan mencocokkan `answers` ke `correctAnswers` di `ct_e_learning_questions`)
atau perlu dinilai manual oleh mentor (`gradedBy`/`gradedAt`/`remarks`
terisi) - model grading hybrid. `gradedBy` sendiri disimpan sebagai String
biasa (bukan relasi FK ke `users`), jadi integritasnya tidak dijamin DB.

---

### 5.58 `ct_e_learning_assignments`

**Fungsi tabel**: Tugas/assignment yang menempel pada satu `ELearningText`
(1:1 opsional) - punya instruksi, file pendukung, dan submission dari
peserta di tabel-tabel terpisah.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `textId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Text induk (1:1). |
| `title` | VarChar | `NOT NULL` | – | Judul tugas. |
| `description` | String | `nullable` | – | Deskripsi/instruksi umum tugas. |
| `dueDays` | Int | `nullable` | – | Batas waktu pengumpulan dalam hitungan hari (relatif, bukan tanggal absolut - kemungkinan dihitung sejak materi diakses/dibuka). |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `textId` → `e_learning_texts.id`, `@unique` (1:1) - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`instructions` (→ `ct_e_learning_assignment_instructions`),
`supportingFiles` (→ `ct_e_learning_assignment_supporting_files`),
`submissions` (→ `e_learning_submissions`).

---

### 5.59 `ct_e_learning_assignment_instructions`

**Fungsi tabel**: Satu baris instruksi langkah-per-langkah di dalam tugas
(5.58).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `assignmentId` | String | `NOT NULL`, 🔗 FK | – | Tugas induk. |
| `instruction` | Text | `NOT NULL` | – | Isi instruksi. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan instruksi. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `assignmentId` → `ct_e_learning_assignments.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([assignmentId, orderNumber])`.

---

### 5.60 `ct_e_learning_assignment_supporting_files`

**Fungsi tabel**: File pendukung (dataset, template, atau referensi) yang
disediakan mentor untuk satu tugas (5.58).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `assignmentId` | String | `NOT NULL`, 🔗 FK | – | Tugas induk. |
| `name` | String | `NOT NULL` | – | Nama file. |
| `type` | Enum `SupportingFileType` | `NOT NULL` | – | `DATASET`, `TEMPLATE`, atau `REFERENCE`. |
| `url` | String | `NOT NULL` | – | URL/path file. |
| `pageCount` | Int | `nullable` | – | Jumlah halaman - kemungkinan hanya relevan kalau file berupa dokumen/PDF referensi. |
| `format` | String | `nullable` | – | Format file (mis. "pdf", "csv"). |
| `sizeKB` | Int | `nullable` | – | Ukuran file dalam KB. |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `assignmentId` → `ct_e_learning_assignments.id` - `onDelete: Cascade`.

---

### 5.61 `e_learning_submissions`

**Fungsi tabel**: Pengumpulan tugas oleh peserta - mendukung pengumpulan
ulang bernomor (retake), review dua arah (peserta yang mengumpulkan &
mentor yang menilai), dan breakdown skor per komponen.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `assignmentId` | String | `NOT NULL`, 🔗 FK | – | Tugas yang dikumpulkan. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta pengumpul. |
| `attemptNumber` | Int | `NOT NULL` | `1` | Nomor percobaan pengumpulan ke berapa. |
| `notes` | String | `nullable` | – | Catatan dari peserta. |
| `files` | VarChar[] | `NOT NULL` | – | Array file yang dikumpulkan. |
| `submittedAt` | DateTime | `nullable` | `now()` | Waktu dikumpulkan. |
| `status` | Enum `ELearningSubmissionStatus` | `NOT NULL` | `PENDING` | `PENDING`, `REVIEWED`, `REVISION_REQUIRED`, `APPROVED`, atau `REJECTED`. |
| `reviewedById` | String | `nullable`, 🔗 FK | – | Mentor/admin yang mereview (opsional). |
| `reviewedAt` | DateTime | `nullable` | – | Waktu direview. |
| `feedback` | String | `nullable` | – | Feedback dari reviewer. |
| `score` | Int | `nullable` | – | Skor total. |
| `gradeBreakdown` | JsonB | `nullable` | – | Rincian skor per komponen. Contoh dari komentar developer: `{"content":8,"structure":9,"creativity":7}`. |
| `isRevisionRequired` | Boolean | `nullable` | `false` | Menandai submission perlu direvisi. |
| `revisionDeadline` | DateTime | `nullable` | – | Batas waktu revisi. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `assignmentId` → `ct_e_learning_assignments.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` (relasi `"ELearningSubmittedBy"`) - *(tidak ada `onDelete` eksplisit)*.
- 🔗 **FK 3**: `reviewedById` → `users.id` (relasi `"ELearningReviewedBy"`) - *(tidak ada `onDelete` eksplisit)*, opsional.
- **Constraint tambahan**: `@@unique([assignmentId, userId, attemptNumber])`.

#### 📌 Catatan

Tabel ini punya **dua relasi berbeda ke `users`** dengan nama relasi
eksplisit yang berbeda - `userId` (peserta yang mengumpulkan, relasi
`"ELearningSubmittedBy"`) dan `reviewedById` (mentor/admin yang menilai,
relasi `"ELearningReviewedBy"`) - jadi satu akun `users` bisa muncul di
kedua sisi, tergantung perannya di submission tertentu.

---

### 5.62 `e_learning_subscription_plans`

**Fungsi tabel**: Master data paket langganan e-learning (mis. Monthly,
Quarterly, Yearly per komentar developer).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik paket. |
| `name` | VarChar | `NOT NULL` | – | Nama paket. Contoh dari komentar developer: Monthly, Quarterly, Yearly. |
| `durationDay` | Int | `NOT NULL` | – | Durasi paket dalam hari. Contoh dari komentar developer: 30, 90, 365. |
| `price` | Decimal | `NOT NULL` | – | Harga paket. |
| `description` | String | `nullable` | – | Deskripsi paket. |
| `isActive` | Boolean | `NOT NULL` | `true` | `false` = paket tidak dijual lagi. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu dibuat. |
| `updatedAt` | DateTime | `nullable` | *(tidak ada)* | Tidak punya default sama sekali (bukan `now()`, bukan `@updatedAt`) - kosong sampai di-set manual pertama kali oleh kode aplikasi. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: *(tidak ada)* - tabel master/induk.

#### Relasi ke Tabel Lain (ringkasan)

`subscriptions` (→ `e_learning_subscriptions`), `redeemCodes` (→
`RedeemCode` - modul Voucher & Redeem Code, belum dibahas).

---

### 5.63 `e_learning_subscriptions`

**Fungsi tabel**: Langganan aktif seorang user terhadap satu paket - bisa
dibayar langsung, atau didapat lewat kode referral, voucher, atau redeem
code (masing-masing opsional 1:1).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik langganan. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | User pelanggan. |
| `planId` | String | `NOT NULL`, 🔗 FK | – | Paket yang dilanggan. |
| `referralUsageId` | String | `nullable`, `@unique`, 🔗 FK | – | Terisi kalau langganan ini pakai kode referral (opsional 1:1). |
| `startAt` | DateTime | `NOT NULL` | – | Tanggal mulai aktif. |
| `endAt` | DateTime | `NOT NULL` | – | Tanggal berakhir. |
| `status` | String | `NOT NULL` | – | Status langganan (freetext, tidak divalidasi enum di DB - pola sama seperti `bookings.status` di modul Mentoring). |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu dibuat. |
| `updatedAt` | DateTime | `nullable` | *(tidak ada)* | Tidak punya default. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `planId` → `e_learning_subscription_plans.id`.
- 🔗 **FK 3**: `referralUsageId` → `referral_usages.id` (relasi `"ReferralUsageELearningSubscription"`), opsional 1:1.

#### Relasi ke Tabel Lain (ringkasan)

`payment` (→ `Payment`, 1:1, modul Payment & Withdrawal - belum dibahas),
`voucherUsage` (→ `VoucherUsage`, relasi `"VoucherUsageELearning"`, 1:1,
modul Voucher & Redeem Code - belum dibahas), `redeemCodeUsage` (→
`RedeemCodeUsage`, relasi `"RedeemCodeUsageSubscription"`, 1:1, modul
Voucher & Redeem Code - belum dibahas).

#### 📌 Catatan

Berbeda dari kebanyakan tabel `e_learning_*` lain yang `@map` kolomnya ke
snake_case, **tidak satu pun kolom di tabel ini pakai `@map`** (`userId`,
`planId`, `referralUsageId`, `startAt`, `endAt`, `status` semua tetap
camelCase secara fisik di DB) - padahal nama tabelnya sendiri tetap
di-`@map` ke `e_learning_subscriptions`. Satu langganan bisa punya sampai
4 jalur pembayaran/diskon yang saling terpisah dan opsional: `payment`
langsung, `referralUsage`, `voucherUsage`, atau `redeemCodeUsage` - masing-
masing relasi 1:1 independen, jadi kombinasinya perlu divalidasi di kode
aplikasi (mis. memastikan tidak lebih dari satu yang terisi sekaligus kalau
memang saling eksklusif).

---

### 5.64 `e_learning_progress`

**Fungsi tabel**: Progress belajar di level **sub-bab** (boolean
selesai/belum) - satu-satunya dari 4 tabel progress di modul ini yang
bernama tunggal ("progress", bukan "progresses"), dan yang paling minim
kolom auditnya.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta. |
| `subBabId` | String | `NOT NULL`, 🔗 FK | – | Sub-bab yang dipelajari. |
| `isCompleted` | Boolean | `nullable` | `false` | Status selesai/belum. |
| `lastAccessed` | DateTime | `nullable` | – | Waktu terakhir diakses. |
| `timeSpent` | Int | `nullable` | `0` | Total waktu belajar (kemungkinan detik). |
| `lastActivityAt` | DateTime | `nullable` | – | Waktu aktivitas terakhir. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `subBabId` → `e_learning_sub_babs.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([userId, subBabId])`.

#### 📌 Catatan

Tabel ini tidak punya `createdAt`/`updatedAt` sama sekali - beda dari 3
tabel progress lain (5.65-5.67) yang semuanya punya `createdAt` +
`updatedAt` (dengan `@updatedAt`). Kemungkinan ini iterasi paling awal dari
fitur progress tracking (khusus level sub-bab, pakai flag boolean
selesai/belum), sementara tracking di level sub-chapter/text/block
ditambahkan belakangan dengan audit trail yang lebih lengkap.

---

### 5.65 `e_learning_sub_chapter_progress`

**Fungsi tabel**: Progress belajar di level **sub-chapter** - dinyatakan
sebagai persentase (bukan boolean), karena satu sub-chapter mengagregasi
beberapa sub-bab.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta. |
| `subChapterId` | String | `NOT NULL`, 🔗 FK | – | Sub-chapter yang dipelajari. |
| `progressPercent` | Float | `NOT NULL` | `0` | Persentase progress, 0-100. |
| `lastActivityAt` | DateTime | `nullable` | – | Waktu aktivitas terakhir. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu dibuat. |
| `updatedAt` | DateTime | `NOT NULL` | *(auto)* | Pakai `@updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `subChapterId` → `e_learning_sub_chapters.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([userId, subChapterId])`, `@@index([userId])`, `@@index([subChapterId])`.

---

### 5.66 `e_learning_text_progress`

**Fungsi tabel**: Progress belajar di level **text** (unit materi
terkecil) - polanya sama persis dengan sub-chapter progress (5.65), cuma
beda level granularitas.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta. |
| `textId` | String | `NOT NULL`, 🔗 FK | – | Text yang dipelajari. |
| `progress` | Float | `NOT NULL` | `0` | Persentase progress, 0-100. |
| `lastAccessedAt` | DateTime | `nullable` | – | Waktu terakhir diakses. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu dibuat. |
| `updatedAt` | DateTime | `NOT NULL` | *(auto)* | Pakai `@updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `textId` → `e_learning_texts.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([userId, textId])`, `@@index([userId])`, `@@index([textId])`.

---

### 5.67 `e_learning_block_progress`

**Fungsi tabel**: Progress belajar di level **block** (unit paling
granular) - level tracking paling detail di antara 4 tabel progress modul
ini.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta. Tidak pakai `@map`. |
| `blockId` | String | `NOT NULL`, 🔗 FK | – | Block yang dipelajari. Tidak pakai `@map`. |
| `progress` | Int | `NOT NULL` | `0` | Progress 0-100. **Bertipe `Int`**, berbeda dari `progressPercent`/`progress` di 5.65 & 5.66 yang bertipe `Float` - inkonsistensi tipe untuk konsep yang sama antar 3 tabel ini. |
| `isCompleted` | Boolean | `NOT NULL` | `false` | Status selesai/belum. |
| `timeSpent` | Int | `nullable` | `0` | Total waktu (kemungkinan detik). |
| `lastActivityAt` | DateTime | `nullable` | `now()` | Waktu aktivitas terakhir - satu-satunya di antara 4 tabel progress yang kolom "waktu terakhir"-nya punya default `now()`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `blockId` → `e_learning_text_blocks.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([userId, blockId])`, `@@index([blockId])` (tidak ada index terpisah untuk `userId`, berbeda dari 5.65/5.66 yang mengindeks kedua sisi).

#### 📌 Catatan

Tabel ini juga tidak punya `createdAt`. Sebelum menulis logika agregasi
progress lintas 4 tabel (`e_learning_progress`,
`e_learning_sub_chapter_progress`, `e_learning_text_progress`, tabel ini),
penting diingat tipe datanya tidak seragam (`Int` di sini vs `Float` di
5.65/5.66, dan boolean-only di 5.64).

---

### 5.68 `e_learning_reviews`

**Fungsi tabel**: Rating & ulasan peserta terhadap satu sub-chapter -
sesuai `@@unique([userId, subChapterId])`, rating hanya ada di level
sub-chapter, tidak ada kolom rating agregat langsung di `ELearningCourse`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta pemberi ulasan. |
| `subChapterId` | String | `NOT NULL`, 🔗 FK | – | Sub-chapter yang diulas. |
| `rating` | Decimal(2,1) | `NOT NULL` | – | Nilai rating. |
| `comment` | String | `nullable` | – | Isi ulasan. |
| `isPublic` | Boolean | `NOT NULL` | `true` | `false` = ulasan disembunyikan dari tampilan publik. |
| `isAnonymous` | Boolean | `NOT NULL` | `false` | `true` = nama peserta disembunyikan di tampilan (lihat catatan). |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. Tidak ada `updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `subChapterId` → `e_learning_sub_chapters.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([userId, subChapterId])` - satu peserta cuma bisa memberi satu ulasan per sub-chapter.

#### 📌 Catatan

`isAnonymous` cuma flag tampilan - `userId` tetap `NOT NULL` dan tersimpan
apa adanya, jadi identitas pemberi ulasan tetap ada di database walau
`true`; anonimitasnya harus diterapkan di layer tampilan (frontend/API),
bukan lewat penyembunyian data di DB.

---

### 5.69 `e_learning_certificates`

**Fungsi tabel**: Sertifikat kelulusan peserta untuk satu sub-chapter - pola
`@@unique([userId, subChapterId])`-nya sama seperti review (5.68), jadi
sertifikat juga diterbitkan per sub-chapter, bukan per course.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `subChapterId` | String | `NOT NULL`, 🔗 FK | – | Sub-chapter yang diselesaikan. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta pemegang sertifikat. |
| `certificateUrl` | VarChar | `NOT NULL` | – | URL file sertifikat. |
| `certificatePath` | VarChar | `nullable` | – | Path penyimpanan file sertifikat. |
| `issuedAt` | DateTime | `nullable` | `now()` | Waktu diterbitkan. |
| `certificateNumber` | VarChar | `NOT NULL`, `@unique` | – | Nomor sertifikat unik. |
| `displayNumber` | VarChar | `NOT NULL`, `@unique` | – | Nomor tampilan unik - kemungkinan format berbeda dari `certificateNumber` untuk keperluan cetak/tampilan publik (perlu dicek ke kode generator sertifikat untuk kepastian mana yang internal vs mana yang dicetak). |
| `status` | VarChar | `nullable` | – | Freetext, contoh dari komentar developer: generated, sent, viewed. |
| `verifiedBy` | VarChar | `nullable` | – | ID admin/verifikator (opsional, freetext). **Bukan FK sungguhan** - lihat catatan. |
| `note` | VarChar | `nullable` | – | Catatan tambahan. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `subChapterId` → `e_learning_sub_chapters.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([userId, subChapterId])`.

#### 📌 Catatan

`verifiedBy` disimpan sebagai `VarChar` biasa, bukan relasi FK ke `users`
seperti `reviewedById` di `e_learning_submissions` (5.61) - jadi walau
konsepnya sama-sama "user yang memverifikasi", integritasnya tidak
dijamin oleh DB di tabel ini.

---

### 5.70 `e_learning_discussions`

**Fungsi tabel**: Forum diskusi/tanya-jawab di level course - mendukung
reply berjenjang lewat self-relation `parentId`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `courseId` | String | `NOT NULL`, 🔗 FK | – | Course tempat diskusi berlangsung. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | User penulis. |
| `content` | Text | `NOT NULL` | – | Isi diskusi/komentar. |
| `parentId` | String | `nullable`, 🔗 FK | – | Diisi kalau baris ini adalah **balasan** (reply) ke diskusi lain (self-relation, relasi `"ReplyTo"`). |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. Tidak ada `updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `courseId` → `e_learning_courses.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 3**: `parentId` → `e_learning_discussions.id` (self-relation `"ReplyTo"`), opsional - *(tidak ada `onDelete` eksplisit)*.

#### 📌 Catatan

Karena `parentId` menunjuk ke tabel yang sama, struktur balasan bisa
bertingkat sedalam apapun secara skema (balasan dari balasan, dst.) - UI
bebas memilih membatasi kedalaman tampilan atau menampilkannya penuh
bertingkat. Tanpa `updatedAt`, komentar yang diedit tidak bisa dibedakan
dari komentar asli hanya lewat data di tabel ini.

---

### 5.71 `e_learning_bookmarks`

**Fungsi tabel**: Penanda bookmark peserta terhadap satu sub-bab - berupa
toggle (ada/tidak ada baris), bukan daftar bookmark berulang.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta. |
| `subBabId` | String | `NOT NULL`, 🔗 FK | – | Sub-bab yang di-bookmark. |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu bookmark dibuat. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - `onDelete: Cascade`.
- 🔗 **FK 2**: `subBabId` → `e_learning_sub_babs.id` - `onDelete: Cascade`.
- **Constraint tambahan**: `@@unique([userId, subBabId])` - satu peserta cuma bisa punya satu baris bookmark per sub-bab (toggle, bukan daftar berulang).

---

*(Modul **E-Learning** sudah lengkap dengan ini - 46 tabel dan 12 enum,
mulai dari audit log sampai ke seluruh tipe konten interaktifnya. Tabel
`MentorProfile`, `RedeemCode`, `RedeemCodeUsage`, `Payment`,
`ReferralUsage`, dan `VoucherUsage` yang direferensikan masing-masing masuk
ke modul lain dan akan dibahas di bagiannya sendiri.)*

## Modul: Practice

> ℹ️ **Catatan pola untuk seluruh modul ini**: Practice adalah modul latihan
> mandiri terpisah dari E-Learning - mentor membuat satu `Practice` (paket
> latihan berbayar) berisi beberapa `PracticeMaterial` (dengan file
> pendukungnya di `PracticeFile`), peserta membeli lewat `PracticePurchase`,
> mengerjakan lalu mengumpulkan lewat `PracticeSubmission`, progress
> belajarnya dilacak per-materi lewat `PracticeProgress`, dan bisa memberi
> ulasan lewat `PracticeReview`.
>
> Ikut dibahas juga di sini `Project` & `ProjectSubmission` - **bukan**
> anak dari `Practice`, melainkan fitur proyek/tugas akhir yang menempel ke
> `MentoringService` (modul Mentoring, 5.6), jadi konteksnya sesi mentoring
> berbayar, bukan latihan mandiri. Keduanya dikelompokkan bareng "Practice"
> di ringkasan relasi tabel `users` (5.1) karena sama-sama fitur submission
> tugas dengan skema penilaian mirip, tapi secara struktur data keduanya
> independen dari `Practice`.
>
> Tiga model di modul ini (`PracticeFile`, `PracticePurchase`, `Practice`)
> punya komentar generator Prisma: *"This model or at least one of its
> fields has comments in the database..."* - artinya ada `COMMENT ON
> TABLE/COLUMN` yang di-set langsung di database (lewat migration manual
> atau tool lain), tidak lewat atribut Prisma biasa. Isi komentar DB-nya
> sendiri tidak tercermin di file `schema.prisma`, jadi kalau butuh
> membaca komentarnya, perlu query langsung ke database
> (`information_schema` / `pg_catalog`) atau baca file migration SQL-nya.

### 5.72 `practice_files`

**Fungsi tabel**: File pendukung (materi belajar) yang di-upload mentor
untuk satu `PracticeMaterial`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik file. |
| `materialId` | String | `NOT NULL`, 🔗 FK | – | Materi induk. |
| `fileName` | VarChar | `NOT NULL` | – | Nama file. |
| `filePath` | VarChar | `NOT NULL` | – | Path/URL penyimpanan file. |
| `fileType` | VarChar | `NOT NULL` | – | Tipe/ekstensi file. |
| `fileSize` | Int | `nullable` | – | Ukuran file. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan tampil file dalam materi. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu diunggah. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual, tidak `@updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `materialId` → `practice_materials.id` - `onDelete: Cascade`, `onUpdate: Cascade`.

#### 📌 Catatan

Punya komentar generator Prisma soal database comments - lihat catatan pola
modul di atas.

---

### 5.73 `practice_materials`

**Fungsi tabel**: Satu unit materi/modul di dalam sebuah `Practice` -
tempat menempelnya file pendukung (5.72) dan tracking progress (5.74).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik materi. |
| `practiceId` | String | `NOT NULL`, 🔗 FK | – | Practice induk. |
| `title` | VarChar | `NOT NULL` | – | Judul materi. |
| `description` | Text | `nullable` | – | Deskripsi materi. |
| `orderNumber` | Int | `NOT NULL` | – | Urutan tampil materi. |
| `status` | String | `nullable` | – | Freetext, sesuai komentar developer: `draft`, `active`, `inactive`. |
| `startDate` | DateTime | `nullable` | – | Tanggal mulai materi ini aktif (sesuai komentar developer). |
| `endDate` | DateTime | `nullable` | – | Tanggal selesai materi ini aktif. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `practiceId` → `practices.id` - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`practiceFiles` (→ `practice_files`), `practiceProgress` (→
`practice_progress`).

#### 📌 Catatan

`status` di sini freetext dengan 3 nilai (draft/active/inactive) - beda
konsep dari `status` enum `CourseStatus` (DRAFT/PUBLISHED/ARCHIVED) di
modul E-Learning; `startDate`/`endDate` menambahkan kemampuan
menjadwalkan aktif-nonaktifnya materi secara otomatis berdasarkan tanggal,
sesuatu yang tidak ada padanannya langsung di struktur materi E-Learning.

---

### 5.74 `practice_progress`

**Fungsi tabel**: Progress belajar peserta per `PracticeMaterial`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta. |
| `materialId` | String | `NOT NULL`, 🔗 FK | – | Materi yang dipelajari. |
| `isCompleted` | Boolean | `nullable` | `false` | Status selesai/belum. |
| `lastAccessed` | Timestamp(6) | `nullable` | – | Waktu terakhir diakses. |
| `timeSpentSeconds` | Int | `nullable` | `0` | Total waktu belajar dalam detik (satuannya eksplisit di nama kolom - beda dari `timeSpent` di modul E-Learning yang satuannya cuma diasumsikan dari konteks). |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `materialId` → `practice_materials.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- **Constraint tambahan**: `@@unique([userId, materialId])`.

---

### 5.75 `practice_purchases`

**Fungsi tabel**: Transaksi pembelian satu `Practice` oleh peserta - mirip
peran `e_learning_subscriptions` tapi untuk pembelian sekali-bayar (bukan
langganan berkala).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik pembelian. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Pembeli. Tidak pakai `@map`. |
| `practiceId` | String | `NOT NULL`, 🔗 FK | – | Practice yang dibeli. Tidak pakai `@map`. |
| `referralUsageId` | String | `nullable`, `@unique`, 🔗 FK | – | Terisi kalau pembelian ini pakai kode referral (opsional 1:1). Tidak pakai `@map`. |
| `purchaseDate` | DateTime | `nullable` | `now()` | Tanggal pembelian. |
| `status` | VarChar | `nullable` | – | Status transaksi (freetext, tidak divalidasi enum). |
| `createdAt` | DateTime | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | DateTime | `nullable` | *(tidak ada)* | Tidak punya default sama sekali. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `userId` → `users.id` - *(tidak ada `onDelete` eksplisit)*.
- 🔗 **FK 2**: `practiceId` → `practices.id` - *(tidak ada `onDelete` eksplisit)*.
- 🔗 **FK 3**: `referralUsageId` → `referral_usages.id` (relasi `"ReferralUsagePracticePurchase"`), opsional 1:1 - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`payment` (→ `Payment`, relasi `"PracticePurchasePayment"`, 1:1, modul
Payment & Withdrawal - belum dibahas), `voucherUsage` (→ `VoucherUsage`,
relasi `"VoucherUsagePractice"`, 1:1, modul Voucher & Redeem Code - belum
dibahas).

#### 📌 Catatan

Punya komentar generator Prisma soal database comments (lihat catatan pola
modul). Berbeda dari `e_learning_subscriptions` (yang relasi
`referralUsage`-nya tanpa `onDelete` eksplisit), relasi `referralUsage` di
sini justru punya `onDelete: Cascade, onUpdate: Cascade` eksplisit -
perilaku berbeda untuk konsep "pemakaian kode referral" yang serupa antar
dua modul.

---

### 5.76 `practice_reviews`

**Fungsi tabel**: Rating & ulasan peserta terhadap satu `Practice` -
polanya mirip `e_learning_reviews`, tapi `rating` di sini bertipe `Int`
(bukan `Decimal`) dan tanpa flag `isPublic`/`isAnonymous`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta pemberi ulasan. |
| `practiceId` | String | `NOT NULL`, 🔗 FK | – | Practice yang diulas. |
| `rating` | Int | `NOT NULL` | – | Nilai rating (bilangan bulat, beda dari `Decimal(2,1)` di `e_learning_reviews`). |
| `comment` | String | `nullable` | – | Isi ulasan. |
| `submittedDate` | Timestamp(6) | `nullable` | `now()` | Tanggal ulasan dikirim. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `practiceId` → `practices.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 2**: `userId` → `users.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- **Constraint tambahan**: `@@unique([userId, practiceId])` - satu peserta cuma bisa memberi satu ulasan per practice.

#### 📌 Catatan

Tabel ini punya `submittedDate` **dan** `createdAt` yang sama-sama default
`now()` - kemungkinan redundan (dua kolom mencatat waktu yang praktis
sama), berbeda dari `e_learning_reviews` yang cuma punya `createdAt` saja.

---

### 5.77 `practice_submissions`

**Fungsi tabel**: Pengumpulan hasil pengerjaan `Practice` oleh peserta,
lengkap dengan penilaian & feedback dari mentor.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `userId` | String | `NOT NULL`, 🔗 FK | – | Peserta pengumpul. |
| `practiceId` | String | `NOT NULL`, 🔗 FK | – | Practice yang dikerjakan. |
| `notes` | String | `nullable` | – | Catatan dari peserta. |
| `files` | VarChar[] | `NOT NULL` | – | Array file yang dikumpulkan. |
| `submittedAt` | Timestamp(6) | `nullable` | `now()` | Waktu dikumpulkan. |
| `status` | String | `nullable` | `"pending"` | Freetext (bukan enum), sesuai komentar developer: `pending`, `reviewed`, `approved`, `rejected`. |
| `reviewedById` | String | `nullable`, 🔗 FK | – | Mentor/admin yang mereview (opsional). |
| `reviewedAt` | Timestamp(6) | `nullable` | – | Waktu direview. |
| `kesesuaian` | VarChar | `nullable` | – | Nilai komponen "kesesuaian" dari mentor. |
| `kualitas` | VarChar | `nullable` | – | Nilai komponen "kualitas". |
| `kreativitas` | VarChar | `nullable` | – | Nilai komponen "kreativitas". |
| `kelengkapan` | VarChar | `nullable` | – | Nilai komponen "kelengkapan". |
| `komentar` | Text | `nullable` | – | Komentar mentor. |
| `saran` | Text | `nullable` | – | Saran/masukan mentor. |
| `perluRevisi` | Boolean | `nullable` | `false` | Menandai submission perlu direvisi. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `user` → `users.id` (relasi `"PracticeSubmittedBy"`) - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 2**: `practiceId` → `practices.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 3**: `reviewedById` → `users.id` (relasi `"PracticeReviewedBy"`), opsional - *(tidak ada `onDelete` eksplisit)*.
- **Constraint tambahan**: `@@unique([userId, practiceId])` - **peserta cuma bisa submit sekali per practice**, tidak ada `attemptNumber` seperti di `e_learning_submissions`/`e_learning_quiz_attempts`, jadi tidak ada mekanisme submit ulang bertahap di level skema.

#### 📌 Catatan

Empat kolom penilaian (`kesesuaian`, `kualitas`, `kreativitas`,
`kelengkapan`) dan dua kolom feedback (`komentar`, `saran`) memakai nama
**Bahasa Indonesia**, berbeda dari konvensi penamaan Inggris di hampir
semua tabel lain di skema ini. Semua nilai komponen penilaian juga bertipe
`VarChar` (bukan `Int`/`Decimal`), jadi kemungkinan diisi label kualitatif
(mis. "Baik", "Cukup") bukan angka - berbeda dari `gradeBreakdown` (Json)
di `e_learning_submissions` yang menyimpan skor numerik per komponen.
`status` di sini tetap `String` biasa dengan default `"pending"`, tidak
diubah jadi enum seperti `ELearningSubmissionStatus` di modul E-Learning,
walau nilai yang mungkin (pending/reviewed/approved/rejected) sama persis
disebutkan di komentar developer.

---

### 5.78 `practices`

**Fungsi tabel**: Master data satu paket latihan mandiri (Practice) yang
dibuat mentor - induk dari seluruh tabel Practice lainnya.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik practice. |
| `mentorId` | String | `NOT NULL`, 🔗 FK | – | Mentor pembuat. |
| `title` | VarChar | `NOT NULL` | – | Judul practice. |
| `description` | Text | `nullable` | – | Deskripsi practice. |
| `thumbnailImages` | VarChar[] | `NOT NULL` | – | Array gambar thumbnail. Di-`@map` ke `thumbnail_image` (**tunggal**) walau kolomnya array/jamak - beda dari `e_learning_courses.thumbnailImages` yang di-`@map` ke `thumbnail_images` (jamak, konsisten). |
| `price` | Decimal | `NOT NULL` | – | Harga practice. |
| `practiceType` | VarChar | `nullable` | – | Jenis practice (freetext). |
| `category` | VarChar | `nullable` | – | Kategori (freetext). |
| `tags` | VarChar[] | `NOT NULL` | – | Array tag. |
| `benefits` | VarChar | `nullable` | – | Manfaat mengikuti practice. |
| `toolsUsed` | VarChar | `nullable` | – | Tools/software yang dipakai. |
| `challenges` | VarChar | `nullable` | – | Tantangan yang akan dihadapi peserta. |
| `expectedOutcomes` | VarChar | `nullable` | – | Hasil yang diharapkan setelah selesai. |
| `estimatedDuration` | VarChar | `nullable` | – | Estimasi durasi (freetext). |
| `targetAudience` | VarChar | `nullable` | – | Target peserta. |
| `isActive` | Boolean | `nullable` | `true` | `false` = practice tidak ditampilkan. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `mentorId` → `mentor_profiles.id` - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`practiceMaterials` (→ `practice_materials`), `practicePurchases` (→
`practice_purchases`), `practiceReviews` (→ `practice_reviews`),
`practiceSubmissions` (→ `practice_submissions`).

#### 📌 Catatan

Punya komentar generator Prisma soal database comments (lihat catatan pola
modul). Dibanding `e_learning_courses` (5.27), `practices` punya beberapa
kolom deskriptif tambahan yang tidak ada padanannya di E-Learning
(`challenges`, `expectedOutcomes`) - masuk akal karena Practice berorientasi
proyek/latihan praktik, bukan materi belajar bertahap. Tidak ada kolom
`slug` maupun `status` (DRAFT/PUBLISHED/ARCHIVED) di sini seperti di
`e_learning_courses` - kontrol tampil/tidaknya cuma lewat `isActive`.

---

### 5.79 `projects`

**Fungsi tabel**: Proyek/tugas yang menempel pada satu `MentoringService`
(5.6, modul Mentoring) - **bukan** bagian dari `Practice`, walau
dikelompokkan bareng di ringkasan relasi `users`. Submission-nya ada di
tabel terpisah (5.80).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik proyek. |
| `serviceId` | String | `NOT NULL`, 🔗 FK | – | Mentoring service induk. |
| `title` | VarChar | `NOT NULL` | – | Judul proyek. |
| `description` | Text | `nullable` | – | Deskripsi/instruksi proyek. |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `serviceId` → `mentoring_services.id` - `onDelete: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`submissions` (→ `project_submissions`).

---

### 5.80 `project_submissions`

**Fungsi tabel**: Pengumpulan tugas proyek oleh mentee untuk satu
`Project` (5.79) - skema penilaiannya paling lengkap di antara semua tabel
submission di skema ini (skor otomatis/plagiarisme, skor per-metrik, status
review pakai enum, tautan ke sesi mentoring tertentu).

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik. |
| `projectId` | String | `NOT NULL`, 🔗 FK | – | Proyek yang dikumpulkan. |
| `menteeId` | String | `NOT NULL`, 🔗 FK | – | Mentee pengumpul. |
| `sessionId` | String | `nullable`, 🔗 FK | – | Sesi mentoring terkait (opsional). |
| `title` | VarChar | `nullable` | – | Judul submission dari mentee. |
| `filePaths` | String[] | `NOT NULL` | – | Array path file submission. |
| `projectLink` | VarChar | `nullable` | – | Link tambahan (Drive, GitHub, dll - sesuai komentar developer). |
| `submissionDate` | Timestamp(6) | `nullable` | `now()` | Waktu dikumpulkan. |
| `plagiarismScore` | Decimal | `nullable` | – | Skor plagiarisme dari sistem otomatis. |
| `score` | Decimal | `nullable` | – | Skor agregat dari seluruh penilaian (sesuai komentar developer). |
| `briefScore` | String | `nullable` | – | Skor kesesuaian brief (freetext/label, bukan angka). |
| `technicalScore` | String | `nullable` | – | Skor kualitas teknis. |
| `creativityScore` | String | `nullable` | – | Skor kreativitas. |
| `completenessScore` | String | `nullable` | – | Skor kelengkapan. |
| `mentorFeedback` | VarChar | `nullable` | – | Feedback singkat dari mentor. |
| `mentorSuggestion` | VarChar | `nullable` | – | Saran dari mentor. |
| `isReviewed` | Boolean | `nullable` | `false` | Status sudah/belum direview. |
| `reviewStatus` | Enum `ReviewStatus` | `NOT NULL` | `PENDING` | `PENDING`, `REVIEWED`, atau `REVISION_REQUIRED`. |
| `isRevisedRequired` | Boolean | `nullable` | `false` | Menandai submission perlu direvisi. |
| `revisionDeadline` | DateTime | `nullable` | – | Batas waktu revisi. |
| `gradedBy` | String | `nullable`, 🔗 FK | – | Mentor yang menilai (opsional). |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `projectId` → `projects.id` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 2**: `menteeId` → `users.id` (relasi `"SubmissionByMentee"`) - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 3**: `sessionId` → `mentoring_sessions.id`, opsional - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 4**: `gradedBy` → `users.id` (relasi `"SubmissionGradedByMentor"`), opsional - `onDelete: Cascade`, `onUpdate: Cascade`.

#### 📌 Catatan

Tabel submission paling detail di seluruh skema: skor dipisah jadi 3
lapis - `plagiarismScore` (otomatis/sistem), 4 kolom skor per-metrik
(`briefScore`/`technicalScore`/`creativityScore`/`completenessScore`, semua
`String` - kemungkinan label kualitatif, bukan angka, sama seperti pola di
`practice_submissions`), dan `score` (agregat, `Decimal`) - tapi tidak ada
kolom di skema yang menjelaskan bagaimana `score` dihitung dari
komponen-komponennya, jadi logikanya murni ada di kode aplikasi. Tidak
seperti `practice_submissions` yang pakai `@@unique([userId, practiceId])`
(submit sekali per practice), tabel ini **tidak punya unique constraint**
sama sekali pada `(projectId, menteeId)` - artinya satu mentee bisa
mengumpulkan submission berkali-kali untuk proyek yang sama tanpa dibatasi
skema, tanpa mekanisme penomoran `attemptNumber` seperti di
`e_learning_submissions`. `reviewStatus` juga satu-satunya di antara 3
tabel submission serupa (`practice_submissions`,
`e_learning_submissions`, tabel ini) yang memakai **enum sungguhan**
(`ReviewStatus`) alih-alih `String` freetext - tapi enum-nya cuma 3 nilai
(tidak ada `APPROVED`/`REJECTED` seperti `ELearningSubmissionStatus`),
jadi status "disetujui/ditolak akhir" kemungkinan direpresentasikan lewat
kombinasi `reviewStatus` + `score`, bukan satu kolom status tunggal.

---

*(Modul **Practice** sudah lengkap dengan ini - 9 tabel (termasuk `Project`
& `ProjectSubmission`, walau keduanya sebenarnya bagian dari domain
Mentoring) dan 1 enum. Tabel `Payment`, `ReferralUsage`, dan `VoucherUsage`
yang direferensikan masing-masing masuk ke modul lain dan akan dibahas di
bagiannya sendiri.)*

## Modul: Payment & Withdrawal

> ℹ️ **Catatan**: Skema yang dikirim baru mencakup sisi **Payment**
> (`Payment`, `BookingInvoice`). Tabel-tabel terkait **Withdrawal** (mis.
> pencairan dana mentor) belum ada di skema yang dikirim, jadi belum
> dibahas di bagian ini - akan ditambahkan begitu skemanya dikirim.
>
> `BookingParticipant` (`booking_participants`) sebenarnya juga bagian dari
> alur pembayaran, tapi sudah didokumentasikan lebih dulu di modul
> Mentoring & Booking (5.16) karena strukturnya menempel langsung ke
> `Booking`. `PracticePurchase` (5.75), `ELearningSubscription` (5.63), dan
> `AYCLBooking` (5.24) juga disertakan ulang di potongan skema yang
> dikirim sekadar sebagai konteks relasi ke `Payment` - ketiganya **sudah**
> didokumentasikan lengkap di modul masing-masing, jadi tidak diulang di
> sini.

### 5.81 `payments`

**Fungsi tabel**: Satu transaksi pembayaran - tabel pembayaran sentral yang
dipakai oleh **empat** sumber transaksi berbeda: cicilan booking mentoring,
pembelian practice, langganan e-learning, dan booking AYCL.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik pembayaran. |
| `bookingInvoiceId` | String | `nullable`, 🔗 FK | – | Invoice booking mentoring terkait (**bukan** `@unique` - satu invoice bisa punya banyak `Payment`, satu per cicilan). |
| `practicePurchaseId` | String | `nullable`, `@unique`, 🔗 FK | – | Pembelian practice terkait (1:1). |
| `eLearningSubscriptionId` | String | `nullable`, `@unique`, 🔗 FK | – | Langganan e-learning terkait (1:1). |
| `ayclBookingId` | String | `nullable`, `@unique`, 🔗 FK | – | Booking AYCL terkait (1:1). |
| `merchantOrderId` | String | `nullable`, `@unique` | – | Order ID dari payment gateway/merchant pihak ketiga. |
| `amount` | Decimal | `NOT NULL` | – | Nominal pembayaran. |
| `installmentNumber` | Int | `nullable` | – | Nomor cicilan ke berapa - **hanya dipakai kalau `bookingInvoiceId` terisi** (sesuai komentar developer). |
| `dueDate` | DateTime | `nullable` | – | Batas waktu pembayaran (relevan untuk cicilan). |
| `reminderCount` | Int | `NOT NULL` | `0` | Jumlah reminder yang sudah dikirim ke pembayar. |
| `lastReminderSentAt` | DateTime | `nullable` | – | Waktu reminder terakhir dikirim. |
| `paymentDate` | Timestamp(6) | `nullable` | – | Tanggal pembayaran benar-benar diterima/lunas. |
| `paymentMethod` | VarChar | `nullable` | – | Metode pembayaran (freetext, mis. nama channel/bank). |
| `transactionId` | VarChar | `nullable` | – | ID transaksi dari payment gateway. |
| `status` | VarChar | `nullable` | – | Status pembayaran (freetext, tidak divalidasi enum). |
| `createdAt` | Timestamp(6) | `nullable` | `now()` | Waktu baris dibuat. |
| `updatedAt` | Timestamp(6) | `nullable` | – | Manual, tidak `@updatedAt`. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK 1**: `bookingInvoiceId` → `booking_invoices.id` - `onDelete: Cascade`, `onUpdate: Cascade`. *(non-unique - lihat catatan.)*
- 🔗 **FK 2**: `practicePurchaseId` → `practice_purchases.id` (relasi `"PracticePurchasePayment"`), `@unique` - `onDelete: Cascade`, `onUpdate: Cascade`.
- 🔗 **FK 3**: `eLearningSubscriptionId` → `e_learning_subscriptions.id`, `@unique` - `onDelete: Cascade`.
- 🔗 **FK 4**: `ayclBookingId` → `aycl_bookings.id`, `@unique` - *(tidak ada `onDelete` eksplisit)*.
- **Index tambahan**: `@@index([bookingInvoiceId])`.

#### Relasi ke Tabel Lain (ringkasan)

`bookingParticipants` (→ `booking_participants`, relasi
`"ParticipantPayment"`, **1:many** - satu `Payment` bisa dipakai untuk
menandai status lunas beberapa peserta booking grup sekaligus, lihat 5.16).

#### 📌 Catatan

`payments` adalah tabel pembayaran "hub" untuk 4 jalur transaksi berbeda,
dan pola keterhubungannya **tidak seragam**:

- Untuk **booking mentoring** (cicilan): `bookingInvoiceId` **bukan**
  `@unique`, jadi satu `BookingInvoice` bisa punya *banyak* baris
  `Payment` - satu per cicilan (`installmentNumber` membedakan urutannya).
  Ini satu-satunya dari 4 sumber yang berupa relasi 1:many, bukan 1:1.
- Untuk **practice, e-learning, AYCL**: ketiga kolom FK-nya
  (`practicePurchaseId`, `eLearningSubscriptionId`, `ayclBookingId`)
  semuanya `@unique`, jadi masing-masing hanya bisa punya *satu*
  `Payment` (transaksi sekali-bayar, bukan cicilan).

Kolom `installmentNumber`, `dueDate`, `reminderCount`, dan
`lastReminderSentAt` (menurut komentar developer) **cuma relevan untuk
jalur booking cicilan** - kosong/tidak dipakai untuk 3 jalur pembayaran
lainnya. Tidak ada `CHECK constraint` di level Prisma yang memastikan tepat
satu dari keempat kolom FK ini terisi per baris - kode aplikasi yang wajib
menjaga eksklusivitasnya.

---

### 5.82 `booking_invoices`

**Fungsi tabel**: Invoice/tagihan untuk satu `Booking` mentoring - mendukung
pembayaran penuh (`FULL`) atau cicilan (`INSTALLMENT`), dengan tracking
progres pelunasan lewat `paidAmount`/`remainingAmount`.

#### Kolom

| Kolom | Tipe Data | Constraint | Default | Keterangan |
|---|---|---|---|---|
| `id` | String (cuid) | 🔑 PK, `NOT NULL` | `cuid()` | ID unik invoice. |
| `bookingId` | String | `NOT NULL`, `@unique`, 🔗 FK | – | Booking terkait (1:1). |
| `totalAmount` | Decimal | `NOT NULL` | – | Total tagihan. |
| `paidAmount` | Decimal | `NOT NULL` | `0` | Jumlah yang sudah dibayar (kemungkinan diakumulasi dari `payments` yang statusnya lunas). |
| `remainingAmount` | Decimal | `NOT NULL` | – | Sisa yang belum dibayar. |
| `paymentType` | VarChar | `NOT NULL` | – | Freetext, sesuai komentar developer: `FULL` atau `INSTALLMENT`. |
| `installmentCount` | Int | `nullable` | – | Jumlah cicilan yang disepakati (relevan kalau `paymentType = INSTALLMENT`). |
| `status` | VarChar | `NOT NULL` | – | Freetext, sesuai komentar developer: `PAID_DONE`, `PARTIALLY_PAID`, atau `HAVENT_PAID`. |
| `createdAt` | DateTime | `NOT NULL` | `now()` | Waktu dibuat. |
| `updatedAt` | DateTime | `nullable` | *(tidak ada)* | Tidak punya default sama sekali. |

#### Primary Key & Foreign Key

- 🔑 **PK**: `id`
- 🔗 **FK**: `bookingId` → `bookings.id`, `@unique` (1:1) - `onDelete: Cascade`, `onUpdate: Cascade`.

#### Relasi ke Tabel Lain (ringkasan)

`payments` (→ `payments`, **1:many** - lihat catatan di 5.81).

#### 📌 Catatan

`paymentType` dan `status` sama-sama freetext `VarChar`, tapi nilai
contohnya (dari komentar developer) ditulis pakai `SCREAMING_SNAKE_CASE`
(`FULL`/`INSTALLMENT`, `PAID_DONE`/`PARTIALLY_PAID`/`HAVENT_PAID`) -
berbeda dari kebanyakan kolom `status` freetext lain di skema ini yang
biasanya dicontohkan pakai lowercase (mis. `pending`, `confirmed`).
Penamaan `HAVENT_PAID` juga tata bahasanya agak janggal (harusnya
`HAVE_NOT_PAID` atau `UNPAID`/`NOT_PAID`) - kemungkinan cuma typo di
komentar developer, bukan sesuatu yang perlu diubah di kode, tapi baik
untuk diketahui saat mencari nilai status ini di database/log.
`paidAmount` + `remainingAmount` dua-duanya disimpan eksplisit (bukan
`remainingAmount` dihitung on-the-fly dari `totalAmount - paidAmount`),
jadi berpotensi tidak sinkron kalau salah satu tidak konsisten diupdate
bareng saat ada pembayaran baru masuk.

---

*(Bagian **Payment** dari modul **Payment & Withdrawal** sudah lengkap
dengan ini - 2 tabel baru: `payments` dan `booking_invoices`. Bagian
**Withdrawal** menyusul begitu skemanya dikirim. Tabel `PracticePurchase`,
`ELearningSubscription`, dan `AYCLBooking` yang direferensikan sudah
dibahas masing-masing di 5.75, 5.63, dan 5.24; `BookingParticipant` sudah
dibahas di 5.16.)*