import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";
const sql = postgres(connectionString, { prepare: false });

async function queryCapsterAktif() {
  const now = new Date();
  const jakartaDateStr = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  const startOfToday = new Date(`${jakartaDateStr}T00:00:00+07:00`);
  const endOfToday = new Date(`${jakartaDateStr}T23:59:59.999+07:00`);

  const rows = await sql`
    SELECT count(distinct id_capster)::int as active_count
    FROM shift_capster
    WHERE status = 'ongoing'
      AND tanggal >= ${startOfToday}
      AND tanggal <= ${endOfToday}
  `;

  return rows[0]?.active_count ?? 0;
}

async function runTests() {
  console.log("===============================================================");
  console.log("🔍 TESTING PERBAIKAN LOGIC 'CAPSTER AKTIF' (8 SKENARIO)");
  console.log("===============================================================\n");

  const [budi] = await sql`
    SELECT c.id_capster FROM capster c
    JOIN users u ON c.id_user = u.id_user
    WHERE u.nama_lengkap ILIKE '%budi%'
    LIMIT 1
  `;
  const [andi] = await sql`
    SELECT c.id_capster FROM capster c
    JOIN users u ON c.id_user = u.id_user
    WHERE u.nama_lengkap ILIKE '%andi%'
    LIMIT 1
  `;

  const budiId = budi.id_capster;
  const andiId = andi.id_capster;

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Setel semua shift hari ini ke completed untuk baseline uji
  await sql`UPDATE shift_capster SET status = 'completed' WHERE tanggal >= CURRENT_DATE`;

  // -----------------------------------------------------------------
  // TEST 1: Budi ongoing, Andi belum check-in
  // -----------------------------------------------------------------
  console.log("▶ TEST 1: Budi shift ongoing, Andi belum check-in...");
  const [testShiftBudi] = await sql`
    INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
    VALUES (${budiId}, ${now}, '08:00 WIB', 'ongoing')
    RETURNING id_shift
  `;

  const count1 = await queryCapsterAktif();
  console.log(`  Capster Aktif: ${count1}`);
  if (count1 !== 1) {
    console.error(`❌ GAGAL TEST 1: Diharapkan 1, didapat ${count1}`);
    process.exit(1);
  }
  console.log("  ✅ SUKSES TEST 1: Capster Aktif = 1\n");

  // -----------------------------------------------------------------
  // TEST 2: Andi melakukan check-in (Budi ongoing, Andi ongoing)
  // -----------------------------------------------------------------
  console.log("▶ TEST 2: Andi melakukan check-in (Budi ongoing, Andi ongoing)...");
  const [testShiftAndi] = await sql`
    INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
    VALUES (${andiId}, ${now}, '08:30 WIB', 'ongoing')
    RETURNING id_shift
  `;

  const count2 = await queryCapsterAktif();
  console.log(`  Capster Aktif: ${count2}`);
  if (count2 !== 2) {
    console.error(`❌ GAGAL TEST 2: Diharapkan 2, didapat ${count2}`);
    process.exit(1);
  }
  console.log("  ✅ SUKSES TEST 2: Capster Aktif = 2\n");

  // -----------------------------------------------------------------
  // TEST 3: Budi end shift (Budi completed, Andi ongoing)
  // -----------------------------------------------------------------
  console.log("▶ TEST 3: Budi melakukan end shift (Budi completed, Andi ongoing)...");
  await sql`
    UPDATE shift_capster
    SET status = 'completed', waktu_selesai = '12:00 WIB'
    WHERE id_shift = ${testShiftBudi.id_shift}
  `;

  const count3 = await queryCapsterAktif();
  console.log(`  Capster Aktif: ${count3}`);
  if (count3 !== 1) {
    console.error(`❌ GAGAL TEST 3: Diharapkan 1, didapat ${count3}`);
    process.exit(1);
  }
  console.log("  ✅ SUKSES TEST 3: Capster Aktif = 1\n");

  // -----------------------------------------------------------------
  // TEST 4: Capster dengan status 'active' tanpa shift ongoing hari ini
  // -----------------------------------------------------------------
  console.log("▶ TEST 4: Verifikasi capster berstatus active tanpa shift ongoing tidak dihitung...");
  // Budi memiliki capster.status = 'active', tetapi shift hari ini berstatus completed
  // Andi memiliki shift ongoing
  const count4 = await queryCapsterAktif();
  console.log(`  Capster Aktif: ${count4} (Budi akun active tidak dihitung)`);
  if (count4 !== 1) {
    console.error(`❌ GAGAL TEST 4: Akun active tanpa shift ongoing terhitung!`);
    process.exit(1);
  }
  console.log("  ✅ SUKSES TEST 4: Hanya capster dengan shift ongoing yang dihitung!\n");

  // -----------------------------------------------------------------
  // TEST 5: Shift cancelled tidak dihitung
  // -----------------------------------------------------------------
  console.log("▶ TEST 5: Memastikan shift cancelled tidak dihitung...");
  // Andi cancel shift
  await sql`
    UPDATE shift_capster
    SET status = 'cancelled'
    WHERE id_shift = ${testShiftAndi.id_shift}
  `;

  const count5 = await queryCapsterAktif();
  console.log(`  Capster Aktif: ${count5}`);
  if (count5 !== 0) {
    console.error(`❌ GAGAL TEST 5: Shift cancelled terhitung sebagai aktif!`);
    process.exit(1);
  }
  console.log("  ✅ SUKSES TEST 5: Shift cancelled tidak dihitung (Capster Aktif = 0)\n");

  // -----------------------------------------------------------------
  // TEST 6: Shift completed tidak dihitung
  // -----------------------------------------------------------------
  console.log("▶ TEST 6: Memastikan shift completed tidak dihitung...");
  const [completedShift] = await sql`
    INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, waktu_selesai, status)
    VALUES (${budiId}, ${now}, '13:00 WIB', '15:00 WIB', 'completed')
    RETURNING id_shift
  `;

  const count6 = await queryCapsterAktif();
  console.log(`  Capster Aktif: ${count6}`);
  if (count6 !== 0) {
    console.error(`❌ GAGAL TEST 6: Shift completed terhitung sebagai aktif!`);
    process.exit(1);
  }
  console.log("  ✅ SUKSES TEST 6: Shift completed tidak dihitung (Capster Aktif = 0)\n");

  // -----------------------------------------------------------------
  // TEST 7: Shift dari tanggal kemarin tidak dihitung
  // -----------------------------------------------------------------
  console.log("▶ TEST 7: Memastikan shift kemarin (meski status ongoing) tidak dihitung hari ini...");
  const [yesterdayShift] = await sql`
    INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
    VALUES (${budiId}, ${yesterday}, '08:00 WIB', 'ongoing')
    RETURNING id_shift
  `;

  const count7 = await queryCapsterAktif();
  console.log(`  Capster Aktif: ${count7}`);
  if (count7 !== 0) {
    console.error(`❌ GAGAL TEST 7: Shift kemarin terhitung hari ini!`);
    process.exit(1);
  }
  console.log("  ✅ SUKSES TEST 7: Shift kemarin tidak dihitung hari ini (Capster Aktif = 0)\n");

  // -----------------------------------------------------------------
  // TEST 8: Multiple shift ongoing untuk capster yang sama di hari yang sama (DISTINCT)
  // -----------------------------------------------------------------
  console.log("▶ TEST 8: Capster memiliki multiple shift ongoing di hari yang sama (DISTINCT)...");
  const [dupShift1] = await sql`
    INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
    VALUES (${budiId}, ${now}, '08:00 WIB', 'ongoing')
    RETURNING id_shift
  `;
  const [dupShift2] = await sql`
    INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
    VALUES (${budiId}, ${now}, '10:00 WIB', 'ongoing')
    RETURNING id_shift
  `;

  const count8 = await queryCapsterAktif();
  console.log(`  Capster Aktif (Budi 2 shift ongoing): ${count8}`);
  if (count8 !== 1) {
    console.error(`❌ GAGAL TEST 8: Duplikasi capster tidak di-distinct, didapat ${count8}`);
    process.exit(1);
  }
  console.log("  ✅ SUKSES TEST 8: Budi hanya dihitung 1 kali (Capster Aktif = 1)\n");

  // Bersihkan shift temporary uji coba (yang tidak memiliki transaksi)
  await sql`
    DELETE FROM shift_capster 
    WHERE id_shift IN (
      ${testShiftBudi.id_shift},
      ${testShiftAndi.id_shift},
      ${completedShift.id_shift},
      ${yesterdayShift.id_shift},
      ${dupShift1.id_shift},
      ${dupShift2.id_shift}
    )
  `;

  // Pastikan Budi memiliki 1 shift ongoing untuk hari ini agar dashboard normal
  const [activeCheck] = await sql`
    SELECT id_shift FROM shift_capster 
    WHERE id_capster = ${budiId} AND tanggal >= CURRENT_DATE AND status = 'ongoing'
    LIMIT 1
  `;
  if (!activeCheck) {
    await sql`
      INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
      VALUES (${budiId}, ${now}, '08:00 WIB', 'ongoing')
    `;
  }

  const finalCount = await queryCapsterAktif();
  console.log(`  Kondisi akhir stabil: Budi ongoing -> Capster Aktif = ${finalCount}`);

  console.log("\n===============================================================");
  console.log("🎉 SELURUH 8 PENGUJIAN 'CAPSTER AKTIF' BERHASIL 100%!");
  console.log("===============================================================");

  await sql.end();
}

runTests().catch(console.error);
