import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";
const sql = postgres(connectionString, { prepare: false });

async function resetTransactions() {
  console.log("=================================================");
  console.log("🗑️  MENGHAPUS SEMUA RIWAYAT TRANSAKSI DARI DATABASE");
  console.log("=================================================\n");

  // 1. Hapus struk (child dari transaksi)
  const deletedStruk = await sql`DELETE FROM struk RETURNING id_struk`;
  console.log(`- Terhapus dari struk: ${deletedStruk.length} baris`);

  // 2. Hapus pembayaran (child dari transaksi)
  const deletedPembayaran = await sql`DELETE FROM pembayaran RETURNING id_pembayaran`;
  console.log(`- Terhapus dari pembayaran: ${deletedPembayaran.length} baris`);

  // 3. Hapus transaksi
  const deletedTransaksi = await sql`DELETE FROM transaksi RETURNING id_transaksi`;
  console.log(`- Terhapus dari transaksi: ${deletedTransaksi.length} baris`);

  // 4. Hapus detail_booking dan booking
  const deletedDetail = await sql`DELETE FROM detail_booking RETURNING id_detail_booking`;
  console.log(`- Terhapus dari detail_booking: ${deletedDetail.length} baris`);

  const deletedBooking = await sql`DELETE FROM booking RETURNING id_booking`;
  console.log(`- Terhapus dari booking: ${deletedBooking.length} baris`);

  // 5. Reset akumulasi pada shift_capster
  const updatedShifts = await sql`
    UPDATE shift_capster
    SET total_transaksi = 0, total_pendapatan = '0'
    RETURNING id_shift
  `;
  console.log(`- Reset total_transaksi & total_pendapatan pada ${updatedShifts.length} shift capster`);

  // 6. Hapus shift testing lama yang berstatus 'completed' atau 'cancelled' dan tidak diperlukan
  // Hanya sisakan shift ongoing hari ini untuk Budi
  const [budi] = await sql`
    SELECT c.id_capster FROM capster c
    JOIN users u ON c.id_user = u.id_user
    WHERE u.nama_lengkap ILIKE '%budi%'
    LIMIT 1
  `;
  
  if (budi) {
    // Pastikan Budi memiliki tepat 1 shift ongoing hari ini
    const todayOngoing = await sql`
      SELECT id_shift FROM shift_capster
      WHERE id_capster = ${budi.id_capster}
        AND status = 'ongoing'
        AND tanggal >= CURRENT_DATE
      LIMIT 1
    `;
    if (todayOngoing.length === 0) {
      await sql`
        INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status, total_transaksi, total_pendapatan)
        VALUES (${budi.id_capster}, NOW(), '08:00 WIB', 'ongoing', 0, '0')
      `;
    }
  }

  // Bersihkan shift-shift completed test sebelumnya
  const deletedOldShifts = await sql`
    DELETE FROM shift_capster
    WHERE status != 'ongoing'
    RETURNING id_shift
  `;
  console.log(`- Dihapus ${deletedOldShifts.length} riwayat shift lama yang tidak aktif`);

  // 7. Verifikasi kondisi akhir database
  console.log("\n=================================================");
  console.log("🔍 VERIFIKASI KONDISI AKHIR DATABASE");
  console.log("=================================================");
  const [tx] = await sql`SELECT count(*)::int as count FROM transaksi`;
  const [pay] = await sql`SELECT count(*)::int as count FROM pembayaran`;
  const [str] = await sql`SELECT count(*)::int as count FROM struk`;
  const [book] = await sql`SELECT count(*)::int as count FROM booking`;
  const [det] = await sql`SELECT count(*)::int as count FROM detail_booking`;
  const [activeShift] = await sql`SELECT count(*)::int as count FROM shift_capster WHERE status = 'ongoing'`;

  console.log(`- Jumlah Transaksi      : ${tx.count}`);
  console.log(`- Jumlah Pembayaran     : ${pay.count}`);
  console.log(`- Jumlah Struk          : ${str.count}`);
  console.log(`- Jumlah Booking        : ${book.count}`);
  console.log(`- Jumlah Detail Booking : ${det.count}`);
  console.log(`- Jumlah Shift Ongoing  : ${activeShift.count}`);

  if (tx.count === 0 && pay.count === 0 && str.count === 0 && book.count === 0) {
    console.log("\n✅ SEMUA RIWAYAT TRANSAKSI BERHASIL DIRESET KE 0!");
  } else {
    console.error("\n❌ Masih ada data transaksi yang tersisa!");
    process.exit(1);
  }

  await sql.end();
}

resetTransactions().catch(console.error);
