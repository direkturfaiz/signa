import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";
const sql = postgres(connectionString, { prepare: false });

function generateStrukNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `STR-${ymd}-${rand}`;
}

async function createTestTransaction(customerName, capsterId) {
  const [shop] = await sql`SELECT id_barbershop FROM barbershop LIMIT 1`;
  const [srv] = await sql`SELECT id_layanan, harga FROM layanan LIMIT 1`;

  // Find or create customer
  let [user] = await sql`
    SELECT id_user FROM users WHERE email = 'customer.test@barberin.local' LIMIT 1
  `;
  if (!user) {
    [user] = await sql`
      INSERT INTO users (email, nama_lengkap, no_hp, role, status)
      VALUES ('customer.test@barberin.local', ${customerName}, '081234567899', 'pelanggan', 'active')
      RETURNING id_user
    `;
  }

  let [cust] = await sql`
    SELECT id_pelanggan FROM pelanggan WHERE id_user = ${user.id_user} LIMIT 1
  `;
  if (!cust) {
    [cust] = await sql`
      INSERT INTO pelanggan (id_user) VALUES (${user.id_user}) RETURNING id_pelanggan
    `;
  }

  // Get active shift for capster
  let [shift] = await sql`
    SELECT id_shift FROM shift_capster WHERE id_capster = ${capsterId} LIMIT 1
  `;
  if (!shift) {
    [shift] = await sql`
      INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
      VALUES (${capsterId}, NOW(), '08:00 WIB', 'ongoing')
      RETURNING id_shift
    `;
  }

  // 1. Booking (status: pending)
  const [b] = await sql`
    INSERT INTO booking (id_pelanggan, id_barbershop, id_capster, tanggal_booking, waktu_booking, status)
    VALUES (${cust.id_pelanggan}, ${shop.id_barbershop}, ${capsterId}, NOW(), '09:00', 'pending')
    RETURNING id_booking
  `;

  // 2. Detail Booking
  await sql`
    INSERT INTO detail_booking (id_booking, id_layanan, harga_satuan, qty, subtotal)
    VALUES (${b.id_booking}, ${srv.id_layanan}, ${srv.harga}, 1, ${srv.harga})
  `;

  // 3. Transaksi (status: pending)
  const [t] = await sql`
    INSERT INTO transaksi (id_booking, id_shift, id_pelanggan, subtotal, diskon, total, status_transaksi)
    VALUES (${b.id_booking}, ${shift.id_shift}, ${cust.id_pelanggan}, ${srv.harga}, 0, ${srv.harga}, 'pending')
    RETURNING id_transaksi
  `;

  // 4. Pembayaran (status: pending)
  await sql`
    INSERT INTO pembayaran (id_transaksi, metode_pembayaran, jumlah_bayar, status_pembayaran)
    VALUES (${t.id_transaksi}, 'tunai', ${srv.harga}, 'pending')
  `;

  return {
    transactionId: t.id_transaksi,
    bookingId: b.id_booking,
  };
}

async function getTransactionDetailQuery(transactionId) {
  const [t] = await sql`
    SELECT 
      t.id_transaksi,
      t.status_transaksi as status,
      p.status_pembayaran as payment_status,
      b.status as booking_status
    FROM transaksi t
    LEFT JOIN pembayaran p ON t.id_transaksi = p.id_transaksi
    LEFT JOIN booking b ON t.id_booking = b.id_booking
    WHERE t.id_transaksi = ${transactionId}
  `;
  return t;
}

async function capsterConfirmPayment(transactionId) {
  const now = new Date();
  // 1. Update transaksi
  const [updatedTx] = await sql`
    UPDATE transaksi
    SET status_transaksi = 'paid', updated_at = ${now}
    WHERE id_transaksi = ${transactionId}
    RETURNING id_transaksi, id_booking
  `;

  // 2. Update pembayaran
  await sql`
    UPDATE pembayaran
    SET status_pembayaran = 'success', waktu_bayar = ${now}
    WHERE id_transaksi = ${transactionId}
  `;

  // 3. Update booking
  if (updatedTx.id_booking) {
    await sql`
      UPDATE booking
      SET status = 'confirmed', updated_at = ${now}
      WHERE id_booking = ${updatedTx.id_booking}
    `;
  }

  // 4. Struk
  const [existingStruk] = await sql`
    SELECT id_struk FROM struk WHERE id_transaksi = ${transactionId}
  `;
  if (!existingStruk) {
    await sql`
      INSERT INTO struk (id_transaksi, no_struk, tanggal_cetak)
      VALUES (${transactionId}, ${generateStrukNumber()}, ${now})
    `;
  }
}

async function main() {
  console.log("==================================================================");
  console.log("🧪 TESTING FLOW KONFIRMASI PEMBAYARAN: /customer/service-execution");
  console.log("==================================================================\n");

  const [budi] = await sql`SELECT id_capster FROM capster LIMIT 1`;
  const capsterId = budi.id_capster;

  // -------------------------------------------------------------
  // TEST 1: Transaksi baru dibuat -> Capster belum konfirmasi
  // -------------------------------------------------------------
  console.log("▶ TEST 1: Customer membuat transaksi baru (Capster BELUM konfirmasi)...");
  const testTxA = await createTestTransaction("Customer A", capsterId);
  console.log(`  Transaksi A Dibuat: ID = ${testTxA.transactionId}`);

  const detailA1 = await getTransactionDetailQuery(testTxA.transactionId);
  console.log("  Status di Database:", {
    status_transaksi: detailA1.status,
    status_pembayaran: detailA1.payment_status,
    booking_status: detailA1.booking_status,
  });

  const isPaidA1 = detailA1.status === "paid" || detailA1.payment_status === "success";
  const buttonDisabledA1 = !isPaidA1;

  console.log(`  Logika Tombol: isPaid=${isPaidA1} -> Tombol DISABLED = ${buttonDisabledA1}`);

  if (!buttonDisabledA1) {
    console.error("❌ GAGAL TEST 1: Tombol aktif padahal capster belum konfirmasi!");
    process.exit(1);
  }
  console.log("✅ SUKSES TEST 1: Tombol 'Lanjut ke Konfirmasi Pembayaran' BERHASIL DISABLED saat capster belum konfirmasi!\n");

  // -------------------------------------------------------------
  // TEST 2: Transaksi kedua (isolasi transaksi lain)
  // -------------------------------------------------------------
  console.log("▶ TEST 2: Membuat Transaksi B (untuk pengujian isolasi transaksi)...");
  const testTxB = await createTestTransaction("Customer B", capsterId);
  console.log(`  Transaksi B Dibuat: ID = ${testTxB.transactionId}`);

  const detailB1 = await getTransactionDetailQuery(testTxB.transactionId);
  const isPaidB1 = detailB1.status === "paid" || detailB1.payment_status === "success";
  console.log(`  Transaksi B: isPaid=${isPaidB1}, Tombol DISABLED=${!isPaidB1}\n`);

  // -------------------------------------------------------------
  // TEST 3: Capster melakukan konfirmasi pada Transaksi A
  // -------------------------------------------------------------
  console.log("▶ TEST 3: Capster mengonfirmasi pembayaran pada Transaksi A...");
  await capsterConfirmPayment(testTxA.transactionId);

  const detailA2 = await getTransactionDetailQuery(testTxA.transactionId);
  console.log("  Status Transaksi A Setelah Capster Konfirmasi:", {
    status_transaksi: detailA2.status,
    status_pembayaran: detailA2.payment_status,
    booking_status: detailA2.booking_status,
  });

  if (detailA2.status !== "paid" || detailA2.payment_status !== "success") {
    console.error("❌ GAGAL TEST 3: Status transaksi tidak berubah jadi paid di database!");
    process.exit(1);
  }
  console.log("✅ SUKSES TEST 3: Database Supabase terupdate: status_transaksi='paid', status_pembayaran='success'!\n");

  // -------------------------------------------------------------
  // TEST 4: Customer mendeteksi perubahan status Transaksi A
  // -------------------------------------------------------------
  console.log("▶ TEST 4: Customer mendeteksi perubahan status Transaksi A...");
  const isPaidA2 = detailA2.status === "paid" || detailA2.payment_status === "success";
  const buttonDisabledA2 = !isPaidA2;
  console.log(`  Logika Tombol Transaksi A: isPaid=${isPaidA2} -> Tombol DISABLED = ${buttonDisabledA2} (ENABLED = ${!buttonDisabledA2})`);

  if (buttonDisabledA2) {
    console.error("❌ GAGAL TEST 4: Tombol masih disabled padahal capster sudah konfirmasi!");
    process.exit(1);
  }
  console.log("✅ SUKSES TEST 4: Tombol 'Lanjut ke Konfirmasi Pembayaran' BERHASIL MENJADI ENABLED setelah capster konfirmasi!\n");

  // -------------------------------------------------------------
  // TEST 5: Pastikan Transaksi B TIDAK ikut berubah
  // -------------------------------------------------------------
  console.log("▶ TEST 5: Verifikasi Transaksi B (milik customer lain) tetap tidak terpengaruh...");
  const detailB2 = await getTransactionDetailQuery(testTxB.transactionId);
  const isPaidB2 = detailB2.status === "paid" || detailB2.payment_status === "success";
  const buttonDisabledB2 = !isPaidB2;
  console.log("  Status Transaksi B:", {
    status_transaksi: detailB2.status,
    status_pembayaran: detailB2.payment_status,
    tombolDisabled: buttonDisabledB2,
  });

  if (detailB2.status !== "pending" || !buttonDisabledB2) {
    console.error("❌ GAGAL TEST 5: Transaksi B ikut terpengaruh oleh konfirmasi Transaksi A!");
    process.exit(1);
  }
  console.log("✅ SUKSES TEST 5: Transaksi B tetap pending dan tombolnya tetap DISABLED. Tidak ada crosstalk antar transaksi!\n");

  console.log("==================================================================");
  console.log("🎉 SELURUH PENGUJIAN FLOW KONFIRMASI PEMBAYARAN BERHASIL (100%)!");
  console.log("==================================================================");

  await sql.end();
}

main().catch(console.error);
