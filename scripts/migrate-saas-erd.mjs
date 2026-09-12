import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const client = postgres(connectionString, { prepare: false });

async function run() {
  console.log("⚙️  Memulai migrasi skema tabel SaaS Platform BARBERIN (Gambar 2)...");

  // 1. Table: owner
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "owner" (
      "owner_id" BIGSERIAL PRIMARY KEY,
      "name" VARCHAR(255) NOT NULL,
      "email" VARCHAR(255) NOT NULL UNIQUE,
      "phone" VARCHAR(50),
      "password_hash" VARCHAR(255) NOT NULL,
      "status" VARCHAR(50) NOT NULL DEFAULT 'active',
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "owner_email_idx" ON "owner"("email");
    CREATE INDEX IF NOT EXISTS "owner_status_idx" ON "owner"("status");
  `);
  console.log("✅ 1. Tabel 'owner' siap.");

  // 2. Table: business
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "business" (
      "business_id" BIGSERIAL PRIMARY KEY,
      "owner_id" BIGINT NOT NULL REFERENCES "owner"("owner_id") ON DELETE CASCADE,
      "business_name" VARCHAR(255) NOT NULL,
      "status" VARCHAR(50) NOT NULL DEFAULT 'active',
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "business_owner_idx" ON "business"("owner_id");
    CREATE INDEX IF NOT EXISTS "business_status_idx" ON "business"("status");
  `);
  console.log("✅ 2. Tabel 'business' siap.");

  // 3. Table: plan
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "plan" (
      "plan_id" BIGSERIAL PRIMARY KEY,
      "plan_name" VARCHAR(100) NOT NULL UNIQUE,
      "description" TEXT,
      "price" NUMERIC(12, 2) NOT NULL DEFAULT 0,
      "billing_period" VARCHAR(50) NOT NULL DEFAULT 'monthly',
      "status" VARCHAR(50) NOT NULL DEFAULT 'active',
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "plan_name_idx" ON "plan"("plan_name");
    CREATE INDEX IF NOT EXISTS "plan_status_idx" ON "plan"("status");
  `);
  console.log("✅ 3. Tabel 'plan' siap.");

  // 4. Table: feature
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "feature" (
      "feature_id" BIGSERIAL PRIMARY KEY,
      "feature_name" VARCHAR(255) NOT NULL,
      "description" TEXT,
      "module" VARCHAR(100) NOT NULL,
      "status" VARCHAR(50) NOT NULL DEFAULT 'active',
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "feature_module_idx" ON "feature"("module");
    CREATE INDEX IF NOT EXISTS "feature_status_idx" ON "feature"("status");
  `);
  console.log("✅ 4. Tabel 'feature' siap.");

  // 5. Table: plan_feature
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "plan_feature" (
      "plan_feature_id" BIGSERIAL PRIMARY KEY,
      "plan_id" BIGINT NOT NULL REFERENCES "plan"("plan_id") ON DELETE CASCADE,
      "feature_id" BIGINT NOT NULL REFERENCES "feature"("feature_id") ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "plan_feature_plan_idx" ON "plan_feature"("plan_id");
    CREATE INDEX IF NOT EXISTS "plan_feature_feature_idx" ON "plan_feature"("feature_id");
  `);
  console.log("✅ 5. Tabel 'plan_feature' siap.");

  // 6. Table: subscription
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "subscription" (
      "subscription_id" BIGSERIAL PRIMARY KEY,
      "business_id" BIGINT NOT NULL REFERENCES "business"("business_id") ON DELETE CASCADE,
      "plan_id" BIGINT NOT NULL REFERENCES "plan"("plan_id") ON DELETE RESTRICT,
      "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
      "start_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "end_date" TIMESTAMPTZ,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "subscription_business_idx" ON "subscription"("business_id");
    CREATE INDEX IF NOT EXISTS "subscription_plan_idx" ON "subscription"("plan_id");
    CREATE INDEX IF NOT EXISTS "subscription_status_idx" ON "subscription"("status");
  `);
  console.log("✅ 6. Tabel 'subscription' siap.");

  // 7. Table: subscription_payment
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "subscription_payment" (
      "subscription_payment_id" BIGSERIAL PRIMARY KEY,
      "subscription_id" BIGINT NOT NULL REFERENCES "subscription"("subscription_id") ON DELETE CASCADE,
      "amount" NUMERIC(12, 2) NOT NULL,
      "payment_method" VARCHAR(50) NOT NULL,
      "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
      "payment_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "reference_id" VARCHAR(255) NOT NULL UNIQUE,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "sub_payment_subscription_idx" ON "subscription_payment"("subscription_id");
    CREATE INDEX IF NOT EXISTS "sub_payment_status_idx" ON "subscription_payment"("status");
    CREATE INDEX IF NOT EXISTS "sub_payment_reference_idx" ON "subscription_payment"("reference_id");
  `);
  console.log("✅ 7. Tabel 'subscription_payment' siap.");

  // 8. Table: demo_request
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "demo_request" (
      "demo_request_id" BIGSERIAL PRIMARY KEY,
      "owner_id" BIGINT REFERENCES "owner"("owner_id") ON DELETE SET NULL,
      "name" VARCHAR(255) NOT NULL,
      "email" VARCHAR(255) NOT NULL,
      "phone" VARCHAR(50) NOT NULL,
      "business_name" VARCHAR(255),
      "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
      "notes" TEXT,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "demo_request_owner_idx" ON "demo_request"("owner_id");
    CREATE INDEX IF NOT EXISTS "demo_request_status_idx" ON "demo_request"("status");
  `);
  console.log("✅ 8. Tabel 'demo_request' siap.");

  // ==========================================
  // SEED INITIAL DATA: PLANS (Gambar 1 & 2)
  // ==========================================
  const initialPlans = [
    {
      name: "FREE",
      price: 0,
      period: "monthly",
      desc: "Paket uji coba gratis sistem BARBERIN untuk 1 cabang barbershop.",
    },
    {
      name: "PRO",
      price: 149000,
      period: "monthly",
      desc: "Paket lengkap dengan fitur tanpa batas transaksi, komisi otomatis, dan laporan audit.",
    },
    {
      name: "ENTERPRISE",
      price: 499000,
      period: "monthly",
      desc: "Paket kustom multi-cabang dengan dedicated support dan integrasi API khusus.",
    },
  ];

  for (const p of initialPlans) {
    await client`
      INSERT INTO "plan" ("plan_name", "price", "billing_period", "description", "status")
      VALUES (${p.name}, ${p.price}, ${p.period}, ${p.desc}, 'active')
      ON CONFLICT ("plan_name") DO NOTHING
    `;
  }
  console.log("✅ Seed Paket (FREE, PRO, ENTERPRISE) selesai.");

  // ==========================================
  // SEED INITIAL DATA: FEATURES
  // ==========================================
  const initialFeatures = [
    { name: "Dashboard Monitoring Realtime", module: "owner", desc: "Pantau omzet, grafik pendapatan, dan transaksi harian secara realtime." },
    { name: "Manajemen Layanan & Harga", module: "owner", desc: "Kelola katalog harga jasa, estimasi durasi potong, dan kategori layanan." },
    { name: "Manajemen Akun Capster", module: "owner", desc: "Kelola data capster, akun login, dan pantau status kehadiran." },
    { name: "Perhitungan Gaji & Komisi", module: "owner", desc: "Perhitungan otomatis komisi 15% dari transaksi layanan capster." },
    { name: "Audit Aktivitas Log", module: "owner", desc: "Rekam jejak setiap aksi kasir/capster untuk mencegah fraud." },
    { name: "Audit Keuangan & Rekonsiliasi Kas", module: "owner", desc: "Periksa dan cocokkan kas fisik dengan saldo sistem (cash on hand)." },
    { name: "Pusat Bantuan & Dokumen", module: "owner", desc: "Dokumentasi alur kerja BPMN dan referensi operasional." },
  ];

  for (const f of initialFeatures) {
    await client`
      INSERT INTO "feature" ("feature_name", "module", "description", "status")
      SELECT ${f.name}, ${f.module}, ${f.desc}, 'active'
      WHERE NOT EXISTS (
        SELECT 1 FROM "feature" WHERE "feature_name" = ${f.name}
      )
    `;
  }
  console.log("✅ Seed Fitur BARBERIN selesai.");

  // Hubungkan paket PRO & ENTERPRISE ke seluruh fitur
  await client.unsafe(`
    INSERT INTO "plan_feature" ("plan_id", "feature_id")
    SELECT p.plan_id, f.feature_id
    FROM "plan" p
    CROSS JOIN "feature" f
    WHERE p.plan_name IN ('PRO', 'ENTERPRISE')
    ON CONFLICT DO NOTHING;
  `);

  console.log("🎉 Migrasi & Seeding skema SaaS Platform BARBERIN selesai dengan sukses!");
}

run()
  .catch((err) => {
    console.error("❌ Terjadi kesalahan saat migrasi:", err);
  })
  .finally(async () => {
    await client.end();
  });
