import { Practice } from "@/components/elearning/ElearningSelection";

export const practices: Practice[] = [
  {
    id: 1,
    tipe: "data",
    title: "Data Science Fundamental",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    deskripsi:
      "Pengenalan data science mulai dari konsep dasar, alur kerja, hingga pemahaman data untuk pemula",
    level: "Pemula",
    keywords: [
      "data science",
      "data analyst",
      "data processing",
      "python",
      "statistik dasar",
      "pemula",
    ],
    jumlahSubChapter: 4,
    jumlahModul: 18,
    rating: 4.6,
    JumlahPerating: "98 ulasan",
    jumlahPembeli: "980 peserta",
    subChapters: [
      {
        id: 1,
        coverImage:
          "https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=400&h=200",
        title: "Introduction to Data Science",
        description:
          "Pengantar data science, peran data scientist, dan contoh penerapannya di dunia nyata.",
        taskType: "quiz",
        modules: [
          {
            id: 1,
            title: "What is Data Science?",
            estimatedMinutes: 15,
            completed: true,
            subModules: [
              {
                id: 1,
                title: "Definisi Data Science",
                progress: 100,
                blocks: [
                  {
                    id: "block-1",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-1",
                        type: "heading",
                        level: 4,
                        orderNumber: 1,
                        text: "Apa Itu Data Science?",
                      },
                      {
                        id: "paragraph-1",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Data Science adalah bidang multidisipliner yang mempelajari bagaimana cara mengumpulkan, mengolah, menganalisis, dan menginterpretasikan data untuk menghasilkan insight dan pengetahuan yang bernilai.",
                      },
                      {
                        id: "paragraph-2",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Seorang data scientist bekerja dengan berbagai jenis data, baik data terstruktur seperti tabel dan database, maupun data tidak terstruktur seperti teks, gambar, dan video.",
                      },
                      {
                        id: "highlight-1",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Data Science mengubah data mentah menjadi insight bernilai untuk mendukung pengambilan keputusan.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "video-1",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-1",
                          url: "https://www.youtube.com/watch?v=ua-CiDNNj30",
                          caption: "Video penjelasan pengantar Data Science",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-2",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-2",
                        type: "heading",
                        level: 4,
                        orderNumber: 1,
                        text: "Tiga Pilar Utama Data Science",
                      },
                      {
                        id: "accordion-1",
                        type: "accordion",
                        orderNumber: 2,
                        title: "Pilar Utama Data Science",
                        description:
                          "Data Science berdiri di atas tiga fondasi utama berikut:",
                        items: [
                          {
                            title: "Statistika",
                            content:
                              "Membantu memahami pola, hubungan, dan ketidakpastian dalam data.",
                          },
                          {
                            title: "Pemrograman",
                            content:
                              "Digunakan untuk mengolah data dalam skala besar menggunakan Python, R, atau SQL.",
                          },
                          {
                            title: "Domain Knowledge",
                            content:
                              "Memahami konteks bisnis agar analisis relevan dengan tujuan organisasi.",
                          },
                        ],
                      },
                      {
                        id: "paragraph-3",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Kombinasi ketiga aspek ini membuat Data Science menjadi bidang yang unik dan menantang.",
                      },
                    ],
                  },
                ],
              },
              {
                id: 2,
                title: "Komponen Utama Data Science",
                progress: 60,
                blocks: [
                  {
                    id: "block-3",
                    orderNumber: 1,
                    progress: 60,
                    contents: [
                      {
                        id: "heading-3",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Komponen Utama Data Science",
                      },
                      {
                        id: "paragraph-4",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Komponen utama Data Science meliputi data, algoritma, dan interpretasi hasil. Ketiga komponen ini bekerja bersama untuk menghasilkan insight yang bernilai.",
                      },
                      {
                        id: "contentcard-1",
                        type: "content_card",
                        orderNumber: 3,
                        title: "Komponen Utama Ekosistem Data Science",
                        description:
                          "Untuk menghasilkan analisis yang akurat dan berdampak, Data Science mengandalkan kombinasi dari elemen-elemen berikut:",
                        disableExpandableContent: false,
                        items: [
                          {
                            title: "Data (Raw Material)",
                            content:
                              "Bahan baku mentah yang menjadi fondasi utama dari seluruh proses analisis data science.",
                            expandableContent:
                              "Data dapat berupa data terstruktur (seperti tabel database SQL) maupun data tidak terstruktur (seperti teks media sosial, dokumen PDF, sensor IoT, hingga rekaman audio dan gambar).",
                          },
                          {
                            title: "Algoritma & Statistik",
                            content:
                              "Prosedur matematika yang digunakan untuk menemukan pola tersembunyi dan melakukan prediksi.",
                            expandableContent:
                              "Mencakup berbagai teknik mulai dari statistik inferensial dasar, algoritma Machine Learning (Regresi, Klasifikasi, Clustering), hingga arsitektur Deep Learning yang lebih kompleks.",
                          },
                          {
                            title: "Domain Expertise",
                            content:
                              "Pemahaman mendalam mengenai konteks bisnis atau bidang spesifik yang sedang dianalisis.",
                            expandableContent:
                              "Tanpa pemahaman domain, hasil analisis teknis berisiko menjadi tidak relevan atau sulit diterapkan karena tidak mempertimbangkan batasan dan kebutuhan nyata di lapangan.",
                          },
                          {
                            title: "Technology & Tools",
                            content:
                              "Infrastruktur perangkat lunak dan keras yang memfasilitasi pengolahan data skala besar.",
                            expandableContent:
                              "Meliputi bahasa pemrograman seperti Python dan R, penggunaan SQL untuk query data, hingga platform cloud (AWS/GCP) dan framework big data seperti Apache Spark.",
                          },
                          {
                            title: "Visualisasi & Komunikasi",
                            content:
                              "Kemampuan menceritakan temuan data melalui grafik dan narasi yang mudah dipahami.",
                            expandableContent:
                              "Data Scientist harus mampu mengubah angka-angka rumit menjadi dashboard intuitif atau presentasi strategis agar para pengambil keputusan dapat memahami insight dengan cepat.",
                          },
                          {
                            title: "Interpretasi & Etika",
                            content:
                              "Proses penarikan kesimpulan yang logis dengan mempertimbangkan aspek moral dan privasi.",
                            expandableContent:
                              "Setiap keputusan berbasis data harus divalidasi agar tidak mengandung bias yang merugikan kelompok tertentu dan tetap mematuhi regulasi perlindungan data pribadi pengguna.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-1",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-1",
                          language: "python",
                          initialCode: "print('Hello Data Science')",
                          expectedResult: "Hello Data Science"
                        },
                      },
                      {
                        id: "mcq-1",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-1",
                          question:
                            "Manakah yang termasuk komponen utama Data Science?",
                          description: "Pilih semua jawaban yang benar.",
                          options: [
                            { id: "opt-a", text: "Data" },
                            { id: "opt-b", text: "Algoritma" },
                            { id: "opt-c", text: "Desain Interior" },
                            { id: "opt-d", text: "Interpretasi Hasil" },
                          ],
                          correctAnswers: ["opt-a", "opt-b", "opt-d"],
                          explanation:
                            "Data, algoritma, dan interpretasi hasil adalah tiga komponen utama Data Science.",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 2,
            title: "Data Scientist Role & Skills",
            estimatedMinutes: 20,
            completed: true,
            subModules: [
              {
                id: 3,
                title: "Peran Data Scientist di Industri",
                progress: 100,
                blocks: [
                  {
                    id: "block-4",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-4",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Apa Peran Data Scientist di Dunia Industri?",
                      },
                      {
                        id: "paragraph-5",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Seorang Data Scientist bertanggung jawab untuk mengubah data mentah menjadi strategi bisnis melalui analisis mendalam. Mereka menggali pola, membuat model prediktif, dan menghasilkan insight yang dapat digunakan untuk meningkatkan performa perusahaan.",
                      },
                      {
                        id: "paragraph-6",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Peran ini sangat penting karena keputusan berbasis data (data-driven decision making) terbukti lebih akurat dan objektif dibandingkan keputusan berbasis intuisi semata.",
                      },
                      {
                        id: "highlight-2",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Data Scientist mengubah data menjadi strategi yang berdampak langsung pada bisnis.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "video-2",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-2",
                          url: "https://www.youtube.com/watch?v=X3paOmcrTjQ",
                          caption:
                            "Video penjelasan peran Data Scientist di industri",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-5",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-5",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Jembatan Antara Tim Teknis dan Bisnis",
                      },
                      {
                        id: "paragraph-7",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Data Scientist menjembatani antara departemen teknis (IT) dan pemangku kepentingan (Bisnis). Mereka harus mampu memahami kebutuhan bisnis sekaligus menerjemahkannya menjadi solusi teknis berbasis data.",
                      },
                      {
                        id: "accordion-2",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Contoh Kolaborasi Data Scientist",
                        description:
                          "Berikut beberapa contoh bagaimana Data Scientist bekerja di industri:",
                        items: [
                          {
                            title: "Marketing",
                            content:
                              "Menganalisis perilaku pelanggan untuk meningkatkan konversi dan retensi.",
                          },
                          {
                            title: "Finance",
                            content:
                              "Mendeteksi fraud dan memprediksi risiko kredit menggunakan model machine learning.",
                          },
                          {
                            title: "Operations",
                            content:
                              "Mengoptimalkan rantai pasok dan efisiensi proses operasional.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-2",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-2",
                          question:
                            "Manakah yang termasuk peran utama Data Scientist di industri?",
                          description: "Pilih semua jawaban yang benar.",
                          options: [
                            {
                              id: "opt-a",
                              text: "Menganalisis data untuk menghasilkan insight",
                            },
                            {
                              id: "opt-b",
                              text: "Mengelola desain interior kantor",
                            },
                            {
                              id: "opt-c",
                              text: "Membuat model prediktif berbasis data",
                            },
                            {
                              id: "opt-d",
                              text: "Menjadi penghubung antara tim IT dan bisnis",
                            },
                          ],
                          correctAnswers: ["opt-a", "opt-c", "opt-d"],
                          explanation:
                            "Data Scientist berperan dalam analisis data, pembuatan model prediktif, serta menjembatani kebutuhan teknis dan bisnis.",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 4,
                title: "Hard Skills & Soft Skills",
                progress: 100,
                blocks: [
                  {
                    id: "block-6",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-6",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Hard Skills yang Wajib Dimiliki",
                      },
                      {
                        id: "paragraph-8",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Kemampuan teknis utama seorang Data Scientist meliputi pemrograman (Python atau R), pemahaman statistika, serta Machine Learning. Tanpa fondasi teknis yang kuat, analisis data tidak akan menghasilkan insight yang akurat.",
                      },
                      {
                        id: "highlight-3",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Hard skills adalah fondasi teknis untuk mengolah dan memodelkan data.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-2",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-2",
                          language: "python",
                          initialCode:
                            "import pandas as pd\n# Kemampuan dasar manipulasi data\ndf = pd.DataFrame({'Skill': ['Python', 'Statistics'], 'Level': [10, 9]})\nprint(df)",
                          expectedResult: "        Skill  Level\n0      Python     10\n1  Statistics      9"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-7",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-7",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Soft Skills & Data Storytelling",
                      },
                      {
                        id: "paragraph-9",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Selain kemampuan teknis, komunikasi atau 'Data Storytelling' sangat krusial. Data Scientist harus mampu menjelaskan temuan analisis kepada orang awam, manajer, maupun stakeholder non-teknis dengan bahasa yang mudah dipahami.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-3",
                        type: "image_video",
                        orderNumber: 1,
                        position: "before",
                        content: {
                          id: "media-3",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Ilustrasi proses Data Storytelling dalam presentasi bisnis",
                        },
                      },
                      {
                        id: "mcq-3",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-3",
                          question:
                            "Manakah yang termasuk kombinasi Hard Skill dan Soft Skill seorang Data Scientist?",
                          description: "Pilih semua jawaban yang benar.",
                          options: [
                            { id: "opt-a", text: "Pemrograman Python" },
                            { id: "opt-b", text: "Statistika" },
                            { id: "opt-c", text: "Kemampuan komunikasi" },
                            { id: "opt-d", text: "Data Storytelling" },
                            { id: "opt-e", text: "Desain taman kota" },
                          ],
                          correctAnswers: ["opt-a", "opt-b", "opt-c", "opt-d"],
                          explanation:
                            "Hard skills mencakup pemrograman dan statistika, sedangkan soft skills mencakup komunikasi dan kemampuan Data Storytelling.",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 3,
            title: "Data Science Use Cases",
            estimatedMinutes: 25,
            completed: true,
            subModules: [
              {
                id: 5,
                title: "Penerapan di Industri E-Commerce",
                progress: 85,
                blocks: [
                  {
                    id: "block-8",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-8",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Peran Data Science dalam E-Commerce",
                      },
                      {
                        id: "paragraph-10",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam dunia E-commerce, Data Science digunakan untuk memahami perilaku belanja pelanggan secara real-time. Setiap klik, pencarian, dan transaksi dianalisis untuk mengidentifikasi pola konsumsi.",
                      },
                      {
                        id: "paragraph-11",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Insight dari data ini membantu perusahaan meningkatkan pengalaman pengguna, mempercepat proses checkout, dan meningkatkan konversi penjualan.",
                      },
                    ],
                  },

                  {
                    id: "block-9",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-9",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Recommendation System",
                      },
                      {
                        id: "paragraph-12",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Sistem rekomendasi adalah salah satu implementasi paling populer. Algoritma menganalisis riwayat klik, pencarian, dan pembelian untuk menyarankan produk yang relevan secara personal.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "video-4",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-4",
                          url: "https://www.youtube.com/watch?v=n3RKsY2H-NE",
                          caption: "Contoh implementasi Recommendation System",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-10",
                    orderNumber: 3,
                    progress: 50,
                    contents: [
                      {
                        id: "heading-10",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Dynamic Pricing",
                      },
                      {
                        id: "paragraph-13",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Optimasi harga dinamis memungkinkan perusahaan menyesuaikan harga berdasarkan permintaan pasar, stok, musim, dan harga kompetitor secara otomatis.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-3",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-3",
                          language: "python",
                          initialCode:
                            "# Contoh logika sederhana dynamic pricing\ndemand = 100\nbase_price = 50000\nfinal_price = base_price * 1.2 if demand > 80 else base_price\nprint(final_price)",
                          expectedResult: "60000.0"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-11",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-11",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Analisis Churn Pelanggan",
                      },
                      {
                        id: "paragraph-14",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Analisis churn membantu perusahaan memprediksi pelanggan yang berpotensi berhenti menggunakan layanan. Dengan model prediktif, perusahaan dapat memberikan promo atau intervensi lebih awal.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-1",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-1",
                          question:
                            "Cocokkan istilah dengan penerapannya di E-Commerce",
                          leftItems: [
                            { id: "left-1", text: "Recommendation System" },
                            { id: "left-2", text: "Dynamic Pricing" },
                            { id: "left-3", text: "Churn Prediction" },
                          ],
                          rightItems: [
                            {
                              id: "right-1",
                              text: "Memprediksi pelanggan yang akan berhenti",
                            },
                            {
                              id: "right-2",
                              text: "Menyesuaikan harga secara otomatis",
                            },
                            {
                              id: "right-3",
                              text: "Menyarankan produk relevan",
                            },
                          ],
                          correctPairs: [
                            { leftId: "left-1", rightId: "right-3" },
                            { leftId: "left-2", rightId: "right-2" },
                            { leftId: "left-3", rightId: "right-1" },
                          ],
                          explanation: "Berikut adalah penjelasan mendalam mengenai peran ketiga teknologi Data Science tersebut dalam ekosistem E-Commerce modern:\n\n1. **Recommendation System**: Sistem ini menggunakan algoritma filtrasi (seperti Collaborative Filtering) untuk menganalisis perilaku masa lalu pengguna, seperti riwayat pencarian dan pembelian. Tujuannya adalah menciptakan pengalaman belanja yang personal dengan menampilkan produk yang paling mungkin dibeli, sehingga meningkatkan angka konversi dan nilai rata-rata pesanan (AOV).\n\n2. **Dynamic Pricing**: Strategi ini memungkinkan platform untuk menyesuaikan harga barang secara real-time berdasarkan fluktuasi permintaan pasar, tingkat stok, dan strategi kompetitor. Dengan memanfaatkan model prediktif, perusahaan dapat memaksimalkan margin keuntungan pada saat permintaan tinggi dan tetap kompetitif saat pasar sedang lesu tanpa perlu intervensi manual yang memakan waktu.\n\n3. **Churn Prediction**: Ini adalah aplikasi kritis untuk menjaga loyalitas pelanggan (retensi). Algoritma akan mengidentifikasi tanda-tanda penurunan aktivitas pengguna yang mengindikasikan mereka akan berhenti berlangganan atau berpindah ke kompetitor. Dengan informasi ini, tim pemasaran dapat memberikan promo khusus atau insentif tepat waktu untuk mempertahankan pelanggan tersebut sebelum mereka benar-benar pergi."
                        },
                      },
                    ],
                  },
                ],
              },

              {
                id: 6,
                title: "Data Science di Bidang Kesehatan & Finansial",
                progress: 40,
                blocks: [
                  {
                    id: "block-12",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-12",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Revolusi AI dan Data Science dalam Diagnosis Medis Modern",
                      },
                      {
                        id: "paragraph-15",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Di sektor kesehatan global saat ini, implementasi Data Science telah menjadi katalisator utama yang membantu para praktisi medis dalam melakukan diagnosis penyakit secara jauh lebih presisi. Melalui integrasi teknik Computer Vision yang canggih, sistem komputer kini mampu melakukan ekstraksi fitur dan analisis mendalam terhadap berbagai jenis citra medis berkualitas tinggi seperti X-ray, CT-Scan, hingga MRI. Algoritma ini bekerja dengan membedah jutaan piksel untuk menemukan anomali mikroskopis—seperti pertumbuhan sel tumor pada tahap awal atau retakan tulang yang sangat halus—yang seringkali sulit diidentifikasi oleh mata manusia dalam durasi waktu yang singkat atau di bawah tekanan beban kerja yang tinggi.\n\n",
                      },
                      {
                        id: "paragraph-16",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Lebih jauh lagi, pemanfaatan model Deep Learning, khususnya arsitektur Convolutional Neural Networks (CNN), memungkinkan sistem untuk belajar secara mandiri dari basis data historis yang berisi jutaan pindaian pasien terdahulu. Model ini bertindak sebagai 'asisten digital' yang mampu mendeteksi pola-pola patologis yang sangat kompleks dengan tingkat akurasi yang terus meningkat seiring bertambahnya data. Dengan kemampuan memproses informasi secara instan, teknologi ini tidak hanya mempercepat waktu tunggu diagnosis bagi pasien, tetapi juga secara signifikan mengurangi risiko kesalahan manusia (human error) akibat kelelahan, sehingga memungkinkan dokter untuk lebih fokus pada perencanaan strategi pengobatan yang lebih efektif dan personal bagi setiap individu.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-5",
                        type: "image_video",
                        orderNumber: 1,
                        position: "before",
                        content: {
                          id: "media-5",
                          url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
                          caption: "Pemanfaatan AI dalam analisis citra medis",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-13",
                    orderNumber: 2,
                    progress: 60,
                    contents: [
                      {
                        id: "heading-13",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Prediksi Wabah Penyakit",
                      },
                      {
                        id: "paragraph-17",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Prediksi wabah dilakukan dengan mengolah data mobilitas penduduk, laporan rumah sakit, dan data historis penyebaran penyakit.",
                      },
                      {
                        id: "highlight-4",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Data real-time membantu deteksi dini penyebaran penyakit.",
                      },
                    ],
                  },

                  {
                    id: "block-14",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-14",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Fraud Detection di Industri Finansial",
                      },
                      {
                        id: "paragraph-18",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Di bidang finansial, sistem deteksi penipuan (fraud detection) memanfaatkan Machine Learning untuk mengidentifikasi pola transaksi mencurigakan secara otomatis.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-4",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-4",
                          question:
                            "Manakah indikator transaksi yang berpotensi fraud?",
                          description: "Pilih semua jawaban yang benar.",
                          options: [
                            {
                              id: "opt-a",
                              text: "Transaksi jumlah sangat besar tiba-tiba",
                            },
                            {
                              id: "opt-b",
                              text: "Lokasi transaksi tidak biasa",
                            },
                            {
                              id: "opt-c",
                              text: "Pola belanja konsisten seperti biasa",
                            },
                            {
                              id: "opt-d",
                              text: "Percobaan login berulang kali gagal",
                            },
                          ],
                          correctAnswers: ["opt-a", "opt-b", "opt-c"],
                          explanation:
                            "Transaksi besar mendadak, lokasi tidak biasa, dan login gagal berulang adalah indikator umum fraud.",
                        },
                      },
                      {
                        id: "code-4",
                        type: "interactive_code",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "interactive-4",
                          language: "python",
                          initialCode:
                            "# Pseudocode deteksi transaksi anomali\ntransaction_amount = 15000000\nlocation = 'Unknown'\n\nif transaction_amount > 10000000 and location == 'Unknown':\n    print('Flag as Fraud')\nelse:\n    print('Normal Transaction')",
                            expectedResult: "Flag as Fraud"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-15",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-15",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Credit Scoring & Risk Modeling",
                      },
                      {
                        id: "paragraph-19",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Credit scoring menggunakan algoritma Machine Learning untuk menentukan kelayakan pinjaman berdasarkan riwayat kredit, penghasilan, dan profil risiko nasabah.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "summary-1",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-2",
                          question:
                            "Cocokkan penerapan Data Science dengan sektornya",
                          leftItems: [
                            { id: "left-1", text: "Analisis Citra Medis" },
                            { id: "left-2", text: "Fraud Detection" },
                            { id: "left-3", text: "Credit Scoring" },
                          ],
                          rightItems: [
                            {
                              id: "right-1",
                              text: "Menilai kelayakan pinjaman",
                            },
                            {
                              id: "right-2",
                              text: "Mendeteksi transaksi mencurigakan",
                            },
                            {
                              id: "right-3",
                              text: "Mendiagnosis penyakit melalui gambar",
                            },
                          ],
                          correctPairs: [
                            { leftId: "left-1", rightId: "right-3" },
                            { leftId: "left-2", rightId: "right-3" },
                            { leftId: "left-3", rightId: "right-4" },
                          ],
                          explanation: "Berikut adalah penjelasan teknis mengenai bagaimana Data Science mentransformasi sektor kesehatan dan keuangan:\n\n1. **Analisis Citra Medis (Kesehatan)**: Dalam dunia medis, Data Science memanfaatkan teknologi Computer Vision dan Deep Learning untuk menganalisis gambar radiologi seperti X-Ray, CT-Scan, dan MRI dengan akurasi tinggi. Algoritma ini mampu mengenali pola piksel yang menunjukkan gejala penyakit seperti tumor, perdarahan internal, atau retak tulang yang mungkin terlewatkan oleh mata manusia akibat kelelahan.\n\nPenerapan ini sangat krusial dalam deteksi dini penyakit kronis. Dengan bantuan AI, waktu diagnosis dapat dipangkas secara signifikan sehingga pasien mendapatkan penanganan lebih cepat. Selain itu, sistem ini berfungsi sebagai 'pendapat kedua' bagi dokter yang membantu meminimalkan risiko kesalahan diagnosis (false negatives/positives).\n\n2. **Fraud Detection (Keuangan/Fintech)**: Pendeteksian penipuan menggunakan algoritma Anomaly Detection untuk memantau ribuan transaksi per detik secara real-time. Sistem akan membandingkan profil transaksi saat ini dengan pola perilaku historis pengguna; jika ditemukan transaksi yang tidak biasa (misalnya lokasi akses yang mendadak berpindah negara atau nominal yang tidak wajar), sistem akan otomatis menandainya sebagai mencurigakan.\n\nHal ini melindungi aset nasabah dan institusi dari kerugian finansial akibat peretasan kartu kredit atau pencurian identitas. Berbeda dengan sistem berbasis aturan manual, model Machine Learning terus belajar dari pola penipuan baru yang berkembang, sehingga tetap efektif dalam menghadapi ancaman siber yang semakin canggih.\n\n3. **Credit Scoring (Perbankan/Fintech)**: Credit scoring tradisional sering kali hanya melihat riwayat pembayaran hutang, namun dengan Data Science, penilaian kelayakan pinjaman menjadi lebih inklusif melalui analisis 'Alternative Data'. Ini mencakup pola pengeluaran bulanan, perilaku belanja digital, hingga jejak aktivitas di platform daring untuk memprediksi probabilitas gagal bayar (default probability) secara lebih akurat.\n\nDengan model prediktif ini, lembaga keuangan dapat memberikan akses pinjaman kepada individu yang sebelumnya tidak memiliki akses perbankan (unbanked), namun secara finansial sebenarnya bertanggung jawab. Proses persetujuan yang dulunya memakan waktu berhari-hari kini bisa diselesaikan dalam hitungan menit berkat otomatisasi penilaian risiko berbasis data."
                        },
                      },
                    ],
                  },
                ],
              },
            ],

            // QUIZ HARUS DI SINI
            quiz: {
              id: 101,
              title: "Quiz: Introduction to Data Science & Use Cases",
              description:
                "Quiz ini menguji pemahaman konsep Data Science, peran Data Scientist, dan use case di berbagai industri.",
              totalQuestions: 6,
              timeLimitMinutes: 20,

              questions: [
                {
                  id: 1011,
                  orderNumber: 1,
                  textQuestion:
                    "Manakah pernyataan yang menggambarkan tujuan utama Data Science?",
                  options: [
                    "Mengubah data mentah menjadi insight bernilai",
                    "Mengumpulkan data sebanyak mungkin tanpa analisis",
                    "Membantu pengambilan keputusan berbasis data",
                    "Hanya menyimpan data dalam database",
                    "Mengotomatisasi seluruh proses bisnis tanpa manusia",
                  ],
                  correctAnswers: [
                    "Mengubah data mentah menjadi insight bernilai",
                    "Membantu pengambilan keputusan berbasis data",
                  ],
                  explanation:
                    "Data Science berfokus pada ekstraksi insight dari data untuk mendukung pengambilan keputusan.",
                },
                {
                  id: 1012,
                  orderNumber: 2,
                  textQuestion:
                    "Skill apa saja yang termasuk kompetensi inti seorang Data Scientist?",
                  options: [
                    "Statistika",
                    "Pemrograman",
                    "Domain Knowledge",
                    "Desain Interior",
                    "Copywriting",
                  ],
                  correctAnswers: [
                    "Statistika",
                    "Pemrograman",
                    "Domain Knowledge",
                  ],
                  explanation:
                    "Data Scientist membutuhkan kombinasi statistika, programming, dan pemahaman domain bisnis.",
                },
                {
                  id: 1013,
                  orderNumber: 3,
                  textQuestion:
                    "Apa peran utama Data Scientist dalam sebuah organisasi?",
                  options: [
                    "Mengubah data menjadi strategi bisnis",
                    "Mengelola jaringan server perusahaan",
                    "Menyediakan insight untuk pengambilan keputusan",
                    "Menjadi sales produk",
                  ],
                  correctAnswers: [
                    "Mengubah data menjadi strategi bisnis",
                    "Menyediakan insight untuk pengambilan keputusan",
                  ],
                },
                {
                  id: 1014,
                  orderNumber: 4,
                  textQuestion:
                    "Contoh penerapan Data Science di industri E-commerce adalah?",
                  options: [
                    "Sistem rekomendasi produk",
                    "Prediksi permintaan barang",
                    "Desain halaman landing page",
                    "Customer segmentation",
                    "Pembuatan logo brand",
                  ],
                  correctAnswers: [
                    "Sistem rekomendasi produk",
                    "Prediksi permintaan barang",
                    "Customer segmentation",
                  ],
                  explanation:
                    "E-commerce banyak menggunakan Data Science untuk rekomendasi, prediksi permintaan, dan segmentasi pelanggan.",
                },
                {
                  id: 1015,
                  orderNumber: 5,
                  textQuestion:
                    "Analisis churn pelanggan biasanya digunakan untuk?",
                  options: [
                    "Memprediksi pelanggan yang akan berhenti",
                    "Mengidentifikasi faktor penyebab pelanggan keluar",
                    "Meningkatkan harga produk",
                    "Menentukan warna logo perusahaan",
                  ],
                  correctAnswers: [
                    "Memprediksi pelanggan yang akan berhenti",
                    "Mengidentifikasi faktor penyebab pelanggan keluar",
                  ],
                },
                {
                  id: 1016,
                  orderNumber: 6,
                  textQuestion:
                    "Di bidang finansial, Data Science sering digunakan untuk kasus berikut:",
                  options: [
                    "Fraud detection",
                    "Credit scoring",
                    "Analisis risiko",
                    "Desain kartu kredit fisik",
                  ],
                  correctAnswers: [
                    "Fraud detection",
                    "Credit scoring",
                    "Analisis risiko",
                  ],
                  explanation:
                    "Dalam finansial, Data Science digunakan untuk mendeteksi fraud, menilai risiko kredit, dan analisis risiko finansial.",
                },
              ],
            },
          },
        ],
        progressPercent: 100,
        lastActivityAt: "2026-01-08T10:20:00Z",
        certificateTemplateLink:
          "https://example.com/certificate-datascience.pdf",
      },
      {
        id: 2,
        coverImage:
          "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200",
        title: "Data Types & Data Collection",
        description:
          "Memahami jenis-jenis data dan cara pengumpulan data yang umum digunakan.",
        taskType: "quiz",
        modules: [
          {
            id: 4,
            title: "Structured vs Unstructured Data",
            estimatedMinutes: 20,
            completed: true,
            subModules: [
              {
                id: 7,
                title: "Memahami Structured Data",
                progress: 100,
                blocks: [
                  {
                    id: "block-16",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-16",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Apa Itu Data Terstruktur?",
                      },
                      {
                        id: "paragraph-20",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Data terstruktur adalah jenis data yang memiliki format tetap dan terorganisir dengan baik, biasanya dalam bentuk tabel yang terdiri dari baris dan kolom.",
                      },
                      {
                        id: "paragraph-21",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Karena memiliki skema yang jelas, data ini sangat mudah diproses menggunakan sistem manajemen basis data seperti SQL Database.",
                      },
                    ],
                  },

                  {
                    id: "block-17",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-17",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Karakteristik Utama",
                      },
                      {
                        id: "accordion-3",
                        type: "accordion",
                        orderNumber: 2,
                        title: "Ciri-Ciri Data Terstruktur",
                        items: [
                          {
                            title: "Memiliki Skema Tetap",
                            content:
                              "Struktur kolom sudah ditentukan sebelum data dimasukkan.",
                          },
                          {
                            title: "Relasional",
                            content:
                              "Data bisa dihubungkan antar tabel menggunakan primary key dan foreign key.",
                          },
                          {
                            title: "Mudah Dikuery",
                            content:
                              "Dapat dicari menggunakan SQL dengan performa tinggi.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-6",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-6",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption: "Ilustrasi tabel data dalam sistem database",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-18",
                    orderNumber: 3,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-18",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Contoh Query pada Data Terstruktur",
                      },
                      {
                        id: "paragraph-22",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Bahasa SQL digunakan untuk mengambil dan memanipulasi data terstruktur dengan cepat dan efisien.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-5",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-5",
                          language: "sql",
                          initialCode:
                            "SELECT name, age\nFROM users\nWHERE status = 'active';",
                            expectedResult: "[{'name': 'Rozi', 'age': 28}, {'name': 'Rega', 'age': 32}]"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-19",
                    orderNumber: 4,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-19",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Ringkasan Structured Data",
                      },
                      {
                        id: "summary-2",
                        type: "summary",
                        orderNumber: 2,
                        comments: [
                          "Memiliki format tabel dengan baris dan kolom",
                          "Menggunakan skema tetap",
                          "Cocok untuk sistem relasional",
                          "Mudah diproses menggunakan SQL",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-5",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-5",
                          question:
                            "Manakah yang termasuk contoh data terstruktur?",
                          options: [
                            { id: "opt-1", text: "Tabel transaksi bank" },
                            { id: "opt-2", text: "File video MP4" },
                            { id: "opt-3", text: "Spreadsheet inventaris" },
                            { id: "opt-4", text: "Rekaman suara" },
                          ],
                          correctAnswers: ["opt-1", "opt-3"],
                          explanation:
                            "Tabel dan spreadsheet memiliki struktur kolom dan baris yang jelas.",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 8,
                title: "Mengenal Unstructured & Semi-Structured Data",
                progress: 100,
                blocks: [
                  {
                    id: "block-20",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-20",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Apa Itu Unstructured Data?",
                      },
                      {
                        id: "paragraph-23",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Berbeda dengan data terstruktur, data tidak terstruktur tidak memiliki format tabel atau skema tetap. Data ini sering berupa teks bebas, gambar, audio, atau video.",
                      },
                      {
                        id: "paragraph-24",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Sekitar 80% data yang dihasilkan dunia saat ini termasuk dalam kategori ini, terutama dari media sosial, sensor, dan aktivitas digital.",
                      },
                      {
                        id: "highlight-5",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Sebagian besar Big Data bersifat tidak terstruktur.",
                      },
                    ],
                  },

                  {
                    id: "block-21",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-21",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Contoh Unstructured Data",
                      },
                      {
                        id: "paragraph-25",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Contohnya meliputi file video, rekaman suara, email, dokumen PDF, serta postingan media sosial. Untuk mengolahnya dibutuhkan teknik seperti NLP dan Computer Vision.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-7",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-7",
                          url: "https://www.youtube.com/watch?v=ua-CiDNNj30",
                          caption: "Penjelasan mengenai Unstructured Data",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-22",
                    orderNumber: 3,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-22",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Semi-Structured Data",
                      },
                      {
                        id: "paragraph-26",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Semi-structured data berada di antara structured dan unstructured. Data ini tidak berbentuk tabel relasional, namun memiliki penanda seperti tag atau key-value.",
                      },
                      {
                        id: "accordion-4",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Contoh Format Semi-Structured",
                        items: [
                          {
                            title: "JSON",
                            content:
                              "Menggunakan pasangan key-value untuk menyimpan data.",
                          },
                          {
                            title: "XML",
                            content:
                              "Menggunakan tag untuk memisahkan elemen data.",
                          },
                          {
                            title: "NoSQL Document",
                            content:
                              "Database seperti MongoDB menyimpan data berbentuk dokumen fleksibel.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-6",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-6",
                          language: "json",
                          initialCode:
                            '{\n  "id": 1,\n  "name": "Semi Structured Data",\n  "tags": ["Big Data", "NLP"]\n}',
                            expectedResult: "{\n  \"id\": 1,\n  \"name\": \"Semi Structured Data\",\n  \"tags\": [\"Big Data\", \"NLP\"]\n}"
                        },
                      },
                      {
                        id: "mcq-6",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-6",
                          question:
                            "Manakah yang termasuk semi-structured data?",
                          options: [
                            { id: "opt-1", text: "JSON File" },
                            { id: "opt-2", text: "XML Document" },
                            { id: "opt-3", text: "Tabel SQL" },
                            { id: "opt-4", text: "Video MP4" },
                          ],
                          correctAnswers: ["opt-1", "opt-2"],
                          explanation:
                            "JSON dan XML memiliki struktur fleksibel berbasis tag atau key-value.",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-23",
                    orderNumber: 4,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-23",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Tantangan Pengolahan",
                      },
                      {
                        id: "paragraph-27",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Tantangan utama dalam data tidak terstruktur adalah kebutuhan penyimpanan besar dan algoritma kompleks untuk ekstraksi informasi.",
                      },
                      {
                        id: "summary-3",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Unstructured data tidak memiliki skema tetap",
                          "Semi-structured menggunakan tag atau key-value",
                          "Membutuhkan teknik NLP dan Computer Vision",
                          "Pengolahan lebih kompleks dibanding data tabular",
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 5,
            title: "Data Sources",
            estimatedMinutes: 20,
            completed: true,
            subModules: [
              {
                id: 9,
                title: "Internal vs External Data Sources",
                progress: 100,
                blocks: [
                  {
                    id: "block-24",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-24",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Sumber Data Internal",
                      },
                      {
                        id: "paragraph-28",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Sumber data internal adalah data yang dihasilkan dari dalam organisasi sendiri, seperti database transaksi pelanggan, log server, data operasional harian, hingga data keuangan perusahaan.",
                      },
                      {
                        id: "paragraph-29",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Karena berasal dari sistem internal, data ini biasanya lebih terkontrol, memiliki struktur yang jelas, dan lebih mudah diverifikasi keakuratannya.",
                      },
                      {
                        id: "highlight-6",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Data internal biasanya memiliki tingkat kepercayaan lebih tinggi.",
                      },
                    ],
                  },

                  {
                    id: "block-25",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-25",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Sumber Data Eksternal",
                      },
                      {
                        id: "paragraph-30",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Sumber data eksternal berasal dari luar organisasi, seperti media sosial, laporan riset pasar, data pemerintah (open data), data cuaca, hingga API pihak ketiga.",
                      },
                      {
                        id: "paragraph-31",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Data eksternal sering digunakan untuk memperkaya analisis, memberikan konteks tambahan, dan membantu proses prediksi atau pengambilan keputusan strategis.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-8",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-8",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Ilustrasi ekosistem sumber data internal dan eksternal",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-26",
                    orderNumber: 3,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-26",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Perbandingan Internal vs External",
                      },
                      {
                        id: "accordion-5",
                        type: "accordion",
                        orderNumber: 2,
                        title: "Perbandingan Sumber Data",
                        items: [
                          {
                            title: "Kontrol Data",
                            content:
                              "Data internal dikontrol penuh oleh organisasi, sedangkan data eksternal tidak.",
                          },
                          {
                            title: "Biaya Akses",
                            content:
                              "Data internal biasanya sudah tersedia, data eksternal bisa berbayar.",
                          },
                          {
                            title: "Validitas",
                            content:
                              "Data eksternal perlu proses validasi tambahan.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-7",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-7",
                          question: "Manakah contoh sumber data eksternal?",
                          options: [
                            { id: "opt-1", text: "Log server perusahaan" },
                            {
                              id: "opt-2",
                              text: "Database transaksi internal",
                            },
                            { id: "opt-3", text: "API cuaca publik" },
                            { id: "opt-4", text: "Data absensi karyawan" },
                          ],
                          correctAnswers: ["opt-3"],
                          explanation:
                            "API publik berasal dari luar organisasi sehingga termasuk sumber data eksternal.",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-27",
                    orderNumber: 4,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-27",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Validasi dan Etika Penggunaan Data",
                      },
                      {
                        id: "paragraph-32",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Seorang Data Scientist harus memastikan bahwa sumber data, baik internal maupun eksternal, telah melalui proses validasi, pembersihan, serta mematuhi regulasi privasi dan keamanan data.",
                      },
                      {
                        id: "summary-4",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Data internal berasal dari dalam organisasi",
                          "Data eksternal berasal dari luar organisasi",
                          "Data eksternal memperkaya analisis",
                          "Validasi data sangat penting sebelum analisis",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-3",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-3",
                          question: "Cocokkan jenis sumber data berikut:",
                          leftItems: [
                            { id: "l1", text: "Database Penjualan" },
                            { id: "l2", text: "API Cuaca" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Internal" },
                            { id: "r2", text: "Eksternal" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                          ],
                        },
                      },
                      {
                        id: "code-7",
                        type: "interactive_code",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "interactive-7",
                          language: "python",
                          initialCode:
                            "import requests\n\nresponse = requests.get('https://api.publicapis.org/entries')\nprint(response.status_code)",
                            expectedResult: "200"
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 10,
                title: "Teknik Pengumpulan Data",
                progress: 100,
                blocks: [
                  {
                    id: "block-28",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-28",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Metode Pengumpulan Data Modern",
                      },
                      {
                        id: "paragraph-33",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam dunia data science, pengumpulan data dapat dilakukan melalui berbagai metode seperti query database menggunakan SQL, konsumsi API RESTful, pengunduhan dataset publik, maupun integrasi dengan sistem internal perusahaan.",
                      },
                      {
                        id: "highlight-7",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Kualitas analisis sangat bergantung pada kualitas proses pengumpulan data.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-8",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-8",
                          language: "python",
                          initialCode:
                            "import requests\n\nresponse = requests.get('https://api.example.com/data')\ndata = response.json()\nprint(data)",
                            expectedResult: "{'status': 'success', 'data': []}"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-29",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-29",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Web Scraping",
                      },
                      {
                        id: "paragraph-34",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Web scraping digunakan ketika sebuah website tidak menyediakan API resmi. Teknik ini mengambil data langsung dari struktur HTML halaman web.",
                      },
                      {
                        id: "paragraph-35",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Namun, praktik ini harus memperhatikan robots.txt, kebijakan privasi, serta regulasi hukum yang berlaku.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-9",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-9",
                          url: "https://www.youtube.com/watch?v=X3paOmcrTjQ",
                          caption:
                            "Video tutorial singkat mengenai Web Scraping",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-30",
                    orderNumber: 3,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-30",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Streaming Data & IoT",
                      },
                      {
                        id: "paragraph-36",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Perangkat IoT dan sensor modern mengirimkan data secara real-time ke sistem pusat. Data ini biasanya diproses menggunakan arsitektur streaming seperti message broker dan data pipeline.",
                      },
                      {
                        id: "accordion-6",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Karakteristik Data Streaming",
                        items: [
                          {
                            title: "Real-Time",
                            content:
                              "Data dikirim secara terus menerus tanpa jeda.",
                          },
                          {
                            title: "High Volume",
                            content:
                              "Menghasilkan data dalam jumlah sangat besar.",
                          },
                          {
                            title: "Low Latency",
                            content: "Diproses dengan delay seminimal mungkin.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-8",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-8",
                          question:
                            "Manakah yang termasuk teknik pengumpulan data?",
                          options: [
                            { id: "opt-1", text: "Query SQL" },
                            { id: "opt-2", text: "Web Scraping" },
                            { id: "opt-3", text: "REST API" },
                            { id: "opt-4", text: "Menggambar diagram manual" },
                          ],
                          correctAnswers: ["opt-1", "opt-2", "opt-3"],
                          explanation:
                            "SQL, Web Scraping, dan REST API adalah metode pengumpulan data.",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-31",
                    orderNumber: 4,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-31",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Penyimpanan Setelah Pengumpulan",
                      },
                      {
                        id: "paragraph-37",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah data terkumpul, data dapat disimpan dalam Data Warehouse atau Data Lake tergantung pada struktur dan kebutuhan analisis.",
                      },
                      {
                        id: "summary-5",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "SQL dan API adalah metode umum pengumpulan data",
                          "Web scraping digunakan jika API tidak tersedia",
                          "Streaming data berasal dari IoT dan sensor",
                          "Data harus disimpan dengan arsitektur yang tepat",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-4",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-4",
                          question: "Cocokkan teknik dengan deskripsinya:",
                          leftItems: [
                            { id: "l1", text: "REST API" },
                            { id: "l2", text: "Web Scraping" },
                          ],
                          rightItems: [
                            {
                              id: "r1",
                              text: "Mengambil data dari endpoint resmi",
                            },
                            {
                              id: "r2",
                              text: "Mengambil data dari struktur HTML",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 6,
            title: "Data Collection Methods",
            estimatedMinutes: 25,
            completed: false, // Progress akan bervariasi
            subModules: [
              {
                id: 11,
                title: "Metode Observasi & Survei Digital",
                progress: 75,
                blocks: [
                  {
                    id: "block-32",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-32",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Observasi Perilaku Digital",
                      },
                      {
                        id: "paragraph-38",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Metode observasi dalam data science sering dilakukan melalui event tracking, cookies, heatmap, dan analytic tools untuk memahami perilaku pengguna dalam aplikasi atau website.",
                      },
                      {
                        id: "paragraph-39",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dengan teknik ini, perusahaan dapat melihat pola klik, waktu interaksi, hingga drop-off rate dalam proses tertentu seperti checkout atau pendaftaran.",
                      },
                      {
                        id: "highlight-8",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Observasi digital menghasilkan data perilaku real-time yang sangat kaya.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-9",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-9",
                          language: "javascript",
                          initialCode:
                            "window.addEventListener('click', function(event) {\n  console.log('Element clicked:', event.target);\n});",
                            expectedResult: "Element clicked: [object HTMLElement]"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-33",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-33",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Survei Digital sebagai Data Primer",
                      },
                      {
                        id: "paragraph-40",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Survei digital memungkinkan pengumpulan data langsung dari responden melalui platform online seperti formulir atau aplikasi survei.",
                      },
                      {
                        id: "paragraph-41",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Metode ini efektif untuk mendapatkan opini, preferensi, serta data demografis dalam waktu relatif singkat.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-10",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-10",
                          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
                          caption: "Ilustrasi dashboard survei digital",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-34",
                    orderNumber: 3,
                    progress: 75,
                    contents: [
                      {
                        id: "heading-34",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Bias dalam Survei",
                      },
                      {
                        id: "paragraph-42",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Tantangan utama dalam survei digital adalah bias responden, seperti self-selection bias, leading questions, dan non-response bias.",
                      },
                      {
                        id: "accordion-7",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Jenis Bias Umum",
                        items: [
                          {
                            title: "Self-Selection Bias",
                            content:
                              "Hanya individu tertentu yang memilih untuk mengisi survei.",
                          },
                          {
                            title: "Leading Question",
                            content:
                              "Pertanyaan mengarahkan jawaban responden.",
                          },
                          {
                            title: "Non-Response Bias",
                            content:
                              "Sebagian kelompok tidak memberikan respon.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-9",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-9",
                          question:
                            "Manakah yang termasuk bentuk bias dalam survei digital?",
                          options: [
                            { id: "opt-1", text: "Self-selection bias" },
                            { id: "opt-2", text: "Leading question" },
                            { id: "opt-3", text: "Non-response bias" },
                            { id: "opt-4", text: "Database normalization" },
                          ],
                          correctAnswers: ["opt-1", "opt-2", "opt-3"],
                          explanation:
                            "Ketiga opsi pertama adalah bentuk bias survei, sedangkan database normalization bukan.",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-35",
                    orderNumber: 4,
                    progress: 75,
                    contents: [
                      {
                        id: "heading-35",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Merancang Survei yang Efektif",
                      },
                      {
                        id: "paragraph-43",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Untuk meminimalkan bias, pertanyaan harus netral, jelas, dan tidak ambigu. Selain itu, pemilihan sampel harus merepresentasikan populasi target.",
                      },
                      {
                        id: "summary-6",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Observasi digital menggunakan tracking event",
                          "Survei digital menghasilkan data primer",
                          "Bias survei dapat mempengaruhi hasil analisis",
                          "Desain pertanyaan yang netral sangat penting",
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 12,
                title: "Eksperimen & A/B Testing",
                progress: 30,
                blocks: [
                  {
                    id: "block-36",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-36",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Konsep Dasar Eksperimen Digital",
                      },
                      {
                        id: "paragraph-44",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "A/B Testing adalah metode eksperimen terkontrol yang digunakan untuk membandingkan dua versi dari suatu elemen produk digital, seperti tombol, headline, layout halaman, atau bahkan alur checkout. Dalam praktiknya, pengguna dibagi secara acak ke dalam dua grup berbeda untuk memastikan bahwa perbedaan hasil benar-benar disebabkan oleh perubahan variabel yang diuji dan bukan oleh faktor eksternal lainnya.",
                      },
                      {
                        id: "paragraph-45",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Metode ini banyak digunakan dalam pengembangan produk digital karena memungkinkan pengambilan keputusan berbasis data. Setiap perubahan kecil dapat diuji terlebih dahulu sebelum diimplementasikan secara penuh kepada seluruh pengguna, sehingga risiko penurunan performa dapat diminimalkan.",
                      },
                      {
                        id: "highlight-9",
                        type: "highlight",
                        orderNumber: 4,
                        text: "A/B Testing membantu keputusan produk menjadi berbasis data, bukan asumsi.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-11",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-11",
                          url: "https://www.youtube.com/watch?v=8H6Qo2e_D8M",
                          caption:
                            "Penjelasan visual mengenai konsep A/B Testing",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-37",
                    orderNumber: 2,
                    progress: 60,
                    contents: [
                      {
                        id: "heading-37",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Menentukan KPI dan Hipotesis",
                      },
                      {
                        id: "paragraph-46",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Sebelum eksperimen dimulai, penting untuk menetapkan Key Performance Indicator (KPI) yang jelas, seperti Click Through Rate (CTR), conversion rate, average order value, atau retention rate. Tanpa metrik yang terdefinisi dengan baik, hasil eksperimen akan sulit diinterpretasikan dan berpotensi menyesatkan.",
                      },
                      {
                        id: "paragraph-47",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Selain KPI, hipotesis juga harus dirumuskan secara spesifik. Contohnya: 'Mengubah warna tombol menjadi hijau akan meningkatkan conversion rate sebesar 5% dibandingkan versi sebelumnya.' Hipotesis yang jelas membantu tim fokus pada tujuan eksperimen.",
                      },
                      {
                        id: "accordion-8",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Komponen Penting Eksperimen",
                        items: [
                          {
                            title: "Hipotesis",
                            content:
                              "Pernyataan yang ingin diuji secara terukur.",
                          },
                          {
                            title: "Variabel",
                            content: "Elemen yang diubah dalam eksperimen.",
                          },
                          {
                            title: "Metrik",
                            content: "Indikator untuk mengukur keberhasilan.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-10",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-10",
                          question:
                            "Apa yang harus ditentukan sebelum menjalankan A/B Testing?",
                          options: [
                            { id: "opt-1", text: "Hipotesis yang jelas" },
                            { id: "opt-2", text: "KPI yang terukur" },
                            { id: "opt-3", text: "Pembagian grup acak" },
                            { id: "opt-4", text: "Jumlah warna di halaman" },
                          ],
                          correctAnswers: ["opt-1", "opt-2", "opt-3"],
                          explanation:
                            "Hipotesis, KPI, dan randomisasi adalah fondasi eksperimen yang valid.",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-38",
                    orderNumber: 3,
                    progress: 40,
                    contents: [
                      {
                        id: "heading-38",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Randomisasi & Pembagian Grup",
                      },
                      {
                        id: "paragraph-48",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Randomisasi dilakukan untuk memastikan bahwa setiap pengguna memiliki peluang yang sama untuk masuk ke grup kontrol maupun grup eksperimen. Dengan cara ini, distribusi karakteristik pengguna akan relatif seimbang sehingga hasil eksperimen lebih dapat dipercaya.",
                      },
                      {
                        id: "paragraph-49",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam skala besar, pembagian ini biasanya dilakukan secara otomatis oleh sistem backend menggunakan algoritma tertentu yang memastikan distribusi tetap konsisten sepanjang periode eksperimen.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-10",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-10",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\n# Simulasi pembagian 1000 user\nusers = 1000\ngroups = np.random.choice(['Control', 'Experiment'], size=users, p=[0.5, 0.5])\n\nunique, counts = np.unique(groups, return_counts=True)\nprint(dict(zip(unique, counts)))",
                            expectedResult: "{'Control': 500, 'Experiment': 500}"
                        },
                      },
                      {
                        id: "matching-5",
                        type: "matching",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "matching-question-5",
                          question: "Cocokkan istilah dengan definisinya:",
                          leftItems: [
                            { id: "l1", text: "Control Group" },
                            { id: "l2", text: "Experiment Group" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Versi lama atau baseline" },
                            { id: "r2", text: "Versi dengan perubahan baru" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                          ],
                        },
                      },
                    ],
                  },

                  {
                    id: "block-39",
                    orderNumber: 4,
                    progress: 20,
                    contents: [
                      {
                        id: "heading-39",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Analisis Statistik Hasil Eksperimen",
                      },
                      {
                        id: "paragraph-50",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah eksperimen berjalan selama periode tertentu dan data terkumpul, langkah berikutnya adalah melakukan analisis statistik. Metode seperti t-test, chi-square test, atau perhitungan p-value digunakan untuk menentukan apakah perbedaan performa antara dua grup signifikan secara statistik atau hanya terjadi karena variasi acak.",
                      },
                      {
                        id: "paragraph-51",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Keputusan akhir biasanya diambil berdasarkan tingkat signifikansi tertentu, misalnya 95% confidence level. Jika hasil signifikan, maka perubahan dapat diimplementasikan secara permanen. Jika tidak, eksperimen dapat diulang dengan hipotesis baru.",
                      },
                      {
                        id: "summary-7",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "A/B Testing membandingkan dua versi produk",
                          "Hipotesis dan KPI harus ditentukan sejak awal",
                          "Randomisasi penting untuk validitas eksperimen",
                          "Analisis statistik menentukan signifikansi hasil",
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 7,
            title: "Case Study: Data Collection",
            estimatedMinutes: 30,
            completed: false,
            subModules: [
              {
                id: 13,
                title: "Studi Kasus: Optimalisasi Layout Minimarket",
                progress: 100,
                blocks: [
                  {
                    id: "block-40",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-40",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Identifikasi Masalah Bisnis",
                      },
                      {
                        id: "paragraph-52",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Sebuah jaringan minimarket nasional menghadapi tantangan dalam meningkatkan nilai rata-rata transaksi per pelanggan. Meskipun jumlah pengunjung stabil, manajemen menyadari bahwa peluang cross-selling belum dimanfaatkan secara maksimal. Analisis awal menunjukkan bahwa produk roti dan susu sering dibeli secara bersamaan, namun tata letak toko tidak mendukung perilaku pembelian tersebut.",
                      },
                      {
                        id: "paragraph-53",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Permasalahan ini bukan hanya tentang penempatan produk, tetapi juga tentang bagaimana pelanggan bergerak di dalam toko. Apakah mereka melihat produk pelengkap? Apakah jarak antar rak mempengaruhi keputusan spontan? Pertanyaan-pertanyaan ini menjadi dasar dimulainya proyek data science untuk optimalisasi layout.",
                      },
                      {
                        id: "highlight-10",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Optimalisasi layout bertujuan meningkatkan cross-selling dan basket size.",
                      },
                    ],
                  },

                  {
                    id: "block-41",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-41",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Pengumpulan & Integrasi Data",
                      },
                      {
                        id: "paragraph-54",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Tim mengumpulkan data transaksi historis dari sistem Point of Sale (POS) selama enam bulan terakhir. Data ini mencakup informasi produk yang dibeli, waktu transaksi, serta kombinasi item dalam satu keranjang belanja. Selain itu, digunakan pula sensor heatmap untuk melacak pergerakan pelanggan di dalam toko dan mengidentifikasi area dengan traffic tinggi maupun rendah.",
                      },
                      {
                        id: "paragraph-55",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Integrasi kedua sumber data ini memungkinkan analisis yang lebih komprehensif: tidak hanya mengetahui produk apa yang sering dibeli bersama, tetapi juga memahami apakah pelanggan benar-benar melewati rak tertentu atau melewatkannya begitu saja.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-12",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-12",
                          url: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400",
                          caption: "Ilustrasi tata letak rak minimarket",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-42",
                    orderNumber: 3,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-42",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Analisis Korelasi Produk",
                      },
                      {
                        id: "paragraph-56",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Hasil analisis menunjukkan bahwa sekitar 70% pelanggan yang membeli roti juga membeli susu dalam transaksi yang sama. Namun, kedua produk tersebut ditempatkan di lokasi yang berjauhan, sehingga peluang pembelian impulsif berpotensi hilang jika pelanggan hanya berniat membeli salah satu saja.",
                      },
                      {
                        id: "paragraph-57",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dengan menggunakan analisis korelasi sederhana serta pendekatan market basket analysis, tim dapat mengukur kekuatan hubungan antar produk dan mengidentifikasi pasangan produk lainnya yang memiliki potensi cross-selling tinggi.",
                      },
                      {
                        id: "accordion-9",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Metode Analisis yang Digunakan",
                        items: [
                          {
                            title: "Correlation Analysis",
                            content:
                              "Mengukur hubungan linier antar variabel produk.",
                          },
                          {
                            title: "Market Basket Analysis",
                            content: "Menemukan pola pembelian bersama.",
                          },
                          {
                            title: "Heatmap Tracking",
                            content:
                              "Menganalisis pergerakan pelanggan di toko.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-11",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-11",
                          language: "python",
                          initialCode:
                            "# Contoh korelasi sederhana\ncorrelation = df['roti'].corr(df['susu'])\nprint(f'Kekuatan hubungan roti & susu: {correlation}')",
                            expectedResult: "Kekuatan hubungan roti & susu: 0.85"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-43",
                    orderNumber: 4,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-43",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Implementasi & Evaluasi Eksperimen",
                      },
                      {
                        id: "paragraph-58",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Berdasarkan temuan analitik, manajemen memutuskan untuk melakukan eksperimen lapangan dengan memindahkan rak roti kecil ke dekat kulkas susu di beberapa cabang tertentu sebagai kelompok eksperimen. Cabang lainnya tetap menggunakan layout lama sebagai kelompok kontrol.",
                      },
                      {
                        id: "paragraph-59",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Setelah periode uji coba selama satu bulan, data menunjukkan peningkatan signifikan dalam pembelian gabungan roti dan susu di cabang eksperimen. Hasil ini membuktikan bahwa perubahan tata letak berbasis data dapat memberikan dampak nyata terhadap performa penjualan.",
                      },
                      {
                        id: "summary-8",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Masalah bisnis dapat dipecahkan dengan analisis data",
                          "Integrasi POS dan heatmap memberi insight lebih kaya",
                          "Market basket analysis membantu cross-selling",
                          "Eksperimen lapangan memvalidasi keputusan layout",
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 14,
                title: "Analisis Hasil & Pengambilan Keputusan",
                progress: 45,
                blocks: [
                  {
                    id: "block-44",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-44",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Validasi Data Pasca Intervensi",
                      },
                      {
                        id: "paragraph-60",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Untuk memastikan bahwa perubahan layout benar-benar memberikan dampak yang terukur, tim melakukan pengumpulan data selama 14 hari setelah intervensi dilakukan. Data ini dibandingkan dengan periode sebelum perubahan menggunakan pendekatan before-after analysis. Selain melihat angka penjualan mentah, tim juga memperhatikan pola waktu transaksi, distribusi pembelian per jam, serta perubahan komposisi keranjang belanja pelanggan. Hal ini penting agar keputusan tidak hanya didasarkan pada kenaikan sementara, tetapi benar-benar mencerminkan perubahan perilaku konsumen yang konsisten.",
                      },
                      {
                        id: "highlight-11",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Keputusan berbasis data harus melalui proses validasi yang objektif.",
                      },
                    ],
                  },

                  {
                    id: "block-45",
                    orderNumber: 2,
                    progress: 80,
                    contents: [
                      {
                        id: "heading-45",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Metrik Evaluasi Kinerja",
                      },
                      {
                        id: "paragraph-61",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dua metrik utama yang dianalisis adalah Basket Size dan Revenue per Category. Basket Size dihitung sebagai rata-rata jumlah item dalam satu transaksi, sedangkan Revenue per Category memantau kontribusi kategori roti dan susu terhadap total pendapatan. Selain itu, tim juga menghitung conversion rate pembelian gabungan untuk mengetahui seberapa besar peningkatan probabilitas pelanggan membeli kedua produk secara bersamaan setelah layout diubah.",
                      },
                      {
                        id: "accordion-10",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Indikator yang Dipantau",
                        items: [
                          {
                            title: "Basket Size",
                            content:
                              "Rata-rata jumlah item per transaksi pelanggan.",
                          },
                          {
                            title: "Category Revenue",
                            content: "Total pendapatan per kategori produk.",
                          },
                          {
                            title: "Cross-Selling Rate",
                            content:
                              "Persentase pembelian gabungan antar produk.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-11",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-11",
                          question:
                            "Metrik mana yang paling relevan untuk mengukur peningkatan cross-selling?",
                          options: [
                            { id: "opt-1", text: "Basket Size" },
                            { id: "opt-2", text: "Cross-Selling Rate" },
                            { id: "opt-3", text: "Jumlah Karyawan Shift" },
                            { id: "opt-4", text: "Waktu Buka Toko" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Cross-Selling Rate secara langsung mengukur peningkatan pembelian gabungan antar produk.",
                        },
                      },
                    ],
                  },

                  {
                    id: "block-46",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-46",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Analisis Kuantitatif & Perhitungan Growth",
                      },
                      {
                        id: "paragraph-62",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah periode observasi selesai, tim menghitung persentase pertumbuhan penjualan menggunakan formula sederhana growth rate. Perhitungan ini membantu manajemen memahami seberapa besar peningkatan yang terjadi secara proporsional, bukan hanya dalam angka absolut. Dengan pendekatan ini, keputusan untuk melakukan roll-out perubahan layout ke seluruh cabang dapat dipertimbangkan secara rasional dan terukur.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-13",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-13",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption: "Visualisasi analisis pertumbuhan penjualan",
                        },
                      },
                      {
                        id: "code-12",
                        type: "interactive_code",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "interactive-12",
                          language: "python",
                          initialCode:
                            "# Menghitung growth rate\npenjualan_lama = 1000\npenjualan_baru = 1150\n\ngrowth = (penjualan_baru - penjualan_lama) / penjualan_lama * 100\nprint(f'Growth rate: {growth}%')",
                            expectedResult: "Growth rate: 15.0%"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-47",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-47",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Pengambilan Keputusan Strategis",
                      },
                      {
                        id: "paragraph-63",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Berdasarkan hasil analisis yang menunjukkan peningkatan penjualan roti sebesar 15% tanpa penurunan signifikan pada kategori lain, manajemen memutuskan untuk memperluas implementasi layout baru ke seluruh cabang secara bertahap. Namun, proses ini tetap disertai monitoring berkelanjutan untuk memastikan dampaknya konsisten di berbagai lokasi dengan karakteristik pelanggan yang berbeda. Keputusan strategis yang baik bukan hanya berdasarkan satu eksperimen, tetapi pada konsistensi hasil dan kesiapan operasional.",
                      },
                      {
                        id: "summary-9",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Validasi dilakukan dengan before-after analysis",
                          "Metrik utama: Basket Size & Cross-Selling Rate",
                          "Growth rate membantu evaluasi proporsional",
                          "Keputusan strategis harus berbasis data konsisten",
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            // Penambahan Quiz untuk SubChapter ID 2 (Data Types & Data Collection)
            quiz: {
              id: 102,
              title: "Quiz Akhir: Data Types & Collection",
              description:
                "Evaluasi menyeluruh mengenai tipe data terstruktur/tidak terstruktur, sumber data internal/eksternal, serta metode pengumpulan data.",
              totalQuestions: 5,
              timeLimitMinutes: 15,

              questions: [
                {
                  id: 1021,
                  orderNumber: 1,
                  textQuestion:
                    "Manakah pernyataan berikut yang BENAR mengenai data terstruktur dan tidak terstruktur?",
                  options: [
                    "Data terstruktur memiliki skema tetap seperti tabel",
                    "Data tidak terstruktur selalu berbentuk angka",
                    "Data tidak terstruktur dapat berupa teks, gambar, atau video",
                    "Data terstruktur biasanya mudah dianalisis menggunakan SQL",
                    "Data tidak terstruktur tidak bisa dianalisis sama sekali",
                  ],
                  correctAnswers: [
                    "Data terstruktur memiliki skema tetap seperti tabel",
                    "Data tidak terstruktur dapat berupa teks, gambar, atau video",
                    "Data terstruktur biasanya mudah dianalisis menggunakan SQL",
                  ],
                  explanation:
                    "Data terstruktur memiliki format tabular dengan skema tetap. Data tidak terstruktur mencakup teks, gambar, video, dan membutuhkan teknik khusus untuk analisis.",
                },

                {
                  id: 1022,
                  orderNumber: 2,
                  textQuestion:
                    "Contoh data semi-terstruktur yang umum digunakan dalam sistem modern adalah?",
                  options: [
                    "File PDF hasil scan",
                    "Dokumen JSON",
                    "File XML",
                    "Tabel relasional SQL",
                    "CSV dengan header kolom",
                  ],
                  correctAnswers: ["Dokumen JSON", "File XML"],
                  explanation:
                    "JSON dan XML menggunakan struktur key-value atau tag, sehingga disebut semi-terstruktur.",
                },

                {
                  id: 1023,
                  orderNumber: 3,
                  textQuestion:
                    "Manakah yang termasuk sumber data eksternal bagi sebuah perusahaan?",
                  options: [
                    "Database pelanggan internal",
                    "API media sosial",
                    "Open data pemerintah",
                    "Data transaksi kasir internal",
                    "Laporan riset dari perusahaan konsultan",
                  ],
                  correctAnswers: [
                    "API media sosial",
                    "Open data pemerintah",
                    "Laporan riset dari perusahaan konsultan",
                  ],
                  explanation:
                    "Data eksternal berasal dari luar organisasi seperti API publik, open data, dan laporan pihak ketiga.",
                },

                {
                  id: 1024,
                  orderNumber: 4,
                  textQuestion:
                    "Teknik pengumpulan data yang dilakukan tanpa API resmi dari website disebut?",
                  options: [
                    "Web Scraping",
                    "Manual Copy-Paste",
                    "Database Replication",
                    "Streaming API",
                  ],
                  correctAnswers: ["Web Scraping"],
                  explanation:
                    "Web scraping adalah proses ekstraksi data otomatis dari website menggunakan script.",
                },

                {
                  id: 1025,
                  orderNumber: 5,
                  textQuestion:
                    "Dalam eksperimen A/B Testing, apa fungsi utama control group?",
                  options: [
                    "Sebagai kelompok pembanding",
                    "Menggunakan versi lama/standar sistem",
                    "Diberikan fitur eksperimen",
                    "Digunakan untuk menyimpan backup data",
                  ],
                  correctAnswers: [
                    "Sebagai kelompok pembanding",
                    "Menggunakan versi lama/standar sistem",
                  ],
                  explanation:
                    "Control group tetap menggunakan versi standar untuk dibandingkan dengan kelompok eksperimen.",
                },
              ],
            },
          },
        ],
        progressPercent: 50,
        lastActivityAt: "2026-01-15T09:40:00Z",
        certificateTemplateLink:
          "https://example.com/certificate-datascience-2.pdf",
      },
      {
        id: 3,
        coverImage:
          "https://images.unsplash.com/photo-1581091870627-3c1b79c5d2c9?w=400&h=200",
        title: "Data Cleaning & Preparation",
        description:
          "Tahapan penting dalam membersihkan dan menyiapkan data sebelum analisis.",
        taskType: "quiz_and_project",
        modules: [
          {
            id: 8,
            title: "Handling Missing Values",
            estimatedMinutes: 25,
            completed: false,
            subModules: [
              {
                id: 15,
                title: "Identifikasi Missing Values",
                progress: 60,
                blocks: [
                  {
                    id: "block-48",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-48",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Memahami Konsep Missing Values",
                      },
                      {
                        id: "paragraph-64",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Missing values atau nilai yang hilang merupakan salah satu tantangan terbesar dalam proses data cleaning. Dalam praktik dunia nyata, sangat jarang kita menemukan dataset yang benar-benar lengkap tanpa adanya nilai kosong. Data dapat hilang karena berbagai alasan seperti kesalahan input manual, gangguan sistem saat pengumpulan data, keterbatasan responden dalam survei, hingga kegagalan perangkat sensor. Ketika tidak ditangani dengan benar, missing values dapat menyebabkan bias dalam analisis, mengurangi akurasi model machine learning, bahkan menghasilkan kesimpulan yang menyesatkan. Oleh karena itu, memahami sumber dan pola kehilangan data adalah langkah awal yang sangat krusial sebelum masuk ke tahap penanganan.",
                      },
                      {
                        id: "highlight-12",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Data yang tidak lengkap bisa mengubah hasil analisis secara signifikan.",
                      },
                    ],
                  },

                  {
                    id: "block-49",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-49",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Teknik Identifikasi Missing Values",
                      },
                      {
                        id: "paragraph-65",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Langkah pertama dalam menangani missing values adalah mengidentifikasi keberadaannya secara sistematis. Dalam Python, library Pandas menyediakan berbagai fungsi seperti isnull(), notnull(), dan info() untuk mendeteksi jumlah nilai kosong pada setiap kolom. Selain itu, visualisasi seperti heatmap missing data juga dapat membantu melihat pola distribusi nilai kosong secara lebih intuitif. Identifikasi ini penting untuk menentukan apakah nilai hilang terjadi secara acak atau memiliki pola tertentu yang mungkin berkaitan dengan variabel lain dalam dataset.",
                      },
                      {
                        id: "accordion-11",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Jenis Missing Data",
                        items: [
                          {
                            title: "MCAR",
                            content:
                              "Missing Completely At Random, tidak ada pola tertentu.",
                          },
                          {
                            title: "MAR",
                            content:
                              "Missing At Random, tergantung variabel lain.",
                          },
                          {
                            title: "MNAR",
                            content:
                              "Missing Not At Random, ada pola tersembunyi.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-13",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-13",
                          language: "python",
                          initialCode:
                            "import pandas as pd\n\n# Membaca dataset\ndf = pd.read_csv('data.csv')\n\n# Menghitung jumlah missing values tiap kolom\nprint(df.isnull().sum())",
                            expectedResult: "user_id     0\nproduct     0\nrating     15\ndtype: int64"
                        },
                      },
                    ],
                  },

                  {
                    id: "block-50",
                    orderNumber: 3,
                    progress: 50,
                    contents: [
                      {
                        id: "heading-50",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Visualisasi & Evaluasi Dampak Missing Data",
                      },
                      {
                        id: "paragraph-66",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Selain menghitung jumlah nilai kosong, penting juga untuk mengevaluasi dampaknya terhadap analisis. Misalnya, jika kolom dengan missing values memiliki peran penting dalam prediksi, maka penghapusan baris secara sembarangan bisa mengurangi jumlah data secara signifikan dan mempengaruhi performa model. Visualisasi seperti bar chart proporsi missing value per kolom atau heatmap distribusi nilai kosong dapat membantu dalam pengambilan keputusan. Evaluasi ini menjadi dasar untuk menentukan strategi selanjutnya, apakah akan dilakukan imputasi, penghapusan data, atau pendekatan lainnya.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-14",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-14",
                          url: "https://images.unsplash.com/photo-1599658880436-c61792e70672?w=400",
                          caption:
                            "Ilustrasi visual data dengan nilai yang hilang",
                        },
                      },
                      {
                        id: "mcq-12",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-12",
                          question:
                            "Apa risiko utama jika missing values tidak ditangani dengan benar?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Dataset menjadi lebih besar",
                            },
                            {
                              id: "opt-2",
                              text: "Analisis menjadi bias atau tidak akurat",
                            },
                            { id: "opt-3", text: "Model menjadi lebih cepat" },
                            { id: "opt-4", text: "Warna visualisasi berubah" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Missing values yang tidak ditangani dapat menyebabkan bias dan menurunkan akurasi analisis.",
                        },
                      },
                      {
                        id: "matching-6",
                        type: "matching",
                        orderNumber: 3,
                        position: "after",
                        content: {
                          id: "matching-question-6",
                          question:
                            "Cocokkan jenis missing data dengan definisinya:",
                          leftItems: [
                            { id: "l1", text: "MCAR" },
                            { id: "l2", text: "MAR" },
                            { id: "l3", text: "MNAR" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Tidak ada pola tertentu" },
                            { id: "r2", text: "Tergantung variabel lain" },
                            { id: "r3", text: "Ada pola tersembunyi" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },

                  {
                    id: "block-51",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-51",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Kesimpulan Tahap Identifikasi",
                      },
                      {
                        id: "paragraph-67",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Tahap identifikasi missing values merupakan fondasi dari seluruh proses data cleaning. Tanpa pemahaman yang jelas mengenai distribusi dan pola kehilangan data, strategi penanganan yang dipilih bisa saja keliru dan berdampak pada kualitas analisis selanjutnya. Dengan kombinasi pendekatan kuantitatif (perhitungan jumlah nilai kosong) dan visual (heatmap atau grafik proporsi), seorang data analyst dapat membuat keputusan yang lebih tepat dan terstruktur dalam mempersiapkan dataset untuk tahap modeling atau analisis lanjutan.",
                      },
                      {
                        id: "summary-10",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Missing values umum terjadi dalam dataset nyata",
                          "Identifikasi dilakukan dengan fungsi seperti isnull()",
                          "Pahami jenis MCAR, MAR, dan MNAR",
                          "Evaluasi dampak sebelum menentukan strategi penanganan",
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 16,
                title: "Teknik Imputasi vs Deletion",
                progress: 0,
                blocks: [
                  {
                    id: "block-52",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-52",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Dua Strategi Utama: Deletion dan Imputation",
                      },
                      {
                        id: "paragraph-68",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah proses identifikasi missing values dilakukan secara menyeluruh, langkah berikutnya adalah menentukan strategi penanganan yang tepat. Secara umum, terdapat dua pendekatan utama yang paling sering digunakan dalam praktik data cleaning, yaitu deletion (penghapusan data) dan imputation (pengisian nilai yang hilang). Kedua teknik ini memiliki kelebihan dan kekurangan masing-masing, dan pemilihannya tidak bisa dilakukan secara sembarangan. Faktor seperti ukuran dataset, proporsi missing values, distribusi data, serta konteks bisnis sangat mempengaruhi keputusan akhir. Dalam beberapa kasus, deletion mungkin terlihat sederhana dan cepat, tetapi berisiko mengurangi jumlah observasi secara signifikan. Sebaliknya, imputation dapat mempertahankan jumlah data, namun berpotensi menambahkan bias jika metode estimasinya tidak sesuai dengan karakteristik data.",
                      },
                      {
                        id: "highlight-13",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Tidak ada teknik yang selalu benar, semuanya bergantung pada konteks data.",
                      },
                    ],
                  },
                  {
                    id: "block-53",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-53",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Pendekatan Deletion: Sederhana Namun Berisiko",
                      },
                      {
                        id: "paragraph-69",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Deletion adalah teknik yang dilakukan dengan cara menghapus baris atau kolom yang mengandung nilai kosong. Metode ini sering digunakan ketika proporsi missing values relatif kecil atau ketika data yang hilang dianggap tidak signifikan terhadap keseluruhan analisis. Terdapat dua bentuk umum deletion, yaitu listwise deletion (menghapus seluruh baris jika terdapat satu saja nilai kosong) dan column deletion (menghapus kolom tertentu jika persentase missing terlalu besar). Walaupun terlihat praktis, pendekatan ini dapat menyebabkan hilangnya informasi penting, terutama jika dataset berukuran kecil atau jika missing values memiliki pola tertentu. Oleh karena itu, sebelum melakukan deletion, penting untuk mengevaluasi dampaknya terhadap distribusi data dan representativitas sampel.",
                      },
                      {
                        id: "accordion-12",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Jenis Deletion",
                        items: [
                          {
                            title: "Listwise Deletion",
                            content:
                              "Menghapus seluruh baris jika ada satu nilai kosong.",
                          },
                          {
                            title: "Pairwise Deletion",
                            content:
                              "Menggunakan data tersedia per analisis tertentu.",
                          },
                          {
                            title: "Column Deletion",
                            content: "Menghapus kolom dengan missing tinggi.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-14",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-14",
                          language: "python",
                          initialCode:
                            "# Menghapus baris dengan missing values\nclean_df = df.dropna()\n\n# Menghapus kolom dengan lebih dari 50% missing\nthreshold = len(df) * 0.5\nclean_df = df.dropna(thresh=threshold, axis=1)",
                            expectedResult: "Baris tersisa: 85"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-54",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-54",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Pendekatan Imputation: Mengisi dengan Estimasi",
                      },
                      {
                        id: "paragraph-70",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Imputation adalah teknik yang bertujuan untuk mengisi nilai kosong dengan estimasi tertentu agar dataset tetap utuh. Untuk data numerik, metode yang umum digunakan adalah mean, median, atau modus. Pemilihan metode sangat bergantung pada distribusi data; misalnya, median lebih cocok untuk data yang memiliki outlier karena lebih robust dibandingkan mean. Untuk data kategorikal, nilai yang paling sering muncul biasanya digunakan sebagai pengganti. Selain metode sederhana tersebut, terdapat pula teknik lanjutan seperti KNN Imputation atau model-based imputation yang memanfaatkan pola antar variabel untuk memperkirakan nilai yang hilang. Meskipun imputation membantu menjaga jumlah observasi, teknik ini tetap harus digunakan dengan hati-hati agar tidak menciptakan pola buatan yang tidak merepresentasikan kondisi sebenarnya.",
                      },
                      {
                        id: "paragraph-71",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam praktik bisnis, pemilihan teknik imputasi sering kali mempertimbangkan risiko analitis. Misalnya, dalam analisis kesehatan atau keuangan, mengganti nilai ekstrem dengan rata-rata dapat menurunkan sensitivitas model terhadap kondisi kritis. Oleh karena itu, dokumentasi proses imputasi menjadi bagian penting dari workflow data science agar transparansi dan reproducibility tetap terjaga.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-15",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-15",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Ilustrasi proses analisis dan imputasi data",
                        },
                      },
                      {
                        id: "mcq-13",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-13",
                          question:
                            "Kapan median lebih disarankan dibanding mean untuk imputasi?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Saat data memiliki banyak outlier",
                            },
                            { id: "opt-2", text: "Saat data selalu simetris" },
                            {
                              id: "opt-3",
                              text: "Saat tidak ada missing value",
                            },
                            { id: "opt-4", text: "Saat dataset sangat kecil" },
                          ],
                          correctAnswers: ["opt-1"],
                          explanation:
                            "Median lebih robust terhadap outlier dibandingkan mean.",
                        },
                      },
                      {
                        id: "matching-7",
                        type: "matching",
                        orderNumber: 3,
                        position: "after",
                        content: {
                          id: "matching-question-7",
                          question: "Cocokkan teknik dengan karakteristiknya:",
                          leftItems: [
                            { id: "l1", text: "Mean Imputation" },
                            { id: "l2", text: "Median Imputation" },
                            { id: "l3", text: "Deletion" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Sensitif terhadap outlier" },
                            { id: "r2", text: "Lebih robust terhadap outlier" },
                            { id: "r3", text: "Mengurangi jumlah data" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    id: "block-55",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-55",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Kesimpulan dan Pertimbangan Strategis",
                      },
                      {
                        id: "paragraph-72",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Pemilihan antara deletion dan imputation bukan sekadar keputusan teknis, melainkan juga keputusan strategis yang dapat memengaruhi kualitas insight bisnis. Seorang data analyst perlu mempertimbangkan proporsi missing data, jenis variabel, distribusi data, serta dampak terhadap model atau analisis statistik yang akan dilakukan. Dalam banyak kasus, kombinasi kedua teknik juga dapat digunakan, misalnya menghapus kolom dengan missing sangat tinggi dan mengimputasi kolom lain yang masih dapat diselamatkan. Pendekatan yang sistematis dan terdokumentasi dengan baik akan membantu menjaga integritas analisis serta meningkatkan kepercayaan terhadap hasil yang diperoleh.",
                      },
                      {
                        id: "summary-11",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Deletion menghapus data dengan nilai kosong",
                          "Imputation mengisi nilai kosong dengan estimasi",
                          "Median lebih aman untuk data dengan outlier",
                          "Keputusan harus mempertimbangkan konteks bisnis",
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 9,
            title: "Data Formatting",
            estimatedMinutes: 20,
            completed: false, // Progress akan bervariasi
            subModules: [
              {
                id: 17,
                title: "Standardisasi Format Data",
                progress: 80,
                blocks: [
                  {
                    id: "block-56",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-56",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Mengapa Standardisasi Format Itu Penting?",
                      },
                      {
                        id: "paragraph-73",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Standardisasi format data adalah proses menyelaraskan struktur dan representasi data agar konsisten di seluruh dataset. Dalam praktik nyata, data sering dikumpulkan dari berbagai sumber seperti sistem internal, file Excel manual, API eksternal, hingga input pengguna. Masing-masing sumber dapat memiliki format berbeda untuk tipe data yang sama. Ketidakkonsistenan ini dapat menyebabkan error saat proses analisis, agregasi, maupun modeling. Misalnya, nilai angka yang tersimpan sebagai string tidak akan dapat dihitung secara langsung, atau format tanggal yang berbeda dapat menghasilkan interpretasi waktu yang salah. Oleh karena itu, standardisasi format merupakan langkah fundamental dalam memastikan kualitas data sebelum masuk ke tahap analisis lanjutan.",
                      },
                      {
                        id: "highlight-14",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Data yang konsisten lebih mudah dianalisis dan divalidasi.",
                      },
                    ],
                  },
                  {
                    id: "block-57",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-57",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Standardisasi Format Tanggal dan Waktu",
                      },
                      {
                        id: "paragraph-74",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Salah satu permasalahan paling umum dalam data formatting adalah inkonsistensi format tanggal dan waktu. Sebagai contoh, sebagian sistem mungkin menggunakan format DD-MM-YYYY, sementara sistem lain menggunakan MM/DD/YYYY atau ISO format YYYY-MM-DD. Jika tidak dikonversi ke format yang seragam, analisis time-series dapat menghasilkan perhitungan yang salah, terutama dalam pengurutan kronologis atau perhitungan selisih waktu. Oleh karena itu, praktik terbaik adalah mengonversi seluruh kolom tanggal ke tipe datetime standar menggunakan library seperti Pandas. Selain itu, penting juga memastikan zona waktu (timezone) telah ditangani dengan benar agar tidak terjadi pergeseran waktu yang tidak diinginkan.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-15",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-15",
                          language: "python",
                          initialCode:
                            "import pandas as pd\n\n# Konversi kolom ke datetime standar\n df['transaction_date'] = pd.to_datetime(df['transaction_date'], errors='coerce')\n\n# Cek tipe data\nprint(df.dtypes)",
                            expectedResult: "transaction_date    datetime64[ns]\nprice                         float64\ndtype: object"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-58",
                    orderNumber: 3,
                    progress: 40,
                    contents: [
                      {
                        id: "heading-58",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Standardisasi Teks dan Kategori",
                      },
                      {
                        id: "paragraph-75",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Selain format tanggal, standarisasi teks juga menjadi aspek penting dalam data cleaning. Perbedaan huruf besar dan kecil, spasi berlebih, atau karakter tersembunyi dapat menyebabkan duplikasi kategori yang seharusnya sama. Sebagai contoh, nilai 'Jakarta', 'jakarta', dan ' JAKARTA ' dapat dianggap sebagai tiga entitas berbeda jika tidak dibersihkan terlebih dahulu. Praktik umum meliputi mengubah seluruh teks menjadi lowercase, menghapus spasi di awal dan akhir string, serta mengganti karakter khusus yang tidak diperlukan. Untuk data kategorikal, proses encoding juga dapat dilakukan setelah standardisasi untuk memastikan konsistensi saat masuk ke model machine learning.",
                      },
                      {
                        id: "carousel-1",
                        type: "carousel",
                        orderNumber: 3,
                        title: "Contoh Inkonsistensi Teks",
                        description:
                          "Inkonsistensi dalam data teks adalah masalah klasik yang dapat mengacaukan hasil analisis statistik dan performa model machine learning. Berikut adalah beberapa variasi penulisan yang sering ditemukan dalam dataset mentah yang wajib dibersihkan agar data menjadi seragam dan akurat.",
                        cardsPerSlide: 2,
                        items: [
                          {
                            title: "Perbedaan Kapitalisasi",
                            content:
                              "Penggunaan huruf besar dan kecil yang tidak seragam (misalnya: 'Jakarta', 'jakarta', dan 'JAKARTA') akan membuat komputer menganggap ketiganya sebagai entitas yang berbeda. Hal ini menyebabkan perhitungan frekuensi atau agregasi data menjadi tidak akurat.",
                          },
                          {
                            title: "Spasi Berlebih (Whitespace)",
                            content:
                              "Karakter spasi tambahan di awal, di tengah, atau di akhir teks (seperti ' Bandung ' vs 'Bandung') seringkali tidak terlihat secara kasat mata. Namun, spasi tersembunyi ini dapat menyebabkan kegagalan fatal saat proses pencocokan data atau penggabungan antar tabel (joining).",
                          },
                          {
                            title: "Singkatan Tidak Konsisten",
                            content:
                              "Variasi dalam penulisan nama organisasi, gelar, atau alamat (contoh: 'PT. ABC', 'PT ABC', atau 'Perseroan Terbatas ABC') menciptakan duplikasi data yang signifikan. Tanpa standarisasi, sistem tidak akan mengenali bahwa ketiga entitas tersebut sebenarnya adalah subjek yang sama.",
                          },
                          {
                            title: "Kesalahan Ejaan (Typo)",
                            content:
                              "Kesalahan ketik kecil pada kata kunci penting (seperti 'Indoensia' vs 'Indonesia') dapat menghilangkan baris data berharga dari hasil filter. Pembersihan data teks memerlukan teknik normalisasi untuk menangani kesalahan input manusia seperti ini secara otomatis.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-14",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-14",
                          question:
                            "Mengapa perlu mengubah teks menjadi lowercase?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Agar data terlihat lebih kecil",
                            },
                            {
                              id: "opt-2",
                              text: "Untuk mencegah duplikasi kategori karena kapitalisasi",
                            },
                            { id: "opt-3", text: "Agar file lebih ringan" },
                            {
                              id: "opt-4",
                              text: "Untuk mempercepat komputasi CPU",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Lowercase membantu mencegah perbedaan entitas karena kapitalisasi.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-59",
                    orderNumber: 4,
                    progress: 20,
                    contents: [
                      {
                        id: "heading-59",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Standardisasi Tipe Data Numerik",
                      },
                      {
                        id: "paragraph-76",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Sering kali data numerik tersimpan dalam bentuk string akibat proses input atau ekspor dari sistem tertentu. Contohnya, nilai '1.000' bisa berarti seribu atau satu tergantung pada sistem penulisan desimal yang digunakan. Standardisasi tipe data numerik mencakup penghapusan simbol seperti koma pemisah ribuan, simbol mata uang, atau karakter non-numerik lainnya sebelum dikonversi menjadi tipe numerik yang sesuai. Kesalahan dalam proses ini dapat menyebabkan agregasi yang tidak akurat atau error dalam perhitungan statistik. Oleh karena itu, validasi setelah konversi tipe data menjadi langkah penting untuk memastikan integritas data tetap terjaga.",
                      },
                      {
                        id: "summary-12",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Standardisasi memastikan konsistensi format data",
                          "Format tanggal harus diseragamkan",
                          "Teks perlu dibersihkan dari kapitalisasi dan spasi",
                          "Tipe numerik harus divalidasi setelah konversi",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-8",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-8",
                          question:
                            "Cocokkan jenis data dengan proses standarisasinya:",
                          leftItems: [
                            { id: "l1", text: "Tanggal" },
                            { id: "l2", text: "Teks" },
                            { id: "l3", text: "Numerik" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Konversi ke datetime" },
                            { id: "r2", text: "Lowercase dan trim spasi" },
                            { id: "r3", text: "Hapus simbol non-angka" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                      {
                        id: "image-16",
                        type: "image_video",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "media-16",
                          url: "https://images.unsplash.com/photo-1508385082359-f48b45d34c2a?w=400",
                          caption:
                            "Contoh transformasi dan pembersihan format data",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 18,
                title: "Unit Conversion & Scaling",
                progress: 20,
                blocks: [
                  {
                    id: "block-60",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-60",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Pentingnya Unit Conversion dalam Dataset",
                      },
                      {
                        id: "paragraph-77",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam praktik data analytics, sering kali data dikumpulkan dari berbagai sumber dengan satuan yang berbeda-beda. Misalnya, berat produk bisa tercatat dalam kilogram pada satu sistem, sementara sistem lain menggunakan pound. Hal serupa juga terjadi pada tinggi badan (cm vs inch), jarak (km vs mile), hingga mata uang (Rupiah vs Dollar). Jika data dengan satuan berbeda ini digabungkan tanpa konversi terlebih dahulu, hasil analisis akan menjadi tidak valid dan menyesatkan. Oleh karena itu, unit conversion menjadi langkah krusial untuk memastikan seluruh data berada dalam satu standar pengukuran yang konsisten sebelum dilakukan agregasi, visualisasi, maupun modeling.",
                      },
                      {
                        id: "highlight-15",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Satuan yang berbeda dapat menghasilkan insight yang salah jika tidak dikonversi.",
                      },
                      {
                        id: "accordion-13",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Contoh Kasus Unit Conversion",
                        description: "Beberapa skenario umum dalam data nyata",
                        items: [
                          {
                            title: "Berat Produk",
                            content:
                              "Mengonversi pound ke kilogram sebelum menghitung total berat.",
                          },
                          {
                            title: "Mata Uang",
                            content:
                              "Menyamakan seluruh transaksi ke satu mata uang sebelum laporan.",
                          },
                          {
                            title: "Jarak Tempuh",
                            content:
                              "Mengubah mile menjadi kilometer untuk konsistensi analisis.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-17",
                        type: "image_video",
                        orderNumber: 1,
                        position: "before",
                        content: {
                          id: "media-17",
                          url: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400",
                          caption:
                            "Ilustrasi pengukuran dan satuan yang berbeda",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-61",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-61",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Konsep Data Scaling dalam Machine Learning",
                      },
                      {
                        id: "paragraph-78",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Data scaling adalah proses menyesuaikan rentang nilai fitur dalam dataset agar berada pada skala yang sebanding. Dalam machine learning, beberapa algoritma seperti K-Nearest Neighbors, K-Means Clustering, dan Logistic Regression sangat sensitif terhadap skala fitur. Misalnya, jika fitur gaji memiliki rentang jutaan sementara fitur umur hanya puluhan, maka model dapat lebih 'memperhatikan' fitur gaji karena nilai numeriknya jauh lebih besar. Teknik seperti Min-Max Scaling mengubah nilai ke rentang 0 hingga 1, sedangkan Standardization mengubah distribusi menjadi memiliki mean 0 dan standar deviasi 1. Proses ini membantu model belajar lebih stabil dan konvergen lebih cepat.",
                      },
                      {
                        id: "carousel-2",
                        type: "carousel",
                        orderNumber: 3,
                        title: "Teknik Scaling Populer",
                        description:
                          "Metode yang sering digunakan dalam preprocessing",
                        cardsPerSlide: 2,
                        items: [
                          {
                            title: "Min-Max Scaling",
                            content:
                              "Mengubah nilai ke rentang 0–1 berdasarkan nilai minimum dan maksimum.",
                          },
                          {
                            title: "Standardization",
                            content:
                              "Menggunakan mean dan standar deviasi untuk normalisasi distribusi.",
                          },
                          {
                            title: "Robust Scaling",
                            content:
                              "Menggunakan median dan IQR, cocok untuk data dengan outlier.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-16",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-16",
                          language: "python",
                          initialCode:
                            "# Contoh Min-Max Scaling sederhana\nimport pandas as pd\n\n# Asumsi df sudah ada\n df['scaled_price'] = (df['price'] - df['price'].min()) / (df['price'].max() - df['price'].min())\n\nprint(df[['price','scaled_price']].head())",
                            expectedResult: "   price  scaled_price\n0    100           0.0\n1    500           0.5\n2    900           1.0"
                        },
                      },
                      {
                        id: "mcq-15",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-15",
                          question:
                            "Mengapa scaling penting dalam machine learning?",
                          options: [
                            { id: "opt-1", text: "Agar warna dataset berubah" },
                            {
                              id: "opt-2",
                              text: "Agar semua fitur memiliki skala yang sebanding",
                            },
                            {
                              id: "opt-3",
                              text: "Agar ukuran file menjadi kecil",
                            },
                            {
                              id: "opt-4",
                              text: "Agar database lebih cepat diakses",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Scaling memastikan fitur dengan rentang besar tidak mendominasi model.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-62",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-62",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Validasi Tipe Data dan Integritas Akhir",
                      },
                      {
                        id: "paragraph-79",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah unit conversion dan scaling dilakukan, langkah terakhir yang tidak kalah penting adalah memastikan tipe data sudah sesuai dengan kebutuhan analisis. Nilai numerik harus benar-benar bertipe integer atau float, bukan string. Kolom kategori sebaiknya dikonversi menjadi tipe category untuk efisiensi memori dan performa. Selain itu, penting juga untuk melakukan validasi akhir seperti pengecekan missing values, nilai negatif yang tidak logis, atau duplikasi data yang mungkin muncul setelah proses transformasi. Tahapan ini memastikan bahwa dataset benar-benar siap digunakan dalam proses analitik maupun pembangunan model machine learning.",
                      },
                      {
                        id: "summary-13",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Unit conversion menyamakan satuan pengukuran",
                          "Scaling membantu model machine learning bekerja optimal",
                          "Validasi tipe data memastikan kesiapan dataset",
                          "Tahap akhir adalah pengecekan integritas data",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-9",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-9",
                          question: "Cocokkan konsep dengan tujuannya:",
                          leftItems: [
                            { id: "l1", text: "Unit Conversion" },
                            { id: "l2", text: "Scaling" },
                            { id: "l3", text: "Validasi Tipe Data" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Menyamakan satuan pengukuran" },
                            {
                              id: "r2",
                              text: "Menyesuaikan rentang nilai fitur",
                            },
                            {
                              id: "r3",
                              text: "Memastikan format data sesuai kebutuhan",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 10,
            title: "Outlier Detection",
            estimatedMinutes: 25,
            completed: false, // Progress bervariasi
            subModules: [
              {
                id: 19,
                title: "Memahami Konsep Outlier",
                progress: 50,
                blocks: [
                  {
                    id: "block-63",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-63",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Apa Itu Outlier dalam Analisis Data?",
                      },
                      {
                        id: "paragraph-80",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Outlier atau pencilan adalah titik data yang secara signifikan berbeda dari mayoritas data lainnya dalam suatu distribusi. Dalam praktik analisis data, outlier dapat muncul karena berbagai alasan, seperti kesalahan input, kesalahan pengukuran, gangguan sistem, maupun kejadian ekstrem yang memang benar-benar terjadi secara alami. Sebagai contoh, dalam dataset gaji karyawan, mayoritas nilai mungkin berada pada rentang 5–20 juta rupiah per bulan, tetapi terdapat satu nilai sebesar 500 juta. Nilai tersebut bisa menjadi outlier yang perlu diperiksa lebih lanjut apakah merupakan kesalahan pencatatan atau memang merupakan eksekutif dengan kompensasi khusus.",
                      },
                      {
                        id: "highlight-16",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Outlier dapat mengubah hasil analisis secara signifikan jika tidak ditangani.",
                      },
                      {
                        id: "content-card-1",
                        type: "content_card",
                        orderNumber: 4,
                        title: "Sumber Kemunculan Outlier",
                        description: "Beberapa penyebab umum data pencilan",
                        disableExpandableContent: false,
                        items: [
                          {
                            title: "Kesalahan Input",
                            content: "Human error saat memasukkan data.",
                            expandableContent:
                              "Misalnya salah ketik 100000 menjadi 1000000.",
                          },
                          {
                            title: "Variasi Alami",
                            content: "Fenomena ekstrem yang memang terjadi.",
                            expandableContent:
                              "Contohnya transaksi sangat besar saat promo besar-besaran.",
                          },
                          {
                            title: "Gangguan Sistem",
                            content: "Bug atau error dalam sistem pencatatan.",
                            expandableContent:
                              "Duplikasi transaksi akibat retry otomatis.",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: "block-64",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-64",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Dampak Outlier terhadap Statistik",
                      },
                      {
                        id: "paragraph-81",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Outlier memiliki pengaruh besar terhadap ukuran statistik tertentu, terutama mean dan standar deviasi. Karena mean menghitung rata-rata dari seluruh nilai, satu nilai ekstrem dapat menarik rata-rata menjadi tidak representatif terhadap mayoritas data. Sebaliknya, median biasanya lebih tahan terhadap outlier karena hanya bergantung pada posisi nilai dalam urutan. Dalam analisis regresi, outlier juga dapat memengaruhi kemiringan garis regresi sehingga model menjadi bias. Oleh karena itu, penting untuk mengidentifikasi dan mengevaluasi outlier sebelum mengambil keputusan berbasis data.",
                      },
                      {
                        id: "accordion-14",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Ukuran Statistik & Sensitivitas",
                        items: [
                          {
                            title: "Mean",
                            content: "Sangat sensitif terhadap nilai ekstrem.",
                          },
                          {
                            title: "Median",
                            content: "Lebih robust terhadap outlier.",
                          },
                          {
                            title: "Standar Deviasi",
                            content:
                              "Meningkat drastis jika ada nilai ekstrem.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-18",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-18",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption: "Visualisasi distribusi data dengan outlier",
                        },
                      },
                      {
                        id: "mcq-16",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-16",
                          question:
                            "Ukuran statistik mana yang paling sensitif terhadap outlier?",
                          options: [
                            { id: "opt-1", text: "Median" },
                            { id: "opt-2", text: "Mean" },
                            { id: "opt-3", text: "Modus" },
                            { id: "opt-4", text: "Persentil" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Mean menghitung rata-rata seluruh nilai sehingga sangat terpengaruh nilai ekstrem.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-65",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-65",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Jenis Outlier dan Teknik Deteksi",
                      },
                      {
                        id: "paragraph-82",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Secara umum, outlier dapat dibagi menjadi dua kategori utama: univariate dan multivariate. Outlier univariate terjadi ketika satu variabel memiliki nilai ekstrem dibandingkan distribusinya sendiri, misalnya usia 150 tahun dalam dataset populasi. Sementara itu, outlier multivariate muncul ketika kombinasi beberapa variabel menghasilkan pola yang tidak lazim, meskipun masing-masing variabel terlihat normal secara terpisah. Untuk mendeteksi outlier, analis dapat menggunakan metode visual seperti boxplot dan scatter plot, maupun metode statistik seperti Z-score dan Interquartile Range (IQR). Dalam konteks machine learning, algoritma seperti Isolation Forest juga sering digunakan untuk mendeteksi anomali dalam dataset besar.",
                      },
                      {
                        id: "tab-1",
                        type: "tab_navigation",
                        orderNumber: 3,
                        title: "Metode Deteksi Outlier secara Mendalam",
                        description:
                          "Deteksi outlier adalah langkah krusial dalam pra-pemrosesan data untuk memastikan model tidak terdistorsi oleh nilai ekstrem. Berikut adalah perbandingan teknis antara metode statistik tradisional dan pendekatan machine learning modern.",
                        tabs: [
                          {
                            title: "Z-Score (Standard Score)",
                            content:
                              "Z-Score, atau skor standar, adalah teknik statistik yang memvalidasi posisi relatif suatu titik data terhadap rata-rata kelompoknya dalam satuan standar deviasi. Metode ini sangat bergantung pada asumsi distribusi normal (Gaussian), di mana rumus utamanya adalah $z = \\frac{x - \\mu}{\\sigma}$. Dengan mentransformasikan data ke dalam distribusi standar, kita dapat melihat seberapa jauh penyimpangan suatu nilai dari pusat data secara seragam, yang sangat memudahkan proses perbandingan antar variabel yang memiliki skala atau satuan yang berbeda.\n\nDalam praktik industri, ambang batas (threshold) yang paling umum digunakan untuk mengidentifikasi outlier adalah nilai Z yang berada di luar rentang -3 hingga 3, yang secara teoretis mencakup sekitar 99.7% populasi data menurut aturan empiris 68-95-99.7. Meskipun sangat efisien untuk dataset berskala besar karena beban komputasinya yang ringan, Z-Score memiliki kelemahan fatal yakni kurangnya ketangguhan (robustness) terhadap nilai ekstrem itu sendiri. Keberadaan outlier yang sangat besar dapat menarik nilai rata-rata (mean) secara signifikan dan memperbesar standar deviasi, sehingga berpotensi menyebabkan kegagalan dalam mendeteksi outlier lainnya atau yang sering disebut sebagai efek masking.",
                          },
                          {
                            title: "IQR (Interquartile Range)",
                            content:
                              "Interquartile Range (IQR) merupakan metode deteksi outlier berbasis statistik deskriptif yang memfokuskan analisis pada penyebaran 50% data bagian tengah. Metode ini melibatkan perhitungan Kuartil 1 (persentil ke-25) dan Kuartil 3 (persentil ke-75), di mana selisih antara keduanya didefinisikan sebagai $IQR = Q3 - Q1$. Penggunaan IQR sangat populer dalam analisis eksplorasi data karena mampu memberikan gambaran objektif mengenai variabilitas data tanpa harus terikat pada asumsi distribusi tertentu, menjadikannya pilihan utama untuk dataset yang memiliki kemiringan (skewness) tinggi atau tidak mengikuti kurva normal.\n\nUntuk mengklasifikasikan pencilan, metode ini menerapkan sistem 'pagar' statistik dengan rumus Batas Bawah = $Q1 - 1.5 \\times IQR$ dan Batas Atas = $Q3 + 1.5 \\times IQR$, di mana setiap titik data yang berada di luar rentang tersebut akan dianggap sebagai outlier. Keunggulan utama IQR dibandingkan Z-Score terletak pada sifatnya yang sangat tangguh (robust), karena nilai kuartil didasarkan pada peringkat data dan bukan nilai rata-rata, sehingga tidak mudah bergeser oleh keberadaan nilai ekstrem. Metode ini sering dipadukan dengan visualisasi Boxplot untuk memudahkan analis dalam melihat sebaran data serta mengidentifikasi potensi anomali secara cepat dan akurat di berbagai skenario riset.",
                          },
                          {
                            title: "Isolation Forest",
                            content:
                              "Isolation Forest adalah algoritma berbasis Machine Learning yang mengadopsi pendekatan unik dengan cara 'mengisolasi' anomali alih-alih mencoba memodelkan titik data normal. Berbeda dengan metode berbasis jarak (distance-based) atau kepadatan (density-based) yang menghabiskan banyak memori, algoritma ini bekerja secara 'unsupervised' dengan membangun struktur ensemble dari pohon keputusan acak (random trees). Filosofi dasarnya adalah bahwa outlier cenderung memiliki nilai fitur yang sangat berbeda dan jumlahnya sedikit, sehingga dalam proses partisi fitur secara acak, outlier akan terisolasi pada cabang pohon yang jauh lebih dangkal dibandingkan titik data reguler yang memerlukan lebih banyak pembagian.\n\nSecara teknis, tingkat anomali suatu data ditentukan berdasarkan rata-rata kedalaman jalur (path length) pada seluruh pohon di dalam hutan; semakin pendek jalurnya, semakin tinggi skor anomali titik tersebut. Algoritma ini sangat unggul dalam menangani dataset berdimensi tinggi (high-dimensional data) di mana metode statistik konvensional seringkali kehilangan efektivitasnya akibat fenomena 'curse of dimensionality'. Karena tidak memerlukan perhitungan jarak yang mahal secara komputasi, Isolation Forest menawarkan efisiensi luar biasa untuk data skala besar dan mampu mendeteksi pola anomali kompleks yang bersifat non-linear yang biasanya terlewatkan oleh pendekatan statistik standar.",
                          },
                        ],
                      },
                      {
                        id: "summary-14",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Outlier adalah nilai yang berbeda signifikan dari mayoritas data",
                          "Mean sangat sensitif terhadap outlier",
                          "Terdapat outlier univariate dan multivariate",
                          "Deteksi dapat dilakukan dengan metode statistik maupun ML",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-17",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-17",
                          language: "python",
                          initialCode:
                            "# Contoh deteksi outlier dengan Z-Score\nimport numpy as np\n\nmean = np.mean(df['value'])\nstd = np.std(df['value'])\n\nz_scores = (df['value'] - mean) / std\noutliers = df[np.abs(z_scores) > 3]\n\nprint(outliers)",
                            expectedResult: "    value\n88    999"
                        },
                      },
                      {
                        id: "matching-10",
                        type: "matching",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "matching-question-10",
                          question:
                            "Cocokkan jenis outlier dengan penjelasannya:",
                          leftItems: [
                            { id: "l1", text: "Univariate Outlier" },
                            { id: "l2", text: "Multivariate Outlier" },
                          ],
                          rightItems: [
                            {
                              id: "r1",
                              text: "Nilai ekstrem pada satu variabel",
                            },
                            {
                              id: "r2",
                              text: "Kombinasi nilai aneh pada beberapa variabel",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 20,
                title: "Teknik Deteksi Statistik",
                progress: 0,
                blocks: [
                  {
                    id: "block-66",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-66",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Deteksi Outlier dengan Interquartile Range (IQR)",
                      },
                      {
                        id: "paragraph-83",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Salah satu metode statistik paling umum untuk mendeteksi outlier adalah Interquartile Range (IQR). IQR mengukur rentang antara kuartil pertama (Q1) dan kuartil ketiga (Q3), yang merepresentasikan 50% data di tengah distribusi. Dengan menghitung selisih Q3 - Q1, kita mendapatkan ukuran sebaran data yang relatif robust terhadap nilai ekstrem. Data dianggap sebagai outlier jika berada di bawah Q1 - 1.5 × IQR atau di atas Q3 + 1.5 × IQR. Pendekatan ini sangat populer karena tidak bergantung pada asumsi distribusi normal dan cukup efektif untuk berbagai jenis dataset, terutama dalam analisis eksploratif awal.",
                      },
                      {
                        id: "highlight-17",
                        type: "highlight",
                        orderNumber: 3,
                        text: "IQR adalah metode robust karena tidak sensitif terhadap nilai ekstrem.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-18",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-18",
                          language: "python",
                          initialCode:
                            "# Deteksi outlier menggunakan IQR\nQ1 = df['value'].quantile(0.25)\nQ3 = df['value'].quantile(0.75)\nIQR = Q3 - Q1\n\nlower_bound = Q1 - 1.5 * IQR\nupper_bound = Q3 + 1.5 * IQR\n\noutliers = df[(df['value'] < lower_bound) | (df['value'] > upper_bound)]\nprint(outliers)",
                            expectedResult: "    value\n42  150.0\n89   -5.0"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-67",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-67",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Pendekatan Z-Score untuk Distribusi Normal",
                      },
                      {
                        id: "paragraph-84",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Metode Z-Score digunakan ketika data diasumsikan mengikuti distribusi normal. Z-Score menghitung jarak suatu nilai terhadap rata-rata dalam satuan standar deviasi. Secara umum, nilai dengan |Z| > 3 sering dikategorikan sebagai outlier karena sangat jarang terjadi dalam distribusi normal. Namun, pendekatan ini sensitif terhadap keberadaan outlier itu sendiri karena mean dan standar deviasi dapat terdistorsi oleh nilai ekstrem. Oleh karena itu, penting untuk memahami karakteristik distribusi data sebelum memilih metode ini.",
                      },
                      {
                        id: "accordion-15",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Kapan Menggunakan Z-Score?",
                        items: [
                          {
                            title: "Distribusi Normal",
                            content:
                              "Cocok jika data mendekati distribusi Gaussian.",
                          },
                          {
                            title: "Dataset Besar",
                            content:
                              "Lebih stabil jika jumlah data cukup banyak.",
                          },
                          {
                            title: "Analisis Parametrik",
                            content:
                              "Digunakan dalam metode berbasis asumsi statistik klasik.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-17",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-17",
                          question:
                            "Nilai Z-Score biasanya dianggap outlier jika:",
                          options: [
                            { id: "opt-1", text: "|Z| > 1" },
                            { id: "opt-2", text: "|Z| > 2" },
                            { id: "opt-3", text: "|Z| > 3" },
                            { id: "opt-4", text: "|Z| = 0" },
                          ],
                          correctAnswers: ["opt-3"],
                          explanation:
                            "Dalam praktik umum, |Z| > 3 dianggap sangat jarang dan berpotensi sebagai outlier.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-68",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-68",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Visualisasi Statistik untuk Deteksi Cepat",
                      },
                      {
                        id: "paragraph-85",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Sebelum melakukan perhitungan matematis yang kompleks, visualisasi sering kali menjadi langkah awal yang sangat efektif dalam mendeteksi outlier. Boxplot memungkinkan kita melihat batas kuartil serta titik-titik yang berada di luar whisker. Scatter plot juga membantu mengidentifikasi pola tidak biasa, terutama dalam kasus multivariate. Visualisasi tidak hanya membantu dalam mendeteksi anomali, tetapi juga memberikan konteks terhadap distribusi data secara keseluruhan sehingga keputusan penanganan outlier menjadi lebih terinformasi.",
                      },
                      {
                        id: "carousel-1",
                        type: "carousel",
                        orderNumber: 3,
                        title: "Alat Visual untuk Outlier",
                        cardsPerSlide: 2,
                        items: [
                          {
                            title: "Box Plot",
                            content:
                              "Menampilkan kuartil dan titik ekstrem secara visual.",
                          },
                          {
                            title: "Scatter Plot",
                            content:
                              "Membantu melihat anomali dalam dua variabel.",
                          },
                          {
                            title: "Histogram",
                            content: "Menunjukkan distribusi dan ekor panjang.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-19",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-19",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Contoh visualisasi boxplot untuk mendeteksi outlier",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-69",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-69",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Strategi Penanganan Outlier",
                      },
                      {
                        id: "paragraph-86",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah outlier teridentifikasi, analis harus menentukan strategi penanganan yang tepat. Opsi yang tersedia meliputi menghapus data jika terbukti merupakan kesalahan pencatatan, melakukan transformasi seperti winsorizing untuk membatasi nilai ekstrem, atau mempertahankan outlier jika memang merepresentasikan kejadian penting seperti lonjakan transaksi akibat promosi besar. Keputusan ini harus mempertimbangkan konteks bisnis dan tujuan analisis agar tidak menghilangkan informasi berharga.",
                      },
                      {
                        id: "tab-2",
                        type: "tab_navigation",
                        orderNumber: 3,
                        title: "Pilihan Penanganan",
                        tabs: [
                          {
                            title: "Remove",
                            content: "Hapus jika jelas merupakan error data.",
                          },
                          {
                            title: "Transform",
                            content: "Gunakan winsorizing atau log transform.",
                          },
                          {
                            title: "Keep",
                            content: "Pertahankan jika bernilai informatif.",
                          },
                        ],
                      },
                      {
                        id: "summary-15",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "IQR tidak bergantung pada distribusi normal",
                          "Z-Score cocok untuk data Gaussian",
                          "Visualisasi membantu deteksi awal",
                          "Penanganan outlier harus kontekstual",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-19",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-19",
                          language: "python",
                          initialCode:
                            "# Contoh winsorizing sederhana\nfrom scipy.stats.mstats import winsorize\n\ndf['value'] = winsorize(df['value'], limits=[0.05, 0.05])\nprint(df['value'].describe())",
                            expectedResult: "count    100.000000\nmean      50.230000\nstd       12.450000\nmin       10.000000\nmax       90.000000\ndtype: float64"
                        },
                      },
                      {
                        id: "matching-11",
                        type: "matching",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "matching-question-11",
                          question: "Cocokkan metode dengan karakteristiknya:",
                          leftItems: [
                            { id: "l1", text: "IQR" },
                            { id: "l2", text: "Z-Score" },
                            { id: "l3", text: "Winsorizing" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Berbasis kuartil" },
                            { id: "r2", text: "Berbasis standar deviasi" },
                            { id: "r3", text: "Membatasi nilai ekstrem" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 11,
            title: "Mini Project: Clean Dataset",
            estimatedMinutes: 40,
            completed: false,
            subModules: [
              {
                id: 21,
                title: "Mini Project: Clean Dataset",
                progress: 0,
                blocks: [
                  {
                    id: "block-70",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-70",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Persiapan dan Pemahaman Dataset Proyek",
                      },
                      {
                        id: "paragraph-87",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Pada mini project ini, Anda akan bekerja dengan dataset penjualan ritel yang masih dalam kondisi mentah (raw data). Dataset tersebut mengandung berbagai permasalahan umum seperti missing values, duplikasi baris, inkonsistensi format tanggal, perbedaan penulisan kategori produk, hingga nilai numerik yang tersimpan dalam format string. Sebelum melakukan pembersihan, penting untuk memahami konteks bisnis dari dataset tersebut, seperti periode waktu transaksi, jenis produk yang dijual, serta tujuan analisis akhir yang ingin dicapai. Dengan memahami konteks ini, proses cleaning tidak hanya menjadi teknis, tetapi juga strategis dan relevan dengan kebutuhan analisis.",
                      },
                      {
                        id: "highlight-18",
                        type: "highlight",
                        orderNumber: 3,
                        text: "Data cleaning yang baik selalu dimulai dari pemahaman konteks bisnis.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-20",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-20",
                          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
                          caption:
                            "Ilustrasi proses eksplorasi dan pembersihan data proyek",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-71",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-71",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Eksplorasi Awal dan Identifikasi Masalah Data",
                      },
                      {
                        id: "paragraph-88",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Langkah berikutnya adalah melakukan eksplorasi awal menggunakan fungsi-fungsi dasar seperti melihat lima baris pertama dataset, mengecek tipe data setiap kolom, serta menghitung jumlah nilai kosong pada masing-masing variabel. Dari tahap ini, Anda dapat mulai mengidentifikasi masalah utama seperti kolom dengan persentase missing value tinggi, anomali nilai numerik, atau inkonsistensi kategori. Eksplorasi awal ini menjadi fondasi penting untuk menentukan strategi cleaning yang tepat, apakah perlu imputasi, penghapusan data, atau transformasi tipe data.",
                      },
                      {
                        id: "accordion-16",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Checklist Eksplorasi Awal",
                        items: [
                          {
                            title: "Cek Missing Value",
                            content:
                              "Hitung jumlah dan persentase nilai kosong.",
                          },
                          {
                            title: "Periksa Tipe Data",
                            content:
                              "Pastikan numerik, tanggal, dan kategori sesuai.",
                          },
                          {
                            title: "Deteksi Duplikasi",
                            content: "Cari baris dengan data identik.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-20",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-20",
                          language: "python",
                          initialCode:
                            "# Eksplorasi awal dataset proyek\nimport pandas as pd\n\ndf_project = pd.read_csv('dirty_retail_data.csv')\n\nprint(df_project.head())\nprint(df_project.info())\nprint(df_project.isnull().sum())",
                            expectedResult: "   ID  Customer_Age Transaction_Date\n0   1          25.0       2026/01/15\n\nRangeIndex: 100 entries, 0 to 99\nData columns (total 3 columns):\nCustomer_Age    95 non-null float64\n...\n\nCustomer_Age        5\nTransaction_Date    0\ndtype: int64"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-72",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-72",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Strategi Pembersihan dan Transformasi Data",
                      },
                      {
                        id: "paragraph-89",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah masalah data teridentifikasi, Anda perlu menyusun strategi pembersihan secara sistematis. Missing value dapat ditangani dengan berbagai pendekatan seperti imputasi mean/median untuk data numerik atau modus untuk data kategorikal. Duplikasi dapat dihapus dengan mempertahankan satu entri unik. Format tanggal yang tidak konsisten dapat dinormalisasi menggunakan parsing standar. Selain itu, kolom kategorikal yang memiliki variasi penulisan seperti 'Elektronik', 'elektronik', atau 'ELEKTRONIK' perlu diseragamkan agar analisis agregasi tidak menghasilkan kategori ganda yang sebenarnya sama.",
                      },
                      {
                        id: "tab-3",
                        type: "tab_navigation",
                        orderNumber: 3,
                        title: "Teknik Cleaning Utama",
                        tabs: [
                          {
                            title: "Imputasi",
                            content:
                              "Mengisi nilai kosong dengan pendekatan statistik.",
                          },
                          {
                            title: "Normalisasi",
                            content: "Menyamakan format dan standar penulisan.",
                          },
                          {
                            title: "Filtering",
                            content:
                              "Menghapus data tidak valid atau duplikat.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-18",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-18",
                          question:
                            "Langkah pertama dalam data cleaning proyek adalah:",
                          options: [
                            {
                              id: "opt-1",
                              text: "Langsung menghapus semua missing value",
                            },
                            {
                              id: "opt-2",
                              text: "Melakukan eksplorasi dan identifikasi masalah data",
                            },
                            {
                              id: "opt-3",
                              text: "Membangun model machine learning",
                            },
                            {
                              id: "opt-4",
                              text: "Membuat dashboard visualisasi",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Eksplorasi awal diperlukan untuk memahami masalah sebelum melakukan cleaning.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-73",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-73",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Finalisasi Dataset dan Validasi Hasil Cleaning",
                      },
                      {
                        id: "paragraph-90",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Tahap terakhir dalam mini project ini adalah melakukan validasi terhadap dataset yang telah dibersihkan. Pastikan tidak ada lagi nilai kosong yang tidak terkontrol, tipe data sudah sesuai, serta tidak terdapat duplikasi yang tersisa. Anda juga dapat membandingkan statistik deskriptif sebelum dan sesudah cleaning untuk melihat dampak perubahan yang dilakukan. Dataset yang telah bersih dan konsisten inilah yang disebut sebagai analysis-ready data, yaitu data yang siap digunakan untuk analisis lanjutan seperti pembuatan laporan, dashboard, maupun model prediktif.",
                      },
                      {
                        id: "summary-16",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Pahami konteks bisnis sebelum cleaning",
                          "Lakukan eksplorasi awal secara sistematis",
                          "Terapkan strategi cleaning yang sesuai",
                          "Validasi hasil sebelum analisis lanjutan",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-12",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-12",
                          question: "Cocokkan langkah dengan tujuannya:",
                          leftItems: [
                            { id: "l1", text: "Eksplorasi Data" },
                            { id: "l2", text: "Imputasi" },
                            { id: "l3", text: "Validasi" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Mengidentifikasi masalah awal" },
                            { id: "r2", text: "Mengisi nilai yang hilang" },
                            { id: "r3", text: "Memastikan data siap analisis" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 22,
                title: "Implementasi Pembersihan Data",
                progress: 0,
                blocks: [
                  {
                    id: "block-74",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-74",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Menangani Missing Value pada Customer_Age",
                      },
                      {
                        id: "paragraph-91",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam dataset proyek, kolom Customer_Age memiliki sejumlah nilai kosong yang cukup signifikan. Nilai usia pelanggan merupakan variabel penting untuk analisis segmentasi dan perilaku belanja. Karena distribusi usia biasanya tidak simetris dan cenderung skewed akibat adanya kelompok usia dominan, penggunaan mean bisa menghasilkan bias. Oleh karena itu, pendekatan imputasi median menjadi pilihan yang lebih robust terhadap outlier. Median mampu merepresentasikan titik tengah distribusi tanpa terlalu dipengaruhi nilai ekstrem.",
                      },
                      {
                        id: "paragraph-92",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Sebelum melakukan imputasi, pastikan kolom sudah dalam format numerik. Jika masih bertipe string akibat karakter tersembunyi atau simbol tertentu, lakukan konversi terlebih dahulu. Setelah imputasi dilakukan, verifikasi kembali apakah masih terdapat nilai kosong yang tersisa dan bandingkan statistik deskriptif sebelum serta sesudah proses pengisian untuk memastikan tidak terjadi distorsi signifikan.",
                      },
                      {
                        id: "highlight-19",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Median lebih stabil terhadap outlier dibandingkan mean.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-21",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-21",
                          language: "python",
                          initialCode:
                            "# Mengisi missing value dengan median\nmedian_age = df_project['Customer_Age'].median()\ndf_project['Customer_Age'] = df_project['Customer_Age'].fillna(median_age)\n\n# Verifikasi hasil\nprint(df_project['Customer_Age'].isnull().sum())",
                            expectedResult: "0"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-75",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-75",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Standarisasi Format Transaction_Date",
                      },
                      {
                        id: "paragraph-93",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Kolom Transaction_Date sering kali menjadi sumber inkonsistensi karena perbedaan format input, seperti penggunaan tanda garis miring (/) dan tanda hubung (-). Inkonsistensi ini dapat menyebabkan kegagalan saat parsing ke tipe datetime dan menghambat analisis berbasis waktu seperti tren bulanan atau perhitungan durasi. Untuk itu, diperlukan proses normalisasi format sebelum dikonversi ke datetime.",
                      },
                      {
                        id: "accordion-17",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Langkah Standarisasi Tanggal",
                        items: [
                          {
                            title: "Identifikasi Format",
                            content:
                              "Periksa variasi format tanggal dalam dataset.",
                          },
                          {
                            title: "Replace Karakter",
                            content: "Samakan separator menjadi satu format.",
                          },
                          {
                            title: "Konversi ke Datetime",
                            content: "Gunakan parsing dengan pandas.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-19",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-19",
                          question:
                            "Mengapa format tanggal harus diseragamkan?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Agar ukuran file lebih kecil",
                            },
                            {
                              id: "opt-2",
                              text: "Agar dapat diproses sebagai tipe datetime dengan benar",
                            },
                            { id: "opt-3", text: "Supaya warna tabel berubah" },
                            { id: "opt-4", text: "Tidak perlu diseragamkan" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Format yang konsisten memungkinkan parsing datetime tanpa error.",
                        },
                      },
                      {
                        id: "code-22",
                        type: "interactive_code",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "interactive-22",
                          language: "python",
                          initialCode:
                            "# Standarisasi dan konversi tanggal\ndf_project['Transaction_Date'] = df_project['Transaction_Date'].str.replace('/', '-')\ndf_project['Transaction_Date'] = pd.to_datetime(df_project['Transaction_Date'], errors='coerce')\n\nprint(df_project['Transaction_Date'].head())",
                            expectedResult: "0   2026-01-15\n1   2026-01-16\n2   2026-01-17\nName: Transaction_Date, dtype: datetime64[ns]"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-76",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-76",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Deteksi dan Penanganan Outlier pada Total_Spent",
                      },
                      {
                        id: "paragraph-94",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Outlier pada kolom Total_Spent dapat muncul akibat kesalahan input data, bug sistem, atau transaksi tidak wajar. Misalnya, nilai belanja dalam jumlah triliunan di toko ritel kecil kemungkinan besar merupakan kesalahan. Deteksi outlier dapat dilakukan menggunakan metode statistik seperti IQR (Interquartile Range) atau Z-score. Setelah teridentifikasi, analis harus memutuskan apakah data tersebut akan dihapus, dikoreksi, atau tetap dipertahankan dengan catatan khusus.",
                      },
                      {
                        id: "paragraph-95",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Keputusan terhadap outlier sebaiknya mempertimbangkan konteks bisnis. Dalam beberapa kasus, nilai ekstrem justru mewakili pelanggan VIP dengan pembelian besar. Oleh karena itu, validasi tambahan dengan tim bisnis atau pengecekan log transaksi dapat membantu menghindari penghapusan data yang sebenarnya valid.",
                      },
                      {
                        id: "carousel-4",
                        type: "carousel",
                        orderNumber: 4,
                        title: "Metode Deteksi Outlier",
                        cardsPerSlide: 2,
                        items: [
                          {
                            title: "IQR Method",
                            content:
                              "Menggunakan rentang kuartil untuk mendeteksi nilai ekstrem.",
                          },
                          {
                            title: "Z-Score",
                            content:
                              "Mengukur jarak nilai dari rata-rata dalam satuan standar deviasi.",
                          },
                          {
                            title: "Visualisasi Boxplot",
                            content: "Mendeteksi outlier secara visual.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-21",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-21",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Ilustrasi analisis outlier dalam data penjualan",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-77",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-77",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Menyimpan Dataset Bersih",
                      },
                      {
                        id: "paragraph-96",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah seluruh proses pembersihan selesai, dataset harus disimpan kembali dalam format yang siap digunakan untuk analisis lanjutan. Format CSV umum digunakan karena ringan dan kompatibel dengan berbagai tools analitik. Pastikan parameter seperti index=False digunakan agar indeks tidak ikut tersimpan sebagai kolom tambahan yang tidak diperlukan.",
                      },
                      {
                        id: "summary-17",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Gunakan median untuk imputasi data skewed",
                          "Seragamkan format tanggal sebelum parsing",
                          "Deteksi outlier dengan metode statistik",
                          "Simpan dataset bersih dalam format siap analisis",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-23",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-23",
                          language: "python",
                          initialCode:
                            "# Simpan dataset hasil cleaning\ndf_project.to_csv('cleaned_retail_data.csv', index=False)",
                            expectedResult: ""
                        },
                      },
                      {
                        id: "matching-13",
                        type: "matching",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "matching-question-13",
                          question: "Cocokkan teknik dengan tujuannya:",
                          leftItems: [
                            { id: "l1", text: "Imputasi Median" },
                            { id: "l2", text: "Parsing Datetime" },
                            { id: "l3", text: "IQR" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Mengisi missing value numerik" },
                            { id: "r2", text: "Standarisasi tipe tanggal" },
                            { id: "r3", text: "Deteksi nilai ekstrem" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            // Penambahan Quiz sesuai permintaan (Mencakup seluruh isi modul di SubChapter 3)
            quiz: {
              id: 301,
              title: "Quiz Akhir: Data Cleaning & Preparation",
              description:
                "Evaluasi menyeluruh tentang penanganan missing values, standarisasi format data, hingga deteksi outlier.",
              totalQuestions: 5,
              timeLimitMinutes: 15,

              questions: [
                {
                  id: 3011,
                  orderNumber: 1,
                  textQuestion:
                    "Strategi apa yang TEPAT dalam menangani missing values pada dataset besar?",
                  options: [
                    "Menghapus baris jika proporsi missing sangat kecil",
                    "Imputasi dengan mean untuk data numerik",
                    "Imputasi dengan median jika terdapat outlier",
                    "Mengganti semua missing value dengan 0 tanpa analisis",
                    "Membiarkan missing value karena tidak berpengaruh",
                  ],
                  correctAnswers: [
                    "Menghapus baris jika proporsi missing sangat kecil",
                    "Imputasi dengan mean untuk data numerik",
                    "Imputasi dengan median jika terdapat outlier",
                  ],
                  explanation:
                    "Strategi tergantung konteks. Drop cocok jika jumlah kecil, mean untuk distribusi normal, median untuk data dengan outlier.",
                },

                {
                  id: 3012,
                  orderNumber: 2,
                  textQuestion:
                    "Mengapa standarisasi teks (misalnya lowercase) penting dalam data cleaning?",
                  options: [
                    "Menghindari duplikasi kategori akibat perbedaan huruf besar/kecil",
                    "Mengurangi ukuran file dataset",
                    "Memastikan konsistensi data kategorikal",
                    "Menghapus missing values secara otomatis",
                  ],
                  correctAnswers: [
                    "Menghindari duplikasi kategori akibat perbedaan huruf besar/kecil",
                    "Memastikan konsistensi data kategorikal",
                  ],
                  explanation:
                    "Tanpa standarisasi, 'Jakarta' dan 'jakarta' akan dianggap berbeda oleh sistem.",
                },

                {
                  id: 3013,
                  orderNumber: 3,
                  textQuestion:
                    "Metode yang digunakan untuk mendeteksi outlier berbasis distribusi statistik adalah?",
                  options: [
                    "Z-Score",
                    "Interquartile Range (IQR)",
                    "Min-Max Scaling",
                    "One-Hot Encoding",
                    "Standard Deviation",
                  ],
                  correctAnswers: ["Z-Score", "Interquartile Range (IQR)"],
                  explanation:
                    "Z-Score dan IQR sama-sama metode statistik untuk mendeteksi pencilan (outlier).",
                },

                {
                  id: 3014,
                  orderNumber: 4,
                  textQuestion:
                    "Kapan median lebih disarankan dibanding mean untuk imputasi?",
                  options: [
                    "Saat data memiliki outlier ekstrem",
                    "Saat distribusi data miring (skewed)",
                    "Saat data berbentuk teks",
                    "Saat data sangat kecil jumlahnya",
                  ],
                  correctAnswers: [
                    "Saat data memiliki outlier ekstrem",
                    "Saat distribusi data miring (skewed)",
                  ],
                  explanation:
                    "Median lebih robust terhadap nilai ekstrem dibandingkan mean.",
                },

                {
                  id: 3015,
                  orderNumber: 5,
                  textQuestion: "Apa tujuan utama dari proses Data Scaling?",
                  options: [
                    "Menyamakan rentang nilai antar fitur",
                    "Menghapus outlier",
                    "Membantu algoritma berbasis jarak bekerja lebih optimal",
                    "Mengubah tipe data menjadi numerik",
                  ],
                  correctAnswers: [
                    "Menyamakan rentang nilai antar fitur",
                    "Membantu algoritma berbasis jarak bekerja lebih optimal",
                  ],
                  explanation:
                    "Scaling penting terutama untuk algoritma seperti KNN, SVM, dan regresi agar fitur tidak saling mendominasi.",
                },
              ],
            },

            // Penambahan Assignment (Project) sesuai permintaan
            assignment: {
              id: 302,
              title: "Project: Retail Data Cleaning Challenge",
              description:
                "Proyek akhir untuk menguji pemahaman Anda tentang data cleaning dan data preparation pada kasus data ritel nyata.",

              instruction: [
                "Unduh dataset 'dirty_retail_data.csv' dari file pendukung.",
                "Identifikasi kolom yang memiliki missing values, khususnya pada Customer_Age.",
                "Lakukan imputasi missing values pada Customer_Age menggunakan teknik median.",
                "Seragamkan format kolom Transaction_Date ke format YYYY-MM-DD.",
                "Deteksi outlier pada kolom Total_Spent menggunakan metode statistik (IQR atau Z-Score).",
                "Tentukan strategi penanganan outlier (hapus atau sesuaikan) dan jelaskan alasannya.",
                "Simpan dataset hasil pembersihan ke dalam file CSV baru.",
                "Dokumentasikan seluruh proses dalam Jupyter Notebook (.ipynb).",
                "Kumpulkan file notebook dan dataset bersih sebagai hasil akhir proyek.",
              ],

              supportingFiles: [
                {
                  id: 1,
                  name: "Dirty Retail Dataset",
                  type: "dataset",
                  url: "/files/datasets/dirty_retail_data.csv",
                  pageCount: 5,
                  format: "CSV",
                  sizeKB: 850,
                },
                {
                  id: 2,
                  name: "Project Notebook Template",
                  type: "template",
                  url: "/files/templates/retail_cleaning_template.ipynb",
                  pageCount: 3,
                  format: "IPYNB",
                  sizeKB: 420,
                },
                {
                  id: 3,
                  name: "Data Cleaning Guidelines",
                  type: "reference",
                  url: "/files/references/data_cleaning_guidelines.pdf",
                  format: "PDF",
                  pageCount: 18,
                  sizeKB: 2300,
                },
              ],

              dueDays: 7,
            },
          },
        ],
        progressPercent: 30,
        lastActivityAt: null,
        certificateTemplateLink:
          "https://example.com/certificate-datascience-3.pdf",
      },
      {
        id: 4,
        coverImage:
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200",
        title: "Data Analysis Basics",
        description:
          "Dasar-dasar analisis data untuk menemukan insight awal dari dataset.",
        taskType: "project",
        modules: [
          {
            id: 12,
            title: "Exploratory Data Analysis",
            estimatedMinutes: 30,
            completed: false,
            subModules: [
              {
                id: 23,
                title: "Konsep Dasar Exploratory Data Analysis (EDA)",
                progress: 0,
                blocks: [
                  {
                    id: "block-78",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-78",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Apa Itu Exploratory Data Analysis?",
                      },
                      {
                        id: "paragraph-97",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Exploratory Data Analysis (EDA) merupakan pendekatan awal dalam analisis data yang bertujuan untuk memahami karakteristik utama dataset sebelum masuk ke tahap pemodelan atau pengambilan keputusan strategis. Pada tahap ini, analis berfokus pada eksplorasi struktur data, distribusi variabel, pola hubungan antar fitur, serta potensi anomali yang mungkin tersembunyi. EDA bukan hanya tentang membuat grafik, tetapi tentang membangun intuisi terhadap data yang sedang dianalisis.",
                      },
                      {
                        id: "paragraph-98",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Melalui EDA, kita dapat menemukan insight awal seperti tren peningkatan penjualan, segmentasi pelanggan berdasarkan perilaku, atau hubungan antara diskon dan volume transaksi. Tahap ini sering kali menghasilkan pertanyaan baru yang lebih tajam, yang kemudian menjadi dasar untuk analisis lanjutan atau eksperimen bisnis.",
                      },
                      {
                        id: "highlight-20",
                        type: "highlight",
                        orderNumber: 4,
                        text: "EDA membantu membangun intuisi sebelum membuat model.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-22",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-22",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Visualisasi grafik sebagai bagian dari proses EDA",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-79",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-79",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Statistik Deskriptif sebagai Langkah Awal",
                      },
                      {
                        id: "paragraph-99",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Salah satu langkah pertama dalam EDA adalah menghitung statistik deskriptif seperti mean, median, standar deviasi, nilai minimum, dan maksimum. Statistik ini memberikan gambaran umum mengenai distribusi dan penyebaran data. Dengan melihat ringkasan ini, kita dapat segera mengidentifikasi nilai yang tidak wajar, distribusi yang sangat miring, atau kolom dengan variasi yang sangat kecil.",
                      },
                      {
                        id: "accordion-18",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Komponen Statistik Deskriptif",
                        items: [
                          {
                            title: "Mean & Median",
                            content: "Mengukur nilai pusat distribusi.",
                          },
                          {
                            title: "Standar Deviasi",
                            content: "Mengukur tingkat penyebaran data.",
                          },
                          {
                            title: "Minimum & Maximum",
                            content: "Menunjukkan rentang nilai.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-24",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-24",
                          language: "python",
                          initialCode:
                            "# Statistik deskriptif dasar\nprint(df_project.describe())",
                            expectedResult: "       Customer_Age\ncount    100.000000\nmean      32.450000\nmin       18.000000\nmax       65.000000"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-80",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-80",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Visualisasi untuk Menemukan Pola",
                      },
                      {
                        id: "paragraph-100",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Visualisasi merupakan komponen penting dalam EDA karena manusia lebih mudah memahami pola melalui representasi visual dibandingkan angka mentah. Grafik seperti histogram membantu melihat distribusi satu variabel, sedangkan scatter plot membantu mengidentifikasi hubungan antara dua variabel numerik. Visualisasi juga dapat membantu mendeteksi outlier, tren musiman, serta klaster alami dalam data.",
                      },
                      {
                        id: "carousel-5",
                        type: "carousel",
                        orderNumber: 3,
                        title: "Jenis Visualisasi Umum",
                        cardsPerSlide: 2,
                        items: [
                          {
                            title: "Histogram",
                            content:
                              "Melihat distribusi satu variabel numerik.",
                          },
                          {
                            title: "Scatter Plot",
                            content: "Menganalisis hubungan dua variabel.",
                          },
                          {
                            title: "Boxplot",
                            content: "Mendeteksi outlier secara visual.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-20",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-20",
                          question:
                            "Tujuan utama visualisasi dalam EDA adalah:",
                          options: [
                            { id: "opt-1", text: "Memperindah laporan" },
                            {
                              id: "opt-2",
                              text: "Menemukan pola dan insight dalam data",
                            },
                            { id: "opt-3", text: "Mengurangi ukuran dataset" },
                            { id: "opt-4", text: "Menghapus missing value" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Visualisasi membantu menemukan pola, tren, dan insight.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-81",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-81",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Menyusun Insight Awal dari EDA",
                      },
                      {
                        id: "paragraph-101",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah melakukan analisis statistik dan visualisasi, langkah berikutnya adalah menyusun insight awal yang ditemukan. Insight ini dapat berupa pola pembelian pelanggan, periode penjualan tertinggi, atau indikasi adanya segmentasi tertentu. Insight yang baik biasanya menjawab pertanyaan bisnis dan dapat ditindaklanjuti. Pada tahap ini, penting untuk mendokumentasikan temuan agar dapat digunakan sebagai referensi pada tahap modeling atau presentasi kepada stakeholder.",
                      },
                      {
                        id: "summary-18",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "EDA adalah tahap eksplorasi awal dataset",
                          "Gunakan statistik deskriptif untuk memahami distribusi",
                          "Visualisasi membantu menemukan pola tersembunyi",
                          "Insight awal menjadi dasar analisis lanjutan",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-14",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-14",
                          question: "Cocokkan konsep dengan fungsinya:",
                          leftItems: [
                            { id: "l1", text: "Histogram" },
                            { id: "l2", text: "Scatter Plot" },
                            { id: "l3", text: "Statistik Deskriptif" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Melihat distribusi data" },
                            {
                              id: "r2",
                              text: "Melihat hubungan antar variabel",
                            },
                            {
                              id: "r3",
                              text: "Merangkum karakteristik numerik",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 24,
                title: "Statistik Deskriptif dalam EDA",
                progress: 40,
                blocks: [
                  {
                    id: "block-82",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-82",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Memahami Ukuran Pemusatan Data",
                      },
                      {
                        id: "paragraph-102",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam Exploratory Data Analysis (EDA), ukuran pemusatan data seperti mean, median, dan modus menjadi fondasi awal untuk memahami distribusi suatu variabel numerik. Mean memberikan gambaran rata-rata umum, tetapi sangat sensitif terhadap outlier. Median sering kali lebih stabil karena merepresentasikan nilai tengah dari distribusi, sementara modus menunjukkan nilai yang paling sering muncul. Dengan membandingkan ketiganya, analis dapat segera mendeteksi apakah distribusi data cenderung simetris atau miring (skewed).",
                      },
                      {
                        id: "paragraph-103",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Sebagai contoh, dalam dataset transaksi e-commerce, jika mean jauh lebih tinggi daripada median, hal ini bisa mengindikasikan adanya beberapa transaksi bernilai sangat besar yang memengaruhi rata-rata. Insight seperti ini penting sebelum melanjutkan ke tahap modeling karena model prediktif bisa terdampak oleh distribusi yang tidak seimbang.",
                      },
                      {
                        id: "highlight-21",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Bandingkan mean dan median untuk mendeteksi skewness.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-25",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-25",
                          language: "python",
                          initialCode:
                            "# Menghitung mean dan median\nprint('Mean:', df['revenue'].mean())\nprint('Median:', df['revenue'].median())",
                            expectedResult: "Mean: 7500000.0\nMedian: 6200000.0"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-83",
                    orderNumber: 2,
                    progress: 60,
                    contents: [
                      {
                        id: "heading-83",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Ukuran Penyebaran dan Variabilitas",
                      },
                      {
                        id: "paragraph-104",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Selain mengetahui nilai pusat, penting juga untuk memahami seberapa tersebar data tersebut. Standar deviasi dan varians mengukur tingkat variasi data terhadap rata-rata. Nilai standar deviasi yang tinggi menunjukkan bahwa data tersebar luas dari mean, sedangkan nilai yang rendah menunjukkan konsistensi yang lebih baik.",
                      },
                      {
                        id: "accordion-19",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Komponen Penyebaran Data",
                        items: [
                          {
                            title: "Range",
                            content:
                              "Selisih antara nilai maksimum dan minimum.",
                          },
                          {
                            title: "Varians",
                            content: "Rata-rata kuadrat deviasi dari mean.",
                          },
                          {
                            title: "Standar Deviasi",
                            content:
                              "Akar dari varians, lebih mudah diinterpretasi.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-23",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-23",
                          url: "https://images.unsplash.com/photo-1551288049-9b3c1d4d3c6a?w=400",
                          caption:
                            "Ilustrasi visual distribusi dan penyebaran data",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-84",
                    orderNumber: 3,
                    progress: 40,
                    contents: [
                      {
                        id: "heading-84",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Analisis Korelasi Antar Variabel",
                      },
                      {
                        id: "paragraph-105",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Korelasi membantu kita memahami hubungan linear antara dua variabel numerik. Nilai korelasi berkisar antara -1 hingga 1. Nilai mendekati 1 menunjukkan hubungan positif yang kuat, mendekati -1 menunjukkan hubungan negatif yang kuat, dan mendekati 0 menunjukkan tidak adanya hubungan linear yang signifikan.",
                      },
                      {
                        id: "paragraph-106",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Namun, penting untuk diingat bahwa korelasi tidak selalu berarti kausalitas. Dua variabel dapat memiliki korelasi tinggi tanpa adanya hubungan sebab-akibat langsung. Oleh karena itu, hasil korelasi harus dianalisis lebih lanjut dengan pemahaman konteks bisnis atau eksperimen tambahan.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-26",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-26",
                          language: "python",
                          initialCode:
                            "# Menghitung korelasi\ncorrelation_matrix = df.corr()\nprint(correlation_matrix)",
                            expectedResult: "          revenue   profit\nrevenue   1.000000  0.824512\nprofit    0.824512  1.000000"
                        },
                      },
                      {
                        id: "mcq-21",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-21",
                          question:
                            "Jika nilai korelasi mendekati -1, maka artinya:",
                          options: [
                            { id: "opt-1", text: "Hubungan positif kuat" },
                            { id: "opt-2", text: "Tidak ada hubungan" },
                            { id: "opt-3", text: "Hubungan negatif kuat" },
                            { id: "opt-4", text: "Hubungan kausal langsung" },
                          ],
                          correctAnswers: ["opt-3"],
                          explanation:
                            "Nilai mendekati -1 menunjukkan hubungan linear negatif yang kuat.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-85",
                    orderNumber: 4,
                    progress: 20,
                    contents: [
                      {
                        id: "heading-85",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Menyusun Ringkasan Statistik sebagai Insight",
                      },
                      {
                        id: "paragraph-107",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah menghitung berbagai metrik statistik, langkah penting berikutnya adalah menerjemahkannya menjadi insight yang bermakna. Statistik deskriptif bukan hanya angka, tetapi cerita tentang bagaimana data berperilaku. Misalnya, standar deviasi tinggi pada durasi kunjungan pengguna dapat mengindikasikan segmentasi perilaku yang berbeda-beda. Dengan menggabungkan ukuran pemusatan, penyebaran, dan korelasi, analis dapat membangun narasi awal sebelum masuk ke tahap visualisasi lanjutan atau pemodelan machine learning.",
                      },
                      {
                        id: "summary-19",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Ukuran pemusatan membantu memahami nilai tengah",
                          "Ukuran penyebaran menunjukkan variasi data",
                          "Korelasi mengukur hubungan linear antar variabel",
                          "Statistik deskriptif harus diterjemahkan menjadi insight",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-15",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-15",
                          question:
                            "Cocokkan istilah statistik dengan definisinya:",
                          leftItems: [
                            { id: "l1", text: "Mean" },
                            { id: "l2", text: "Standar Deviasi" },
                            { id: "l3", text: "Korelasi" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Mengukur rata-rata nilai" },
                            {
                              id: "r2",
                              text: "Mengukur tingkat penyebaran data",
                            },
                            {
                              id: "r3",
                              text: "Mengukur hubungan antar variabel",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 13,
            title: "Data Visualization Basics",
            estimatedMinutes: 25,
            completed: false,
            subModules: [
              {
                id: 25,
                title: "Memilih Jenis Grafik yang Tepat",
                progress: 0,
                blocks: [
                  {
                    id: "block-86",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-86",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Visualisasi sebagai Alat Komunikasi Data",
                      },
                      {
                        id: "paragraph-108",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Visualisasi data bukan sekadar membuat grafik yang terlihat menarik, tetapi merupakan sarana komunikasi yang efektif antara analis dan stakeholder. Grafik yang tepat mampu menyederhanakan ribuan baris data menjadi pesan yang mudah dipahami dalam hitungan detik. Pemilihan jenis grafik harus selalu didasarkan pada pertanyaan analisis yang ingin dijawab, apakah ingin membandingkan kategori, melihat tren waktu, memahami distribusi, atau mengevaluasi hubungan antar variabel.",
                      },
                      {
                        id: "paragraph-109",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Kesalahan dalam memilih grafik dapat menyebabkan misinterpretasi data. Misalnya, menggunakan pie chart untuk terlalu banyak kategori dapat membuat pembaca kesulitan membedakan proporsi. Oleh karena itu, pemahaman mendalam mengenai fungsi setiap jenis grafik menjadi keterampilan penting dalam EDA maupun presentasi hasil analisis.",
                      },
                      {
                        id: "highlight-22",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Grafik yang tepat memperjelas pesan, bukan memperumitnya.",
                      },
                    ],
                  },
                  {
                    id: "block-87",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-87",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Grafik untuk Perbandingan dan Tren",
                      },
                      {
                        id: "paragraph-110",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Bar chart sangat efektif untuk membandingkan nilai antar kategori, seperti jumlah penjualan antar produk atau jumlah pengguna antar wilayah. Struktur batang yang jelas membuat perbandingan visual menjadi intuitif. Sementara itu, line chart lebih cocok digunakan untuk data time-series karena mampu menunjukkan perubahan nilai dari waktu ke waktu secara berurutan.",
                      },
                      {
                        id: "accordion-20",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Kapan Menggunakan Grafik Ini?",
                        items: [
                          {
                            title: "Bar Chart",
                            content:
                              "Gunakan untuk membandingkan kategori diskrit.",
                          },
                          {
                            title: "Line Chart",
                            content: "Gunakan untuk menunjukkan tren waktu.",
                          },
                          {
                            title: "Area Chart",
                            content:
                              "Menunjukkan tren sekaligus volume secara kumulatif.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-24",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-24",
                          url: "https://www.youtube.com/watch?v=8H6Qo2e_D8M",
                          caption: "Penjelasan memilih jenis chart yang tepat",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-88",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-88",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Grafik untuk Distribusi dan Hubungan",
                      },
                      {
                        id: "paragraph-111",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Histogram digunakan untuk memahami distribusi satu variabel numerik. Dengan histogram, kita dapat melihat apakah data terdistribusi normal, miring ke kiri, atau miring ke kanan. Grafik ini juga membantu mendeteksi outlier atau konsentrasi nilai tertentu.",
                      },
                      {
                        id: "paragraph-112",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Scatter plot digunakan untuk memvisualisasikan hubungan antara dua variabel numerik. Pola titik-titik pada scatter plot dapat menunjukkan adanya korelasi positif, negatif, atau bahkan pola non-linear. Visualisasi ini sangat berguna sebelum melakukan analisis korelasi atau regresi lebih lanjut.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-22",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-22",
                          question:
                            "Grafik yang paling tepat untuk melihat hubungan dua variabel numerik adalah:",
                          options: [
                            { id: "opt-1", text: "Bar Chart" },
                            { id: "opt-2", text: "Pie Chart" },
                            { id: "opt-3", text: "Scatter Plot" },
                            { id: "opt-4", text: "Histogram" },
                          ],
                          correctAnswers: ["opt-3"],
                          explanation:
                            "Scatter plot digunakan untuk melihat hubungan antara dua variabel numerik.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-89",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-89",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Prinsip Desain dalam Visualisasi",
                      },
                      {
                        id: "paragraph-113",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Selain memilih jenis grafik yang tepat, prinsip desain juga memegang peranan penting. Hindari penggunaan warna berlebihan, pastikan label sumbu jelas, dan gunakan skala yang tidak menyesatkan. Visualisasi yang baik bersifat jujur, informatif, dan mudah dipahami tanpa perlu penjelasan panjang.",
                      },
                      {
                        id: "summary-20",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Pilih grafik sesuai tujuan analisis",
                          "Bar chart untuk perbandingan kategori",
                          "Line chart untuk tren waktu",
                          "Scatter plot untuk hubungan dua variabel",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-16",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-16",
                          question: "Cocokkan jenis grafik dengan fungsinya:",
                          leftItems: [
                            { id: "l1", text: "Histogram" },
                            { id: "l2", text: "Line Chart" },
                            { id: "l3", text: "Bar Chart" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Melihat distribusi data" },
                            { id: "r2", text: "Menunjukkan tren waktu" },
                            { id: "r3", text: "Membandingkan kategori" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 26,
                title: "Implementasi dengan Library Visualisasi",
                progress: 0,
                blocks: [
                  {
                    id: "block-90",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-90",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Mengenal Library Visualisasi dalam Ekosistem Python",
                      },
                      {
                        id: "paragraph-114",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam praktik Data Science, visualisasi bukan lagi sekadar teori tentang jenis grafik, tetapi implementasi nyata menggunakan library yang tersedia. Python memiliki ekosistem visualisasi yang sangat kaya, mulai dari Matplotlib sebagai fondasi utama, Seaborn yang mempercantik tampilan secara default, hingga Plotly yang mendukung visualisasi interaktif berbasis web. Memahami karakteristik setiap library akan membantu kita memilih alat yang paling sesuai dengan kebutuhan analisis dan audiens.",
                      },
                      {
                        id: "paragraph-115",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Matplotlib memberikan kontrol granular terhadap setiap elemen visual—mulai dari ukuran figure, warna, label, hingga anotasi detail. Sementara itu, Seaborn dibangun di atas Matplotlib dan menawarkan gaya visual yang lebih modern serta integrasi yang lebih kuat dengan pandas DataFrame. Dalam implementasi nyata, seorang analis sering mengombinasikan keduanya untuk mendapatkan fleksibilitas sekaligus estetika.",
                      },
                      {
                        id: "highlight-23",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Pilih library berdasarkan kebutuhan kontrol, estetika, dan interaktivitas.",
                      },
                    ],
                  },
                  {
                    id: "block-91",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-91",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Praktik Dasar dengan Seaborn",
                      },
                      {
                        id: "paragraph-116",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Seaborn sangat cocok digunakan saat kita ingin membuat visualisasi statistik dengan cepat dan rapi. Library ini memiliki fungsi bawaan seperti histplot, boxplot, scatterplot, dan heatmap yang secara otomatis mengatur style dan color palette. Dengan satu atau dua baris kode saja, kita sudah dapat menghasilkan grafik yang profesional dan informatif.",
                      },
                      {
                        id: "paragraph-117",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam praktiknya, penting untuk tetap memperhatikan konteks data. Jangan hanya fokus pada tampilan, tetapi pastikan bahwa grafik benar-benar menjawab pertanyaan analisis. Tambahkan judul yang jelas, label sumbu yang informatif, serta hindari elemen visual yang tidak relevan agar pesan utama tetap kuat.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-27",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-27",
                          language: "python",
                          initialCode:
                            "import seaborn as sns\nimport matplotlib.pyplot as plt\n\nsns.histplot(df['revenue'], kde=True)\nplt.title('Distribusi Revenue Perusahaan')\nplt.xlabel('Revenue')\nplt.ylabel('Frekuensi')\nplt.show()",
                            expectedResult: "<Figure size 640x480 with 1 Axes>"
                        },
                      },
                      {
                        id: "image-25",
                        type: "image_video",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "media-25",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
                          caption:
                            "Contoh dashboard visualisasi yang bersih dan minimalis",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-92",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-92",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Membangun Visualisasi yang Informatif",
                      },
                      {
                        id: "paragraph-118",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Visualisasi yang baik selalu memiliki struktur yang jelas. Gunakan hierarki visual melalui ukuran font, warna, dan penempatan elemen untuk mengarahkan perhatian pembaca. Gunakan warna secara konsisten untuk kategori yang sama dan hindari penggunaan warna yang terlalu mencolok jika tidak memiliki makna tertentu.",
                      },
                      {
                        id: "accordion-21",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Checklist Visualisasi Berkualitas",
                        items: [
                          {
                            title: "Judul Informatif",
                            content:
                              "Pastikan judul menjelaskan apa yang divisualisasikan.",
                          },
                          {
                            title: "Label Sumbu Jelas",
                            content:
                              "Sumbu X dan Y harus memiliki deskripsi dan satuan.",
                          },
                          {
                            title: "Warna Konsisten",
                            content:
                              "Gunakan warna untuk memperkuat makna, bukan dekorasi.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-23",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-23",
                          question:
                            "Manakah prinsip yang benar dalam membuat visualisasi data?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Menggunakan warna sebanyak mungkin agar menarik",
                            },
                            {
                              id: "opt-2",
                              text: "Menambahkan dekorasi agar terlihat kompleks",
                            },
                            {
                              id: "opt-3",
                              text: "Memberikan label sumbu yang jelas",
                            },
                            {
                              id: "opt-4",
                              text: "Memastikan grafik menjawab pertanyaan analisis",
                            },
                          ],
                          correctAnswers: ["opt-3", "opt-4"],
                          explanation:
                            "Visualisasi harus jelas, informatif, dan relevan terhadap tujuan analisis.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-93",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-93",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Ringkasan Implementasi Visualisasi",
                      },
                      {
                        id: "paragraph-119",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Implementasi visualisasi data memerlukan keseimbangan antara teknik dan desain. Library seperti Matplotlib dan Seaborn membantu kita membangun grafik yang informatif, tetapi keputusan akhir tetap berada pada analis. Setiap elemen dalam grafik harus memiliki tujuan yang jelas dan mendukung pesan utama yang ingin disampaikan.",
                      },
                      {
                        id: "summary-21",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Matplotlib memberikan kontrol penuh terhadap visualisasi",
                          "Seaborn mempermudah pembuatan grafik statistik yang estetis",
                          "Visualisasi harus jelas dan tidak berlebihan",
                          "Desain yang baik memperkuat pesan analisis",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-17",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-17",
                          question: "Cocokkan library dengan karakteristiknya:",
                          leftItems: [
                            { id: "l1", text: "Matplotlib" },
                            { id: "l2", text: "Seaborn" },
                          ],
                          rightItems: [
                            { id: "r1", text: "Kontrol penuh dan fleksibel" },
                            {
                              id: "r2",
                              text: "Style modern dan statistik default",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 14,
            title: "Simple Statistical Analysis",
            estimatedMinutes: 30,
            completed: false,
            subModules: [
              {
                id: 27,
                title: "Uji Hipotesis Sederhana",
                progress: 100,
                blocks: [
                  {
                    id: "block-94",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-94",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Konsep Dasar Uji Hipotesis",
                      },
                      {
                        id: "paragraph-120",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Analisis statistik tidak hanya berhenti pada visualisasi atau perhitungan rata-rata. Dalam banyak kasus, kita perlu memastikan apakah perbedaan atau pola yang kita lihat benar-benar signifikan secara statistik atau hanya terjadi karena variasi acak semata. Di sinilah konsep uji hipotesis berperan penting. Uji hipotesis membantu kita membuat keputusan berbasis data dengan pendekatan matematis yang terukur dan sistematis.",
                      },
                      {
                        id: "paragraph-121",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Secara umum, uji hipotesis dimulai dengan merumuskan dua hipotesis: hipotesis nol (H0) yang menyatakan tidak ada perbedaan atau efek, dan hipotesis alternatif (H1) yang menyatakan adanya perbedaan atau efek tertentu. Proses analisis kemudian menentukan apakah kita memiliki cukup bukti untuk menolak hipotesis nol berdasarkan data sampel yang tersedia.",
                      },
                      {
                        id: "highlight-24",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Uji hipotesis membantu kita mengambil keputusan berbasis probabilitas.",
                      },
                    ],
                  },
                  {
                    id: "block-95",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-95",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "T-Test untuk Dua Kelompok",
                      },
                      {
                        id: "paragraph-122",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Salah satu metode paling umum dalam analisis statistik sederhana adalah T-Test. Uji ini digunakan untuk membandingkan rata-rata dua kelompok dan menentukan apakah perbedaannya signifikan secara statistik. Contohnya, kita ingin mengetahui apakah rata-rata pendapatan pelanggan yang menerima promo berbeda dari yang tidak menerima promo.",
                      },
                      {
                        id: "paragraph-123",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "T-Test bekerja dengan menghitung nilai statistik (t-statistic) dan p-value. Nilai ini merepresentasikan seberapa besar perbedaan rata-rata relatif terhadap variasi dalam data. Semakin kecil p-value, semakin kuat bukti bahwa perbedaan tersebut bukan sekadar kebetulan.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-28",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-28",
                          language: "python",
                          initialCode:
                            "from scipy import stats\n\n# Membandingkan dua kelompok sampel\nt_stat, p_val = stats.ttest_ind(group_a, group_b)\n\nprint('T-Statistic:', t_stat)\nprint('P-Value:', p_val)",
                            expectedResult: "T-Statistic: 2.45123891\nP-Value: 0.01642109"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-96",
                    orderNumber: 3,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-96",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Memahami P-Value dan Signifikansi",
                      },
                      {
                        id: "paragraph-124",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "P-value adalah probabilitas mendapatkan hasil yang sama ekstremnya dengan data yang diamati, dengan asumsi bahwa hipotesis nol benar. Dalam praktik umum, jika p-value lebih kecil dari 0.05, maka kita menganggap hasil tersebut signifikan secara statistik dan menolak hipotesis nol.",
                      },
                      {
                        id: "paragraph-125",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Namun penting untuk memahami bahwa signifikansi statistik tidak selalu berarti signifikansi praktis. Sebuah perbedaan bisa saja signifikan secara matematis tetapi tidak memiliki dampak bisnis yang berarti. Oleh karena itu, interpretasi hasil harus selalu dikaitkan dengan konteks analisis.",
                      },
                      {
                        id: "accordion-22",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Istilah Penting dalam Uji Hipotesis",
                        items: [
                          {
                            title: "Hipotesis Nol (H0)",
                            content:
                              "Menyatakan tidak ada perbedaan atau efek.",
                          },
                          {
                            title: "Hipotesis Alternatif (H1)",
                            content: "Menyatakan adanya perbedaan atau efek.",
                          },
                          {
                            title: "Level Signifikansi",
                            content: "Batas probabilitas, umumnya 0.05.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-24",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-24",
                          question:
                            "Jika p-value = 0.03 dan level signifikansi 0.05, maka keputusan yang tepat adalah:",
                          options: [
                            { id: "opt-1", text: "Menerima hipotesis nol" },
                            { id: "opt-2", text: "Menolak hipotesis nol" },
                            { id: "opt-3", text: "Data tidak valid" },
                            {
                              id: "opt-4",
                              text: "Perlu menambah variabel baru",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Karena 0.03 < 0.05, maka hasil signifikan dan H0 ditolak.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-97",
                    orderNumber: 4,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-97",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Kesimpulan Uji Hipotesis Sederhana",
                      },
                      {
                        id: "paragraph-126",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Uji hipotesis sederhana seperti T-Test merupakan langkah awal dalam pengambilan keputusan berbasis data. Dengan memahami konsep hipotesis nol, hipotesis alternatif, serta interpretasi p-value, kita dapat menghindari keputusan yang hanya didasarkan pada intuisi semata.",
                      },
                      {
                        id: "summary-22",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Hipotesis nol menyatakan tidak ada perbedaan",
                          "T-Test membandingkan rata-rata dua kelompok",
                          "P-value menentukan signifikansi statistik",
                          "Interpretasi harus mempertimbangkan konteks bisnis",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-18",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-18",
                          question: "Cocokkan istilah dengan definisinya:",
                          leftItems: [
                            { id: "l1", text: "P-Value" },
                            { id: "l2", text: "T-Test" },
                          ],
                          rightItems: [
                            {
                              id: "r1",
                              text: "Uji perbandingan dua rata-rata",
                            },
                            {
                              id: "r2",
                              text: "Probabilitas berdasarkan asumsi H0 benar",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r2" },
                            { leftId: "l2", rightId: "r1" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 28,
                title: "Analisis Korelasi dan Regresi",
                progress: 30,
                blocks: [
                  {
                    id: "block-98",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-98",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Memahami Konsep Korelasi",
                      },
                      {
                        id: "paragraph-127",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Korelasi adalah ukuran statistik yang digunakan untuk mengetahui seberapa kuat hubungan antara dua variabel numerik. Salah satu metode paling umum adalah Korelasi Pearson, yang mengukur hubungan linear antara dua variabel dan menghasilkan nilai antara -1 hingga 1. Nilai mendekati 1 menunjukkan hubungan positif yang kuat, nilai mendekati -1 menunjukkan hubungan negatif yang kuat, dan nilai mendekati 0 menunjukkan tidak adanya hubungan linear yang signifikan.",
                      },
                      {
                        id: "paragraph-128",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam praktik bisnis, korelasi sering digunakan untuk mengidentifikasi pola awal sebelum membangun model prediktif. Misalnya, perusahaan dapat menganalisis hubungan antara biaya iklan dan penjualan, atau antara jam belajar dan nilai ujian. Namun penting untuk diingat bahwa korelasi hanya menunjukkan hubungan, bukan sebab-akibat.",
                      },
                      {
                        id: "highlight-25",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Nilai korelasi mengukur kekuatan hubungan, bukan sebab-akibat.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-26",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-26",
                          url: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400",
                          caption:
                            "Ilustrasi grafik scatter plot dengan hubungan linear",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-99",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-99",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Regresi Linear sebagai Model Prediksi",
                      },
                      {
                        id: "paragraph-129",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Regresi Linear adalah teknik statistik yang memungkinkan kita memodelkan hubungan antara variabel independen (X) dan variabel dependen (Y). Dengan pendekatan ini, kita membangun persamaan garis terbaik yang meminimalkan selisih antara nilai aktual dan nilai prediksi. Konsep ini menjadi fondasi dari banyak algoritma machine learning yang lebih kompleks.",
                      },
                      {
                        id: "paragraph-130",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Model regresi tidak hanya memberikan prediksi, tetapi juga informasi mengenai kekuatan hubungan melalui koefisien regresi. Koefisien ini menunjukkan seberapa besar perubahan pada variabel dependen ketika variabel independen meningkat satu satuan, dengan asumsi variabel lain tetap konstan.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-29",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-29",
                          language: "python",
                          initialCode:
                            "import statsmodels.api as sm\n\nX = sm.add_constant(df['iklan'])\nmodel = sm.OLS(df['penjualan'], X).fit()\n\nprint(model.summary())",
                            expectedResult: "                            OLS Regression Results                            \n==============================================================================\nDep. Variable:              penjualan   R-squared:                       0.856\n..."
                        },
                      },
                      {
                        id: "mcq-25",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-25",
                          question:
                            "Dalam regresi linear sederhana, variabel Y biasanya disebut sebagai:",
                          options: [
                            { id: "opt-1", text: "Variabel independen" },
                            { id: "opt-2", text: "Variabel dependen" },
                            { id: "opt-3", text: "Variabel kontrol" },
                            { id: "opt-4", text: "Variabel acak" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Y adalah variabel dependen yang nilainya diprediksi berdasarkan X.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-100",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-100",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Korelasi Bukan Sebab-Akibat",
                      },
                      {
                        id: "paragraph-131",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Salah satu kesalahan umum dalam analisis data adalah mengasumsikan bahwa korelasi berarti sebab-akibat. Dua variabel bisa saja memiliki hubungan kuat karena adanya variabel ketiga yang memengaruhi keduanya. Misalnya, peningkatan penjualan es krim dan peningkatan kasus tenggelam bisa sama-sama dipengaruhi oleh musim panas, bukan karena es krim menyebabkan tenggelam.",
                      },
                      {
                        id: "paragraph-132",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Oleh karena itu, analis data harus selalu mempertimbangkan konteks dan melakukan analisis lanjutan sebelum menarik kesimpulan kausal. Dalam banyak kasus, eksperimen terkontrol atau pendekatan kausal inference diperlukan untuk membuktikan hubungan sebab-akibat secara ilmiah.",
                      },
                      {
                        id: "accordion-23",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Kesalahan Umum dalam Interpretasi Korelasi",
                        items: [
                          {
                            title: "Menganggap Korelasi = Kausalitas",
                            content:
                              "Hubungan statistik tidak selalu berarti sebab-akibat.",
                          },
                          {
                            title: "Mengabaikan Variabel Lain",
                            content:
                              "Variabel tersembunyi bisa memengaruhi hasil.",
                          },
                          {
                            title: "Mengandalkan Satu Analisis",
                            content: "Selalu lakukan validasi tambahan.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-19",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-question-19",
                          question: "Cocokkan konsep dengan penjelasannya:",
                          leftItems: [
                            { id: "l1", text: "Korelasi Pearson" },
                            { id: "l2", text: "Regresi Linear" },
                          ],
                          rightItems: [
                            {
                              id: "r1",
                              text: "Model untuk prediksi nilai Y berdasarkan X",
                            },
                            {
                              id: "r2",
                              text: "Mengukur kekuatan hubungan linear",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r2" },
                            { leftId: "l2", rightId: "r1" },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    id: "block-101",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-101",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Ringkasan Analisis Korelasi dan Regresi",
                      },
                      {
                        id: "paragraph-133",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Analisis korelasi membantu kita memahami kekuatan hubungan antara dua variabel, sedangkan regresi linear memungkinkan kita membangun model prediktif berbasis hubungan tersebut. Keduanya merupakan fondasi penting dalam analisis statistik dan machine learning.",
                      },
                      {
                        id: "summary-23",
                        type: "summary",
                        orderNumber: 3,
                        comments: [
                          "Korelasi mengukur kekuatan hubungan linear",
                          "Regresi linear membangun model prediksi",
                          "Koefisien regresi menunjukkan pengaruh variabel",
                          "Korelasi tidak selalu berarti kausalitas",
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 15,
            title: "Final Project: Analyze Dataset",
            estimatedMinutes: 45,
            completed: false,
            subModules: [
              {
                id: 29,
                title: "Studi Kasus: Insight Perilaku Konsumen",
                progress: 0,
                blocks: [
                  {
                    id: "block-102",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-102",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Pendahuluan Final Project",
                      },
                      {
                        id: "paragraph-134",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Selamat datang di tahap akhir pembelajaran Anda. Pada submodule ini, Anda akan mengintegrasikan seluruh konsep yang telah dipelajari mulai dari data cleaning, eksplorasi data, visualisasi, hingga analisis statistik untuk menghasilkan insight bisnis yang nyata dan dapat ditindaklanjuti. Dataset yang digunakan merupakan data transaksi pelanggan yang mencakup informasi segmentasi, kategori produk, diskon, profit, serta waktu transaksi. Tugas Anda bukan hanya menghitung angka, tetapi memahami cerita yang tersembunyi di balik pola-pola tersebut dan menerjemahkannya menjadi rekomendasi strategis yang relevan bagi pengambilan keputusan bisnis.",
                      },
                      {
                        id: "paragraph-135",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Anggaplah Anda adalah seorang data analyst di sebuah perusahaan ritel yang sedang ingin meningkatkan profitabilitas dan efisiensi promosi. Manajemen meminta Anda untuk mengidentifikasi segmen pelanggan paling menguntungkan, mengevaluasi efektivitas diskon, serta menyusun rekomendasi berbasis data. Seluruh analisis harus didukung oleh bukti numerik dan visualisasi yang jelas agar mudah dipahami oleh stakeholder non-teknis.",
                      },
                      {
                        id: "highlight-26",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Fokus utama: ubah data menjadi keputusan bisnis.",
                      },
                    ],
                  },
                  {
                    id: "block-103",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-103",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Segmentasi Pelanggan dan Analisis Profit",
                      },
                      {
                        id: "paragraph-136",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Langkah pertama adalah melakukan analisis segmentasi pelanggan. Gunakan pendekatan statistik deskriptif untuk menghitung total profit, rata-rata nilai transaksi, serta frekuensi pembelian pada masing-masing segmen pelanggan. Perhatikan apakah terdapat segmen yang menghasilkan profit tinggi tetapi memiliki margin rendah akibat diskon besar. Analisis ini akan membantu Anda menentukan apakah perusahaan perlu memprioritaskan segmen tertentu atau mengoptimalkan strategi harga pada segmen lainnya.",
                      },
                      {
                        id: "paragraph-137",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Selain itu, evaluasi juga distribusi kontribusi profit menggunakan prinsip Pareto (80/20). Apakah 20% pelanggan menyumbang sebagian besar profit? Jika ya, strategi retensi pelanggan pada kelompok tersebut dapat menjadi prioritas utama. Gunakan tabel ringkasan dan visualisasi sederhana seperti bar chart untuk memperjelas temuan Anda.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-30",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-30",
                          language: "python",
                          initialCode:
                            "# Ringkasan profit per segmen\nsegment_summary = df.groupby('segment').agg({\n    'profit': 'sum',\n    'sales': 'mean',\n    'customer_id': 'count'\n})\n\nprint(segment_summary.sort_values(by='profit', ascending=False))",
                            expectedResult: "             profit          sales  customer_id\nsegment                                        \nEnterprise  5000000  120000.000000          150\nConsumer    2500000   45000.500000          450"
                        },
                      },
                      {
                        id: "mcq-26",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-26",
                          question:
                            "Jika satu segmen memiliki penjualan tinggi tetapi profit rendah, kemungkinan penyebabnya adalah:",
                          options: [
                            { id: "opt-1", text: "Tidak ada pelanggan tetap" },
                            {
                              id: "opt-2",
                              text: "Diskon terlalu besar atau margin kecil",
                            },
                            {
                              id: "opt-3",
                              text: "Jumlah transaksi terlalu sedikit",
                            },
                            { id: "opt-4", text: "Data tidak lengkap" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Penjualan tinggi namun profit rendah biasanya disebabkan margin yang kecil atau diskon besar.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-104",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-104",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Analisis Tren dan Efektivitas Diskon",
                      },
                      {
                        id: "paragraph-138",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Langkah berikutnya adalah menganalisis tren penjualan bulanan dan hubungan antara diskon yang diberikan dengan total penjualan maupun profit. Buat agregasi data berdasarkan bulan untuk melihat pola musiman. Apakah terdapat lonjakan penjualan pada periode tertentu? Kemudian analisis korelasi sederhana antara diskon dan profit untuk mengevaluasi apakah diskon benar-benar meningkatkan keuntungan atau hanya meningkatkan volume penjualan tanpa meningkatkan margin.",
                      },
                      {
                        id: "paragraph-139",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Perhatikan pula perbedaan performa diskon antara hari kerja dan akhir pekan. Bisa jadi pelanggan lebih sensitif terhadap diskon di hari tertentu. Analisis ini dapat membantu perusahaan mengoptimalkan waktu promosi sehingga biaya promosi lebih efisien dan berdampak langsung pada profitabilitas.",
                      },
                      {
                        id: "accordion-24",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Checklist Analisis Tren",
                        items: [
                          {
                            title: "Identifikasi Pola Musiman",
                            content: "Periksa lonjakan penjualan per bulan.",
                          },
                          {
                            title: "Ukur Korelasi Diskon-Profit",
                            content: "Pastikan diskon meningkatkan margin.",
                          },
                          {
                            title: "Bandingkan Hari Transaksi",
                            content: "Evaluasi weekday vs weekend.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-27",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-27",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption: "Contoh dashboard tren penjualan bulanan",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-105",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-105",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Rekomendasi Bisnis dan Data Storytelling",
                      },
                      {
                        id: "paragraph-140",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah seluruh analisis selesai, susun rekomendasi bisnis yang konkret dan terukur. Hindari rekomendasi yang terlalu umum. Sebaliknya, gunakan angka dan bukti visual sebagai dasar argumen. Misalnya, jika ditemukan bahwa diskon di akhir pekan meningkatkan penjualan tetapi menurunkan profit margin sebesar 10%, maka perusahaan dapat mempertimbangkan strategi bundling produk dibandingkan diskon langsung.",
                      },
                      {
                        id: "paragraph-141",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Terakhir, rangkum seluruh insight dalam bentuk narasi yang mudah dipahami oleh stakeholder. Gunakan pendekatan storytelling: mulai dari masalah bisnis, temuan utama berbasis data, hingga rekomendasi strategis. Narasi yang kuat akan membuat hasil analisis Anda lebih berdampak dan lebih mudah diterima oleh manajemen.",
                      },
                      {
                        id: "summary-24",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Identifikasi segmen paling menguntungkan",
                          "Evaluasi efektivitas diskon terhadap profit",
                          "Analisis tren musiman penjualan",
                          "Susun rekomendasi berbasis data",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-31",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-31",
                          language: "python",
                          initialCode:
                            "# Simpan laporan akhir\nfinal_report = segment_summary.copy()\nfinal_report.to_csv('final_project_insight.csv')\n\nprint('File berhasil disimpan.')",
                            expectedResult: "File berhasil disimpan."
                        },
                      },
                      {
                        id: "matching-20",
                        type: "matching",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "matching-question-20",
                          question: "Cocokkan langkah dengan tujuannya:",
                          leftItems: [
                            { id: "l1", text: "Segmentasi Pelanggan" },
                            { id: "l2", text: "Analisis Diskon" },
                          ],
                          rightItems: [
                            {
                              id: "r1",
                              text: "Mengetahui kontribusi profit tiap kelompok",
                            },
                            {
                              id: "r2",
                              text: "Mengukur dampak potongan harga",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            // ===============================
            // ASSIGNMENT (karena taskType = project)
            // ===============================
            assignment: {
              id: 401,
              title: "Final Project: Comprehensive Data Analysis & Insight",
              description:
                "Proyek akhir untuk menguji pemahaman Anda tentang EDA, visualisasi data, analisis statistik, serta kemampuan menyampaikan insight bisnis berbasis data.",
              instruction: [
                "Gunakan dataset yang telah Anda bersihkan pada modul sebelumnya.",
                "Lakukan Exploratory Data Analysis (EDA) menggunakan statistik deskriptif (mean, median, std).",
                "Analisis korelasi antar variabel numerik dan jelaskan implikasinya.",
                "Buat minimal 3 visualisasi data yang relevan (Bar Chart, Line Chart, Histogram, atau Scatter Plot).",
                "Lakukan satu analisis statistik sederhana (T-Test atau regresi linear).",
                "Interpretasikan hasil analisis statistik tersebut secara bisnis.",
                "Susun insight utama dan rekomendasi bisnis berdasarkan temuan Anda.",
                "Buat narasi data (data storytelling) yang jelas dan mudah dipahami.",
                "Simpan hasil analisis dalam Jupyter Notebook (.ipynb).",
                "Ekspor ringkasan hasil akhir ke file CSV atau PDF.",
              ],
              supportingFiles: [
                {
                  id: 4011,
                  name: "Cleaned Dataset",
                  type: "dataset",
                  url: "/files/datasets/cleaned_retail_data.csv",
                },
                {
                  id: 4012,
                  name: "Final Project Notebook Template",
                  type: "template",
                  url: "/files/templates/final_analysis_template.ipynb",
                },
                {
                  id: 4013,
                  name: "Data Analysis Reference Guide",
                  type: "reference",
                  url: "/files/references/data_analysis_guidelines.pdf",
                },
              ],
              dueDays: 10,
            },
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
        certificateTemplateLink:
          "https://example.com/certificate-datascience-2-4.pdf",
      },
    ],
  },
  {
    id: 2,
    tipe: "machine learning",
    title: "Mathematics for Machine Learning - Beginner",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
    deskripsi:
      "Belajar matematika dasar yang dibutuhkan untuk machine learning seperti aljabar, statistik, dan probabilitas",
    level: "Pemula",
    keywords: [
      "matematika",
      "linear algebra",
      "statistika",
      "probabilitas",
      "kalkulus",
      "gradient descent",
      "dasar ml",
    ],
    jumlahSubChapter: 4,
    jumlahModul: 12,
    rating: 4.8,
    JumlahPerating: "150 ulasan",
    jumlahPembeli: "1.430 peserta",
    subChapters: [
      {
        id: 5,
        coverImage:
          "https://images.unsplash.com/photo-1509228463558-399364a71109?w=400&h=200",
        title: "Linear Algebra Foundations",
        description:
          "Memahami konsep vektor dan matriks sebagai fondasi representasi data di ML.",
        taskType: "quiz",
        modules: [
          {
            id: 16,
            title: "Introduction to Vectors",
            estimatedMinutes: 20,
            completed: false,
            subModules: [
              {
                id: 30,
                title: "Konsep Dasar dan Geometri Vektor",
                progress: 60,
                blocks: [
                  {
                    id: "block-106",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-106",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Apa Itu Vektor dalam Machine Learning?",
                      },
                      {
                        id: "paragraph-142",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Vektor adalah representasi matematis yang memiliki besar (magnitudo) dan arah. Dalam konteks machine learning, vektor sering digunakan untuk merepresentasikan satu data point atau sekumpulan fitur dari suatu objek. Misalnya, dalam dataset prediksi harga rumah, setiap rumah dapat direpresentasikan sebagai vektor yang berisi fitur seperti luas bangunan, jumlah kamar, dan usia bangunan. Dengan demikian, seluruh dataset sebenarnya dapat dipandang sebagai kumpulan vektor di dalam ruang berdimensi tertentu.",
                      },
                      {
                        id: "paragraph-143",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Memahami vektor sangat penting karena hampir semua algoritma machine learning bekerja dengan operasi berbasis vektor dan matriks. Ketika model melakukan perhitungan prediksi, proses tersebut sebenarnya melibatkan operasi linear seperti dot product, transformasi matriks, dan kombinasi linear antar fitur.",
                      },
                      {
                        id: "highlight-27",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Setiap baris data pada dataset dapat dipandang sebagai satu vektor fitur.",
                      },
                    ],
                  },
                  {
                    id: "block-107",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-107",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Geometri Vektor di Ruang Dua dan Tiga Dimensi",
                      },
                      {
                        id: "paragraph-144",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Secara geometris, vektor dapat divisualisasikan sebagai panah yang dimulai dari titik origin (0,0) menuju suatu titik di ruang koordinat. Dalam dua dimensi, vektor direpresentasikan sebagai pasangan (x, y), sedangkan dalam tiga dimensi sebagai (x, y, z). Panjang panah menunjukkan magnitudo, sementara arah panah menunjukkan orientasi vektor tersebut terhadap sumbu koordinat.",
                      },
                      {
                        id: "paragraph-145",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam machine learning berdimensi tinggi, visualisasi langsung mungkin tidak memungkinkan karena data bisa memiliki puluhan hingga ribuan dimensi. Namun secara konsep, prinsip geometrinya tetap sama: setiap fitur menambahkan satu dimensi baru dalam ruang representasi data.",
                      },
                      {
                        id: "accordion-25",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Konsep Geometris Penting",
                        items: [
                          {
                            title: "Origin",
                            content:
                              "Titik awal sistem koordinat (0,0) atau (0,0,0).",
                          },
                          {
                            title: "Magnitudo",
                            content:
                              "Panjang vektor yang dihitung dengan rumus akar jumlah kuadrat komponennya.",
                          },
                          {
                            title: "Arah",
                            content:
                              "Orientasi vektor relatif terhadap sumbu koordinat.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-28",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-28",
                          url: "https://images.unsplash.com/photo-1509228463558-399364a71109?w=400",
                          caption:
                            "Ilustrasi representasi vektor pada bidang koordinat",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-108",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-108",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Operasi Dasar pada Vektor",
                      },
                      {
                        id: "paragraph-146",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Operasi dasar pada vektor meliputi penjumlahan, pengurangan, dan perkalian skalar. Penjumlahan dilakukan dengan menjumlahkan setiap komponen yang bersesuaian. Perkalian skalar dilakukan dengan mengalikan setiap komponen vektor dengan suatu bilangan real. Operasi-operasi ini menjadi fondasi dalam pembentukan model linear seperti regresi linear.",
                      },
                      {
                        id: "paragraph-147",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Selain itu terdapat dot product (perkalian titik) yang menghasilkan nilai skalar. Dot product sangat penting dalam machine learning karena digunakan untuk menghitung proyeksi dan menentukan seberapa sejajar dua vektor. Dalam model linear, proses prediksi sering kali berupa dot product antara vektor fitur dan vektor bobot (weights).",
                      },
                      {
                        id: "contentcard-1",
                        type: "content_card",
                        orderNumber: 4,
                        title: "Ringkasan Operasi Vektor",
                        description: "Operasi fundamental yang wajib dipahami",
                        disableExpandableContent: false,
                        items: [
                          {
                            title: "Penjumlahan",
                            content: "Menjumlahkan komponen sejenis.",
                            expandableContent:
                              "Jika a=(a1,a2) dan b=(b1,b2) maka a+b=(a1+b1,a2+b2).",
                          },
                          {
                            title: "Perkalian Skalar",
                            content: "Mengalikan setiap komponen.",
                            expandableContent:
                              "Jika k adalah skalar maka k·a=(k*a1,k*a2).",
                          },
                          {
                            title: "Dot Product",
                            content: "Menghasilkan nilai skalar.",
                            expandableContent:
                              "a·b = a1*b1 + a2*b2, digunakan dalam prediksi linear.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-32",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-32",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\na = np.array([2, 3])\nb = np.array([4, 1])\n\nprint('Penjumlahan:', a + b)\nprint('Dot Product:', np.dot(a, b))",
                            expectedResult: "Penjumlahan: [6 4]\nDot Product: 11"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-109",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-109",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Vektor sebagai Representasi Data Fitur",
                      },
                      {
                        id: "paragraph-148",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam praktik machine learning, setiap observasi direpresentasikan sebagai vektor fitur. Proses pelatihan model bertujuan untuk menemukan vektor bobot optimal yang dapat memetakan vektor input menjadi prediksi yang akurat. Konsep ini menjadi dasar bagi algoritma seperti regresi linear, logistic regression, hingga neural networks.",
                      },
                      {
                        id: "paragraph-149",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dengan memahami bahwa model bekerja pada operasi vektor, Anda akan lebih mudah memahami bagaimana proses optimisasi seperti gradient descent memperbarui bobot model secara iteratif. Semua pembaruan parameter pada akhirnya merupakan operasi matematis pada vektor dan matriks.",
                      },
                      {
                        id: "summary-25",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Vektor memiliki magnitudo dan arah",
                          "Data ML direpresentasikan sebagai vektor fitur",
                          "Dot product digunakan dalam prediksi linear",
                          "Operasi vektor adalah dasar optimisasi model",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-27",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-27",
                          question:
                            "Mengapa dot product penting dalam machine learning?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Untuk menghitung rata-rata data",
                            },
                            {
                              id: "opt-2",
                              text: "Untuk mengukur kesamaan atau proyeksi antar vektor",
                            },
                            { id: "opt-3", text: "Untuk mengurutkan dataset" },
                            { id: "opt-4", text: "Untuk menghapus outlier" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Dot product digunakan untuk menghitung proyeksi dan menjadi dasar perhitungan model linear.",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 31,
                title: "Dot Product dan Magnitudo",
                progress: 0,
                blocks: [
                  {
                    id: "block-110",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-110",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Memahami Dot Product Secara Mendalam",
                      },
                      {
                        id: "paragraph-150",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dot product atau perkalian titik adalah operasi antara dua vektor yang menghasilkan sebuah nilai skalar. Secara matematis, dot product dihitung dengan mengalikan setiap komponen yang bersesuaian kemudian menjumlahkannya. Jika kita memiliki dua vektor a = (a1, a2, ..., an) dan b = (b1, b2, ..., bn), maka dot product didefinisikan sebagai a1*b1 + a2*b2 + ... + an*bn. Operasi ini terlihat sederhana, namun memiliki makna geometris yang sangat kuat karena berhubungan langsung dengan sudut antara dua vektor.",
                      },
                      {
                        id: "paragraph-151",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam konteks machine learning, dot product sering muncul dalam proses prediksi model linear. Ketika model menghitung hasil prediksi, ia sebenarnya melakukan dot product antara vektor fitur input dan vektor bobot (weights). Nilai yang dihasilkan kemudian bisa diproses lebih lanjut melalui fungsi aktivasi atau digunakan langsung sebagai output prediksi.",
                      },
                      {
                        id: "highlight-28",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Dot product menjadi inti perhitungan pada hampir semua model linear.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-33",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-33",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])\n\ndot_product = np.dot(a, b)\nprint('Dot Product:', dot_product)",
                            expectedResult: "Dot Product: 32"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-111",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-111",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Makna Geometris dan Cosine Similarity",
                      },
                      {
                        id: "paragraph-152",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Secara geometris, dot product dapat dituliskan sebagai hasil perkalian antara magnitudo dua vektor dan cosinus sudut di antara keduanya. Artinya, dot product tidak hanya mempertimbangkan panjang vektor, tetapi juga arah relatifnya. Jika dua vektor sejajar dan mengarah ke arah yang sama, maka dot product bernilai maksimum. Jika keduanya tegak lurus, dot product bernilai nol.",
                      },
                      {
                        id: "paragraph-153",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Konsep ini menjadi dasar dari cosine similarity, yaitu ukuran kemiripan antar dua vektor yang banyak digunakan dalam sistem rekomendasi, pencarian dokumen, dan representasi teks berbasis embedding. Dengan menormalisasi dot product menggunakan magnitudo masing-masing vektor, kita memperoleh nilai antara -1 hingga 1 yang menggambarkan tingkat kesamaan arah kedua vektor.",
                      },
                      {
                        id: "accordion-26",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Interpretasi Nilai Dot Product",
                        items: [
                          {
                            title: "Nilai Positif",
                            content:
                              "Vektor cenderung searah dan memiliki kemiripan tinggi.",
                          },
                          {
                            title: "Nilai Nol",
                            content: "Vektor saling tegak lurus (orthogonal).",
                          },
                          {
                            title: "Nilai Negatif",
                            content: "Vektor berlawanan arah.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-28",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-28",
                          question:
                            "Jika dua vektor memiliki dot product = 0, maka hubungan keduanya adalah:",
                          options: [
                            { id: "opt-1", text: "Sejajar" },
                            { id: "opt-2", text: "Identik" },
                            { id: "opt-3", text: "Tegak lurus (orthogonal)" },
                            { id: "opt-4", text: "Berimpit sebagian" },
                          ],
                          correctAnswers: ["opt-3"],
                          explanation:
                            "Dot product nol menunjukkan sudut 90 derajat antar vektor.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-112",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-112",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Magnitudo dan Euclidean Norm (L2 Norm)",
                      },
                      {
                        id: "paragraph-154",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Magnitudo atau norma sebuah vektor menggambarkan panjang vektor tersebut dalam ruang berdimensi tertentu. Norma yang paling umum digunakan adalah Euclidean Norm atau L2 Norm, yang dihitung dengan mengambil akar dari jumlah kuadrat setiap komponennya. Secara matematis, untuk vektor a = (a1, a2, ..., an), magnitudo dihitung sebagai sqrt(a1^2 + a2^2 + ... + an^2).",
                      },
                      {
                        id: "paragraph-155",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam machine learning, magnitudo sering digunakan dalam proses normalisasi data, regularisasi (seperti L2 regularization), serta dalam perhitungan cosine similarity. Dengan memahami konsep magnitudo, kita dapat mengontrol skala data dan mencegah fitur dengan nilai besar mendominasi proses pelatihan model.",
                      },
                      {
                        id: "contentcard-2",
                        type: "content_card",
                        orderNumber: 4,
                        title: "Ringkasan Konsep Magnitudo",
                        description:
                          "Konsep penting dalam pengukuran panjang vektor",
                        disableExpandableContent: false,
                        items: [
                          {
                            title: "Definisi Magnitudo",
                            content: "Panjang vektor dalam ruang berdimensi n.",
                            expandableContent:
                              "Dihitung menggunakan akar jumlah kuadrat komponen.",
                          },
                          {
                            title: "L2 Norm",
                            content: "Norma paling umum digunakan.",
                            expandableContent:
                              "Sering dipakai dalam regularisasi model ML.",
                          },
                          {
                            title: "Normalisasi",
                            content: "Menyetarakan skala fitur.",
                            expandableContent:
                              "Membagi vektor dengan magnitudonya.",
                          },
                        ],
                      },
                      {
                        id: "summary-26",
                        type: "summary",
                        orderNumber: 5,
                        comments: [
                          "Dot product menghasilkan nilai skalar",
                          "Dot product berkaitan dengan sudut antar vektor",
                          "Cosine similarity berasal dari normalisasi dot product",
                          "Magnitudo dihitung menggunakan L2 Norm",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-29",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-29",
                          url: "https://www.youtube.com/watch?v=fNk_zzaMoBA",
                          caption:
                            "Penjelasan visual mengenai magnitudo vektor",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 17,
            title: "Matrix Operations and Properties",
            estimatedMinutes: 25,
            completed: false,
            subModules: [
              {
                id: 32,
                title: "Matriks sebagai Transformasi Data",
                progress: 0,
                blocks: [
                  {
                    id: "block-113",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-113",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Matriks sebagai Representasi Dataset",
                      },
                      {
                        id: "paragraph-156",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Jika sebelumnya kita memahami bahwa satu observasi direpresentasikan sebagai vektor, maka sekumpulan observasi dalam dataset dapat direpresentasikan sebagai matriks. Setiap baris biasanya merepresentasikan satu data point, sementara setiap kolom merepresentasikan satu fitur. Dengan sudut pandang ini, hampir seluruh dataset machine learning sebenarnya adalah sebuah matriks besar yang berisi angka-angka numerik hasil encoding atau transformasi fitur.",
                      },
                      {
                        id: "paragraph-157",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Pemahaman ini sangat penting karena hampir semua algoritma machine learning modern — mulai dari regresi linear hingga neural networks — melakukan operasi berbasis matriks. Proses training model pada dasarnya adalah manipulasi matriks secara berulang melalui operasi linear dan optimisasi numerik.",
                      },
                      {
                        id: "highlight-29",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Dataset dalam ML pada dasarnya adalah sebuah matriks fitur.",
                      },
                    ],
                  },
                  {
                    id: "block-114",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-114",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Perkalian Matriks dalam Machine Learning",
                      },
                      {
                        id: "paragraph-158",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Perkalian matriks adalah inti dari komputasi dalam neural networks. Dalam forward propagation, matriks input dikalikan dengan matriks bobot untuk menghasilkan output linear sebelum diterapkan fungsi aktivasi. Agar perkalian matriks dapat dilakukan, jumlah kolom matriks pertama harus sama dengan jumlah baris matriks kedua. Ketidaksesuaian dimensi akan menyebabkan error komputasi.",
                      },
                      {
                        id: "paragraph-159",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam praktiknya, framework seperti TensorFlow atau PyTorch melakukan operasi ini secara sangat efisien menggunakan optimisasi berbasis GPU. Namun secara konsep, operasi tersebut tetaplah perkalian matriks biasa yang mengikuti aturan aljabar linear.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-34",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-34",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\n\nresult = np.matmul(A, B)\nprint('Hasil Perkalian Matriks:\\n', result)",
                            expectedResult: "Hasil Perkalian Matriks:\n [[19 22]\n [43 50]]"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-115",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-115",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Transpose dan Penyesuaian Dimensi",
                      },
                      {
                        id: "paragraph-160",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Transpose matriks adalah operasi menukar baris menjadi kolom. Jika matriks berukuran m x n, maka setelah ditranspose ukurannya menjadi n x m. Operasi ini sangat sering digunakan dalam machine learning untuk menyesuaikan dimensi sebelum melakukan perkalian matriks.",
                      },
                      {
                        id: "paragraph-161",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Selain untuk penyesuaian dimensi, transpose juga digunakan dalam perhitungan gradien pada optimisasi, terutama dalam algoritma seperti gradient descent dan backpropagation. Banyak rumus turunan parsial dalam neural networks melibatkan transpose matriks.",
                      },
                      {
                        id: "accordion-27",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Kapan Transpose Digunakan?",
                        items: [
                          {
                            title: "Penyesuaian Dimensi",
                            content:
                              "Agar dua matriks kompatibel untuk dikalikan.",
                          },
                          {
                            title: "Perhitungan Gradien",
                            content: "Digunakan dalam backpropagation.",
                          },
                          {
                            title: "Representasi Data",
                            content: "Mengubah perspektif baris menjadi kolom.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-35",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-35",
                          language: "python",
                          initialCode:
                            "A = np.array([[1, 2, 3], [4, 5, 6]])\nprint('Transpose A:\\n', A.T)",
                            expectedResult: "Transpose A:\n [[1 4]\n [2 5]\n [3 6]]"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-116",
                    orderNumber: 4,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-116",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Matriks Identitas, Determinan, dan Invers",
                      },
                      {
                        id: "paragraph-162",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Matriks identitas adalah matriks persegi yang memiliki nilai 1 pada diagonal utama dan 0 pada elemen lainnya. Jika suatu matriks dikalikan dengan matriks identitas yang sesuai ukurannya, hasilnya tetap matriks semula. Konsep ini mirip dengan angka 1 dalam operasi perkalian bilangan real.",
                      },
                      {
                        id: "paragraph-163",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Determinan adalah nilai skalar yang dihitung dari matriks persegi dan memberikan informasi penting mengenai sifat matriks tersebut. Jika determinan bernilai nol, maka matriks tidak memiliki invers dan sistem persamaan linear yang diwakilinya tidak memiliki solusi unik.",
                      },
                      {
                        id: "paragraph-164",
                        type: "paragraph",
                        orderNumber: 4,
                        text: "Invers matriks digunakan untuk menyelesaikan sistem persamaan linear dalam bentuk AX = B. Jika matriks A memiliki invers, maka solusi dapat diperoleh dengan mengalikan kedua sisi dengan A inverse. Dalam machine learning, konsep invers sering muncul dalam solusi analitik regresi linear.",
                      },
                      {
                        id: "summary-27",
                        type: "summary",
                        orderNumber: 5,
                        comments: [
                          "Matriks merepresentasikan seluruh dataset",
                          "Perkalian matriks inti neural networks",
                          "Transpose digunakan untuk penyesuaian dimensi",
                          "Determinan menentukan keberadaan invers",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-30",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-30",
                          url: "https://images.unsplash.com/photo-1509228463558-399364a71109?w=400",
                          caption: "Ilustrasi abstrak konsep aljabar linear",
                        },
                      },
                      {
                        id: "mcq-29",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-29",
                          question:
                            "Kapan sebuah matriks tidak memiliki invers?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Ketika matriks bukan persegi",
                            },
                            {
                              id: "opt-2",
                              text: "Ketika determinan bernilai nol",
                            },
                            {
                              id: "opt-3",
                              text: "Ketika semua elemen bernilai positif",
                            },
                            {
                              id: "opt-4",
                              text: "Ketika matriks memiliki transpose",
                            },
                          ],
                          correctAnswers: ["opt-1", "opt-2"],
                          explanation:
                            "Hanya matriks persegi yang bisa memiliki invers, dan determinannya harus tidak nol.",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 18,
            title: "Dot Product and Matrix Multiplication",
            estimatedMinutes: 20,
            completed: false,
            subModules: [
              {
                id: 33,
                title: "Struktur Lanjutan Dot Product dalam Model Linear",
                progress: 0,
                blocks: [
                  {
                    id: "block-117",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-117",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Dot Product sebagai Weighted Sum",
                      },
                      {
                        id: "paragraph-165",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dot product bukan sekadar operasi matematis sederhana, melainkan fondasi dari hampir seluruh model linear dalam machine learning. Ketika sebuah model menerima input berupa sekumpulan fitur numerik, setiap fitur tersebut akan dikalikan dengan bobot tertentu yang merepresentasikan tingkat kepentingannya. Proses ini menghasilkan weighted sum — sebuah kombinasi linear dari seluruh fitur yang dirancang untuk menangkap pola dalam data. Secara konseptual, dot product mengubah sekumpulan angka mentah menjadi satu nilai representatif yang dapat digunakan untuk pengambilan keputusan, baik dalam klasifikasi maupun regresi.",
                      },
                      {
                        id: "paragraph-166",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam regresi linear, nilai prediksi diperoleh dari dot product antara vektor fitur dan vektor bobot, kemudian ditambahkan dengan bias. Pada neural networks, mekanisme yang sama terjadi pada setiap neuron. Artinya, seluruh jaringan saraf pada dasarnya hanyalah tumpukan operasi dot product yang disusun secara bertingkat, lalu diproses melalui fungsi aktivasi untuk menciptakan non-linearitas.",
                      },
                      {
                        id: "highlight-30",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Setiap neuron pada neural network melakukan satu operasi dot product.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-36",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-36",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\n# vektor fitur dan bobot\nx = np.array([2.0, 1.5, -3.0])\nw = np.array([0.5, -1.0, 2.0])\nbias = 0.7\n\nprediction = np.dot(x, w) + bias\nprint('Hasil weighted sum:', prediction)",
                            expectedResult: "Hasil weighted sum: -5.8"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-118",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-118",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Interpretasi Geometris dalam Ruang Fitur",
                      },
                      {
                        id: "paragraph-167",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Secara geometris, dot product dapat dipahami sebagai ukuran seberapa sejajar dua vektor dalam ruang berdimensi n. Jika vektor fitur dan vektor bobot memiliki arah yang mirip, maka hasil dot product akan besar dan positif. Jika keduanya berlawanan arah, nilainya menjadi negatif. Jika tegak lurus, kontribusi salah satu terhadap yang lain menjadi nol. Dalam konteks klasifikasi, hal ini berarti model sebenarnya sedang mengukur seberapa dekat suatu data terhadap arah tertentu dalam ruang fitur.",
                      },
                      {
                        id: "paragraph-168",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Interpretasi ini membantu kita memahami hyperplane dalam klasifikasi linear. Hyperplane adalah batas keputusan yang didefinisikan oleh persamaan berbasis dot product. Ketika hasil dot product sama dengan nol, titik tersebut berada tepat di batas keputusan. Jika positif atau negatif, titik berada di salah satu sisi hyperplane tersebut.",
                      },
                      {
                        id: "accordion-28",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Makna Nilai Dot Product dalam Klasifikasi",
                        items: [
                          {
                            title: "Nilai Positif",
                            content: "Data berada di sisi kelas positif.",
                          },
                          {
                            title: "Nilai Nol",
                            content: "Data tepat pada hyperplane keputusan.",
                          },
                          {
                            title: "Nilai Negatif",
                            content: "Data berada di sisi kelas negatif.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-30",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-30",
                          question:
                            "Apa arti dot product bernilai besar dan positif dalam model klasifikasi linear?",
                          options: [
                            { id: "opt-1", text: "Data jauh dari semua kelas" },
                            {
                              id: "opt-2",
                              text: "Data sejajar dengan arah bobot model",
                            },
                            {
                              id: "opt-3",
                              text: "Model mengalami overfitting",
                            },
                            { id: "opt-4", text: "Bobot bernilai nol" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Nilai besar dan positif menunjukkan arah fitur selaras dengan arah bobot.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-119",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-119",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Stabilitas Numerik dan Skala Fitur",
                      },
                      {
                        id: "paragraph-169",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Meskipun dot product tampak sederhana, dalam praktik nyata terdapat tantangan numerik yang perlu diperhatikan. Jika skala fitur sangat berbeda, maka fitur dengan nilai besar dapat mendominasi hasil dot product dan menyebabkan model menjadi bias terhadap fitur tersebut. Oleh karena itu, teknik normalisasi dan standardisasi sering diterapkan sebelum proses pelatihan model.",
                      },
                      {
                        id: "paragraph-170",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Selain itu, pada dataset berdimensi sangat tinggi seperti pada representasi teks berbasis embedding, dot product dapat menghasilkan nilai yang sangat besar sehingga memengaruhi stabilitas komputasi. Di sinilah cosine similarity menjadi alternatif yang lebih stabil karena mempertimbangkan arah tanpa terlalu dipengaruhi panjang vektor.",
                      },
                      {
                        id: "tabnav-1",
                        type: "tab_navigation",
                        orderNumber: 4,
                        title: "Strategi Mengatasi Dominasi Skala",
                        tabs: [
                          {
                            title: "Normalisasi",
                            content:
                              "Membagi setiap fitur dengan magnitudonya agar skala seragam.",
                          },
                          {
                            title: "Standardisasi",
                            content:
                              "Mengurangi mean dan membagi dengan standar deviasi.",
                          },
                          {
                            title: "Regularisasi",
                            content:
                              "Membatasi besarnya bobot agar model tidak ekstrem.",
                          },
                        ],
                      },
                      {
                        id: "summary-28",
                        type: "summary",
                        orderNumber: 5,
                        comments: [
                          "Dot product menghasilkan weighted sum",
                          "Interpretasi geometris berkaitan dengan hyperplane",
                          "Setiap neuron melakukan dot product",
                          "Normalisasi penting untuk stabilitas numerik",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-1",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "matching-1-content",
                          question: "Cocokkan konsep dengan deskripsinya:",
                          leftItems: [
                            { id: "l1", text: "Dot Product" },
                            { id: "l2", text: "Hyperplane" },
                            { id: "l3", text: "Normalisasi" },
                          ],
                          rightItems: [
                            {
                              id: "r1",
                              text: "Batas keputusan dalam klasifikasi",
                            },
                            { id: "r2", text: "Menghasilkan weighted sum" },
                            { id: "r3", text: "Menyetarakan skala fitur" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r2" },
                            { leftId: "l2", rightId: "r1" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 34,
                title: "Perkalian Matriks Lanjutan dalam Sistem Linear",
                progress: 0,
                blocks: [
                  {
                    id: "block-120",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-120",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Struktur Fundamental Perkalian Matriks",
                      },
                      {
                        id: "paragraph-171",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Perkalian matriks pada dasarnya adalah kumpulan operasi dot product yang dilakukan secara sistematis antara setiap baris matriks pertama dan setiap kolom matriks kedua. Setiap elemen pada matriks hasil merupakan representasi hubungan linear antara dua dimensi berbeda. Oleh karena itu, memahami perkalian matriks berarti memahami bagaimana informasi diproyeksikan dari satu ruang ke ruang lain.",
                      },
                      {
                        id: "paragraph-172",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Jika matriks A berukuran m x n dan matriks B berukuran n x p, maka hasil perkalian AB akan berukuran m x p. Dimensi dalam (n) harus sama agar operasi dapat dilakukan. Konsep ini bukan sekadar aturan teknis, tetapi mencerminkan bahwa jumlah fitur pada representasi pertama harus kompatibel dengan jumlah parameter pada representasi kedua.",
                      },
                      {
                        id: "highlight-31",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Perkalian matriks = serangkaian dot product antar baris dan kolom.",
                      },
                    ],
                  },
                  {
                    id: "block-121",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-121",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Non-Komutatif dan Implikasinya",
                      },
                      {
                        id: "paragraph-173",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Salah satu sifat penting dari perkalian matriks adalah tidak komutatif. Artinya, A × B hampir selalu berbeda dengan B × A. Bahkan dalam banyak kasus, salah satu urutan tersebut tidak terdefinisi karena ketidaksesuaian dimensi. Dalam machine learning, hal ini berarti urutan layer pada neural network sangat menentukan hasil akhir. Mengubah urutan transformasi dapat menghasilkan representasi fitur yang sepenuhnya berbeda.",
                      },
                      {
                        id: "paragraph-174",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Sifat ini juga menjelaskan mengapa arsitektur model memiliki peran besar dalam performa. Dua model dengan komponen yang sama tetapi susunan berbeda dapat menghasilkan perilaku yang sangat kontras. Secara matematis, urutan transformasi linear menentukan arah proyeksi dalam ruang vektor.",
                      },
                      {
                        id: "accordion-29",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Mengapa Tidak Komutatif Penting?",
                        items: [
                          {
                            title: "Urutan Layer",
                            content:
                              "Mengubah urutan layer mengubah hasil representasi.",
                          },
                          {
                            title: "Transformasi Berantai",
                            content:
                              "Setiap transformasi mempengaruhi transformasi berikutnya.",
                          },
                          {
                            title: "Dimensi Berbeda",
                            content: "Sering kali B × A tidak terdefinisi.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-37",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-37",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\n\nprint('A x B:\\n', np.dot(A, B))\nprint('B x A:\\n', np.dot(B, A))",
                            expectedResult: "A x B:\n [[19 22]\n [43 50]]\nB x A:\n [[23 34]\n [31 46]]"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-122",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-122",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Perkalian Matriks dalam Transformasi Geometris",
                      },
                      {
                        id: "paragraph-175",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam computer vision dan image processing, perkalian matriks digunakan untuk melakukan transformasi seperti rotasi, refleksi, scaling, dan shear. Setiap transformasi dapat direpresentasikan sebagai matriks tertentu yang ketika dikalikan dengan koordinat titik-titik gambar, akan menghasilkan posisi baru dalam ruang dua atau tiga dimensi.",
                      },
                      {
                        id: "paragraph-176",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Konsep ini meluas pada deep learning, khususnya pada convolutional neural networks, di mana operasi filter dapat dipandang sebagai bentuk khusus dari perkalian matriks terstruktur. Dengan demikian, pemahaman perkalian matriks bukan hanya relevan untuk teori aljabar linear, tetapi juga untuk implementasi praktis pada sistem AI modern.",
                      },
                      {
                        id: "carousel-1",
                        type: "carousel",
                        orderNumber: 4,
                        title: "Contoh Transformasi Geometris",
                        description:
                          "Berbagai transformasi yang direpresentasikan oleh matriks.",
                        cardsPerSlide: 2,
                        items: [
                          {
                            title: "Rotasi",
                            content: "Memutar objek terhadap titik pusat.",
                          },
                          {
                            title: "Scaling",
                            content:
                              "Mengubah ukuran objek secara proporsional.",
                          },
                          {
                            title: "Refleksi",
                            content:
                              "Mencerminkan objek terhadap sumbu tertentu.",
                          },
                          {
                            title: "Shear",
                            content: "Menggeser bentuk tanpa mengubah luas.",
                          },
                        ],
                      },
                      {
                        id: "summary-29",
                        type: "summary",
                        orderNumber: 5,
                        comments: [
                          "Perkalian matriks berbasis dot product",
                          "Dimensi dalam harus cocok",
                          "Tidak komutatif dan urutan penting",
                          "Digunakan dalam transformasi geometris",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-31",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-31",
                          url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
                          caption:
                            "Visualisasi transformasi geometris berbasis matriks",
                        },
                      },
                      {
                        id: "mcq-31",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-31",
                          question:
                            "Mengapa A × B tidak selalu sama dengan B × A?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Karena matriks selalu simetris",
                            },
                            {
                              id: "opt-2",
                              text: "Karena perkalian matriks tidak komutatif",
                            },
                            {
                              id: "opt-3",
                              text: "Karena dot product bernilai nol",
                            },
                            {
                              id: "opt-4",
                              text: "Karena determinan selalu negatif",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Perkalian matriks memiliki sifat tidak komutatif.",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            // ===============================
            // QUIZ (Updated - Mixed Single & Multiple Answers)
            // ===============================
            quiz: {
              id: 501,
              title: "Quiz: Linear Algebra Foundations for Machine Learning",
              description:
                "Quiz ini menguji pemahaman Anda tentang konsep vektor, dot product, matriks, serta penerapannya dalam Machine Learning.",
              totalQuestions: 8,
              timeLimitMinutes: 15,

              questions: [
                {
                  id: 5011,
                  orderNumber: 1,
                  textQuestion:
                    "Dalam konteks Machine Learning, vektor biasanya digunakan untuk merepresentasikan?",
                  options: [
                    "Satu observasi dengan sekumpulan fitur",
                    "Parameter model dalam bentuk bobot",
                    "Seluruh dataset dalam satu struktur",
                    "Embedding teks atau gambar",
                    "Learning rate",
                  ],
                  correctAnswers: [
                    "Satu observasi dengan sekumpulan fitur",
                    "Parameter model dalam bentuk bobot",
                    "Embedding teks atau gambar",
                  ],
                  explanation:
                    "Vektor bisa merepresentasikan data observasi, parameter (weights), maupun embedding dalam ML.",
                },

                {
                  id: 5012,
                  orderNumber: 2,
                  textQuestion:
                    "Secara geometris, magnitudo (norma) sebuah vektor merepresentasikan?",
                  options: [
                    "Arah vektor",
                    "Panjang atau besar vektor",
                    "Sudut antar dua vektor",
                    "Dimensi ruang",
                  ],
                  correctAnswers: ["Panjang atau besar vektor"],
                  explanation:
                    "Magnitudo menggambarkan panjang vektor dalam ruang koordinat.",
                },

                {
                  id: 5013,
                  orderNumber: 3,
                  textQuestion:
                    "Manakah pernyataan yang BENAR tentang dot product?",
                  options: [
                    "Menghasilkan nilai skalar",
                    "Mengukur kesamaan arah dua vektor",
                    "Selalu menghasilkan vektor baru",
                    "Bernilai nol jika vektor orthogonal",
                    "Digunakan dalam perhitungan weighted sum",
                  ],
                  correctAnswers: [
                    "Menghasilkan nilai skalar",
                    "Mengukur kesamaan arah dua vektor",
                    "Bernilai nol jika vektor orthogonal",
                    "Digunakan dalam perhitungan weighted sum",
                  ],
                  explanation:
                    "Dot product menghasilkan skalar, bisa mengukur kesamaan arah, bernilai nol jika orthogonal, dan digunakan dalam neural network.",
                },

                {
                  id: 5014,
                  orderNumber: 4,
                  textQuestion:
                    "Jika dua vektor memiliki dot product bernilai nol, maka keduanya bersifat?",
                  options: [
                    "Sejajar",
                    "Orthogonal",
                    "Linear dependent",
                    "Tegak lurus (90 derajat)",
                  ],
                  correctAnswers: ["Orthogonal", "Tegak lurus (90 derajat)"],
                  explanation:
                    "Dot product nol berarti sudut antar vektor 90 derajat (orthogonal).",
                },

                {
                  id: 5015,
                  orderNumber: 5,
                  textQuestion:
                    "Dalam representasi dataset untuk Machine Learning, matriks biasanya menggambarkan?",
                  options: [
                    "Satu fitur saja",
                    "Sekumpulan observasi dan fitur",
                    "Seluruh dataset dalam bentuk tabel",
                    "Parameter model",
                  ],
                  correctAnswers: [
                    "Sekumpulan observasi dan fitur",
                    "Seluruh dataset dalam bentuk tabel",
                  ],
                  explanation:
                    "Dataset umumnya direpresentasikan sebagai matriks dengan baris = observasi dan kolom = fitur.",
                },

                {
                  id: 5016,
                  orderNumber: 6,
                  textQuestion:
                    "Syarat agar dua matriks A (m×n) dan B (p×q) dapat dikalikan adalah?",
                  options: [
                    "m = p",
                    "n = p",
                    "Jumlah kolom A sama dengan jumlah baris B",
                    "Kedua matriks harus persegi",
                  ],
                  correctAnswers: [
                    "n = p",
                    "Jumlah kolom A sama dengan jumlah baris B",
                  ],
                  explanation:
                    "Perkalian matriks valid jika dimensi dalam sama (n = p).",
                },

                {
                  id: 5017,
                  orderNumber: 7,
                  textQuestion:
                    "Manakah pernyataan yang BENAR mengenai perkalian matriks?",
                  options: [
                    "Bersifat komutatif (A × B = B × A)",
                    "Umumnya tidak komutatif",
                    "Bergantung pada urutan",
                    "Selalu menghasilkan matriks identitas",
                    "Bisa berbeda hasil jika urutan diubah",
                  ],
                  correctAnswers: [
                    "Umumnya tidak komutatif",
                    "Bergantung pada urutan",
                    "Bisa berbeda hasil jika urutan diubah",
                  ],
                  explanation:
                    "Perkalian matriks tidak komutatif dan sangat bergantung pada urutan operasinya.",
                },

                {
                  id: 5018,
                  orderNumber: 8,
                  textQuestion:
                    "Dalam neural network, operasi yang umum digunakan dalam perhitungan layer adalah?",
                  options: [
                    "Dot product",
                    "Penjumlahan bias",
                    "Determinant matriks",
                    "Transpose matriks",
                    "Weighted sum",
                  ],
                  correctAnswers: [
                    "Dot product",
                    "Penjumlahan bias",
                    "Weighted sum",
                  ],
                  explanation:
                    "Perhitungan neuron melibatkan weighted sum (dot product + bias).",
                },
              ],
            },
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 6,
        coverImage:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200",
        title: "Descriptive Statistics",
        description:
          "Mempelajari cara meringkas dan mendeskripsikan data menggunakan statistik dasar.",
        taskType: "quiz",
        modules: [
          {
            id: 19,
            title: "Mean, Median, and Mode",
            estimatedMinutes: 15,
            completed: false,
            subModules: [
              {
                id: 35,
                title: "Variansi dan Standar Deviasi",
                progress: 0,
                blocks: [
                  {
                    id: "block-123",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-123",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Mengapa Ukuran Penyebaran Itu Penting?",
                      },
                      {
                        id: "paragraph-177",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah memahami ukuran pemusatan seperti mean, median, dan mode, langkah berikutnya dalam statistik deskriptif adalah memahami bagaimana data menyebar. Dua dataset dapat memiliki mean yang sama namun memiliki pola distribusi yang sangat berbeda. Inilah mengapa ukuran penyebaran menjadi krusial. Ukuran penyebaran membantu kita memahami seberapa jauh nilai-nilai dalam dataset menyimpang dari pusatnya, dan memberikan gambaran tentang stabilitas, konsistensi, serta risiko dalam pengambilan keputusan berbasis data.",
                      },
                      {
                        id: "paragraph-178",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam konteks analisis data modern, khususnya pada data science dan machine learning, memahami variasi data membantu dalam mendeteksi anomali, mengevaluasi performa model, serta menentukan apakah suatu perubahan signifikan atau hanya fluktuasi biasa. Tanpa ukuran penyebaran, interpretasi terhadap mean bisa menjadi menyesatkan karena tidak memberikan informasi tentang distribusi nilai secara keseluruhan.",
                      },
                      {
                        id: "highlight-32",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Mean memberi pusat, variansi memberi konteks penyebaran.",
                      },
                    ],
                  },
                  {
                    id: "block-124",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-124",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Variansi: Mengukur Penyimpangan Kuadrat",
                      },
                      {
                        id: "paragraph-179",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Variansi adalah ukuran statistik yang menghitung rata-rata kuadrat selisih antara setiap nilai data dengan mean-nya. Dengan mengkuadratkan selisih tersebut, kita memastikan bahwa semua nilai menjadi positif dan deviasi besar mendapatkan bobot lebih besar. Variansi populasi dihitung dengan membagi jumlah kuadrat deviasi dengan jumlah seluruh data, sedangkan variansi sampel membaginya dengan n-1 untuk mengurangi bias estimasi.",
                      },
                      {
                        id: "paragraph-180",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Meskipun variansi memberikan informasi penting, satu kelemahannya adalah satuannya menjadi kuadrat dari satuan asli data. Jika data diukur dalam meter, maka variansi diukur dalam meter kuadrat. Oleh karena itu, interpretasinya sering kali kurang intuitif dibandingkan ukuran lain seperti standar deviasi.",
                      },
                      {
                        id: "accordion-30",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Perbedaan Variansi Populasi vs Sampel",
                        items: [
                          {
                            title: "Variansi Populasi",
                            content: "Dibagi dengan jumlah seluruh data (N).",
                          },
                          {
                            title: "Variansi Sampel",
                            content:
                              "Dibagi dengan N-1 untuk estimasi tidak bias.",
                          },
                          {
                            title: "Tujuan Koreksi N-1",
                            content: "Mengurangi bias dalam estimasi populasi.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-38",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-38",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\ndata = np.array([10, 12, 11, 13, 15])\nprint('Variansi Populasi:', np.var(data))\nprint('Variansi Sampel:', np.var(data, ddof=1))",
                            expectedResult: "Variansi Populasi: 2.96\nVariansi Sampel: 3.7"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-125",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-125",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Standar Deviasi: Akar dari Variansi",
                      },
                      {
                        id: "paragraph-181",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Standar deviasi adalah akar kuadrat dari variansi. Dengan mengambil akar, satuan kembali ke satuan asli data, sehingga lebih mudah diinterpretasikan. Standar deviasi menunjukkan seberapa jauh rata-rata penyimpangan data dari mean. Semakin besar standar deviasi, semakin tersebar data tersebut; semakin kecil nilainya, semakin terkonsentrasi data di sekitar mean.",
                      },
                      {
                        id: "paragraph-182",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam praktik analisis data, standar deviasi sering digunakan untuk mengukur volatilitas, risiko, dan konsistensi performa. Pada distribusi normal, sekitar 68% data berada dalam rentang satu standar deviasi dari mean, dan sekitar 95% berada dalam dua standar deviasi. Aturan empiris ini menjadi dasar banyak metode statistik inferensial.",
                      },
                      {
                        id: "contentcard-3",
                        type: "content_card",
                        orderNumber: 4,
                        title: "Ringkasan Ukuran Penyebaran",
                        description: "Konsep inti variansi dan standar deviasi",
                        disableExpandableContent: false,
                        items: [
                          {
                            title: "Variansi",
                            content: "Rata-rata kuadrat deviasi dari mean.",
                            expandableContent:
                              "Menggunakan pembagian N atau N-1.",
                          },
                          {
                            title: "Standar Deviasi",
                            content: "Akar kuadrat variansi.",
                            expandableContent:
                              "Satuan kembali ke bentuk asli data.",
                          },
                          {
                            title: "Interpretasi",
                            content: "Semakin besar, semakin tersebar.",
                            expandableContent:
                              "Berguna untuk risiko dan volatilitas.",
                          },
                        ],
                      },
                      {
                        id: "summary-30",
                        type: "summary",
                        orderNumber: 5,
                        comments: [
                          "Ukuran penyebaran melengkapi mean",
                          "Variansi menggunakan deviasi kuadrat",
                          "Standar deviasi lebih mudah diinterpretasi",
                          "Digunakan dalam analisis risiko dan performa",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-32",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-32",
                          question:
                            "Mengapa standar deviasi lebih sering digunakan dibanding variansi?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Karena nilainya selalu lebih kecil",
                            },
                            {
                              id: "opt-2",
                              text: "Karena satuannya kembali ke satuan asli data",
                            },
                            {
                              id: "opt-3",
                              text: "Karena tidak menggunakan mean",
                            },
                            { id: "opt-4", text: "Karena selalu bernilai nol" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Standar deviasi memiliki satuan yang sama dengan data aslinya.",
                        },
                      },
                      {
                        id: "image-32",
                        type: "image_video",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "media-32",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Ilustrasi distribusi data dan penyebarannya",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 20,
            title: "Variance and Standard Deviation",
            estimatedMinutes: 20,
            completed: false,
            subModules: [
              {
                id: 36,
                title: "Range, Interquartile Range, dan Distribusi Data",
                progress: 0,
                blocks: [
                  {
                    id: "block-126",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-126",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Range: Ukuran Penyebaran Paling Sederhana",
                      },
                      {
                        id: "paragraph-183",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Range adalah ukuran penyebaran paling sederhana yang dihitung dengan mengurangkan nilai minimum dari nilai maksimum dalam suatu dataset. Meskipun terlihat sangat dasar, range memberikan gambaran awal mengenai seberapa lebar rentang data tersebut. Namun, karena hanya mempertimbangkan dua nilai ekstrem, range sangat sensitif terhadap outlier dan tidak mencerminkan distribusi keseluruhan data.",
                      },
                      {
                        id: "paragraph-184",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Sebagai contoh, jika sebagian besar nilai berada di antara 50 hingga 60 tetapi terdapat satu nilai 200, maka range akan menjadi sangat besar dan memberi kesan bahwa data sangat tersebar, padahal kenyataannya mayoritas data cukup terkonsentrasi. Oleh karena itu, range biasanya digunakan sebagai indikator awal sebelum analisis lanjutan dilakukan.",
                      },
                      {
                        id: "highlight-33",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Range hanya melihat dua titik: maksimum dan minimum.",
                      },
                    ],
                  },
                  {
                    id: "block-127",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-127",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Interquartile Range (IQR) dan Kuartil",
                      },
                      {
                        id: "paragraph-185",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Interquartile Range (IQR) adalah selisih antara kuartil ketiga (Q3) dan kuartil pertama (Q1). IQR mengukur penyebaran 50% data tengah, sehingga lebih tahan terhadap outlier dibandingkan range. Kuartil membagi data yang telah diurutkan menjadi empat bagian sama besar, memberikan perspektif yang lebih rinci tentang distribusi nilai.",
                      },
                      {
                        id: "paragraph-186",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Karena IQR hanya fokus pada bagian tengah distribusi, ia sering digunakan dalam analisis eksploratif untuk mendeteksi pencilan. Nilai yang berada di bawah Q1 - 1.5×IQR atau di atas Q3 + 1.5×IQR biasanya dianggap sebagai outlier. Metode ini menjadi dasar dalam pembuatan boxplot dan analisis robust statistics.",
                      },
                      {
                        id: "accordion-31",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Komponen Kuartil",
                        items: [
                          {
                            title: "Q1",
                            content: "Kuartil pertama (25% data terbawah).",
                          },
                          {
                            title: "Q2",
                            content: "Median (50% titik tengah data).",
                          },
                          {
                            title: "Q3",
                            content: "Kuartil ketiga (75% data terbawah).",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-39",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-39",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\ndata = np.array([10, 12, 11, 13, 15, 18, 20])\nQ1 = np.percentile(data, 25)\nQ3 = np.percentile(data, 75)\nIQR = Q3 - Q1\nprint('Q1:', Q1)\nprint('Q3:', Q3)\nprint('IQR:', IQR)",
                            expectedResult: "Q1: 11.5\nQ3: 16.5\nIQR: 5.0"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-128",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-128",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Boxplot dan Visualisasi Distribusi",
                      },
                      {
                        id: "paragraph-187",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Boxplot adalah representasi visual dari distribusi data berdasarkan lima angka penting: minimum, Q1, median, Q3, dan maksimum. Visualisasi ini membantu kita melihat penyebaran, kemiringan distribusi (skewness), serta keberadaan outlier secara cepat. Dalam satu grafik sederhana, kita bisa memahami karakteristik utama dataset tanpa perlu melihat setiap nilai individual.",
                      },
                      {
                        id: "paragraph-188",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam praktik data science, boxplot sering digunakan dalam tahap eksplorasi awal (Exploratory Data Analysis / EDA). Visualisasi ini sangat membantu dalam membandingkan distribusi antar kelompok data, misalnya membandingkan performa beberapa model atau distribusi nilai antar kategori. Dengan boxplot, perbedaan pola distribusi dapat terlihat secara intuitif.",
                      },
                      {
                        id: "tabnav-2",
                        type: "tab_navigation",
                        orderNumber: 4,
                        title: "Perbandingan Ukuran Penyebaran",
                        description:
                          "Kelebihan dan kelemahan masing-masing ukuran.",
                        tabs: [
                          {
                            title: "Range",
                            content:
                              "Sederhana namun sangat sensitif terhadap outlier.",
                          },
                          {
                            title: "IQR",
                            content:
                              "Fokus pada 50% data tengah dan lebih robust.",
                          },
                          {
                            title: "Standar Deviasi",
                            content:
                              "Mempertimbangkan seluruh data dan umum digunakan.",
                          },
                        ],
                      },
                      {
                        id: "summary-31",
                        type: "summary",
                        orderNumber: 5,
                        comments: [
                          "Range mudah dihitung namun sensitif outlier",
                          "IQR lebih robust dan fokus pada data tengah",
                          "Boxplot membantu visualisasi distribusi",
                          "Ukuran penyebaran penting dalam EDA",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-33",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-33",
                          question:
                            "Mengapa IQR lebih tahan terhadap outlier dibandingkan range?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Karena menggunakan seluruh data",
                            },
                            {
                              id: "opt-2",
                              text: "Karena hanya mempertimbangkan nilai maksimum",
                            },
                            {
                              id: "opt-3",
                              text: "Karena fokus pada 50% data tengah",
                            },
                            {
                              id: "opt-4",
                              text: "Karena selalu bernilai lebih kecil",
                            },
                          ],
                          correctAnswers: ["opt-3"],
                          explanation:
                            "IQR hanya menggunakan Q1 dan Q3 sehingga lebih robust.",
                        },
                      },
                      {
                        id: "image-33",
                        type: "image_video",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "media-33",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Contoh visualisasi distribusi menggunakan boxplot",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 21,
            title: "Data Distributions and Outliers",
            estimatedMinutes: 25,
            completed: false,
            subModules: [
              {
                id: 37,
                title: "Distribusi Normal, Skewness, dan Outlier Lanjutan",
                progress: 0,
                blocks: [
                  {
                    id: "block-129",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-129",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Konsep Fundamental Distribusi Normal",
                      },
                      {
                        id: "paragraph-189",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Distribusi normal adalah salah satu distribusi probabilitas paling penting dalam statistik dan data science. Bentuknya yang menyerupai lonceng simetris membuatnya sering disebut sebagai bell curve. Pada distribusi ini, nilai rata-rata (mean), median, dan modus berada pada titik yang sama di pusat distribusi. Karakteristik utama distribusi normal adalah simetri sempurna terhadap mean serta penurunan frekuensi yang gradual ketika bergerak menjauhi pusat. Banyak fenomena alam, seperti tinggi badan, kesalahan pengukuran, dan variasi biologis, secara empiris mendekati distribusi ini.",
                      },
                      {
                        id: "paragraph-190",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Distribusi normal juga memiliki aturan empiris 68-95-99.7, yang menyatakan bahwa sekitar 68% data berada dalam satu standar deviasi dari mean, 95% dalam dua standar deviasi, dan 99.7% dalam tiga standar deviasi. Aturan ini sangat membantu dalam memahami probabilitas tanpa perlu menghitung integral distribusi secara eksplisit. Dalam machine learning, asumsi normalitas sering digunakan dalam algoritma seperti Gaussian Naive Bayes dan berbagai metode statistik parametrik.",
                      },
                      {
                        id: "highlight-34",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Pada distribusi normal: mean = median = modus.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-34",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-34",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption:
                            "Visualisasi kurva distribusi normal (bell curve)",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-130",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-130",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Skewness: Ketidaksimetrian Distribusi",
                      },
                      {
                        id: "paragraph-191",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Tidak semua data mengikuti distribusi normal. Banyak dataset menunjukkan kemiringan atau skewness, yaitu kondisi ketika distribusi tidak simetris. Skewness positif (right-skewed) terjadi ketika ekor distribusi lebih panjang di sisi kanan, biasanya disebabkan oleh adanya nilai ekstrem yang tinggi. Sebaliknya, skewness negatif (left-skewed) terjadi ketika ekor lebih panjang di sisi kiri. Dalam kondisi ini, mean, median, dan modus tidak lagi berada pada titik yang sama.",
                      },
                      {
                        id: "paragraph-192",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Skewness penting dalam analisis data karena mempengaruhi pemilihan metode statistik dan model machine learning. Beberapa algoritma parametrik mengasumsikan normalitas, sehingga distribusi yang sangat skewed dapat menyebabkan performa model menurun. Dalam praktiknya, transformasi seperti log transformation atau Box-Cox transformation sering digunakan untuk mengurangi skewness dan membuat distribusi lebih mendekati normal.",
                      },
                      {
                        id: "accordion-32",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Jenis Skewness",
                        items: [
                          {
                            title: "Skewness Positif",
                            content: "Ekor panjang di kanan, mean > median.",
                          },
                          {
                            title: "Skewness Negatif",
                            content: "Ekor panjang di kiri, mean < median.",
                          },
                          {
                            title: "Simetris",
                            content: "Distribusi seimbang di sekitar mean.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-40",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-40",
                          language: "python",
                          initialCode:
                            "import numpy as np\nimport scipy.stats as stats\n\n# Generate skewed data\ndata = stats.skewnorm.rvs(a=10, size=1000)\nprint('Skewness:', stats.skew(data))",
                          expectedResult: "Skewness: 0.945" // Nilai akan bervariasi tipis karena random, disarankan menggunakan seed untuk tes eksak.
                        },
                      },
                    ],
                  },
                  {
                    id: "block-131",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-131",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Outlier dalam Distribusi Data",
                      },
                      {
                        id: "paragraph-193",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Outlier adalah nilai yang secara signifikan berbeda dari sebagian besar data lainnya. Dalam distribusi normal, outlier biasanya berada di luar tiga standar deviasi dari mean. Kehadiran outlier dapat menggeser mean, memperbesar standar deviasi, dan mengubah interpretasi statistik secara keseluruhan. Oleh karena itu, identifikasi dan penanganan outlier menjadi langkah penting dalam tahap preprocessing data.",
                      },
                      {
                        id: "paragraph-194",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Namun, tidak semua outlier harus dihapus. Dalam beberapa kasus, outlier justru mengandung informasi penting, seperti indikasi fraud dalam transaksi keuangan atau anomali sistem dalam monitoring sensor. Oleh karena itu, keputusan untuk menghapus, mempertahankan, atau mentransformasi outlier harus dilakukan dengan pemahaman konteks bisnis dan tujuan analisis.",
                      },
                      {
                        id: "summary-32",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Distribusi normal bersifat simetris",
                          "Aturan 68-95-99.7 membantu interpretasi",
                          "Skewness menunjukkan ketidaksimetrian",
                          "Outlier dapat mempengaruhi statistik secara signifikan",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-34",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-34",
                          question:
                            "Jika distribusi memiliki ekor panjang di sisi kanan, maka disebut?",
                          options: [
                            { id: "opt-1", text: "Skewness Negatif" },
                            { id: "opt-2", text: "Distribusi Normal" },
                            { id: "opt-3", text: "Skewness Positif" },
                            { id: "opt-4", text: "Distribusi Uniform" },
                          ],
                          correctAnswers: ["opt-3"],
                          explanation:
                            "Ekor panjang di kanan menunjukkan skewness positif.",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 38,
                title:
                  "Strategi Deteksi dan Penanganan Outlier dalam Praktik Data Science",
                progress: 0,
                blocks: [
                  {
                    id: "block-132",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-132",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Mengidentifikasi Outlier Secara Visual dan Statistik",
                      },
                      {
                        id: "paragraph-195",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Outlier adalah observasi yang secara signifikan menyimpang dari pola umum data. Dalam praktik data science, identifikasi outlier tidak hanya dilakukan melalui satu pendekatan, melainkan kombinasi antara visualisasi dan metode statistik formal. Visualisasi seperti histogram, boxplot, dan scatter plot membantu mendeteksi nilai ekstrem secara intuitif, sementara pendekatan matematis seperti Z-Score dan Interquartile Range (IQR) memberikan batas kuantitatif yang lebih objektif. Pendekatan ganda ini penting karena tidak semua nilai ekstrem merupakan kesalahan; beberapa di antaranya bisa menjadi sinyal penting dalam analisis.",
                      },
                      {
                        id: "paragraph-196",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Z-Score mengukur seberapa jauh suatu nilai dari rata-rata dalam satuan standar deviasi. Secara umum, nilai dengan |Z| > 3 sering dianggap sebagai outlier dalam distribusi yang mendekati normal. Sementara itu, metode IQR menggunakan kuartil pertama dan ketiga untuk menentukan rentang wajar data. Nilai di luar Q1 - 1.5×IQR atau Q3 + 1.5×IQR biasanya ditandai sebagai pencilan. Kedua metode ini memiliki asumsi dan konteks penggunaan yang berbeda, sehingga pemilihan metode harus disesuaikan dengan karakteristik distribusi data.",
                      },
                      {
                        id: "highlight-35",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Outlier tidak selalu salah — bisa jadi sinyal penting.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-41",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-41",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\n# Contoh sederhana Z-Score\n\ndata = np.array([10, 12, 11, 13, 12, 200])\nmean = np.mean(data)\nstd = np.std(data)\nz_scores = (data - mean) / std\nprint('Z-Scores:', z_scores)",
                            expectedResult: "Z-Scores: [-0.46995058 -0.44147055 -0.45571057 -0.42723053 -0.44147055  2.23583278]"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-133",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-133",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Dampak Outlier terhadap Model Machine Learning",
                      },
                      {
                        id: "paragraph-197",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Outlier dapat memberikan dampak signifikan terhadap performa model machine learning, terutama model yang sensitif terhadap nilai ekstrem seperti regresi linear dan k-nearest neighbors. Dalam regresi linear, satu titik ekstrem dapat mengubah kemiringan garis regresi secara drastis karena metode ini meminimalkan error kuadrat. Akibatnya, prediksi untuk mayoritas data bisa menjadi kurang akurat hanya karena beberapa observasi ekstrem.",
                      },
                      {
                        id: "paragraph-198",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Sebaliknya, beberapa algoritma seperti decision tree dan random forest relatif lebih tahan terhadap outlier karena mereka membagi data berdasarkan aturan threshold, bukan jarak atau nilai rata-rata global. Oleh karena itu, sebelum menghapus outlier, penting untuk memahami jenis model yang akan digunakan. Dalam beberapa kasus, mempertahankan outlier justru meningkatkan kemampuan model dalam mendeteksi anomali atau kasus langka.",
                      },
                      {
                        id: "contentcard-4",
                        type: "content_card",
                        orderNumber: 4,
                        title: "Model dan Sensitivitas terhadap Outlier",
                        description:
                          "Tidak semua model bereaksi sama terhadap nilai ekstrem.",
                        disableExpandableContent: false,
                        items: [
                          {
                            title: "Regresi Linear",
                            content: "Sangat sensitif terhadap nilai ekstrem.",
                            expandableContent:
                              "Karena meminimalkan error kuadrat, satu nilai besar dapat menggeser garis regresi secara signifikan.",
                          },
                          {
                            title: "KNN",
                            content: "Dipengaruhi oleh jarak antar titik.",
                            expandableContent:
                              "Outlier dapat mengubah tetangga terdekat dan mempengaruhi klasifikasi atau regresi.",
                          },
                          {
                            title: "Decision Tree",
                            content: "Relatif lebih robust.",
                            expandableContent:
                              "Pembagian berbasis threshold membuatnya lebih tahan terhadap satu atau dua nilai ekstrem.",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: "block-134",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-134",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Strategi Penanganan Outlier",
                      },
                      {
                        id: "paragraph-199",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Terdapat beberapa strategi dalam menangani outlier, dan tidak ada pendekatan tunggal yang selalu benar. Salah satu metode paling sederhana adalah menghapus observasi ekstrem jika dipastikan merupakan kesalahan pencatatan atau noise. Alternatif lainnya adalah melakukan transformasi data, seperti transformasi logaritma atau scaling robust, untuk mengurangi pengaruh nilai ekstrem tanpa menghilangkannya sepenuhnya.",
                      },
                      {
                        id: "paragraph-200",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam konteks bisnis tertentu, outlier justru menjadi fokus utama analisis, seperti dalam fraud detection, fault detection pada mesin industri, atau analisis perilaku pelanggan premium. Oleh karena itu, penting untuk membedakan antara outlier sebagai kesalahan data dan outlier sebagai insight. Pendekatan terbaik adalah selalu menggabungkan pemahaman statistik dengan konteks domain sebelum mengambil keputusan akhir.",
                      },
                      {
                        id: "summary-33",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Outlier dapat dideteksi secara visual dan statistik",
                          "Z-Score cocok untuk data normal",
                          "IQR lebih umum dan robust",
                          "Keputusan penanganan harus mempertimbangkan konteks bisnis",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-35",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-35",
                          question:
                            "Mengapa regresi linear sensitif terhadap outlier?",
                          options: [
                            { id: "opt-1", text: "Karena menggunakan median" },
                            {
                              id: "opt-2",
                              text: "Karena meminimalkan error kuadrat",
                            },
                            {
                              id: "opt-3",
                              text: "Karena berbasis aturan threshold",
                            },
                            {
                              id: "opt-4",
                              text: "Karena hanya melihat ranking data",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Regresi linear meminimalkan error kuadrat sehingga nilai ekstrem sangat berpengaruh.",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            // ===============================
            // QUIZ (Updated - Mixed Single & Multiple Answers)
            // ===============================
            quiz: {
              id: 601,
              title: "Quiz: Descriptive Statistics Fundamentals",
              description:
                "Quiz ini menguji pemahaman Anda tentang ukuran pemusatan data, variabilitas, distribusi data, dan outlier dalam statistik deskriptif.",
              totalQuestions: 10,
              timeLimitMinutes: 20,

              questions: [
                {
                  id: 6011,
                  orderNumber: 1,
                  textQuestion:
                    "Ukuran pemusatan data yang paling sensitif terhadap outlier adalah?",
                  options: [
                    "Mean",
                    "Median",
                    "Mode",
                    "Geometric Mean",
                    "Harmonic Mean",
                  ],
                  correctAnswers: ["Mean"],
                  explanation:
                    "Mean menggunakan seluruh nilai data sehingga sangat terpengaruh oleh nilai ekstrem.",
                },

                {
                  id: 6012,
                  orderNumber: 2,
                  textQuestion:
                    "Ukuran pemusatan yang lebih stabil untuk data skewed adalah?",
                  options: ["Median", "Mean", "Mode", "Trimmed Mean"],
                  correctAnswers: ["Median", "Trimmed Mean"],
                  explanation:
                    "Median dan trimmed mean lebih robust terhadap outlier dibanding mean biasa.",
                },

                {
                  id: 6013,
                  orderNumber: 3,
                  textQuestion:
                    "Ukuran penyebaran data yang memiliki satuan sama dengan data aslinya adalah?",
                  options: ["Variance", "Standard Deviation", "Range", "IQR"],
                  correctAnswers: ["Standard Deviation", "Range", "IQR"],
                  explanation:
                    "Standard deviation, range, dan IQR memiliki satuan yang sama dengan data asli, sedangkan variance dalam satuan kuadrat.",
                },

                {
                  id: 6014,
                  orderNumber: 4,
                  textQuestion:
                    "Karakteristik utama dari distribusi normal adalah?",
                  options: [
                    "Berbentuk lonceng (bell curve)",
                    "Simetris terhadap mean",
                    "Mean = Median = Mode",
                    "Selalu memiliki outlier",
                    "Memiliki dua puncak (bimodal)",
                  ],
                  correctAnswers: [
                    "Berbentuk lonceng (bell curve)",
                    "Simetris terhadap mean",
                    "Mean = Median = Mode",
                  ],
                  explanation:
                    "Distribusi normal berbentuk lonceng dan simetris, dengan mean, median, dan mode bernilai sama.",
                },

                {
                  id: 6015,
                  orderNumber: 5,
                  textQuestion:
                    "Dalam distribusi normal, sebagian besar data berada di sekitar?",
                  options: ["Mean", "Median", "Mode", "Kuartil ketiga"],
                  correctAnswers: ["Mean", "Median", "Mode"],
                  explanation:
                    "Karena distribusi normal simetris, mean = median = mode dan pusat data berada di titik tersebut.",
                },

                {
                  id: 6016,
                  orderNumber: 6,
                  textQuestion:
                    "Dampak outlier terhadap analisis statistik dapat berupa?",
                  options: [
                    "Menggeser nilai mean",
                    "Meningkatkan variansi",
                    "Menghilangkan distribusi normal",
                    "Mendistorsi interpretasi data",
                  ],
                  correctAnswers: [
                    "Menggeser nilai mean",
                    "Meningkatkan variansi",
                    "Mendistorsi interpretasi data",
                  ],
                  explanation:
                    "Outlier dapat menarik mean, memperbesar variansi, dan menyebabkan interpretasi menjadi bias.",
                },

                {
                  id: 6017,
                  orderNumber: 7,
                  textQuestion:
                    "Metode yang umum digunakan untuk mendeteksi outlier adalah?",
                  options: [
                    "Z-Score",
                    "Interquartile Range (IQR)",
                    "Standard Deviation",
                    "Min-Max Scaling",
                    "Boxplot",
                  ],
                  correctAnswers: [
                    "Z-Score",
                    "Interquartile Range (IQR)",
                    "Boxplot",
                  ],
                  explanation:
                    "Z-score dan IQR adalah metode statistik utama, dan boxplot sering digunakan untuk visualisasi outlier.",
                },

                {
                  id: 6018,
                  orderNumber: 8,
                  textQuestion: "IQR lebih cocok digunakan pada kondisi?",
                  options: [
                    "Data berdistribusi normal sempurna",
                    "Data skewed",
                    "Data memiliki outlier",
                    "Data kategorikal",
                  ],
                  correctAnswers: ["Data skewed", "Data memiliki outlier"],
                  explanation:
                    "IQR bersifat robust terhadap outlier dan cocok untuk data yang tidak normal.",
                },

                {
                  id: 6019,
                  orderNumber: 9,
                  textQuestion: "Skewed distribution positif berarti?",
                  options: [
                    "Ekor distribusi lebih panjang ke kanan",
                    "Mean lebih besar dari median",
                    "Mean lebih kecil dari median",
                    "Distribusi simetris",
                  ],
                  correctAnswers: [
                    "Ekor distribusi lebih panjang ke kanan",
                    "Mean lebih besar dari median",
                  ],
                  explanation:
                    "Pada positive skew, ekor kanan lebih panjang dan mean biasanya lebih besar dari median.",
                },

                {
                  id: 60110,
                  orderNumber: 10,
                  textQuestion:
                    "Mengapa standar deviasi penting dalam Machine Learning?",
                  options: [
                    "Untuk feature scaling (standardization)",
                    "Untuk mendeteksi outlier",
                    "Untuk normalisasi distribusi",
                    "Untuk menghapus missing value",
                    "Untuk memahami sebaran fitur",
                  ],
                  correctAnswers: [
                    "Untuk feature scaling (standardization)",
                    "Untuk mendeteksi outlier",
                    "Untuk memahami sebaran fitur",
                  ],
                  explanation:
                    "Standar deviasi digunakan dalam standardization (Z-score), membantu memahami sebaran data dan mendeteksi outlier.",
                },
              ],
            },
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 7,
        coverImage:
          "https://images.unsplash.com/photo-1454165833767-027ffea70c1e?w=400&h=200",
        title: "Probability Theory",
        description:
          "Konsep peluang dan bagaimana mesin menangani ketidakpastian dalam data.",
        taskType: "quiz",
        modules: [
          {
            id: 22,
            title: "Basic Probability Rules",
            estimatedMinutes: 15,
            completed: false,
            subModules: [
              {
                id: 39,
                title: "Ruang Sampel dan Kejadian dalam Probability Theory",
                progress: 0,
                blocks: [
                  {
                    id: "block-135",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-135",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Memahami Ruang Sampel (Sample Space)",
                      },
                      {
                        id: "paragraph-201",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam teori probabilitas, ruang sampel adalah himpunan semua kemungkinan hasil dari suatu percobaan acak. Konsep ini menjadi fondasi utama dalam memahami bagaimana peluang dihitung dan dianalisis. Misalnya, ketika melempar satu dadu enam sisi, ruang sampelnya adalah {1, 2, 3, 4, 5, 6}. Setiap angka memiliki peluang yang sama jika dadu tersebut adil. Ruang sampel dapat bersifat diskrit seperti pada dadu dan kartu, atau kontinu seperti pada pengukuran suhu dan waktu. Memahami struktur ruang sampel membantu kita mengidentifikasi kemungkinan kejadian dan menghitung probabilitas secara sistematis.",
                      },
                      {
                        id: "paragraph-202",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam konteks machine learning dan data science, ruang sampel sering kali merepresentasikan seluruh kemungkinan nilai fitur atau seluruh kemungkinan output dari suatu model. Sebagai contoh, dalam klasifikasi biner, ruang sampel output mungkin hanya terdiri dari dua label seperti 0 dan 1. Namun pada model regresi, ruang sampel dapat berupa bilangan real dalam rentang tertentu. Oleh karena itu, memahami ruang sampel membantu kita membangun model yang sesuai dengan karakteristik data.",
                      },
                      {
                        id: "highlight-36",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Ruang sampel adalah fondasi semua perhitungan probabilitas.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "imagevideo-16",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-16",
                          url: "https://images.unsplash.com/photo-1596495573826-3946d0286c49?w=400",
                          caption: "Ilustrasi percobaan acak menggunakan dadu",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-136",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-136",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Konsep Kejadian (Event)",
                      },
                      {
                        id: "paragraph-203",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Kejadian adalah subset dari ruang sampel. Artinya, sebuah kejadian terdiri dari satu atau lebih hasil yang mungkin terjadi dalam suatu percobaan. Jika ruang sampel pelemparan dadu adalah {1,2,3,4,5,6}, maka kejadian mendapatkan angka genap adalah {2,4,6}. Probabilitas suatu kejadian dihitung sebagai rasio antara jumlah hasil yang mendukung kejadian tersebut dengan total hasil dalam ruang sampel, selama setiap hasil memiliki peluang yang sama.",
                      },
                      {
                        id: "paragraph-204",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam praktik data science, kejadian sering dikaitkan dengan kondisi tertentu pada dataset. Misalnya, kejadian 'pelanggan melakukan pembelian ulang' merupakan subset dari seluruh populasi pelanggan. Dengan memahami bagaimana mendefinisikan kejadian secara tepat, kita dapat membangun model probabilistik seperti Naive Bayes atau logistic regression yang memprediksi peluang terjadinya suatu peristiwa berdasarkan fitur-fitur tertentu.",
                      },
                      {
                        id: "accordion-33",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Jenis-Jenis Kejadian dalam Probabilitas",
                        description:
                          "Beberapa klasifikasi kejadian penting dalam teori peluang.",
                        items: [
                          {
                            title: "Kejadian Sederhana",
                            content:
                              "Kejadian yang terdiri dari satu hasil saja dalam ruang sampel.",
                          },
                          {
                            title: "Kejadian Majemuk",
                            content:
                              "Kejadian yang terdiri dari lebih dari satu hasil.",
                          },
                          {
                            title: "Kejadian Saling Lepas",
                            content:
                              "Dua kejadian yang tidak dapat terjadi bersamaan.",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: "block-137",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-137",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Operasi pada Kejadian dan Hubungannya dengan Machine Learning",
                      },
                      {
                        id: "paragraph-205",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam teori probabilitas, terdapat beberapa operasi penting pada kejadian seperti irisan (intersection), gabungan (union), dan komplemen (complement). Irisan dua kejadian A dan B merepresentasikan hasil yang termasuk dalam keduanya sekaligus. Gabungan mencakup hasil yang termasuk dalam A atau B atau keduanya. Sementara itu, komplemen dari suatu kejadian adalah semua hasil dalam ruang sampel yang tidak termasuk dalam kejadian tersebut.",
                      },
                      {
                        id: "paragraph-206",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Operasi-operasi ini menjadi dasar dalam perhitungan probabilitas bersyarat dan Teorema Bayes yang banyak digunakan dalam machine learning. Misalnya, dalam klasifikasi email spam, kita menghitung peluang irisan antara kata tertentu muncul dan email termasuk spam. Pemahaman yang kuat tentang operasi kejadian membantu kita menghindari kesalahan logika probabilistik saat membangun model prediktif.",
                      },
                      {
                        id: "tabnav-3",
                        type: "tab_navigation",
                        orderNumber: 4,
                        title: "Operasi Dasar Kejadian",
                        description:
                          "Ringkasan konsep operasi dalam probabilitas.",
                        tabs: [
                          {
                            title: "Union (A ∪ B)",
                            content:
                              "Probabilitas salah satu atau keduanya terjadi.",
                          },
                          {
                            title: "Intersection (A ∩ B)",
                            content: "Probabilitas keduanya terjadi bersamaan.",
                          },
                          {
                            title: "Complement (Aᶜ)",
                            content: "Probabilitas kejadian tidak terjadi.",
                          },
                        ],
                      },
                      {
                        id: "summary-34",
                        type: "summary",
                        orderNumber: 5,
                        comments: [
                          "Ruang sampel adalah himpunan semua kemungkinan hasil",
                          "Kejadian adalah subset dari ruang sampel",
                          "Probabilitas dihitung dari rasio hasil yang mendukung",
                          "Operasi union, intersection, dan complement sangat penting",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-36",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-36",
                          question:
                            "Jika ruang sampel pelemparan dadu adalah {1,2,3,4,5,6}, maka kejadian mendapatkan angka ganjil adalah?",
                          options: [
                            { id: "opt-1", text: "{1,3,5}" },
                            { id: "opt-2", text: "{2,4,6}" },
                            { id: "opt-3", text: "{1,2,3}" },
                            { id: "opt-4", text: "{4,5,6}" },
                          ],
                          correctAnswers: ["opt-1"],
                          explanation:
                            "Angka ganjil dalam ruang sampel tersebut adalah 1, 3, dan 5.",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 40,
                title: "Aturan Penjumlahan dan Perkalian dalam Probabilitas",
                progress: 0,
                blocks: [
                  {
                    id: "block-138",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-138",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Aturan Penjumlahan (Addition Rule)",
                      },
                      {
                        id: "paragraph-207",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Aturan penjumlahan digunakan untuk menghitung probabilitas terjadinya kejadian A atau kejadian B. Jika kedua kejadian tersebut saling lepas (mutually exclusive), maka probabilitasnya cukup dijumlahkan secara langsung: P(A ∪ B) = P(A) + P(B). Namun, dalam banyak kasus nyata, dua kejadian dapat terjadi secara bersamaan. Dalam situasi tersebut, kita harus mengurangi probabilitas irisan keduanya agar tidak menghitung dua kali, sehingga rumus lengkapnya menjadi P(A ∪ B) = P(A) + P(B) - P(A ∩ B).",
                      },
                      {
                        id: "paragraph-208",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam konteks machine learning, aturan penjumlahan sering muncul dalam perhitungan probabilitas klasifikasi multi-kelas. Misalnya, ketika menentukan peluang sebuah transaksi tergolong sebagai fraud atau kesalahan sistem, kita harus mempertimbangkan kemungkinan overlap antar kategori. Kesalahan umum dalam implementasi model probabilistik adalah mengabaikan irisan antar kejadian, yang dapat menghasilkan estimasi probabilitas lebih dari 1.",
                      },
                      {
                        id: "highlight-37",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Jika kejadian tidak saling lepas, jangan lupa kurangi irisan!",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-37",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-37",
                          question:
                            "Jika dua kejadian saling lepas, bagaimana rumus peluang A atau B?",
                          options: [
                            { id: "opt-1", text: "P(A) × P(B)" },
                            { id: "opt-2", text: "P(A) + P(B)" },
                            { id: "opt-3", text: "P(A) - P(B)" },
                            { id: "opt-4", text: "P(A) ÷ P(B)" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Jika saling lepas, probabilitasnya cukup dijumlahkan.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-139",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-139",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Aturan Perkalian (Multiplication Rule)",
                      },
                      {
                        id: "paragraph-209",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Aturan perkalian digunakan untuk menghitung probabilitas dua kejadian terjadi secara bersamaan. Jika kejadian A dan B independen, maka probabilitas keduanya terjadi adalah hasil perkalian peluang masing-masing: P(A ∩ B) = P(A) × P(B). Namun, jika kedua kejadian bersifat dependen, maka rumusnya menjadi P(A ∩ B) = P(A) × P(B|A), di mana P(B|A) adalah probabilitas B terjadi dengan syarat A sudah terjadi.",
                      },
                      {
                        id: "paragraph-210",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam data science, asumsi independensi sering digunakan dalam algoritma seperti Naive Bayes. Meskipun dalam kenyataannya fitur tidak selalu benar-benar independen, pendekatan ini sering kali tetap menghasilkan performa yang baik. Oleh karena itu, memahami kapan harus menggunakan aturan perkalian sederhana dan kapan harus menggunakan probabilitas bersyarat adalah kemampuan penting dalam analisis probabilistik.",
                      },
                      {
                        id: "contentcard-5",
                        type: "content_card",
                        orderNumber: 4,
                        title: "Independen vs Dependen",
                        description:
                          "Perbedaan penting dalam penerapan aturan perkalian.",
                        disableExpandableContent: false,
                        items: [
                          {
                            title: "Independen",
                            content: "Kejadian tidak saling mempengaruhi.",
                            expandableContent:
                              "Contoh: dua kali lempar koin adil. Hasil pertama tidak mempengaruhi hasil kedua.",
                          },
                          {
                            title: "Dependen",
                            content: "Kejadian saling mempengaruhi.",
                            expandableContent:
                              "Contoh: mengambil kartu tanpa pengembalian. Peluang berubah setelah kartu pertama diambil.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-42",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-42",
                          language: "python",
                          initialCode:
                            "# Contoh probabilitas independen\np_a = 0.6\np_b = 0.5\np_intersection = p_a * p_b\nprint('P(A dan B):', p_intersection)",
                            expectedResult: "P(A dan B): 0.3"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-140",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-140",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Mengidentifikasi Ketergantungan dalam Dataset",
                      },
                      {
                        id: "paragraph-211",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam dataset nyata, asumsi independensi jarang benar-benar terpenuhi. Banyak fitur memiliki korelasi atau hubungan sebab-akibat yang kompleks. Oleh karena itu, sebelum menerapkan aturan probabilitas, analis perlu memahami struktur data melalui eksplorasi dan visualisasi. Menggunakan korelasi, contingency table, atau uji statistik dapat membantu menentukan apakah dua variabel memiliki ketergantungan signifikan.",
                      },
                      {
                        id: "paragraph-212",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Kesalahan dalam mengasumsikan independensi dapat menyebabkan model overconfident atau menghasilkan probabilitas yang bias. Dalam sistem rekomendasi, misalnya, asumsi bahwa preferensi pengguna terhadap satu genre tidak mempengaruhi genre lain bisa menghasilkan prediksi yang kurang akurat. Oleh karena itu, penting untuk selalu mengevaluasi asumsi dasar sebelum menerapkan rumus matematis.",
                      },
                      {
                        id: "summary-35",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Aturan penjumlahan untuk kejadian A atau B",
                          "Jika tidak saling lepas, kurangi irisan",
                          "Aturan perkalian untuk kejadian A dan B",
                          "Perhatikan apakah kejadian independen atau dependen",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-1",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-38",
                          question:
                            "Cocokkan jenis kejadian dengan rumus yang tepat",
                          leftItems: [
                            { id: "l1", text: "Saling Lepas" },
                            { id: "l2", text: "Independen" },
                            { id: "l3", text: "Dependen" },
                          ],
                          rightItems: [
                            { id: "r1", text: "P(A) + P(B)" },
                            { id: "r2", text: "P(A) × P(B)" },
                            { id: "r3", text: "P(A) × P(B|A)" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 23,
            title: "Conditional Probability",
            estimatedMinutes: 20,
            completed: false,
            subModules: [
              {
                id: 41,
                title: "Konsep Peluang Bersyarat",
                progress: 0,
                blocks: [
                  {
                    id: "block-141",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-141",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Memahami Definisi P(A|B)",
                      },
                      {
                        id: "paragraph-213",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Peluang bersyarat adalah konsep yang menjelaskan bagaimana probabilitas suatu kejadian dapat berubah ketika kita mengetahui bahwa kejadian lain sudah terjadi. Secara matematis ditulis sebagai P(A|B), yang dibaca sebagai 'peluang A dengan syarat B'. Artinya, kita tidak lagi melihat seluruh ruang sampel awal, tetapi hanya bagian ruang sampel di mana kejadian B terjadi. Dengan kata lain, informasi baru mempersempit kemungkinan yang relevan, sehingga nilai probabilitas bisa meningkat atau menurun tergantung hubungan antara A dan B.",
                      },
                      {
                        id: "paragraph-214",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Rumus formal peluang bersyarat adalah P(A|B) = P(A ∩ B) / P(B), dengan syarat P(B) > 0. Rumus ini menunjukkan bahwa kita menghitung proporsi kejadian A yang juga termasuk dalam B dibandingkan seluruh kejadian B. Konsep ini menjadi fondasi penting dalam statistika, inferensi Bayesian, serta berbagai algoritma machine learning yang berbasis probabilitas.",
                      },
                      {
                        id: "highlight-38",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Informasi baru mengubah ruang sampel.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-43",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-43",
                          language: "python",
                          initialCode:
                            "# Contoh sederhana menghitung P(A|B)\n# Misal P(A ∩ B) = 0.2 dan P(B) = 0.5\np_intersection = 0.2\np_b = 0.5\np_a_given_b = p_intersection / p_b\nprint('P(A|B):', p_a_given_b)",
                            expectedResult: "P(A|B): 0.4"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-142",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-142",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Contoh Kasus: Diagnosis Medis",
                      },
                      {
                        id: "paragraph-215",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam dunia medis, peluang bersyarat sering digunakan untuk menafsirkan hasil tes diagnostik. Misalnya, kita ingin mengetahui peluang seseorang benar-benar mengidap suatu penyakit jika hasil tesnya positif. Banyak orang keliru mengira bahwa akurasi tes yang tinggi otomatis berarti peluang sakit sangat besar ketika hasilnya positif. Padahal, kita juga harus mempertimbangkan prevalensi penyakit di populasi.",
                      },
                      {
                        id: "paragraph-216",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Jika penyakit tersebut sangat jarang terjadi, maka meskipun tes memiliki sensitivitas dan spesifisitas tinggi, kemungkinan hasil positif palsu tetap signifikan. Di sinilah peluang bersyarat berperan penting: kita menghitung ulang probabilitas dengan memasukkan informasi tambahan berupa hasil tes. Konsep ini nantinya akan terhubung langsung dengan Teorema Bayes yang memperluas formulasi peluang bersyarat.",
                      },
                      {
                        id: "accordion-34",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Istilah Penting dalam Tes Diagnostik",
                        description:
                          "Beberapa istilah yang sering muncul dalam konteks medis.",
                        items: [
                          {
                            title: "Prevalensi",
                            content:
                              "Proporsi populasi yang benar-benar memiliki penyakit.",
                          },
                          {
                            title: "Sensitivitas",
                            content:
                              "Kemampuan tes mendeteksi pasien yang benar-benar sakit.",
                          },
                          {
                            title: "Spesifisitas",
                            content:
                              "Kemampuan tes mengidentifikasi individu yang tidak sakit.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-38",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-39",
                          question:
                            "Mengapa prevalensi penting dalam menghitung peluang sakit setelah tes positif?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Karena menentukan biaya tes",
                            },
                            {
                              id: "opt-2",
                              text: "Karena mempengaruhi probabilitas awal sebelum tes",
                            },
                            {
                              id: "opt-3",
                              text: "Karena selalu membuat hasil lebih besar",
                            },
                            {
                              id: "opt-4",
                              text: "Karena menggantikan sensitivitas",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Prevalensi adalah probabilitas awal (prior) sebelum informasi hasil tes diperhitungkan.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-143",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-143",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Peluang Bersyarat dalam Machine Learning",
                      },
                      {
                        id: "paragraph-217",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam machine learning, peluang bersyarat muncul secara eksplisit dalam model klasifikasi probabilistik seperti Naive Bayes. Model ini menghitung probabilitas suatu kelas dengan syarat fitur-fitur tertentu muncul dalam data. Secara umum, kita ingin menghitung P(Kelas|Fitur), yaitu peluang suatu data termasuk ke dalam kelas tertentu dengan syarat fitur-fitur yang diamati.",
                      },
                      {
                        id: "paragraph-218",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Meskipun asumsi independensi pada Naive Bayes sering kali tidak sepenuhnya realistis, penggunaan peluang bersyarat membuat model ini tetap sederhana namun efektif. Konsep ini juga mendasari berbagai sistem rekomendasi, sistem deteksi spam, hingga model prediksi risiko. Dengan memahami bagaimana probabilitas berubah ketika informasi baru masuk, kita dapat membangun sistem yang lebih adaptif dan rasional dalam pengambilan keputusan berbasis data.",
                      },
                      {
                        id: "summary-36",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "P(A|B) mengubah ruang sampel menjadi hanya B",
                          "Rumus dasar: P(A ∩ B) / P(B)",
                          "Prevalensi mempengaruhi interpretasi hasil tes",
                          "Konsep ini penting dalam model probabilistik seperti Naive Bayes",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "matching-2",
                        type: "matching",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-40",
                          question: "Cocokkan konsep dengan penjelasannya",
                          leftItems: [
                            { id: "l1", text: "P(A|B)" },
                            { id: "l2", text: "P(A ∩ B)" },
                            { id: "l3", text: "P(B)" },
                          ],
                          rightItems: [
                            {
                              id: "r1",
                              text: "Probabilitas A dengan syarat B terjadi",
                            },
                            {
                              id: "r2",
                              text: "Probabilitas kejadian A dan B bersama-sama",
                            },
                            { id: "r3", text: "Probabilitas kejadian B" },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 42,
                title: "Teorema Bayes",
                progress: 0,
                blocks: [
                  {
                    id: "block-144",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-144",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Fondasi Teorema Bayes",
                      },
                      {
                        id: "paragraph-219",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Teorema Bayes merupakan pengembangan langsung dari konsep peluang bersyarat yang telah kita pelajari sebelumnya. Inti dari teorema ini adalah bagaimana kita memperbarui keyakinan awal (prior probability) setelah mendapatkan bukti baru (evidence). Dalam banyak situasi nyata, kita tidak pernah benar-benar memulai dari nol. Kita selalu memiliki asumsi awal atau pengetahuan sebelumnya, dan Teorema Bayes menyediakan kerangka matematis untuk menggabungkan pengetahuan awal tersebut dengan data yang baru diamati.",
                      },
                      {
                        id: "paragraph-220",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Secara matematis, Teorema Bayes dirumuskan sebagai: P(A|B) = (P(B|A) × P(A)) / P(B). Di sini, P(A) disebut prior, P(B|A) disebut likelihood, dan P(A|B) disebut posterior. Posterior inilah yang menjadi hasil pembaruan keyakinan kita setelah mempertimbangkan bukti B. Rumus ini sangat penting dalam statistika Bayesian dan menjadi fondasi bagi banyak algoritma pembelajaran mesin berbasis probabilitas.",
                      },
                      {
                        id: "highlight-39",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Posterior = Likelihood × Prior ÷ Evidence",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-44",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-44",
                          language: "python",
                          initialCode:
                            "# Implementasi sederhana Teorema Bayes\n\ndef bayes_theorem(p_a, p_b_given_a, p_b):\n    return (p_b_given_a * p_a) / p_b\n\n# Contoh kasus\np_a = 0.01          # prior\np_b_given_a = 0.9   # likelihood\np_b = 0.05          # evidence\n\nposterior = bayes_theorem(p_a, p_b_given_a, p_b)\nprint('Posterior:', posterior)",
                            expectedResult: "Posterior: 0.18"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-145",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-145",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Intuisi di Balik Prior dan Posterior",
                      },
                      {
                        id: "paragraph-221",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Salah satu kekuatan utama Teorema Bayes adalah kemampuannya dalam memisahkan antara apa yang sudah kita yakini sebelumnya dan apa yang diberikan oleh data. Prior mencerminkan pengetahuan atau asumsi awal sebelum melihat data. Dalam beberapa konteks, prior bisa berasal dari penelitian sebelumnya, pengalaman historis, atau bahkan asumsi subjektif yang masuk akal. Setelah data baru masuk, likelihood mengukur seberapa konsisten data tersebut dengan hipotesis yang kita miliki.",
                      },
                      {
                        id: "paragraph-222",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Posterior kemudian menjadi hasil akhir yang menggabungkan kedua informasi tersebut. Jika data sangat kuat dan konsisten, posterior dapat berubah drastis dibandingkan prior. Namun jika data lemah atau ambigu, prior akan tetap memiliki pengaruh besar terhadap hasil akhir. Konsep ini membuat pendekatan Bayesian sangat fleksibel dan realistis dalam menangani ketidakpastian.",
                      },
                      {
                        id: "tabnav-4",
                        type: "tab_navigation",
                        orderNumber: 4,
                        title: "Komponen Utama Bayes",
                        description:
                          "Empat komponen penting dalam Teorema Bayes.",
                        tabs: [
                          {
                            title: "Prior",
                            content:
                              "Probabilitas awal sebelum melihat data baru.",
                          },
                          {
                            title: "Likelihood",
                            content:
                              "Probabilitas data muncul jika hipotesis benar.",
                          },
                          {
                            title: "Evidence",
                            content:
                              "Probabilitas total data di semua hipotesis.",
                          },
                          {
                            title: "Posterior",
                            content:
                              "Probabilitas hipotesis setelah mempertimbangkan data.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-39",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-41",
                          question:
                            "Dalam Teorema Bayes, mana yang disebut sebagai posterior?",
                          options: [
                            { id: "opt-1", text: "P(A)" },
                            { id: "opt-2", text: "P(B|A)" },
                            { id: "opt-3", text: "P(A|B)" },
                            { id: "opt-4", text: "P(B)" },
                          ],
                          correctAnswers: ["opt-3"],
                          explanation:
                            "Posterior adalah probabilitas hipotesis setelah mempertimbangkan bukti, yaitu P(A|B).",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-146",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-146",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Aplikasi Teorema Bayes dalam Dunia Nyata",
                      },
                      {
                        id: "paragraph-223",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Teorema Bayes digunakan secara luas dalam berbagai bidang modern. Dalam sistem deteksi spam, algoritma menghitung probabilitas sebuah email termasuk spam berdasarkan kata-kata yang muncul di dalamnya. Dalam sistem rekomendasi, model menghitung peluang pengguna menyukai suatu produk berdasarkan riwayat interaksi sebelumnya. Bahkan dalam navigasi kendaraan otonom, pendekatan Bayesian digunakan untuk memperkirakan posisi kendaraan dengan menggabungkan data sensor dan peta digital.",
                      },
                      {
                        id: "paragraph-224",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Keunggulan pendekatan Bayesian terletak pada kemampuannya menangani ketidakpastian secara eksplisit. Alih-alih memberikan jawaban deterministik, sistem memberikan distribusi probabilitas yang mencerminkan tingkat keyakinan terhadap berbagai kemungkinan. Hal ini sangat penting dalam pengambilan keputusan berbasis risiko, seperti diagnosis medis, analisis keuangan, dan kecerdasan buatan tingkat lanjut.",
                      },
                      {
                        id: "summary-37",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Teorema Bayes memperbarui prior menjadi posterior",
                          "Likelihood mengukur kekuatan bukti",
                          "Posterior adalah hasil akhir pembaruan keyakinan",
                          "Digunakan luas dalam AI, spam filter, dan sistem prediktif",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-7",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-7",
                          url: "https://images.unsplash.com/photo-1509228463558-399364a71109?w=400",
                          caption:
                            "Ilustrasi visualisasi pembaruan probabilitas dalam pendekatan Bayesian.",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 24,
            title: "Introduction to Bayes' Theorem",
            estimatedMinutes: 25,
            completed: false,
            subModules: [
              {
                id: 43,
                title: "Intuisi dan Rumus Bayes",
                progress: 40,
                blocks: [
                  {
                    id: "block-147",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-147",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Bayes sebagai Kerangka Berpikir",
                      },
                      {
                        id: "paragraph-225",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Teorema Bayes bukan sekadar persamaan matematis yang berdiri sendiri, melainkan sebuah cara berpikir dalam menghadapi ketidakpastian. Dalam kehidupan sehari-hari, kita sering memperbarui keyakinan tanpa menyadarinya. Ketika mendengar berita baru, melihat data tambahan, atau memperoleh pengalaman baru, secara alami kita menyesuaikan keyakinan awal kita. Pendekatan Bayesian memformalkan proses mental tersebut ke dalam kerangka matematis yang terstruktur dan dapat dihitung secara kuantitatif.",
                      },
                      {
                        id: "paragraph-226",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam konteks ilmiah maupun machine learning, pendekatan ini sangat kuat karena memungkinkan model untuk belajar secara iteratif. Setiap data baru tidak menggantikan keyakinan lama secara total, melainkan memperbaruinya secara proporsional terhadap seberapa kuat bukti tersebut. Dengan demikian, Bayes mencerminkan proses pembelajaran yang dinamis dan adaptif.",
                      },
                      {
                        id: "highlight-40",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Bayesian thinking = belief updating with evidence.",
                      },
                    ],
                  },
                  {
                    id: "block-148",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-148",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Empat Komponen Utama dalam Rumus Bayes",
                      },
                      {
                        id: "paragraph-227",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Rumus Bayes terdiri dari empat komponen utama yang saling berhubungan. Prior adalah keyakinan awal sebelum melihat data. Likelihood adalah peluang munculnya data jika hipotesis benar. Evidence atau marginal likelihood adalah probabilitas total dari data yang diamati di semua kemungkinan hipotesis. Posterior adalah hasil akhir berupa keyakinan baru setelah data dipertimbangkan. Keempat komponen ini bekerja bersama membentuk siklus pembaruan probabilitas yang sistematis.",
                      },
                      {
                        id: "accordion-35",
                        type: "accordion",
                        orderNumber: 3,
                        title: "Penjelasan Komponen Bayes",
                        description:
                          "Klik untuk memahami setiap komponen lebih dalam.",
                        items: [
                          {
                            title: "Prior",
                            content: "Probabilitas awal sebelum melihat bukti.",
                          },
                          {
                            title: "Likelihood",
                            content:
                              "Seberapa besar kemungkinan bukti muncul jika hipotesis benar.",
                          },
                          {
                            title: "Evidence",
                            content:
                              "Probabilitas total bukti tanpa memandang hipotesis.",
                          },
                          {
                            title: "Posterior",
                            content:
                              "Probabilitas baru setelah memperhitungkan bukti.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-8",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-8",
                          url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
                          caption:
                            "Ilustrasi visual rumus Bayes dan komponennya.",
                        },
                      },
                      {
                        id: "mcq-40",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-42",
                          question:
                            "Jika data sangat kuat dan konsisten dengan hipotesis, apa yang kemungkinan terjadi pada posterior?",
                          options: [
                            { id: "opt-1", text: "Tetap sama dengan prior" },
                            { id: "opt-2", text: "Mendekati likelihood" },
                            {
                              id: "opt-3",
                              text: "Menurun drastis tanpa alasan",
                            },
                            { id: "opt-4", text: "Tidak dapat dihitung" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Jika bukti sangat kuat, posterior akan lebih dipengaruhi oleh likelihood dibanding prior.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-149",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-149",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Pengaruh Prior terhadap Hasil Akhir",
                      },
                      {
                        id: "paragraph-228",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Prior memiliki peran yang sangat penting dalam pendekatan Bayesian. Jika prior sangat bias atau terlalu ekstrem, maka diperlukan bukti yang sangat kuat untuk menggeser posterior secara signifikan. Hal ini menunjukkan bahwa Bayesian bukan hanya tentang data, tetapi juga tentang bagaimana kita memulai asumsi awal. Dalam beberapa kasus, pemilihan prior yang tepat justru menjadi bagian paling krusial dalam proses pemodelan.",
                      },
                      {
                        id: "paragraph-229",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam praktik machine learning modern, prior sering kali dipilih berdasarkan pengalaman sebelumnya atau distribusi standar tertentu untuk menjaga model tetap stabil. Namun, penting untuk memahami bahwa prior bukan sekadar angka teknis, melainkan representasi dari pengetahuan awal yang kita masukkan ke dalam sistem. Dengan memahami pengaruh prior, kita dapat lebih bijak dalam membangun model probabilistik yang transparan dan dapat dipertanggungjawabkan.",
                      },
                      {
                        id: "summary-38",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Bayes adalah proses pembaruan keyakinan",
                          "Empat komponen: Prior, Likelihood, Evidence, Posterior",
                          "Data kuat menggeser posterior lebih signifikan",
                          "Pemilihan prior memengaruhi hasil akhir",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-45",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-45",
                          language: "python",
                          initialCode:
                            "# Simulasi sederhana pengaruh prior\n\ndef bayes(p_a, p_b_given_a, p_b):\n    return (p_b_given_a * p_a) / p_b\n\n# Dua prior berbeda\nprior1 = 0.01\nprior2 = 0.5\nlikelihood = 0.9\nevidence = 0.05\n\nprint('Posterior dengan prior kecil:', bayes(prior1, likelihood, evidence))\nprint('Posterior dengan prior besar:', bayes(prior2, likelihood, evidence))",
                            expectedResult: "Posterior dengan prior kecil: 0.18\nPosterior dengan prior besar: 9.0"
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 44,
                title: "Penerapan Bayes dalam Klasifikasi",
                progress: 0,
                blocks: [
                  {
                    id: "block-150",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-150",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Naive Bayes dan Asumsi Independensi",
                      },
                      {
                        id: "paragraph-230",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam praktik Data Science modern, salah satu implementasi paling populer dari Teorema Bayes adalah algoritma Naive Bayes. Disebut 'naive' karena model ini membuat asumsi yang sangat kuat, yaitu setiap fitur dalam data dianggap saling independen satu sama lain terhadap kelas. Artinya, kemunculan satu fitur tidak memengaruhi probabilitas fitur lainnya ketika kita sudah mengetahui kelasnya. Walaupun asumsi ini terdengar terlalu sederhana dan sering kali tidak sepenuhnya sesuai dengan realitas, pendekatan ini justru membuat perhitungan probabilitas menjadi sangat efisien dan skalabel untuk dataset besar.",
                      },
                      {
                        id: "paragraph-231",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Secara matematis, Naive Bayes mengubah perhitungan likelihood gabungan menjadi hasil perkalian likelihood masing-masing fitur. Dengan demikian, kompleksitas komputasi berkurang drastis dibandingkan harus menghitung distribusi probabilitas gabungan secara penuh. Inilah alasan mengapa algoritma ini sangat populer dalam klasifikasi teks, analisis sentimen, hingga sistem rekomendasi berbasis probabilitas.",
                      },
                      {
                        id: "highlight-41",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Naive Bayes = cepat, sederhana, dan sering kali sangat akurat.",
                      },
                    ],
                  },
                  {
                    id: "block-151",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-151",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Implementasi Dasar dengan Python",
                      },
                      {
                        id: "paragraph-232",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam ekosistem Python, implementasi Naive Bayes sangat mudah dilakukan menggunakan library seperti scikit-learn. Tersedia beberapa varian seperti GaussianNB untuk data numerik kontinu, MultinomialNB untuk data frekuensi seperti teks, dan BernoulliNB untuk fitur biner. Dengan hanya beberapa baris kode, kita sudah dapat melatih model klasifikasi berbasis probabilitas yang kuat dan efisien. Hal ini menunjukkan bagaimana teori probabilitas yang kompleks dapat diubah menjadi alat praktis yang mudah digunakan dalam workflow machine learning.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-46",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-46",
                          language: "python",
                          initialCode:
                            "from sklearn.naive_bayes import GaussianNB\nimport numpy as np\n\n# Data sederhana\nX_train = np.array([[1,2], [2,3], [3,4], [8,9], [9,10], [10,11]])\ny_train = np.array([0,0,0,1,1,1])\n\nmodel = GaussianNB()\nmodel.fit(X_train, y_train)\n\nX_new = np.array([[2,2], [9,9]])\nprint('Prediksi:', model.predict(X_new))",
                            expectedResult: "Prediksi: [0 1]"
                        },
                      },
                      {
                        id: "mcq-41",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-43",
                          question: "Mengapa Naive Bayes disebut 'naive'?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Karena tidak menggunakan probabilitas",
                            },
                            {
                              id: "opt-2",
                              text: "Karena mengasumsikan fitur saling independen",
                            },
                            {
                              id: "opt-3",
                              text: "Karena hanya bekerja pada data kecil",
                            },
                            {
                              id: "opt-4",
                              text: "Karena tidak bisa digunakan untuk teks",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Disebut naive karena asumsi independensi antar fitur yang sangat sederhana.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-152",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-152",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Studi Kasus: Klasifikasi Spam Email",
                      },
                      {
                        id: "paragraph-233",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Salah satu contoh paling klasik dari penerapan Naive Bayes adalah sistem filter spam. Model menghitung probabilitas kemunculan kata tertentu pada email spam dan email non-spam. Ketika sebuah email baru masuk, sistem menghitung posterior probability untuk masing-masing kelas berdasarkan kata-kata yang terkandung di dalamnya. Jika probabilitas spam lebih tinggi, maka email tersebut diklasifikasikan sebagai spam. Walaupun asumsi independensi antar kata tidak sepenuhnya benar, dalam praktiknya model ini terbukti sangat efektif dan cepat untuk volume email yang besar.",
                      },
                      {
                        id: "paragraph-234",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Kekuatan pendekatan ini terletak pada kemampuannya mengubah teks menjadi representasi numerik berupa frekuensi kata, lalu menerapkan prinsip probabilitas secara sistematis. Model tidak benar-benar 'memahami' makna kata, tetapi mengandalkan pola statistik yang muncul dari data historis. Inilah contoh nyata bagaimana matematika probabilitas menjadi tulang punggung kecerdasan buatan dalam kehidupan sehari-hari.",
                      },
                      {
                        id: "summary-39",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Naive Bayes mengasumsikan independensi fitur",
                          "Komputasi menjadi efisien karena perkalian likelihood",
                          "Sangat populer untuk klasifikasi teks",
                          "Spam filter adalah contoh penerapan nyata",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-9",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-9",
                          url: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=400",
                          caption:
                            "Ilustrasi sistem klasifikasi email spam berbasis probabilitas.",
                        },
                      },
                      {
                        id: "matching-1",
                        type: "matching",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "matching-1-content",
                          question:
                            "Cocokkan konsep berikut dengan deskripsinya:",
                          leftItems: [
                            { id: "l1", text: "Prior" },
                            { id: "l2", text: "Likelihood" },
                            { id: "l3", text: "Posterior" },
                          ],
                          rightItems: [
                            {
                              id: "r1",
                              text: "Probabilitas awal sebelum melihat data",
                            },
                            {
                              id: "r2",
                              text: "Probabilitas data jika hipotesis benar",
                            },
                            {
                              id: "r3",
                              text: "Probabilitas setelah mempertimbangkan data",
                            },
                          ],
                          correctPairs: [
                            { leftId: "l1", rightId: "r1" },
                            { leftId: "l2", rightId: "r2" },
                            { leftId: "l3", rightId: "r3" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            // =========================================
            // QUIZ (Updated - Mixed Single & Multiple Answers)
            // =========================================
            quiz: {
              id: 701,
              title: "Quiz: Probability Theory & Bayes Foundations",
              description:
                "Quiz ini menguji pemahaman Anda tentang konsep probabilitas dasar, peluang bersyarat, aturan penjumlahan dan perkalian, serta penerapan Teorema Bayes dalam Machine Learning.",
              totalQuestions: 10,
              timeLimitMinutes: 20,

              questions: [
                {
                  id: 7011,
                  orderNumber: 1,
                  textQuestion:
                    "Pernyataan yang BENAR tentang probabilitas adalah?",
                  options: [
                    "Nilainya selalu antara 0 dan 1",
                    "Probabilitas 0 berarti mustahil",
                    "Probabilitas 1 berarti pasti terjadi",
                    "Nilainya bisa lebih dari 1",
                  ],
                  correctAnswers: [
                    "Nilainya selalu antara 0 dan 1",
                    "Probabilitas 0 berarti mustahil",
                    "Probabilitas 1 berarti pasti terjadi",
                  ],
                  explanation:
                    "Probabilitas berada pada rentang 0–1, dengan 0 mustahil dan 1 pasti.",
                },

                {
                  id: 7012,
                  orderNumber: 2,
                  textQuestion:
                    "Dalam Machine Learning, probabilitas sering digunakan untuk?",
                  options: [
                    "Klasifikasi data",
                    "Mengukur confidence model",
                    "Mengurutkan dataset",
                    "Menghapus missing value",
                  ],
                  correctAnswers: [
                    "Klasifikasi data",
                    "Mengukur confidence model",
                  ],
                  explanation:
                    "Model klasifikasi sering menghasilkan probabilitas sebagai confidence score.",
                },

                {
                  id: 7013,
                  orderNumber: 3,
                  textQuestion:
                    "Aturan penjumlahan probabilitas digunakan ketika menghitung peluang kejadian?",
                  options: [
                    "A ATAU B",
                    "A DAN B",
                    "Kejadian saling eksklusif",
                    "Peluang bersyarat",
                  ],
                  correctAnswers: ["A ATAU B", "Kejadian saling eksklusif"],
                  explanation:
                    "Aturan penjumlahan digunakan untuk kejadian alternatif (union).",
                },

                {
                  id: 7014,
                  orderNumber: 4,
                  textQuestion: "Aturan perkalian probabilitas berlaku ketika?",
                  options: [
                    "Menghitung peluang A DAN B",
                    "Menghitung kejadian bersyarat",
                    "Kejadian tidak mungkin terjadi",
                    "Menghitung mean data",
                  ],
                  correctAnswers: [
                    "Menghitung peluang A DAN B",
                    "Menghitung kejadian bersyarat",
                  ],
                  explanation:
                    "Aturan perkalian digunakan untuk kejadian gabungan dan peluang bersyarat.",
                },

                {
                  id: 7015,
                  orderNumber: 5,
                  textQuestion:
                    "Manakah notasi yang benar untuk peluang bersyarat?",
                  options: ["P(A|B)", "P(A+B)", "P(A ∩ B)", "P(B|A)"],
                  correctAnswers: ["P(A|B)"],
                  explanation:
                    "P(A|B) berarti peluang A terjadi dengan syarat B sudah terjadi.",
                },

                {
                  id: 7016,
                  orderNumber: 6,
                  textQuestion: "Komponen dalam Teorema Bayes meliputi?",
                  options: [
                    "Prior",
                    "Posterior",
                    "Likelihood",
                    "Evidence",
                    "Variance",
                  ],
                  correctAnswers: [
                    "Prior",
                    "Posterior",
                    "Likelihood",
                    "Evidence",
                  ],
                  explanation:
                    "Bayes terdiri dari prior, likelihood, evidence, dan menghasilkan posterior.",
                },

                {
                  id: 7017,
                  orderNumber: 7,
                  textQuestion: "Makna utama dari Teorema Bayes adalah?",
                  options: [
                    "Memperbarui keyakinan berdasarkan data baru",
                    "Menghitung rata-rata",
                    "Mengubah prior menjadi posterior",
                    "Menghapus noise data",
                  ],
                  correctAnswers: [
                    "Memperbarui keyakinan berdasarkan data baru",
                    "Mengubah prior menjadi posterior",
                  ],
                  explanation:
                    "Bayes memperbarui probabilitas awal (prior) menjadi posterior berdasarkan bukti.",
                },

                {
                  id: 7018,
                  orderNumber: 8,
                  textQuestion: "Naive Bayes disebut 'naive' karena?",
                  options: [
                    "Mengasumsikan independensi antar fitur",
                    "Perhitungannya sederhana",
                    "Tidak menggunakan probabilitas",
                    "Mengabaikan hubungan antar fitur",
                  ],
                  correctAnswers: [
                    "Mengasumsikan independensi antar fitur",
                    "Mengabaikan hubungan antar fitur",
                  ],
                  explanation:
                    "Disebut naive karena asumsi independensi fitur yang kuat dan jarang benar sepenuhnya.",
                },

                {
                  id: 7019,
                  orderNumber: 9,
                  textQuestion:
                    "Contoh penerapan Naive Bayes yang umum adalah?",
                  options: [
                    "Spam email detection",
                    "Sentiment analysis",
                    "Clustering K-Means",
                    "Face recognition",
                  ],
                  correctAnswers: [
                    "Spam email detection",
                    "Sentiment analysis",
                  ],
                  explanation:
                    "Naive Bayes banyak digunakan dalam klasifikasi teks seperti spam detection dan sentiment analysis.",
                },

                {
                  id: 70110,
                  orderNumber: 10,
                  textQuestion:
                    "Mengapa probabilitas sangat penting dalam Machine Learning?",
                  options: [
                    "Untuk menangani ketidakpastian",
                    "Untuk membuat prediksi berbasis peluang",
                    "Untuk styling tampilan dashboard",
                    "Untuk menghitung hardware usage",
                  ],
                  correctAnswers: [
                    "Untuk menangani ketidakpastian",
                    "Untuk membuat prediksi berbasis peluang",
                  ],
                  explanation:
                    "ML sering bekerja dengan data yang tidak pasti sehingga probabilitas menjadi fondasi penting.",
                },
              ],
            },
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 8,
        coverImage:
          "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&h=200",
        title: "Calculus for Optimization",
        description:
          "Mengenal turunan yang digunakan untuk melatih algoritma machine learning.",
        taskType: "project",
        modules: [
          {
            id: 25,
            title: "Introduction to Derivatives",
            estimatedMinutes: 20,
            completed: false,
            subModules: [
              {
                id: 45,
                title: "Konsep Laju Perubahan",
                progress: 100,
                blocks: [
                  {
                    id: "block-153",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-153",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Turunan sebagai Representasi Perubahan",
                      },
                      {
                        id: "paragraph-235",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Kalkulus merupakan fondasi matematis yang sangat penting dalam machine learning, khususnya dalam proses optimasi model. Konsep utama yang digunakan adalah turunan atau derivative, yang merepresentasikan laju perubahan suatu fungsi terhadap variabelnya. Secara intuitif, turunan memberi tahu kita seberapa cepat suatu output berubah ketika input berubah sedikit saja. Jika perubahan kecil pada input menghasilkan perubahan besar pada output, maka turunan bernilai besar. Sebaliknya, jika perubahan input hampir tidak memengaruhi output, maka nilai turunannya kecil.",
                      },
                      {
                        id: "paragraph-236",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dalam konteks model machine learning, fungsi yang sering kita turunkan adalah fungsi loss atau cost function. Fungsi ini mengukur seberapa jauh prediksi model dari nilai sebenarnya. Dengan menghitung turunan dari fungsi loss terhadap parameter model, kita dapat mengetahui arah perubahan yang harus diambil untuk memperkecil kesalahan tersebut. Inilah dasar dari algoritma optimasi seperti gradient descent.",
                      },
                      {
                        id: "highlight-42",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Turunan membantu kita mengetahui arah tercepat untuk memperkecil error.",
                      },
                    ],
                  },
                  {
                    id: "block-154",
                    orderNumber: 2,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-154",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Makna Geometris Turunan",
                      },
                      {
                        id: "paragraph-237",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Secara geometris, turunan di suatu titik pada grafik fungsi dapat dipahami sebagai kemiringan (slope) garis singgung di titik tersebut. Jika kemiringannya positif, maka fungsi sedang meningkat. Jika kemiringannya negatif, maka fungsi sedang menurun. Dan jika kemiringannya nol, maka kita berada di titik stasioner yang bisa jadi merupakan titik minimum atau maksimum lokal. Visualisasi ini sangat penting karena dalam optimasi kita mencari titik di mana kemiringan mendekati nol, yang berarti model telah mencapai kondisi paling optimal terhadap data pelatihan.",
                      },
                      {
                        id: "paragraph-238",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Bayangkan sebuah bola yang diletakkan di permukaan berbentuk mangkuk. Bola tersebut secara alami akan menggelinding menuju titik terendah. Gradien bertindak seperti kemiringan permukaan yang memberi tahu bola ke arah mana ia harus bergerak. Analogi ini membantu kita memahami bagaimana parameter model diperbarui secara bertahap hingga mencapai titik minimum dari fungsi loss.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-10",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-10",
                          url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
                          caption:
                            "Ilustrasi grafik fungsi dan garis singgung.",
                        },
                      },
                      {
                        id: "mcq-42",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-44",
                          question:
                            "Jika nilai turunan di suatu titik bernilai negatif, apa artinya?",
                          options: [
                            { id: "opt-1", text: "Fungsi sedang naik" },
                            { id: "opt-2", text: "Fungsi sedang turun" },
                            { id: "opt-3", text: "Fungsi konstan selamanya" },
                            { id: "opt-4", text: "Tidak bisa ditentukan" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Turunan negatif menunjukkan bahwa fungsi menurun pada titik tersebut.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-155",
                    orderNumber: 3,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-155",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Turunan dalam Optimasi Machine Learning",
                      },
                      {
                        id: "paragraph-239",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam praktik machine learning modern, turunan digunakan untuk memperbarui parameter model secara iteratif. Proses ini dikenal sebagai gradient descent, di mana parameter diperbarui dengan mengurangi nilai gradien dikalikan learning rate. Learning rate menentukan seberapa besar langkah yang diambil dalam setiap iterasi. Jika terlalu besar, model bisa melewati titik minimum. Jika terlalu kecil, proses konvergensi akan sangat lambat.",
                      },
                      {
                        id: "paragraph-240",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Pemahaman tentang turunan bukan hanya penting secara teoritis, tetapi juga praktis. Hampir semua algoritma deep learning modern, termasuk neural network, bergantung pada perhitungan turunan melalui teknik yang disebut backpropagation. Dengan kata lain, tanpa kalkulus, sebagian besar sistem kecerdasan buatan yang kita gunakan hari ini tidak akan dapat dilatih secara efektif.",
                      },
                      {
                        id: "summary-40",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Turunan mengukur laju perubahan fungsi",
                          "Secara geometris adalah kemiringan garis singgung",
                          "Digunakan untuk meminimalkan fungsi loss",
                          "Menjadi dasar gradient descent dan backpropagation",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-47",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-47",
                          language: "python",
                          initialCode:
                            '# Contoh sederhana gradient descent\n\nimport numpy as np\n\n# Fungsi sederhana f(x) = x^2\ndef f(x):\n    return x**2\n\n# Turunannya f\'(x) = 2x\ndef df(x):\n    return 2*x\n\nx = 5  # nilai awal\nlearning_rate = 0.1\n\nfor i in range(10):\n    x = x - learning_rate * df(x)\n    print(f"Iterasi {i+1}, x = {x}, f(x) = {f(x)}")',
                            expectedResult: "Iterasi 1, x = 4.0, f(x) = 16.0\nIterasi 2, x = 3.2, f(x) = 10.24\nIterasi 3, x = 2.56, f(x) = 6.5536\nIterasi 4, x = 2.048, f(x) = 4.1943\nIterasi 5, x = 1.6384, f(x) = 2.6844\nIterasi 6, x = 1.3107, f(x) = 1.718\nIterasi 7, x = 1.0486, f(x) = 1.0995\nIterasi 8, x = 0.8389, f(x) = 0.7037\nIterasi 9, x = 0.6711, f(x) = 0.4504\nIterasi 10, x = 0.5369, f(x) = 0.2882"
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 46,
                title: "Aturan Dasar Turunan",
                progress: 25,
                blocks: [
                  {
                    id: "block-156",
                    orderNumber: 1,
                    progress: 100,
                    contents: [
                      {
                        id: "heading-156",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Power Rule, Product Rule, dan Sum Rule",
                      },
                      {
                        id: "paragraph-241",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam kalkulus diferensial, terdapat beberapa aturan dasar yang sangat membantu kita menghitung turunan dengan cepat tanpa harus kembali ke definisi limit setiap saat. Salah satu yang paling fundamental adalah Power Rule. Jika f(x) = x^n, maka turunannya adalah n*x^(n-1). Aturan ini menjadi fondasi bagi banyak perhitungan turunan dalam model machine learning karena sebagian besar fungsi polinomial mengikuti pola ini. Dengan memahami pola umum tersebut, kita dapat menghemat waktu dan mengurangi kompleksitas perhitungan secara signifikan.",
                      },
                      {
                        id: "paragraph-242",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Selain itu, terdapat Sum Rule yang menyatakan bahwa turunan dari penjumlahan beberapa fungsi adalah jumlah dari turunan masing-masing fungsi. Kemudian Product Rule digunakan ketika dua fungsi dikalikan. Jika kita memiliki dua fungsi f(x) dan g(x), maka turunan dari f(x)g(x) adalah f'(x)g(x) + f(x)g'(x). Aturan-aturan ini sering muncul dalam formulasi fungsi loss yang lebih kompleks dan dalam ekspresi matematis neural network.",
                      },
                      {
                        id: "highlight-43",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Aturan dasar turunan menyederhanakan perhitungan tanpa kembali ke limit.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-43",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-45",
                          question: "Turunan dari f(x) = 3x^4 adalah?",
                          options: [
                            { id: "opt-1", text: "12x^3" },
                            { id: "opt-2", text: "3x^3" },
                            { id: "opt-3", text: "4x^3" },
                            { id: "opt-4", text: "12x^4" },
                          ],
                          correctAnswers: ["opt-1"],
                          explanation:
                            "Menggunakan Power Rule: turunan 3x^4 adalah 3*4x^3 = 12x^3.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-157",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-157",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Chain Rule dan Komposisi Fungsi",
                      },
                      {
                        id: "paragraph-243",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Chain Rule atau Aturan Rantai digunakan ketika kita menurunkan fungsi yang berada di dalam fungsi lain, atau yang disebut komposisi fungsi. Jika kita memiliki h(x) = f(g(x)), maka turunannya adalah f'(g(x)) * g'(x). Secara intuitif, aturan ini menyatakan bahwa perubahan total merupakan hasil dari perubahan luar dikalikan perubahan dalam. Dalam konteks deep learning, hampir seluruh arsitektur neural network adalah komposisi berlapis-lapis dari fungsi aktivasi dan transformasi linear, sehingga Chain Rule menjadi fondasi utama dalam proses backpropagation.",
                      },
                      {
                        id: "paragraph-244",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Tanpa Chain Rule, kita tidak dapat menghitung bagaimana setiap parameter di lapisan terdalam memengaruhi total error di lapisan output. Inilah sebabnya mengapa pemahaman mendalam terhadap aturan ini sangat penting bagi siapa pun yang ingin memahami cara kerja pelatihan neural network secara matematis. Setiap lapisan menyumbangkan sebagian kecil perubahan, dan Chain Rule memastikan kontribusi tersebut dihitung secara sistematis dan akurat.",
                      },
                      {
                        id: "accordion-36",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Langkah Intuitif Chain Rule",
                        description:
                          "Memahami proses turunan komposisi fungsi.",
                        items: [
                          {
                            title: "Identifikasi fungsi luar",
                            content:
                              "Tentukan fungsi paling luar dalam komposisi.",
                          },
                          {
                            title: "Turunkan fungsi luar",
                            content:
                              "Hitung turunan fungsi luar terhadap variabel dalam.",
                          },
                          {
                            title: "Kalikan turunan fungsi dalam",
                            content: "Hitung turunan fungsi bagian dalam.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-11",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-11",
                          url: "https://www.youtube.com/watch?v=YG15m2VwSXY",
                          caption:
                            "Video penjelasan Chain Rule dan aplikasinya.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-158",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-158",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Turunan Simbolik dan Automatic Differentiation",
                      },
                      {
                        id: "paragraph-245",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dalam praktik modern, kita tidak selalu menghitung turunan secara manual. Library matematika simbolik seperti SymPy memungkinkan kita menghitung turunan secara simbolik, menghasilkan ekspresi matematis baru sebagai output. Sementara itu, framework deep learning seperti PyTorch dan TensorFlow menggunakan teknik yang disebut automatic differentiation untuk menghitung gradien secara efisien selama proses pelatihan model. Teknik ini memanfaatkan prinsip Chain Rule yang diterapkan secara terstruktur pada grafik komputasi.",
                      },
                      {
                        id: "paragraph-246",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Automatic differentiation berbeda dari diferensiasi numerik karena tidak menggunakan pendekatan aproksimasi berbasis selisih kecil, melainkan menghitung turunan secara eksak berdasarkan struktur operasi yang dilakukan. Hal ini membuat proses pelatihan neural network menjadi lebih stabil, cepat, dan akurat. Dengan memahami hubungan antara aturan turunan dasar dan implementasinya dalam kode, kita dapat lebih percaya diri dalam mengembangkan serta mengoptimalkan model machine learning.",
                      },
                      {
                        id: "summary-41",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Power Rule dan Product Rule mempermudah turunan polinomial",
                          "Chain Rule penting untuk komposisi fungsi",
                          "Backpropagation bergantung pada Chain Rule",
                          "Automatic differentiation menghitung gradien secara efisien",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-48",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-48",
                          language: "python",
                          initialCode:
                            "import sympy as sp\n\nx = sp.Symbol('x')\nf = (3*x**2 + 2*x)**3\n\ndf = sp.diff(f, x)\nprint('Fungsi f(x):', f)\nprint('Turunan f(x):', df)",
                            expectedResult: "Fungsi f(x): (3*x**2 + 2*x)**3\nTurunan f(x): 3*(6*x + 2)*(3*x**2 + 2*x)**2"
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 26,
            title: "The Role of Gradient in ML",
            estimatedMinutes: 25,
            completed: false,
            subModules: [
              {
                id: 47,
                title: "Gradient Descent: Menuruni Lembah Error",
                progress: 0,
                blocks: [
                  {
                    id: "block-159",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-159",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Memahami Gradient dalam Ruang Multivariabel",
                      },
                      {
                        id: "paragraph-247",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Gradient adalah vektor yang terdiri dari kumpulan turunan parsial terhadap setiap variabel dalam suatu fungsi multivariabel. Jika suatu fungsi memiliki banyak parameter, maka gradient menunjukkan arah kenaikan tercepat dari fungsi tersebut di ruang berdimensi tinggi. Dalam machine learning, fungsi yang dimaksud biasanya adalah fungsi loss yang bergantung pada banyak bobot dan bias. Karena gradient menunjuk ke arah kenaikan tercepat, maka untuk meminimalkan error kita bergerak ke arah sebaliknya, yaitu negatif gradient. Konsep inilah yang melahirkan algoritma Gradient Descent.",
                      },
                      {
                        id: "paragraph-248",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Secara matematis, jika L(w) adalah fungsi loss terhadap parameter w, maka pembaruan parameter dilakukan dengan rumus w = w - alpha * grad(L). Di sini alpha adalah learning rate yang mengontrol besar langkah pembaruan. Proses ini dilakukan secara iteratif hingga perubahan nilai loss menjadi sangat kecil atau mencapai batas iterasi tertentu.",
                      },
                      {
                        id: "highlight-44",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Kita bergerak berlawanan arah gradient untuk meminimalkan error.",
                      },
                    ],
                  },
                  {
                    id: "block-160",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-160",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Analogi Menuruni Gunung Berkabut",
                      },
                      {
                        id: "paragraph-249",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Bayangkan seseorang berada di puncak gunung yang diselimuti kabut tebal. Ia tidak dapat melihat keseluruhan lanskap, tetapi dapat merasakan kemiringan tanah di bawah kakinya. Dengan hanya mengandalkan informasi lokal tersebut, ia melangkah ke arah yang paling menurun. Setiap langkah membawanya lebih dekat ke lembah terdalam. Analogi ini menggambarkan cara kerja Gradient Descent yang hanya menggunakan informasi gradien lokal untuk menemukan minimum global atau minimum lokal dari fungsi loss.",
                      },
                      {
                        id: "carousel-2",
                        type: "carousel",
                        orderNumber: 3,
                        title: "Tahapan Proses Gradient Descent",
                        description: "Gambaran iteratif penurunan error.",
                        cardsPerSlide: 3,
                        items: [
                          {
                            title: "Inisialisasi Parameter",
                            content: "Bobot dimulai dari nilai acak.",
                          },
                          {
                            title: "Hitung Gradient",
                            content:
                              "Turunan parsial dihitung terhadap semua parameter.",
                          },
                          {
                            title: "Update Parameter",
                            content:
                              "Parameter digeser ke arah negatif gradient.",
                          },
                          {
                            title: "Evaluasi Loss",
                            content: "Cek apakah error sudah cukup kecil.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-12",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-12",
                          url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
                          caption:
                            "Ilustrasi analogi lembah dan penurunan gradien.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-161",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-161",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Learning Rate dan Stabilitas Konvergensi",
                      },
                      {
                        id: "paragraph-250",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Learning rate adalah hiperparameter yang sangat menentukan keberhasilan proses optimasi. Jika nilainya terlalu besar, proses pembaruan bisa meloncat-loncat dan tidak pernah stabil di sekitar minimum. Sebaliknya, jika terlalu kecil, proses konvergensi menjadi sangat lambat dan memerlukan banyak iterasi. Oleh karena itu, pemilihan learning rate sering kali dilakukan melalui eksperimen atau menggunakan teknik adaptif seperti scheduler atau optimizer modern.",
                      },
                      {
                        id: "paragraph-251",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Beberapa varian Gradient Descent yang populer antara lain Stochastic Gradient Descent (SGD) yang memperbarui parameter berdasarkan satu sampel data, Mini-batch Gradient Descent yang menggunakan sebagian kecil dataset, serta Adam Optimizer yang menggabungkan momentum dan adaptive learning rate. Varian-varian ini dirancang untuk meningkatkan stabilitas, kecepatan konvergensi, dan performa model dalam berbagai skenario pelatihan neural network.",
                      },
                      {
                        id: "contentcard-6",
                        type: "content_card",
                        orderNumber: 4,
                        title: "Varian Optimizer Populer",
                        description: "Perbandingan singkat metode optimasi.",
                        disableExpandableContent: false,
                        items: [
                          {
                            title: "SGD",
                            content: "Update berbasis satu sampel.",
                            expandableContent:
                              "Cepat namun fluktuatif dalam konvergensi.",
                          },
                          {
                            title: "Mini-batch GD",
                            content: "Gunakan subset data.",
                            expandableContent:
                              "Lebih stabil dibanding SGD murni.",
                          },
                          {
                            title: "Adam",
                            content: "Adaptive learning rate.",
                            expandableContent:
                              "Sangat populer untuk deep learning modern.",
                          },
                        ],
                      },
                      {
                        id: "summary-42",
                        type: "summary",
                        orderNumber: 5,
                        comments: [
                          "Gradient adalah vektor turunan parsial",
                          "Negatif gradient digunakan untuk minimisasi",
                          "Learning rate memengaruhi stabilitas",
                          "Ada berbagai varian optimizer modern",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-49",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-49",
                          language: "python",
                          initialCode:
                            "# Contoh sederhana update bobot\nweight = 0.5\nlearning_rate = 0.1\ngradient = 0.8\n\nweight = weight - learning_rate * gradient\nprint('Bobot setelah update:', weight)",
                            expectedResult: "Bobot setelah update: 0.42"
                        },
                      },
                      {
                        id: "mcq-44",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-46",
                          question:
                            "Apa yang terjadi jika learning rate terlalu besar?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Konvergensi lebih cepat dan stabil",
                            },
                            {
                              id: "opt-2",
                              text: "Model bisa melewati titik minimum",
                            },
                            { id: "opt-3", text: "Gradient menjadi nol" },
                            { id: "opt-4", text: "Loss langsung menjadi nol" },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Learning rate besar dapat menyebabkan overshooting dan tidak stabil.",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 27,
            title: "Mini Project: Optimization with Gradient Descent",
            estimatedMinutes: 45,
            completed: false,
            subModules: [
              {
                id: 48,
                title: "Persiapan Lingkungan dan Dataset",
                progress: 0,
                blocks: [
                  {
                    id: "block-162",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-162",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Menyiapkan Lingkungan Kerja untuk Mini Project",
                      },
                      {
                        id: "paragraph-252",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Sebelum kita membangun algoritma Gradient Descent dari nol, kita perlu memastikan lingkungan pengembangan sudah siap. Dalam proyek ini, kita akan menggunakan Python sebagai bahasa utama karena sintaksnya yang sederhana serta ekosistem pustaka ilmiah yang sangat kuat. Dua pustaka utama yang akan digunakan adalah NumPy untuk komputasi numerik dan Matplotlib untuk visualisasi grafik. NumPy memungkinkan kita melakukan operasi vektor dan matriks secara efisien, sedangkan Matplotlib membantu kita melihat bagaimana data dan model berevolusi selama proses optimasi berlangsung.",
                      },
                      {
                        id: "paragraph-253",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Pastikan Python sudah terinstal di sistem Anda, baik melalui distribusi standar maupun Anaconda. Anda juga dapat menggunakan environment seperti Jupyter Notebook atau VSCode agar proses eksplorasi data dan visualisasi menjadi lebih interaktif. Dengan lingkungan yang terstruktur dan dependensi yang jelas, eksperimen menjadi lebih mudah direproduksi dan lebih minim error teknis.",
                      },
                      {
                        id: "highlight-45",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Lingkungan yang bersih dan terstruktur mempercepat eksperimen.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-50",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-50",
                          language: "python",
                          initialCode:
                            "# Instalasi pustaka (jalankan di terminal jika belum terpasang)\n# pip install numpy matplotlib\n\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nprint('NumPy version:', np.__version__)\nprint('Matplotlib siap digunakan!')",
                            expectedResult: "NumPy version: 1.26.4\nMatplotlib siap digunakan!"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-163",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-163",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Membangun Dataset Sintetis Linear",
                      },
                      {
                        id: "paragraph-254",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Untuk memahami cara kerja optimasi secara visual, kita akan membuat dataset sintetis sederhana yang mengikuti hubungan linear. Dataset ini akan mensimulasikan pola y = 2x + 1 dengan tambahan noise acak agar terlihat lebih realistis. Noise diperlukan karena dalam dunia nyata data hampir tidak pernah benar-benar bersih atau sempurna. Dengan adanya noise, kita bisa melihat bagaimana Gradient Descent berusaha menemukan garis terbaik yang meminimalkan error meskipun data tidak sepenuhnya presisi.",
                      },
                      {
                        id: "paragraph-255",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Dataset akan terdiri dari 100 sampel dengan nilai X acak antara 0 hingga 2. Nilai y kemudian dihitung berdasarkan persamaan linear ditambah distribusi noise normal. Visualisasi scatter plot akan membantu kita melihat pola hubungan tersebut secara intuitif sebelum kita mulai melakukan pelatihan model regresi linear.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-51",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-51",
                          language: "python",
                          initialCode:
                            "import numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(42)\n\n# Generate data\nX = 2 * np.random.rand(100, 1)\nnoise = np.random.randn(100, 1)\ny = 1 + 2 * X + noise\n\nplt.scatter(X, y)\nplt.title('Dataset Sintetis Regresi Linear')\nplt.xlabel('X')\nplt.ylabel('y')\nplt.show()",
                            expectedResult: "<Figure size 640x480 with 1 Axes>"
                        },
                      },
                      {
                        id: "mcq-45",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-47",
                          question:
                            "Mengapa kita menambahkan noise pada dataset sintetis?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Agar data terlihat lebih realistis",
                            },
                            {
                              id: "opt-2",
                              text: "Agar model langsung overfitting",
                            },
                            {
                              id: "opt-3",
                              text: "Supaya gradient menjadi nol",
                            },
                            { id: "opt-4", text: "Agar dataset lebih kecil" },
                          ],
                          correctAnswers: ["opt-1"],
                          explanation:
                            "Noise mensimulasikan variasi alami pada data dunia nyata.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-164",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-164",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Visualisasi dan Pemahaman Awal Data",
                      },
                      {
                        id: "paragraph-256",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Visualisasi merupakan langkah penting sebelum melakukan pelatihan model. Dengan melihat sebaran data, kita dapat memahami apakah hubungan antar variabel tampak linear, non-linear, atau bahkan tidak memiliki pola jelas. Dalam kasus dataset sintetis ini, kita mengharapkan pola linear dengan sedikit variasi akibat noise. Scatter plot memberikan gambaran awal mengenai bagaimana garis regresi ideal seharusnya terbentuk.",
                      },
                      {
                        id: "paragraph-257",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Pada tahap ini, kita belum menghitung parameter model. Kita hanya mengamati distribusi data dan mencoba memperkirakan secara visual kemiringan garis terbaik. Pendekatan eksploratif seperti ini membantu membangun intuisi sebelum kita masuk ke perhitungan matematis menggunakan fungsi loss dan turunan. Dengan pemahaman visual yang kuat, proses implementasi Gradient Descent akan terasa jauh lebih logis dan terstruktur.",
                      },
                      {
                        id: "summary-43",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Pastikan Python dan pustaka terinstal",
                          "Gunakan NumPy untuk komputasi numerik",
                          "Tambahkan noise untuk simulasi realistis",
                          "Visualisasi membantu memahami pola data",
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 49,
                title: "Implementasi Algoritma dari Nol",
                progress: 0,
                blocks: [
                  {
                    id: "block-165",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-165",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Merancang Fungsi Gradient Descent",
                      },
                      {
                        id: "paragraph-258",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Pada tahap ini, kita mulai membangun algoritma Gradient Descent sepenuhnya dari nol tanpa bantuan library machine learning tingkat tinggi. Kita akan membuat sebuah fungsi yang menerima input berupa data fitur (X), label (y), learning rate, serta jumlah iterasi atau epoch. Di dalam fungsi tersebut, kita akan menginisialisasi parameter model regresi linear, yaitu bobot (m) dan bias (c), dengan nilai awal tertentu—biasanya nol atau angka kecil acak. Proses inisialisasi ini penting karena nilai awal dapat memengaruhi jalur konvergensi, meskipun untuk regresi linear sederhana biasanya tidak terlalu sensitif.",
                      },
                      {
                        id: "paragraph-259",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Setiap iterasi akan mengikuti pola yang sama: menghitung prediksi berdasarkan parameter saat ini, mengukur error, menghitung gradien, lalu memperbarui parameter. Siklus ini adalah inti dari optimasi berbasis turunan. Dengan memahami alur ini secara manual, Anda akan memiliki pemahaman yang jauh lebih kuat dibanding sekadar memanggil fungsi .fit() dari library seperti scikit-learn.",
                      },
                      {
                        id: "highlight-46",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Gradient Descent adalah siklus prediksi → error → gradien → update.",
                      },
                    ],
                  },
                  {
                    id: "block-166",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-166",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Menghitung Loss dengan Mean Squared Error",
                      },
                      {
                        id: "paragraph-260",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Untuk mengukur seberapa baik model kita bekerja, kita menggunakan fungsi loss bernama Mean Squared Error (MSE). MSE menghitung rata-rata kuadrat selisih antara nilai prediksi dan nilai aktual. Penggunaan kuadrat bertujuan untuk memastikan semua error bernilai positif sekaligus memberikan penalti lebih besar terhadap kesalahan yang besar. Secara matematis, MSE didefinisikan sebagai jumlah dari (y_pred - y)^2 dibagi jumlah sampel.",
                      },
                      {
                        id: "paragraph-261",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Setelah menghitung nilai MSE, kita perlu mencari turunannya terhadap parameter m dan c. Turunan inilah yang menghasilkan gradien. Untuk regresi linear sederhana, turunan MSE terhadap m dan c dapat dihitung secara analitik menggunakan aturan turunan dasar. Hasilnya berupa dua persamaan gradien yang akan kita gunakan untuk memperbarui parameter model.",
                      },
                      {
                        id: "accordion-37",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Langkah Perhitungan Matematis",
                        description:
                          "Ringkasan turunan MSE terhadap parameter.",
                        items: [
                          {
                            title: "1. Hitung Prediksi",
                            content:
                              "Gunakan persamaan y_pred = mX + c untuk semua data.",
                          },
                          {
                            title: "2. Hitung Error",
                            content: "Error = y_pred - y untuk setiap sampel.",
                          },
                          {
                            title: "3. Turunan terhadap m",
                            content: "m_grad = (2/n) * Σ(error * X).",
                          },
                          {
                            title: "4. Turunan terhadap c",
                            content: "c_grad = (2/n) * Σ(error).",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "image-13",
                        type: "image_video",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "media-13",
                          url: "https://www.youtube.com/watch?v=sDv4f4s2SB8",
                          caption:
                            "Video penjelasan implementasi Gradient Descent.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-167",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-167",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Update Parameter dan Iterasi Hingga Konvergen",
                      },
                      {
                        id: "paragraph-262",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah gradien diperoleh, kita memperbarui parameter menggunakan rumus pembaruan standar: parameter = parameter - learning_rate × gradient. Tanda negatif memastikan kita bergerak menuju arah penurunan error. Proses ini diulang berkali-kali hingga perubahan nilai loss sangat kecil atau jumlah iterasi maksimum tercapai. Dalam praktik nyata, kita juga bisa menyimpan histori loss untuk melihat bagaimana kurva error menurun seiring waktu.",
                      },
                      {
                        id: "paragraph-263",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Menjalankan algoritma ini secara manual memberikan wawasan mendalam mengenai bagaimana model belajar dari data. Anda akan melihat bahwa pada awal iterasi, nilai loss biasanya besar, tetapi secara bertahap menurun seiring parameter mendekati nilai optimal. Jika learning rate terlalu besar, loss bisa berosilasi. Jika terlalu kecil, konvergensi menjadi lambat. Di sinilah eksperimen dan intuisi matematis menjadi sangat penting.",
                      },
                      {
                        id: "summary-44",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Inisialisasi bobot dan bias",
                          "Hitung prediksi dan MSE",
                          "Turunkan MSE untuk dapatkan gradien",
                          "Update parameter berulang hingga konvergen",
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-52",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-52",
                          language: "python",
                          initialCode:
                            "import numpy as np\n\ndef gradient_descent(X, y, lr=0.01, epochs=100):\n    m, c = 0.0, 0.0\n    n = len(X)\n    \n    for i in range(epochs):\n        y_pred = m * X + c\n        error = y_pred - y\n        \n        m_gradient = (2/n) * np.sum(error * X)\n        c_gradient = (2/n) * np.sum(error)\n        \n        m = m - lr * m_gradient\n        c = c - lr * c_gradient\n    \n    return m, c",
                            expectedResult: ""
                        },
                      },
                      {
                        id: "mcq-46",
                        type: "multiple_choice",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "question-48",
                          question:
                            "Mengapa parameter diperbarui dengan mengurangi gradient?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Karena gradient menunjukkan arah kenaikan tercepat",
                            },
                            { id: "opt-2", text: "Agar error bertambah" },
                            { id: "opt-3", text: "Supaya model tidak belajar" },
                            { id: "opt-4", text: "Karena MSE selalu negatif" },
                          ],
                          correctAnswers: ["opt-1"],
                          explanation:
                            "Gradient menunjuk arah kenaikan, sehingga kita bergerak ke arah sebaliknya untuk meminimalkan loss.",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 50,
                title: "Evaluasi dan Eksperimen",
                progress: 0,
                blocks: [
                  {
                    id: "block-168",
                    orderNumber: 1,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-168",
                        type: "heading",
                        level: 2,
                        orderNumber: 1,
                        text: "Mengevaluasi Hasil Regresi Linear",
                      },
                      {
                        id: "paragraph-264",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Setelah model selesai dilatih menggunakan Gradient Descent, langkah berikutnya adalah melakukan evaluasi performa model. Evaluasi ini bertujuan untuk memastikan bahwa garis regresi yang dihasilkan benar-benar merepresentasikan pola hubungan dalam data. Cara paling intuitif adalah dengan memvisualisasikan garis regresi di atas scatter plot data asli. Jika garis tersebut melewati pusat distribusi data dan mengikuti arah tren dengan baik, maka model telah belajar secara optimal.",
                      },
                      {
                        id: "paragraph-265",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Selain visualisasi, kita juga dapat menghitung kembali nilai Mean Squared Error pada parameter akhir untuk melihat seberapa kecil error yang tersisa. Evaluasi kuantitatif ini penting karena visualisasi terkadang bisa menipu, terutama jika jumlah data besar atau terdapat outlier yang ekstrem. Kombinasi evaluasi visual dan numerik akan memberikan gambaran menyeluruh mengenai kualitas model.",
                      },
                      {
                        id: "highlight-47",
                        type: "highlight",
                        orderNumber: 4,
                        text: "Evaluasi model harus bersifat visual dan kuantitatif.",
                      },
                    ],
                    additionalContents: [
                      {
                        id: "code-53",
                        type: "interactive_code",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "interactive-53",
                          language: "python",
                          initialCode:
                            "m, c = gradient_descent(X, y, lr=0.01, epochs=200)\n\ny_pred = m * X + c\n\nplt.scatter(X, y)\nplt.plot(X, y_pred, color='red')\nplt.title('Evaluasi Garis Regresi')\nplt.xlabel('X')\nplt.ylabel('y')\nplt.show()",
                            expectedResult: "<Figure size 640x480 with 1 Axes>"
                        },
                      },
                    ],
                  },
                  {
                    id: "block-169",
                    orderNumber: 2,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-169",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Eksperimen Learning Rate",
                      },
                      {
                        id: "paragraph-266",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Learning rate merupakan hyperparameter yang sangat menentukan keberhasilan proses optimasi. Nilai yang terlalu besar dapat menyebabkan model melompat-lompat di sekitar titik minimum tanpa pernah benar-benar konvergen. Sebaliknya, nilai yang terlalu kecil membuat proses konvergensi sangat lambat dan memakan banyak iterasi. Oleh karena itu, eksperimen menjadi bagian penting dalam memahami perilaku algoritma.",
                      },
                      {
                        id: "paragraph-267",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Cobalah menggunakan nilai learning rate yang sangat besar seperti 0.9 dan perhatikan bagaimana garis regresi mungkin tidak stabil atau bahkan divergen. Kemudian gunakan nilai sangat kecil seperti 0.00001 dan amati bagaimana proses belajar menjadi sangat lambat. Melalui eksperimen ini, Anda akan memahami bahwa pemilihan learning rate bukan sekadar angka acak, melainkan hasil pertimbangan matematis dan empiris.",
                      },
                      {
                        id: "accordion-38",
                        type: "accordion",
                        orderNumber: 4,
                        title: "Apa yang Terjadi Jika...",
                        items: [
                          {
                            title: "Learning Rate Terlalu Besar",
                            content:
                              "Model bisa gagal konvergen dan loss berosilasi.",
                          },
                          {
                            title: "Learning Rate Terlalu Kecil",
                            content:
                              "Konvergensi sangat lambat meskipun stabil.",
                          },
                          {
                            title: "Learning Rate Optimal",
                            content:
                              "Loss turun stabil dan cepat menuju minimum.",
                          },
                        ],
                      },
                    ],
                    additionalContents: [
                      {
                        id: "mcq-47",
                        type: "multiple_choice",
                        orderNumber: 1,
                        position: "after",
                        content: {
                          id: "question-49",
                          question:
                            "Apa dampak utama jika learning rate terlalu besar?",
                          options: [
                            {
                              id: "opt-1",
                              text: "Model konvergen lebih cepat dan stabil",
                            },
                            {
                              id: "opt-2",
                              text: "Loss dapat berosilasi atau divergen",
                            },
                            { id: "opt-3", text: "Gradien menjadi nol" },
                            {
                              id: "opt-4",
                              text: "Dataset menjadi lebih kecil",
                            },
                          ],
                          correctAnswers: ["opt-2"],
                          explanation:
                            "Learning rate besar dapat menyebabkan langkah update terlalu jauh sehingga tidak pernah mencapai minimum.",
                        },
                      },
                      {
                        id: "image-14",
                        type: "image_video",
                        orderNumber: 2,
                        position: "after",
                        content: {
                          id: "media-14",
                          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
                          caption: "Ilustrasi visualisasi performa model.",
                        },
                      },
                    ],
                  },
                  {
                    id: "block-170",
                    orderNumber: 3,
                    progress: 0,
                    contents: [
                      {
                        id: "heading-170",
                        type: "heading",
                        level: 3,
                        orderNumber: 1,
                        text: "Refleksi dan Intuisi Optimasi",
                      },
                      {
                        id: "paragraph-268",
                        type: "paragraph",
                        orderNumber: 2,
                        text: "Dengan menyelesaikan proyek ini, Anda telah membangun algoritma optimasi dasar yang menjadi fondasi dari banyak model machine learning modern. Konsep Gradient Descent tidak hanya digunakan pada regresi linear, tetapi juga pada neural network, logistic regression, hingga model deep learning berskala besar. Perbedaannya hanya terletak pada kompleksitas fungsi loss dan jumlah parameter yang dioptimalkan.",
                      },
                      {
                        id: "paragraph-269",
                        type: "paragraph",
                        orderNumber: 3,
                        text: "Memahami perilaku konvergensi secara praktis akan memberikan Anda insting kuat saat melakukan tuning hyperparameter di masa depan. Ketika menghadapi model yang kompleks, Anda tidak lagi hanya mencoba angka secara acak, melainkan memahami bagaimana perubahan kecil pada learning rate atau jumlah epoch dapat memengaruhi performa model secara keseluruhan.",
                      },
                      {
                        id: "summary-45",
                        type: "summary",
                        orderNumber: 4,
                        comments: [
                          "Evaluasi visual dan numerik sama pentingnya",
                          "Learning rate memengaruhi stabilitas konvergensi",
                          "Eksperimen membantu membangun intuisi",
                          "Gradient Descent adalah fondasi deep learning",
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            // =========================================
            // ASSIGNMENT (taskType = project)
            // DITARUH DI MODULE TERAKHIR
            // MENGUJI SELURUH SUBCHAPTER CALCULUS
            // =========================================
            assignment: {
              id: 801,
              title: "Mini Project: Building Gradient Descent from Scratch",
              description:
                "Pada assignment ini, Anda akan mengimplementasikan algoritma Gradient Descent dari nol menggunakan Python untuk menyelesaikan masalah regresi linear sederhana. Proyek ini menguji pemahaman Anda tentang turunan, gradient, learning rate, dan optimisasi fungsi loss.",
              dueDays: 7,

              instruction: [
                "Buat dataset sintetis dengan hubungan linear y = ax + b dan tambahkan noise.",
                "Implementasikan fungsi Gradient Descent tanpa menggunakan library ML siap pakai.",
                "Gunakan Mean Squared Error (MSE) sebagai fungsi loss.",
                "Lakukan eksperimen dengan minimal 3 nilai learning rate berbeda.",
                "Visualisasikan hasil regresi dan jelaskan perilaku konvergensinya.",
                "Tuliskan kesimpulan tentang pengaruh learning rate terhadap proses optimisasi.",
              ],

              supportingFiles: [
                {
                  id: 1,
                  name: "gradient_descent_template.py",
                  type: "template",
                  url: "https://example.com/templates/gradient_descent_template.py",
                },
                {
                  id: 2,
                  name: "synthetic_dataset_example.csv",
                  type: "dataset",
                  url: "https://example.com/datasets/synthetic_dataset_example.csv",
                },
                {
                  id: 3,
                  name: "gradient_descent_reference.pdf",
                  type: "reference",
                  url: "https://example.com/references/gradient_descent_reference.pdf",
                },
              ],
            },
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
    ],
  },
  {
    id: 3,
    tipe: "machine learning",
    title: "AI for Productivity",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
    deskripsi:
      "Mengoptimalkan pekerjaan harian dengan bantuan AI untuk riset, penulisan, dan manajemen waktu",
    level: "Pemula",
    keywords: [
      "produktivitas",
      "generative ai",
      "chatgpt",
      "prompt engineering",
      "automation",
      "time management",
      "content creation",
    ],
    jumlahSubChapter: 4, // Disesuaikan agar tidak terlalu panjang
    jumlahModul: 10, // Total modul di bawah ini
    rating: 4.5,
    JumlahPerating: "210 ulasan",
    jumlahPembeli: "2.100 peserta",
    subChapters: [
      {
        id: 9,
        coverImage:
          "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=200",
        title: "AI for Writing & Content",
        description:
          "Menggunakan AI untuk mempercepat proses penulisan draf, email, dan artikel.",
        taskType: "quiz",
        modules: [
          {
            id: 28,
            title: "Introduction to LLMs for Writing",
            estimatedMinutes: 15,
            completed: false,
          },
          {
            id: 29,
            title: "Effective Prompting for Drafts",
            estimatedMinutes: 20,
            completed: false,
          },
          {
            id: 30,
            title: "Editing and Fact-Checking AI Output",
            estimatedMinutes: 20,
            completed: false,
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 10,
        coverImage:
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200",
        title: "AI for Research & Synthesis",
        description:
          "Teknik merangkum dokumen panjang dan melakukan riset cepat dengan AI.",
        taskType: "quiz",
        modules: [
          {
            id: 31,
            title: "Summarizing Long Documents",
            estimatedMinutes: 15,
            completed: false,
          },
          {
            id: 32,
            title: "AI-Powered Search Engines",
            estimatedMinutes: 15,
            completed: false,
          },
          {
            id: 33,
            title: "Data Extraction with AI Tools",
            estimatedMinutes: 20,
            completed: false,
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 11,
        coverImage:
          "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=200",
        title: "Time Management & Automation",
        description:
          "Otomasi jadwal dan pengelolaan tugas harian menggunakan asisten AI.",
        taskType: "quiz",
        modules: [
          {
            id: 34,
            title: "AI for Meeting Transcription",
            estimatedMinutes: 20,
            completed: false,
          },
          {
            id: 35,
            title: "Automating Daily To-Do Lists",
            estimatedMinutes: 15,
            completed: false,
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 12,
        coverImage:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200",
        title: "Final Project: AI Workflow",
        description:
          "Membangun sistem alur kerja produktivitas pribadi yang terintegrasi AI.",
        taskType: "project",
        modules: [
          {
            id: 36,
            title: "Designing Your AI Workflow",
            estimatedMinutes: 30,
            completed: false,
          },
          {
            id: 37,
            title: "Final Project Submission",
            estimatedMinutes: 45,
            completed: false,
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
    ],
  },
  {
    id: 4,
    tipe: "programming",
    title: "Programming Language",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop",
    deskripsi:
      "Dasar-dasar pemrograman untuk membangun logika berpikir dan memahami berbagai bahasa pemrograman",
    level: "Pemula",
    keywords: [
      "coding dasar",
      "logika pemrograman",
      "computational thinking",
      "variabel",
      "control flow",
      "algoritma pemula",
    ],
    jumlahSubChapter: 4,
    jumlahModul: 10,
    rating: 4.4,
    JumlahPerating: "87 ulasan",
    jumlahPembeli: "760 peserta",
    subChapters: [
      {
        id: 13,
        coverImage:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=200",
        title: "Building Blocks of Code",
        description:
          "Mengenal variabel, tipe data, dan bagaimana komputer memproses instruksi sederhana.",
        taskType: "quiz",
        modules: [
          {
            id: 38,
            title: "Introduction to Computational Thinking",
            estimatedMinutes: 15,
            completed: false,
          },
          {
            id: 39,
            title: "Variables and Constants",
            estimatedMinutes: 20,
            completed: false,
          },
          {
            id: 40,
            title: "Data Types: Strings, Numbers, and Booleans",
            estimatedMinutes: 20,
            completed: false,
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 14,
        coverImage:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200",
        title: "Control Flow & Logic",
        description:
          "Mempelajari pengkondisian dan perulangan untuk membuat program yang dinamis.",
        taskType: "quiz",
        modules: [
          {
            id: 41,
            title: "Conditional Statements (If-Else)",
            estimatedMinutes: 25,
            completed: false,
          },
          {
            id: 42,
            title: "Loops: For and While",
            estimatedMinutes: 25,
            completed: false,
          },
          {
            id: 43,
            title: "Logic Operators (AND, OR, NOT)",
            estimatedMinutes: 20,
            completed: false,
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 15,
        coverImage:
          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200",
        title: "Functions & Reusability",
        description:
          "Cara menulis kode yang efisien dan dapat digunakan kembali melalui fungsi.",
        taskType: "quiz",
        modules: [
          {
            id: 44,
            title: "Defining and Calling Functions",
            estimatedMinutes: 20,
            completed: false,
          },
          {
            id: 45,
            title: "Parameters and Return Values",
            estimatedMinutes: 20,
            completed: false,
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
      {
        id: 16,
        coverImage:
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200",
        title: "Basic Data Structures & Project",
        description:
          "Menyimpan kumpulan data dalam array dan membangun logika program pertama.",
        taskType: "project",
        modules: [
          {
            id: 46,
            title: "Working with Arrays/Lists",
            estimatedMinutes: 25,
            completed: false,
          },
          {
            id: 47,
            title: "Final Mini Project: Logic Builder",
            estimatedMinutes: 50,
            completed: false,
          },
        ],
        progressPercent: 0,
        lastActivityAt: null,
      },
    ],
  },
];
