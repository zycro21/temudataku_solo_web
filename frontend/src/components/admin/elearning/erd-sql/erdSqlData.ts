import type { GroupKey, RelationDef, TableDef } from "./types";

// Dihasilkan dari temushop.sql (8 tabel, 4.005 baris). Deskripsi kolom mengikuti kamus data TemuShop.
export const DATASET_TAG = "-- @dataset: temushop";
export const DATASET_PERIOD = "Jan 2025 – Okt 2026";

export const GROUPS: { key: GroupKey; label: string }[] = [
  {
    key: "pelanggan",
    label: "Pelanggan",
  },
  {
    key: "katalog",
    label: "Katalog",
  },
  {
    key: "transaksi",
    label: "Transaksi",
  },
  {
    key: "logistik",
    label: "Pembayaran & pengiriman",
  },
  {
    key: "ulasan",
    label: "Ulasan",
  },
];

export const NOTES: string[] = [
  "Untuk menghitung jumlah checkout atau omzet per pesanan, pakai SalesOrder atau hitung DISTINCT sales_order_id di Orders.",
  "Saat menggabungkan data pembayaran, filter Payment.status = 'paid' agar percobaan ulang tidak ikut dijumlahkan.",
  "Dua relasi memakai composite FK: SalesOrder → CustomerAddress dan Orders → SalesOrder, masing-masing dengan pasangan (id, customer_id).",
  "Tabel sudah ada dan terisi. Jangan CREATE ulang tabel dengan nama yang sama; langsung SELECT, JOIN, subquery, atau CTE.",
];

export const RELATIONS: RelationDef[] = [
  {
    id: "customer-customeraddress",
    parent: "Customer",
    child: "CustomerAddress",
    parentCols: ["customer_id"],
    childCols: ["customer_id"],
    parentLabel: "1",
    childLabel: "0..N",
    desc: "Satu pelanggan dapat menyimpan beberapa alamat.",
    joinSql:
      "SELECT *\nFROM Customer c\nJOIN CustomerAddress a\n  ON a.customer_id = c.customer_id\nLIMIT 5;",
  },
  {
    id: "customer-salesorder",
    parent: "Customer",
    child: "SalesOrder",
    parentCols: ["customer_id"],
    childCols: ["customer_id"],
    parentLabel: "1",
    childLabel: "0..N",
    desc: "Satu pelanggan dapat melakukan beberapa checkout.",
    joinSql:
      "SELECT *\nFROM Customer c\nJOIN SalesOrder s\n  ON s.customer_id = c.customer_id\nLIMIT 5;",
  },
  {
    id: "customeraddress-salesorder",
    parent: "CustomerAddress",
    child: "SalesOrder",
    parentCols: ["address_id", "customer_id"],
    childCols: ["address_id", "customer_id"],
    parentLabel: "1",
    childLabel: "0..N",
    desc: "Setiap checkout memakai alamat milik pelanggan yang sama (composite FK).",
    joinSql:
      "SELECT *\nFROM CustomerAddress a\nJOIN SalesOrder s\n  ON s.address_id = a.address_id\n  AND s.customer_id = a.customer_id\nLIMIT 5;",
  },
  {
    id: "product-orders",
    parent: "Product",
    child: "Orders",
    parentCols: ["product_id"],
    childCols: ["product_id"],
    parentLabel: "1",
    childLabel: "0..N",
    desc: "Satu produk dapat muncul di banyak baris pesanan.",
    joinSql:
      "SELECT *\nFROM Product p\nJOIN Orders o\n  ON o.product_id = p.product_id\nLIMIT 5;",
  },
  {
    id: "salesorder-orders",
    parent: "SalesOrder",
    child: "Orders",
    parentCols: ["sales_order_id", "customer_id"],
    childCols: ["sales_order_id", "customer_id"],
    parentLabel: "1",
    childLabel: "1..N",
    desc: "Setiap checkout berisi satu atau lebih produk (composite FK).",
    joinSql:
      "SELECT *\nFROM SalesOrder s\nJOIN Orders o\n  ON o.sales_order_id = s.sales_order_id\n  AND o.customer_id = s.customer_id\nLIMIT 5;",
  },
  {
    id: "salesorder-payment",
    parent: "SalesOrder",
    child: "Payment",
    parentCols: ["sales_order_id"],
    childCols: ["sales_order_id"],
    parentLabel: "1",
    childLabel: "0..N",
    desc: "Percobaan ulang menghasilkan baris pembayaran tambahan.",
    joinSql:
      "SELECT *\nFROM SalesOrder s\nJOIN Payment pay\n  ON pay.sales_order_id = s.sales_order_id\nLIMIT 5;",
  },
  {
    id: "salesorder-shipment",
    parent: "SalesOrder",
    child: "Shipment",
    parentCols: ["sales_order_id"],
    childCols: ["sales_order_id"],
    parentLabel: "1",
    childLabel: "0..1",
    desc: "Checkout yang sudah dibayar dapat memiliki satu pengiriman.",
    joinSql:
      "SELECT *\nFROM SalesOrder s\nJOIN Shipment sh\n  ON sh.sales_order_id = s.sales_order_id\nLIMIT 5;",
  },
  {
    id: "orders-review",
    parent: "Orders",
    child: "Review",
    parentCols: ["order_id"],
    childCols: ["order_id"],
    parentLabel: "1",
    childLabel: "0..1",
    desc: "Baris produk yang sudah diterima dapat diulas sekali.",
    joinSql:
      "SELECT *\nFROM Orders o\nJOIN Review r\n  ON r.order_id = o.order_id\nLIMIT 5;",
  },
];

export const TABLES: TableDef[] = [
  {
    name: "Customer",
    group: "pelanggan",
    col: 1,
    row: 1,
    summary: "Akun pelanggan. Satu baris per pelanggan.",
    role: "Parent table untuk pelanggan. Dirujuk oleh alamat dan checkout.",
    columns: [
      {
        name: "customer_id",
        type: "INTEGER",
        keys: ["PK"],
        nullable: false,
        ref: null,
        desc: "ID pelanggan.",
      },
      {
        name: "name",
        type: "VARCHAR(100)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Nama pelanggan untuk pencarian dan latihan fungsi string.",
      },
      {
        name: "city",
        type: "VARCHAR(50)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Kota domisili pelanggan.",
      },
      {
        name: "email",
        type: "VARCHAR(120)",
        keys: ["UQ"],
        nullable: false,
        ref: null,
        desc: "Alamat email fiktif dengan domain .example.",
      },
      {
        name: "registered_at",
        type: "DATE",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Tanggal pendaftaran akun.",
        stat: {
          range: ["2023-07-04", "2026-09-30"],
        },
      },
    ],
    notes: [
      "Tidak semua pelanggan pernah checkout. Pakai LEFT JOIN ke SalesOrder untuk menemukan yang belum.",
    ],
    queries: [
      {
        title: "Pelanggan per kota",
        sql: "SELECT city, COUNT(*) AS jumlah\nFROM Customer\nGROUP BY city\nORDER BY jumlah DESC, city;",
      },
      {
        title: "Pelanggan yang belum pernah checkout",
        sql: "SELECT c.customer_id, c.name, c.city\nFROM Customer c\nLEFT JOIN SalesOrder s ON s.customer_id = c.customer_id\nWHERE s.sales_order_id IS NULL\nORDER BY c.customer_id\nLIMIT 10;",
      },
    ],
    rows: 500,
  },
  {
    name: "Product",
    group: "katalog",
    col: 3,
    row: 1,
    summary: "Katalog produk. Satu baris per varian dengan SKU tersendiri.",
    role: "Parent table katalog. Dirujuk oleh baris pesanan (Orders).",
    columns: [
      {
        name: "product_id",
        type: "INTEGER",
        keys: ["PK"],
        nullable: false,
        ref: null,
        desc: "ID produk.",
      },
      {
        name: "name",
        type: "VARCHAR(120)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Nama produk beserta varian.",
      },
      {
        name: "category",
        type: "VARCHAR(60)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Kategori produk.",
        stat: {
          dist: [
            ["Rumah & Dapur", 50],
            ["Perlengkapan Anak", 50],
            ["Perjalanan", 50],
            ["Perawatan Diri", 50],
            ["Olahraga", 50],
            ["Hobi", 50],
            ["Hewan Peliharaan", 50],
            ["Fesyen", 50],
            ["Elektronik", 50],
            ["Alat Tulis", 50],
          ],
        },
      },
      {
        name: "price",
        type: "DECIMAL(12,0)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Harga katalog per unit dalam rupiah.",
        stat: {
          range: [15000, 358000],
        },
      },
      {
        name: "sku",
        type: "VARCHAR(24)",
        keys: ["UQ"],
        nullable: false,
        ref: null,
        desc: "Kode unik varian produk.",
      },
    ],
    notes: [
      "Harga yang dipakai saat checkout disimpan di Orders.unit_price, bisa berbeda dari Product.price.",
    ],
    queries: [
      {
        title: "Rata-rata harga per kategori",
        sql: "SELECT category,\n       COUNT(*) AS jumlah_produk,\n       ROUND(AVG(price), 0) AS rata_rata_harga\nFROM Product\nGROUP BY category\nORDER BY rata_rata_harga DESC;",
      },
      {
        title: "Produk termahal",
        sql: "SELECT product_id, name, category, price\nFROM Product\nORDER BY price DESC\nLIMIT 10;",
      },
    ],
    rows: 500,
  },
  {
    name: "CustomerAddress",
    group: "pelanggan",
    col: 2,
    row: 1,
    summary: "Alamat pengiriman yang tersimpan pada akun pelanggan.",
    role: "Child dari Customer. Dirujuk SalesOrder lewat composite FK.",
    columns: [
      {
        name: "address_id",
        type: "INTEGER",
        keys: ["PK"],
        nullable: false,
        ref: null,
        desc: "ID alamat.",
      },
      {
        name: "customer_id",
        type: "INTEGER",
        keys: ["FK"],
        nullable: false,
        ref: ["Customer", "customer_id"],
        desc: "Pemilik alamat.",
      },
      {
        name: "label",
        type: "VARCHAR(20)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Label alamat, yaitu Rumah, Kantor, atau Keluarga.",
        stat: {
          dist: [
            ["Rumah", 500],
            ["Keluarga", 13],
            ["Kantor", 12],
          ],
        },
      },
      {
        name: "address_line",
        type: "VARCHAR(150)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Alamat jalan dan nomor fiktif.",
      },
      {
        name: "city",
        type: "VARCHAR(50)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Kota tujuan pengiriman.",
      },
      {
        name: "province",
        type: "VARCHAR(50)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Provinsi tujuan pengiriman.",
      },
    ],
    notes: [
      "Ada UNIQUE (address_id, customer_id) sebagai target composite FK dari SalesOrder.",
    ],
    queries: [
      {
        title: "Alamat per label",
        sql: "SELECT label, COUNT(*) AS jumlah\nFROM CustomerAddress\nGROUP BY label\nORDER BY jumlah DESC;",
      },
      {
        title: "Pelanggan dengan lebih dari satu alamat",
        sql: "SELECT c.customer_id, c.name, COUNT(*) AS jumlah_alamat\nFROM Customer c\nJOIN CustomerAddress a ON a.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nHAVING COUNT(*) > 1\nORDER BY jumlah_alamat DESC, c.customer_id;",
      },
    ],
    rows: 525,
  },
  {
    name: "SalesOrder",
    group: "transaksi",
    col: 2,
    row: 2,
    summary:
      "Satu baris per checkout. Pakai tabel ini untuk menghitung transaksi atau omzet per pesanan.",
    role: "Header transaksi. Parent dari Orders, Payment, dan Shipment.",
    columns: [
      {
        name: "sales_order_id",
        type: "INTEGER",
        keys: ["PK"],
        nullable: false,
        ref: null,
        desc: "ID transaksi checkout.",
      },
      {
        name: "customer_id",
        type: "INTEGER",
        keys: ["FK"],
        nullable: false,
        ref: ["Customer", "customer_id"],
        desc: "Pelanggan yang melakukan checkout.",
      },
      {
        name: "address_id",
        type: "INTEGER",
        keys: ["FK"],
        nullable: false,
        ref: ["CustomerAddress", "address_id"],
        desc: "Alamat pengiriman. Pasangkan dengan customer_id saat mengacu ke CustomerAddress.",
      },
      {
        name: "order_date",
        type: "DATE",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Tanggal checkout.",
        stat: {
          range: ["2025-01-03", "2026-10-31"],
        },
      },
      {
        name: "status",
        type: "VARCHAR(24)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "delivered, shipped, processing, awaiting_payment, atau cancelled.",
        stat: {
          dist: [
            ["delivered", 420],
            ["cancelled", 25],
            ["awaiting_payment", 25],
            ["shipped", 20],
            ["processing", 10],
          ],
        },
      },
      {
        name: "subtotal",
        type: "DECIMAL(12,0)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Jumlah Orders.total_amount dalam satu checkout.",
        stat: {
          range: [15000, 1402000],
        },
      },
      {
        name: "shipping_fee",
        type: "DECIMAL(12,0)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Ongkos kirim dalam rupiah. Nilai 0 berarti gratis.",
        stat: {
          range: [0, 35000],
        },
      },
      {
        name: "grand_total",
        type: "DECIMAL(12,0)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Nilai tagihan, yaitu subtotal ditambah shipping_fee.",
        stat: {
          range: [33000, 1418000],
        },
      },
    ],
    notes: [
      "Ada UNIQUE (sales_order_id, customer_id) sebagai target composite FK dari Orders.",
      "FK ke CustomerAddress memakai pasangan (address_id, customer_id) agar alamat pasti milik pelanggan yang sama.",
    ],
    queries: [
      {
        title: "Omzet per status",
        sql: "SELECT status,\n       COUNT(*) AS jumlah_checkout,\n       SUM(grand_total) AS total_tagihan\nFROM SalesOrder\nGROUP BY status\nORDER BY jumlah_checkout DESC;",
      },
      {
        title: "Checkout gratis ongkir",
        sql: "SELECT sales_order_id, order_date, subtotal, grand_total\nFROM SalesOrder\nWHERE shipping_fee = 0\nORDER BY subtotal DESC\nLIMIT 10;",
      },
    ],
    rows: 500,
  },
  {
    name: "Orders",
    group: "transaksi",
    col: 3,
    row: 2,
    summary:
      "Satu baris per produk dalam satu checkout. Kolom dari tiga course SQL tersedia di tabel ini.",
    role: "Detail item transaksi. Menghubungkan SalesOrder dengan Product.",
    columns: [
      {
        name: "order_id",
        type: "INTEGER",
        keys: ["PK"],
        nullable: false,
        ref: null,
        desc: "ID baris produk. Nama ini mengikuti latihan SQL yang sudah dipakai.",
      },
      {
        name: "customer_id",
        type: "INTEGER",
        keys: ["FK"],
        nullable: false,
        ref: ["SalesOrder", "customer_id"],
        desc: "ID pelanggan dari SalesOrder. Bersama sales_order_id membentuk composite FK.",
      },
      {
        name: "product_id",
        type: "INTEGER",
        keys: ["FK"],
        nullable: false,
        ref: ["Product", "product_id"],
        desc: "Produk yang dipesan.",
      },
      {
        name: "quantity",
        type: "INTEGER",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Jumlah unit produk pada baris ini.",
        stat: {
          dist: [
            ["1", 362],
            ["2", 59],
            ["5", 56],
            ["3", 53],
            ["4", 45],
          ],
        },
      },
      {
        name: "order_date",
        type: "DATE",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Tanggal checkout, sama dengan SalesOrder.order_date.",
        stat: {
          range: ["2025-01-03", "2026-10-31"],
        },
      },
      {
        name: "total_amount",
        type: "DECIMAL(12,0)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Nilai baris produk, yaitu quantity × unit_price. Ongkir disimpan di SalesOrder.",
        stat: {
          range: [15000, 1340000],
        },
      },
      {
        name: "sales_order_id",
        type: "INTEGER",
        keys: ["FK"],
        nullable: false,
        ref: ["SalesOrder", "sales_order_id"],
        desc: "ID checkout. Pasangkan dengan customer_id saat mengacu ke SalesOrder.",
      },
      {
        name: "unit_price",
        type: "DECIMAL(12,0)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Harga per unit yang tersimpan pada saat checkout, dalam rupiah.",
        stat: {
          range: [15000, 358000],
        },
      },
    ],
    notes: [
      "order_id mengidentifikasi satu baris produk, bukan satu checkout. Hitung checkout lewat sales_order_id atau tabel SalesOrder.",
      "FK ke SalesOrder memakai pasangan (sales_order_id, customer_id).",
    ],
    queries: [
      {
        title: "Unit dan nilai per kategori",
        sql: "SELECT p.category,\n       SUM(o.quantity) AS unit_dipesan,\n       SUM(o.total_amount) AS nilai_pesanan\nFROM Orders o\nJOIN Product p ON p.product_id = o.product_id\nGROUP BY p.category\nORDER BY unit_dipesan DESC, p.category;",
      },
      {
        title: "Item per checkout",
        sql: "SELECT s.sales_order_id, s.status,\n       COUNT(*) AS jumlah_item,\n       SUM(o.total_amount) AS subtotal_item\nFROM SalesOrder s\nJOIN Orders o ON o.sales_order_id = s.sales_order_id\nGROUP BY s.sales_order_id, s.status\nHAVING COUNT(*) > 1\nORDER BY jumlah_item DESC, s.sales_order_id\nLIMIT 10;",
      },
    ],
    rows: 575,
  },
  {
    name: "Payment",
    group: "logistik",
    col: 1,
    row: 2,
    summary:
      "Satu baris per percobaan pembayaran. Satu checkout dapat memiliki percobaan ulang.",
    role: "Riwayat pembayaran dari SalesOrder, termasuk yang gagal atau tertunda.",
    columns: [
      {
        name: "payment_id",
        type: "INTEGER",
        keys: ["PK"],
        nullable: false,
        ref: null,
        desc: "ID percobaan pembayaran.",
      },
      {
        name: "sales_order_id",
        type: "INTEGER",
        keys: ["FK"],
        nullable: false,
        ref: ["SalesOrder", "sales_order_id"],
        desc: "Checkout yang ditagih.",
      },
      {
        name: "method",
        type: "VARCHAR(24)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "virtual_account, e_wallet, credit_card, bank_transfer, atau qris.",
        stat: {
          dist: [
            ["e_wallet", 113],
            ["qris", 111],
            ["bank_transfer", 103],
            ["credit_card", 99],
            ["virtual_account", 89],
          ],
        },
      },
      {
        name: "status",
        type: "VARCHAR(12)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "paid, pending, atau failed.",
        stat: {
          dist: [
            ["paid", 450],
            ["failed", 40],
            ["pending", 25],
          ],
        },
      },
      {
        name: "amount",
        type: "DECIMAL(12,0)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Nominal yang ditagihkan pada percobaan ini.",
        stat: {
          range: [33000, 1418000],
        },
      },
      {
        name: "attempted_at",
        type: "DATE",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Tanggal percobaan pembayaran.",
        stat: {
          range: ["2025-01-03", "2026-10-31"],
        },
      },
      {
        name: "paid_at",
        type: "DATE",
        keys: [],
        nullable: true,
        ref: null,
        desc: "Tanggal pembayaran berhasil. Kosong untuk pending atau failed.",
        stat: {
          range: ["2025-01-03", "2026-10-31"],
          nulls: 65,
        },
      },
    ],
    notes: [
      "Filter status = 'paid' saat menjumlahkan pembayaran masuk, supaya percobaan ulang tidak ikut terhitung.",
    ],
    queries: [
      {
        title: "Pembayaran berhasil per metode",
        sql: "SELECT method,\n       COUNT(*) AS jumlah,\n       SUM(amount) AS total_masuk\nFROM Payment\nWHERE status = 'paid'\nGROUP BY method\nORDER BY total_masuk DESC;",
      },
      {
        title: "Tingkat kegagalan per metode",
        sql: "SELECT method,\n       COUNT(*) AS percobaan,\n       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS gagal\nFROM Payment\nGROUP BY method\nORDER BY gagal DESC;",
      },
    ],
    rows: 515,
  },
  {
    name: "Shipment",
    group: "logistik",
    col: 2,
    row: 3,
    summary:
      "Maksimal satu pengiriman per checkout. Baris packed menunjukkan paket sudah disiapkan.",
    role: "Status pengiriman dari SalesOrder yang sudah dibayar.",
    columns: [
      {
        name: "shipment_id",
        type: "INTEGER",
        keys: ["PK"],
        nullable: false,
        ref: null,
        desc: "ID pengiriman.",
      },
      {
        name: "sales_order_id",
        type: "INTEGER",
        keys: ["FK", "UQ"],
        nullable: false,
        ref: ["SalesOrder", "sales_order_id"],
        desc: "Checkout yang dikirim.",
      },
      {
        name: "carrier",
        type: "VARCHAR(40)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Nama layanan kurir.",
        stat: {
          dist: [
            ["J&T Express", 102],
            ["Pos Indonesia", 93],
            ["SiCepat", 87],
            ["JNE", 86],
            ["AnterAja", 82],
          ],
        },
      },
      {
        name: "tracking_number",
        type: "VARCHAR(30)",
        keys: ["UQ"],
        nullable: true,
        ref: null,
        desc: "Nomor resi fiktif. Terisi setelah paket dikirim.",
        stat: {
          nulls: 10,
        },
      },
      {
        name: "status",
        type: "VARCHAR(16)",
        keys: [],
        nullable: false,
        ref: null,
        desc: "packed, in_transit, atau delivered.",
        stat: {
          dist: [
            ["delivered", 420],
            ["in_transit", 20],
            ["packed", 10],
          ],
        },
      },
      {
        name: "shipped_at",
        type: "DATE",
        keys: [],
        nullable: true,
        ref: null,
        desc: "Tanggal pengiriman. Kosong saat paket masih packed.",
        stat: {
          range: ["2025-01-04", "2026-10-31"],
          nulls: 10,
        },
      },
      {
        name: "delivered_at",
        type: "DATE",
        keys: [],
        nullable: true,
        ref: null,
        desc: "Tanggal diterima. Terisi pada status delivered.",
        stat: {
          range: ["2025-01-10", "2026-10-19"],
          nulls: 30,
        },
      },
    ],
    notes: [
      "sales_order_id UNIQUE, jadi relasinya satu checkout paling banyak satu pengiriman.",
      "Tidak semua checkout punya Shipment (yang belum dibayar atau dibatalkan tidak ada).",
    ],
    queries: [
      {
        title: "Pengiriman per kurir",
        sql: "SELECT carrier, status, COUNT(*) AS jumlah\nFROM Shipment\nGROUP BY carrier, status\nORDER BY carrier, status;",
      },
      {
        title: "Lama pengiriman rata-rata per kurir",
        sql: "SELECT carrier,\n       ROUND(AVG(delivered_at - shipped_at), 1) AS rata_rata_hari\nFROM Shipment\nWHERE status = 'delivered'\nGROUP BY carrier\nORDER BY rata_rata_hari;",
      },
    ],
    rows: 450,
  },
  {
    name: "Review",
    group: "ulasan",
    col: 3,
    row: 3,
    summary: "Maksimal satu ulasan per baris produk yang sudah diterima.",
    role: "Ulasan pelanggan untuk satu baris produk di Orders.",
    columns: [
      {
        name: "review_id",
        type: "INTEGER",
        keys: ["PK"],
        nullable: false,
        ref: null,
        desc: "ID ulasan.",
      },
      {
        name: "order_id",
        type: "INTEGER",
        keys: ["FK", "UQ"],
        nullable: false,
        ref: ["Orders", "order_id"],
        desc: "Baris produk yang diulas.",
      },
      {
        name: "rating",
        type: "INTEGER",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Penilaian pelanggan dari 1 sampai 5.",
        stat: {
          dist: [
            ["5", 213],
            ["4", 111],
            ["2", 50],
            ["3", 43],
            ["1", 23],
          ],
        },
      },
      {
        name: "comment",
        type: "VARCHAR(240)",
        keys: [],
        nullable: true,
        ref: null,
        desc: "Isi ulasan fiktif. Pelanggan juga dapat mengirim rating saja.",
        stat: {
          nulls: 82,
        },
      },
      {
        name: "reviewed_at",
        type: "DATE",
        keys: [],
        nullable: false,
        ref: null,
        desc: "Tanggal ulasan dibuat.",
        stat: {
          range: ["2025-01-11", "2026-10-30"],
        },
      },
    ],
    notes: [
      "Review terhubung ke Orders (baris produk), bukan ke SalesOrder. Untuk rating per produk, JOIN Review → Orders → Product.",
    ],
    queries: [
      {
        title: "Sebaran rating",
        sql: "SELECT rating, COUNT(*) AS jumlah\nFROM Review\nGROUP BY rating\nORDER BY rating DESC;",
      },
      {
        title: "Rata-rata rating per kategori",
        sql: "SELECT p.category,\n       COUNT(*) AS jumlah_ulasan,\n       ROUND(AVG(r.rating), 2) AS rata_rata_rating\nFROM Review r\nJOIN Orders o ON o.order_id = r.order_id\nJOIN Product p ON p.product_id = o.product_id\nGROUP BY p.category\nORDER BY rata_rata_rating DESC;",
      },
    ],
    rows: 440,
  },
];

export const TOTAL_ROWS = TABLES.reduce((sum, t) => sum + t.rows, 0);
export const getTable = (name: string) => TABLES.find((t) => t.name === name);
