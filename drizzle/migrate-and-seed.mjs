import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in .env!");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });

async function run() {
  console.log("🚀 Menjalankan migrasi database sesuai ERD BARBERIN...");

  // Drop old tables
  await client.unsafe(`
    DROP TABLE IF EXISTS struk CASCADE;
    DROP TABLE IF EXISTS pembayaran CASCADE;
    DROP TABLE IF EXISTS payments CASCADE;
    DROP TABLE IF EXISTS transaksi CASCADE;
    DROP TABLE IF EXISTS transactions CASCADE;
    DROP TABLE IF EXISTS detail_booking CASCADE;
    DROP TABLE IF EXISTS transaction_items CASCADE;
    DROP TABLE IF EXISTS booking CASCADE;
    DROP TABLE IF EXISTS shift_capster CASCADE;
    DROP TABLE IF EXISTS layanan CASCADE;
    DROP TABLE IF EXISTS services CASCADE;
    DROP TABLE IF EXISTS capster CASCADE;
    DROP TABLE IF EXISTS barbershop CASCADE;
    DROP TABLE IF EXISTS pelanggan CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    DROP TYPE IF EXISTS pembayaran_status CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
    DROP TYPE IF EXISTS metode_pembayaran CASCADE;
    DROP TYPE IF EXISTS payment_method CASCADE;
    DROP TYPE IF EXISTS transaksi_status CASCADE;
    DROP TYPE IF EXISTS transaction_status CASCADE;
    DROP TYPE IF EXISTS shift_status CASCADE;
    DROP TYPE IF EXISTS booking_status CASCADE;
    DROP TYPE IF EXISTS common_status CASCADE;
    DROP TYPE IF EXISTS service_status CASCADE;
    DROP TYPE IF EXISTS user_status CASCADE;
    DROP TYPE IF EXISTS user_role CASCADE;
  `);

  // Create ENUMs
  await client.unsafe(`
    CREATE TYPE user_role AS ENUM ('pelanggan', 'capster', 'owner', 'admin_platform');
    CREATE TYPE common_status AS ENUM ('active', 'inactive');
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
    CREATE TYPE shift_status AS ENUM ('ongoing', 'completed', 'cancelled');
    CREATE TYPE transaksi_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');
    CREATE TYPE metode_pembayaran AS ENUM ('tunai', 'qris', 'transfer');
    CREATE TYPE pembayaran_status AS ENUM ('pending', 'success', 'failed', 'refunded');
  `);

  // Create Tables
  await client.unsafe(`
    -- 1. USER
    CREATE TABLE users (
      id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT,
      nama_lengkap VARCHAR(255) NOT NULL,
      no_hp VARCHAR(50),
      role user_role NOT NULL,
      status common_status NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX users_role_idx ON users(role);
    CREATE INDEX users_email_idx ON users(email);

    -- 2. PELANGGAN
    CREATE TABLE pelanggan (
      id_pelanggan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_user UUID NOT NULL UNIQUE REFERENCES users(id_user) ON DELETE CASCADE,
      alamat TEXT,
      tanggal_lahir TIMESTAMPTZ,
      jenis_kelamin VARCHAR(20),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX pelanggan_user_idx ON pelanggan(id_user);

    -- 3. BARBERSHOP
    CREATE TABLE barbershop (
      id_barbershop UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nama_barbershop VARCHAR(255) NOT NULL,
      alamat TEXT,
      no_hp VARCHAR(50),
      foto TEXT,
      jam_buka VARCHAR(20),
      jam_tutup VARCHAR(20),
      status common_status NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 4. CAPSTER
    CREATE TABLE capster (
      id_capster UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_user UUID NOT NULL UNIQUE REFERENCES users(id_user) ON DELETE CASCADE,
      id_barbershop UUID NOT NULL REFERENCES barbershop(id_barbershop) ON DELETE CASCADE,
      no_pegawai VARCHAR(50),
      tanggal_bergabung TIMESTAMPTZ,
      status common_status NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX capster_user_idx ON capster(id_user);
    CREATE INDEX capster_barbershop_idx ON capster(id_barbershop);

    -- 5. LAYANAN
    CREATE TABLE layanan (
      id_layanan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_barbershop UUID NOT NULL REFERENCES barbershop(id_barbershop) ON DELETE CASCADE,
      nama_layanan VARCHAR(255) NOT NULL,
      deskripsi TEXT,
      durasi_menit INTEGER,
      harga NUMERIC(12, 2) NOT NULL,
      status common_status NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX layanan_barbershop_idx ON layanan(id_barbershop);

    -- 6. BOOKING
    CREATE TABLE booking (
      id_booking UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_pelanggan UUID NOT NULL REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
      id_barbershop UUID NOT NULL REFERENCES barbershop(id_barbershop) ON DELETE CASCADE,
      id_capster UUID REFERENCES capster(id_capster) ON DELETE SET NULL,
      tanggal_booking TIMESTAMPTZ NOT NULL,
      waktu_booking VARCHAR(30) NOT NULL,
      status booking_status NOT NULL DEFAULT 'pending',
      catatan TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX booking_pelanggan_idx ON booking(id_pelanggan);
    CREATE INDEX booking_capster_idx ON booking(id_capster);
    CREATE INDEX booking_status_idx ON booking(status);

    -- 7. DETAIL BOOKING
    CREATE TABLE detail_booking (
      id_detail_booking UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_booking UUID NOT NULL REFERENCES booking(id_booking) ON DELETE CASCADE,
      id_layanan UUID NOT NULL REFERENCES layanan(id_layanan) ON DELETE RESTRICT,
      harga_satuan NUMERIC(12, 2) NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      subtotal NUMERIC(12, 2) NOT NULL
    );
    CREATE INDEX detail_booking_booking_idx ON detail_booking(id_booking);
    CREATE INDEX detail_booking_layanan_idx ON detail_booking(id_layanan);

    -- 8. SHIFT CAPSTER
    CREATE TABLE shift_capster (
      id_shift UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_capster UUID NOT NULL REFERENCES capster(id_capster) ON DELETE CASCADE,
      tanggal TIMESTAMPTZ NOT NULL,
      waktu_mulai VARCHAR(30) NOT NULL,
      waktu_selesai VARCHAR(30),
      status shift_status NOT NULL DEFAULT 'ongoing',
      total_transaksi INTEGER NOT NULL DEFAULT 0,
      total_pendapatan NUMERIC(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX shift_capster_capster_idx ON shift_capster(id_capster);
    CREATE INDEX shift_capster_status_idx ON shift_capster(status);

    -- 9. TRANSAKSI
    CREATE TABLE transaksi (
      id_transaksi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_booking UUID REFERENCES booking(id_booking) ON DELETE SET NULL,
      id_shift UUID NOT NULL REFERENCES shift_capster(id_shift) ON DELETE RESTRICT,
      id_pelanggan UUID NOT NULL REFERENCES pelanggan(id_pelanggan) ON DELETE RESTRICT,
      subtotal NUMERIC(12, 2) NOT NULL,
      diskon NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total NUMERIC(12, 2) NOT NULL,
      status_transaksi transaksi_status NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX transaksi_booking_idx ON transaksi(id_booking);
    CREATE INDEX transaksi_shift_idx ON transaksi(id_shift);
    CREATE INDEX transaksi_pelanggan_idx ON transaksi(id_pelanggan);
    CREATE INDEX transaksi_status_idx ON transaksi(status_transaksi);

    -- 10. PEMBAYARAN
    CREATE TABLE pembayaran (
      id_pembayaran UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_transaksi UUID NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
      metode_pembayaran metode_pembayaran NOT NULL,
      jumlah_bayar NUMERIC(12, 2) NOT NULL,
      status_pembayaran pembayaran_status NOT NULL DEFAULT 'pending',
      waktu_bayar TIMESTAMPTZ,
      referensi VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX pembayaran_transaksi_idx ON pembayaran(id_transaksi);
    CREATE INDEX pembayaran_status_idx ON pembayaran(status_pembayaran);

    -- 11. STRUK
    CREATE TABLE struk (
      id_struk UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_transaksi UUID NOT NULL UNIQUE REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
      no_struk VARCHAR(50) NOT NULL UNIQUE,
      tanggal_cetak TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      url_struk TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX struk_transaksi_idx ON struk(id_transaksi);
    CREATE INDEX struk_no_struk_idx ON struk(no_struk);
  `);

  console.log("✅ 11 Tabel ERD berhasil dibuat di Supabase!");

  // ==========================================
  // SEED INITIAL DATA
  // ==========================================
  console.log("🌱 Memulai seeding data awal BARBERIN...");

  // 1. Barbershop
  const [shop] = await client`
    INSERT INTO barbershop (
      nama_barbershop, alamat, no_hp, jam_buka, jam_tutup, status
    ) VALUES (
      'BARBERIN Headquarter',
      'Jl. Jenderal Soedirman No. 123, Purbalingga',
      '0812-3456-7890',
      '08:00',
      '21:00',
      'active'
    ) RETURNING *;
  `;
  console.log(`✅ Barbershop dibuat: ${shop.nama_barbershop} (${shop.id_barbershop})`);

  // 2. Layanan (7 Layanan)
  const serviceList = [
    {
      nama: "Haircut / Potong Rambut",
      desc: "Potong rambut rapi dan presisi oleh capster profesional.",
      durasi: 30,
      harga: 30000,
    },
    {
      nama: "Hair Wash / Keramas",
      desc: "Cuci rambut dengan sampo premium dan pijatan kepala rileks.",
      durasi: 15,
      harga: 20000,
    },
    {
      nama: "Styling / Tata Rambut",
      desc: "Penataan gaya rambut dengan pomade atau wax berkualitas.",
      durasi: 15,
      harga: 25000,
    },
    {
      nama: "Shaving / Cukur Kumis & Jenggot",
      desc: "Merapikan kumis dan jenggot dengan pisau steril dan handuk hangat.",
      durasi: 20,
      harga: 15000,
    },
    {
      nama: "Hair Coloring / Pewarnaan",
      desc: "Pewarnaan rambut tren modern dengan cat rambut aman.",
      durasi: 60,
      harga: 60000,
    },
    {
      nama: "Beard Trim / Rapikan Jenggot",
      desc: "Membentuk dan mencukur jenggot sesuai kontur wajah.",
      durasi: 15,
      harga: 15000,
    },
    {
      nama: "Kids Haircut / Cukur Anak",
      desc: "Potong rambut anak yang ramah, teliti, dan sabar.",
      durasi: 25,
      harga: 25000,
    },
  ];

  for (const s of serviceList) {
    await client`
      INSERT INTO layanan (
        id_barbershop, nama_layanan, deskripsi, durasi_menit, harga, status
      ) VALUES (
        ${shop.id_barbershop}, ${s.nama}, ${s.desc}, ${s.durasi}, ${s.harga}, 'active'
      );
    `;
  }
  console.log(`✅ 7 Layanan barbershop berhasil ditambahkan!`);

  // 3. Users & Capsters
  // Capster 1: Budi
  const [userBudi] = await client`
    INSERT INTO users (
      email, nama_lengkap, no_hp, role, status
    ) VALUES (
      'budi@barberin.test', 'Budi', '081234567891', 'capster', 'active'
    ) RETURNING *;
  `;
  const [capsterBudi] = await client`
    INSERT INTO capster (
      id_user, id_barbershop, no_pegawai, tanggal_bergabung, status
    ) VALUES (
      ${userBudi.id_user}, ${shop.id_barbershop}, 'CAP-001', NOW(), 'active'
    ) RETURNING *;
  `;
  console.log(`✅ Capster 1: ${userBudi.nama_lengkap} (${capsterBudi.id_capster})`);

  // Capster 2: Andi
  const [userAndi] = await client`
    INSERT INTO users (
      email, nama_lengkap, no_hp, role, status
    ) VALUES (
      'andi@barberin.test', 'Andi', '081234567892', 'capster', 'active'
    ) RETURNING *;
  `;
  const [capsterAndi] = await client`
    INSERT INTO capster (
      id_user, id_barbershop, no_pegawai, tanggal_bergabung, status
    ) VALUES (
      ${userAndi.id_user}, ${shop.id_barbershop}, 'CAP-002', NOW(), 'active'
    ) RETURNING *;
  `;
  console.log(`✅ Capster 2: ${userAndi.nama_lengkap} (${capsterAndi.id_capster})`);

  // 4. Initial Ongoing Shift for Budi
  const [activeShift] = await client`
    INSERT INTO shift_capster (
      id_capster, tanggal, waktu_mulai, status, total_transaksi, total_pendapatan
    ) VALUES (
      ${capsterBudi.id_capster}, NOW(), '08:00 WIB', 'ongoing', 0, 0
    ) RETURNING *;
  `;
  console.log(`✅ Shift aktif awal dibuat: ${activeShift.id_shift} untuk ${userBudi.nama_lengkap}`);

  // 5. Customer Demo (Pelanggan)
  const [userCustomer] = await client`
    INSERT INTO users (
      email, nama_lengkap, no_hp, role, status
    ) VALUES (
      'ricky.pratama@barberin.test', 'Ricky Pratama', '081234567890', 'pelanggan', 'active'
    ) RETURNING *;
  `;
  const [pelangganRicky] = await client`
    INSERT INTO pelanggan (
      id_user, alamat, jenis_kelamin
    ) VALUES (
      ${userCustomer.id_user}, 'Purbalingga Lor', 'Laki-laki'
    ) RETURNING *;
  `;
  console.log(`✅ Pelanggan Demo: ${userCustomer.nama_lengkap} (${pelangganRicky.id_pelanggan})`);

  console.log("🎉 Migrasi & Seeding Database BARBERIN Selesai!");
}

run()
  .catch((err) => {
    console.error("❌ Migrasi gagal:", err);
    process.exit(1);
  })
  .finally(() => client.end());
