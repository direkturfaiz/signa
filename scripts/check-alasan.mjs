import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const client = postgres(connectionString, { prepare: false });

async function main() {
  const alasans = await client`SELECT * FROM alasan_pembatalan;`;
  console.log("ALASAN_PEMBATALAN:", JSON.stringify(alasans, null, 2));

  const pendingTxs = await client`
    SELECT id_transaksi, id_booking, created_at, status_transaksi 
    FROM transaksi 
    WHERE status_transaksi = 'pending' 
    ORDER BY created_at DESC 
    LIMIT 10;
  `;
  console.log("PENDING TRANSAKSI:", JSON.stringify(pendingTxs, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
