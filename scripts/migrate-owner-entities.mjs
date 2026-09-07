import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const client = postgres(connectionString, { prepare: false });

async function run() {
  console.log("⚙️ Memeriksa & memigrasi tabel tambahan ERD...");

  // 1. Table alasan_pembatalan
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS alasan_pembatalan (
      id_alasan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tipe_aktor VARCHAR(50) NOT NULL,
      alasan VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✅ Tabel alasan_pembatalan siap.");

  // 2. Table pembatalan
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS pembatalan (
      id_pembatalan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_transaksi UUID NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
      id_alasan UUID REFERENCES alasan_pembatalan(id_alasan) ON DELETE SET NULL,
      dibatalkan_oleh VARCHAR(50) NOT NULL,
      waktu_pembatalan TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      catatan TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS pembatalan_transaksi_idx ON pembatalan(id_transaksi);
    CREATE INDEX IF NOT EXISTS pembatalan_alasan_idx ON pembatalan(id_alasan);
  `);
  console.log("✅ Tabel pembatalan siap.");

  // 3. Seed default alasan jika kosong
  const existingAlasan = await client`SELECT COUNT(*)::int as count FROM alasan_pembatalan`;
  if (existingAlasan[0]?.count === 0) {
    const reasons = [
      { tipe: "pelanggan", alasan: "Tidak puas dengan layanan" },
      { tipe: "pelanggan", alasan: "Menunggu terlalu lama" },
      { tipe: "pelanggan", alasan: "Salah memilih layanan" },
      { tipe: "pelanggan", alasan: "Alasan lainnya" },
      { tipe: "admin/capster", alasan: "Pelanggan meminta pembatalan" },
      { tipe: "admin/capster", alasan: "Layanan tidak dapat dilakukan" },
      { tipe: "admin/capster", alasan: "Kendala operasional" },
      { tipe: "admin/capster", alasan: "Alasan lainnya" },
    ];
    for (const r of reasons) {
      await client`
        INSERT INTO alasan_pembatalan (tipe_aktor, alasan)
        VALUES (${r.tipe}, ${r.alasan})
      `;
    }
    console.log(`✅ Seeded ${reasons.length} alasan pembatalan.`);
  }

  // 4. Pastikan Akun Owner tersedia
  const [existingOwner] = await client`
    SELECT id_user, email, nama_lengkap, role FROM users WHERE role = 'owner' LIMIT 1
  `;

  if (!existingOwner) {
    const [newOwner] = await client`
      INSERT INTO users (
        email,
        password,
        nama_lengkap,
        no_hp,
        role,
        status
      ) VALUES (
        'owner@barberin.test',
        'owner123',
        'Owner Barbershop',
        '081299998888',
        'owner',
        'active'
      ) RETURNING id_user, email, nama_lengkap, role
    `;
    console.log(`✅ Akun Owner dibuat: ${newOwner.nama_lengkap} (${newOwner.email})`);
  } else {
    console.log(`ℹ️ Akun Owner sudah ada: ${existingOwner.nama_lengkap} (${existingOwner.email})`);
  }

  // 5. Cek pembatalan yang belum tercatat dari transaksi cancelled
  const cancelledTxs = await client`
    SELECT t.id_transaksi, t.created_at, b.catatan
    FROM transaksi t
    LEFT JOIN booking b ON t.id_booking = b.id_booking
    LEFT JOIN pembatalan p ON t.id_transaksi = p.id_transaksi
    WHERE t.status_transaksi = 'cancelled' AND p.id_pembatalan IS NULL
  `;

  if (cancelledTxs.length > 0) {
    console.log(`Sinkronisasi ${cancelledTxs.length} transaksi cancelled yang belum ada di tabel pembatalan...`);
    for (const ctx of cancelledTxs) {
      await client`
        INSERT INTO pembatalan (
          id_transaksi,
          dibatalkan_oleh,
          waktu_pembatalan,
          catatan
        ) VALUES (
          ${ctx.id_transaksi},
          'pelanggan',
          ${ctx.created_at},
          ${ctx.catatan || 'Dibatalkan'}
        )
      `;
    }
    console.log("✅ Sinkronisasi pembatalan selesai.");
  }

  console.log("🎉 Migrasi & verifikasi entitas Owner selesai!");
  await client.end();
}

run().catch((err) => {
  console.error("❌ Error saat migrasi entitas owner:", err);
  process.exit(1);
});
