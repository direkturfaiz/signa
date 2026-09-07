import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";
const client = postgres(connectionString, { prepare: false });

async function verify() {
  console.log("🔍 Memverifikasi data dashboard Owner langsung di DB...");

  // 1. Total transaksi valid (paid)
  const paidTxs = await client`
    SELECT COUNT(*)::int as count, SUM(total)::numeric as revenue
    FROM transaksi
    WHERE status_transaksi = 'paid'
  `;
  console.log("📊 Paid Transactions Total:", paidTxs[0]);

  // 2. Active shifts
  const ongoingShifts = await client`
    SELECT s.id_shift, u.nama_lengkap as capster_nama, s.status
    FROM shift_capster s
    JOIN capster c ON s.id_capster = c.id_capster
    JOIN users u ON c.id_user = u.id_user
    WHERE s.status = 'ongoing'
  `;
  console.log("👨‍💼 Active Ongoing Shifts:", ongoingShifts);

  // 3. Capster separation test
  const capsterSummary = await client`
    SELECT 
      u.nama_lengkap as capster_nama,
      c.no_pegawai,
      COUNT(t.id_transaksi)::int as total_tx,
      SUM(CASE WHEN t.status_transaksi = 'paid' THEN t.total ELSE 0 END)::numeric as total_revenue
    FROM capster c
    JOIN users u ON c.id_user = u.id_user
    LEFT JOIN shift_capster s ON c.id_capster = s.id_capster
    LEFT JOIN transaksi t ON t.id_shift = s.id_shift
    GROUP BY u.nama_lengkap, c.no_pegawai
  `;
  console.log("🎯 Capster Separation Summary:", capsterSummary);

  // 4. Pembatalan test
  const cancellations = await client`
    SELECT p.id_pembatalan, p.dibatalkan_oleh, p.waktu_pembatalan, p.catatan, a.alasan
    FROM pembatalan p
    LEFT JOIN alasan_pembatalan a ON p.id_alasan = a.id_alasan
    LIMIT 5
  `;
  console.log("❌ Cancellations Sample:", cancellations);

  console.log("✅ Verifikasi data database selesai dengan sukses!");
  await client.end();
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
