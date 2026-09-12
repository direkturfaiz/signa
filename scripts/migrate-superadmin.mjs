import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const client = postgres(connectionString, { prepare: false });

async function run() {
  console.log("⚙️  Menjalankan migrasi database untuk Modul Superadmin...");

  // 1. Alter ENUM user_role to include 'superadmin'
  try {
    await client.unsafe(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';`);
    console.log("✅ Enum user_role diperbarui (menambahkan 'superadmin').");
  } catch (e) {
    console.log("ℹ️ Enum user_role 'superadmin':", e.message || e);
  }

  // 2. Alter ENUM common_status to include 'suspended'
  try {
    await client.unsafe(`ALTER TYPE common_status ADD VALUE IF NOT EXISTS 'suspended';`);
    console.log("✅ Enum common_status diperbarui (menambahkan 'suspended').");
  } catch (e) {
    console.log("ℹ️ Enum common_status 'suspended':", e.message || e);
  }

  // 3. Alter Table users to add id_barbershop
  await client.unsafe(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS id_barbershop UUID REFERENCES barbershop(id_barbershop) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS users_barbershop_idx ON users(id_barbershop);
  `);
  console.log("✅ Kolom 'id_barbershop' pada tabel users siap.");

  // 4. Create superadmin_audit_logs table
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS superadmin_audit_logs (
      id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      action VARCHAR(100) NOT NULL,
      actor_email VARCHAR(255) NOT NULL,
      target_tenant_id UUID,
      target_tenant_name VARCHAR(255),
      details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS superadmin_logs_action_idx ON superadmin_audit_logs(action);
    CREATE INDEX IF NOT EXISTS superadmin_logs_created_idx ON superadmin_audit_logs(created_at);
  `);
  console.log("✅ Tabel 'superadmin_audit_logs' siap.");

  // 5. Seed Superadmin Account
  const [existingSuperadmin] = await client`
    SELECT id_user, email, nama_lengkap, role FROM users WHERE role = 'superadmin' OR role = 'admin_platform' LIMIT 1
  `;

  if (!existingSuperadmin) {
    const [newSuperadmin] = await client`
      INSERT INTO users (
        email,
        password,
        nama_lengkap,
        no_hp,
        role,
        status
      ) VALUES (
        'superadmin@barberin.test',
        'superadmin123',
        'Superadmin Platform',
        '081122334455',
        'superadmin',
        'active'
      ) RETURNING id_user, email, nama_lengkap, role
    `;
    console.log(`✅ Akun Superadmin dibuat: ${newSuperadmin.nama_lengkap} (${newSuperadmin.email})`);
  } else {
    console.log(`ℹ️ Akun Superadmin/Admin Platform sudah ada: ${existingSuperadmin.nama_lengkap} (${existingSuperadmin.email})`);
  }

  // 6. Hubungkan akun Owner eksisting ke barbershop default jika belum terhubung
  const [defaultShop] = await client`SELECT id_barbershop, nama_barbershop FROM barbershop LIMIT 1`;
  if (defaultShop) {
    const updated = await client`
      UPDATE users
      SET id_barbershop = ${defaultShop.id_barbershop}
      WHERE role = 'owner' AND id_barbershop IS NULL
      RETURNING id_user, email, nama_lengkap
    `;
    if (updated.length > 0) {
      console.log(`✅ Menghubungkan ${updated.length} Owner ke barbershop default (${defaultShop.nama_barbershop}).`);
    }
  }

  console.log("🎉 Migrasi database Superadmin selesai dengan sukses!");
}

run()
  .catch((err) => {
    console.error("❌ Terjadi kesalahan saat migrasi:", err);
  })
  .finally(async () => {
    await client.end();
  });
