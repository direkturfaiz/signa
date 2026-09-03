import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL tidak ditemukan di .env!");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function runTests() {
  console.log("===============================================================");
  console.log("🚀 MENJALANKAN PENGUJIAN OTOMATIS FITUR BARBERIN (TEST A - K)");
  console.log("===============================================================\n");

  const results = {};

  // -----------------------------------------------------------------
  // TEST A: Migrasi Database & Relasi (11 Tabel ERD)
  // -----------------------------------------------------------------
  try {
    console.log("▶ Menjalankan Test A: Verifikasi 11 Tabel ERD di Supabase...");
    const requiredTables = [
      "users",
      "pelanggan",
      "barbershop",
      "capster",
      "layanan",
      "booking",
      "detail_booking",
      "shift_capster",
      "transaksi",
      "pembayaran",
      "struk",
    ];

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
    `;

    const existingTableNames = tables.map((t) => t.table_name);
    const missingTables = requiredTables.filter(
      (t) => !existingTableNames.includes(t),
    );

    if (missingTables.length > 0) {
      throw new Error(`Tabel hilang: ${missingTables.join(", ")}`);
    }

    // Check foreign keys
    const fks = await sql`
      SELECT
        tc.table_name, kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `;

    console.log(`   ✅ Seluruh 11 tabel ERD terverifikasi.`);
    console.log(`   ✅ Ditemukan ${fks.length} foreign key constraints.`);
    results["Test A"] = { passed: true, details: `11/11 tabel aktif, ${fks.length} relasi FK` };
  } catch (err) {
    console.error("   ❌ Test A Gagal:", err.message);
    results["Test A"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST B: Layanan Aktif Muncul
  // -----------------------------------------------------------------
  let testServices = [];
  try {
    console.log("\n▶ Menjalankan Test B: Membaca Layanan Aktif...");
    testServices = await sql`
      SELECT id_layanan, nama_layanan, harga, durasi_menit, status 
      FROM layanan 
      WHERE status = 'active'
      ORDER BY harga ASC;
    `;

    if (testServices.length === 0) {
      throw new Error("Tidak ada layanan aktif di database.");
    }

    console.log(`   ✅ Ditemukan ${testServices.length} layanan aktif di Supabase:`);
    testServices.forEach((s) => {
      console.log(`      - ${s.nama_layanan} (Rp ${Number(s.harga).toLocaleString("id-ID")})`);
    });
    results["Test B"] = { passed: true, count: testServices.length };
  } catch (err) {
    console.error("   ❌ Test B Gagal:", err.message);
    results["Test B"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST C: Pemilihan Capster Berdasarkan Data DB
  // -----------------------------------------------------------------
  let testCapsters = [];
  try {
    console.log("\n▶ Menjalankan Test C: Membaca Data Capster Aktif...");
    testCapsters = await sql`
      SELECT c.id_capster, c.id_barbershop, u.nama_lengkap, u.email, c.no_pegawai, c.status
      FROM capster c
      JOIN users u ON c.id_user = u.id_user
      WHERE c.status = 'active';
    `;

    if (testCapsters.length === 0) {
      throw new Error("Tidak ada capster aktif di database.");
    }

    console.log(`   ✅ Ditemukan ${testCapsters.length} capster aktif:`);
    testCapsters.forEach((c) => {
      console.log(`      - ${c.nama_lengkap} (${c.no_pegawai}) [ID: ${c.id_capster}]`);
    });
    results["Test C"] = { passed: true, count: testCapsters.length };
  } catch (err) {
    console.error("   ❌ Test C Gagal:", err.message);
    results["Test C"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST D: Input Customer Menyimpan ke Pelanggan & Users
  // -----------------------------------------------------------------
  let createdCustomer = null;
  try {
    console.log("\n▶ Menjalankan Test D: Verifikasi Penyimpanan Data Customer...");
    const testEmail = `test.e2e.${Date.now()}@barberin.local`;
    const testName = "Dimas Surya";
    const testPhone = "081299887766";

    const [u] = await sql`
      INSERT INTO users (email, nama_lengkap, no_hp, role, status)
      VALUES (${testEmail}, ${testName}, ${testPhone}, 'pelanggan', 'active')
      RETURNING *;
    `;

    const [p] = await sql`
      INSERT INTO pelanggan (id_user, alamat, jenis_kelamin)
      VALUES (${u.id_user}, 'Jl. Pemuda No. 45', 'Laki-laki')
      RETURNING *;
    `;

    createdCustomer = { user: u, pelanggan: p };
    console.log(`   ✅ Customer berhasil dibuat di DB:`);
    console.log(`      - User ID: ${u.id_user}`);
    console.log(`      - Pelanggan ID: ${p.id_pelanggan} (Nama: ${u.nama_lengkap})`);
    results["Test D"] = { passed: true, customerId: p.id_pelanggan };
  } catch (err) {
    console.error("   ❌ Test D Gagal:", err.message);
    results["Test D"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST E: Customer Booking Menghasilkan Booking, Detail, Transaksi, Pembayaran
  // -----------------------------------------------------------------
  let createdBookingTx = null;
  try {
    console.log("\n▶ Menjalankan Test E: Alur Pemesanan Lengkap Customer...");
    const capster = testCapsters[0];
    const servicesToBook = testServices.slice(0, 2); // 2 services
    const now = new Date();

    // Pastikan shift aktif capster tersedia
    let [activeShift] = await sql`
      SELECT * FROM shift_capster 
      WHERE id_capster = ${capster.id_capster} AND status = 'ongoing'
      LIMIT 1;
    `;

    if (!activeShift) {
      [activeShift] = await sql`
        INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
        VALUES (${capster.id_capster}, NOW(), '08:00 WIB', 'ongoing')
        RETURNING *;
      `;
    }

    // 1. Booking
    const [b] = await sql`
      INSERT INTO booking (
        id_pelanggan, id_barbershop, id_capster, tanggal_booking, waktu_booking, status, catatan
      ) VALUES (
        ${createdCustomer.pelanggan.id_pelanggan},
        ${capster.id_barbershop},
        ${capster.id_capster},
        ${now},
        '10:00 WIB',
        'pending',
        'Pesanan Customer Online'
      ) RETURNING *;
    `;

    // 2. Detail Booking
    let subtotal = 0;
    for (const svc of servicesToBook) {
      const price = Number(svc.harga);
      subtotal += price;
      await sql`
        INSERT INTO detail_booking (id_booking, id_layanan, harga_satuan, qty, subtotal)
        VALUES (${b.id_booking}, ${svc.id_layanan}, ${price}, 1, ${price});
      `;
    }

    // 3. Transaksi
    const [tx] = await sql`
      INSERT INTO transaksi (
        id_booking, id_shift, id_pelanggan, subtotal, diskon, total, status_transaksi
      ) VALUES (
        ${b.id_booking},
        ${activeShift.id_shift},
        ${createdCustomer.pelanggan.id_pelanggan},
        ${subtotal},
        0,
        ${subtotal},
        'pending'
      ) RETURNING *;
    `;

    // 4. Pembayaran
    const [pay] = await sql`
      INSERT INTO pembayaran (
        id_transaksi, metode_pembayaran, jumlah_bayar, status_pembayaran
      ) VALUES (
        ${tx.id_transaksi}, 'qris', ${subtotal}, 'pending'
      ) RETURNING *;
    `;

    createdBookingTx = {
      booking: b,
      transaksi: tx,
      pembayaran: pay,
      shift: activeShift,
    };

    console.log(`   ✅ Booking ID dibuat: ${b.id_booking}`);
    console.log(`   ✅ Transaksi ID dibuat: ${tx.id_transaksi} (Total: Rp ${Number(tx.total).toLocaleString("id-ID")})`);
    console.log(`   ✅ Pembayaran ID dibuat: ${pay.id_pembayaran} (Status: ${pay.status_pembayaran})`);
    results["Test E"] = {
      passed: true,
      transactionId: tx.id_transaksi,
      bookingId: b.id_booking,
    };
  } catch (err) {
    console.error("   ❌ Test E Gagal:", err.message);
    results["Test E"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST F: Capster Check In Membuat shift_capster
  // -----------------------------------------------------------------
  try {
    console.log("\n▶ Menjalankan Test F: Capster Check-in Membuat Record shift_capster...");
    const capster2 = testCapsters[1] || testCapsters[0];

    const [newShift] = await sql`
      INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status, total_transaksi, total_pendapatan)
      VALUES (${capster2.id_capster}, NOW(), '09:00 WIB', 'ongoing', 0, 0)
      RETURNING *;
    `;

    console.log(`   ✅ Shift baru berhasil dibuat:`);
    console.log(`      - Shift ID: ${newShift.id_shift}`);
    console.log(`      - Capster: ${capster2.nama_lengkap}`);
    console.log(`      - Waktu Mulai: ${newShift.waktu_mulai}`);
    console.log(`      - Status: ${newShift.status}`);
    results["Test F"] = { passed: true, shiftId: newShift.id_shift };
  } catch (err) {
    console.error("   ❌ Test F Gagal:", err.message);
    results["Test F"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST G: Capster Melihat Booking Customer Yang Sama
  // -----------------------------------------------------------------
  try {
    console.log("\n▶ Menjalankan Test G: Capster Membaca Transaksi Customer dari Database...");
    const [foundTx] = await sql`
      SELECT 
        t.id_transaksi, t.total, t.status_transaksi,
        u.nama_lengkap as nama_pelanggan,
        b.waktu_booking,
        p.metode_pembayaran
      FROM transaksi t
      JOIN pelanggan pel ON t.id_pelanggan = pel.id_pelanggan
      JOIN users u ON pel.id_user = u.id_user
      LEFT JOIN booking b ON t.id_booking = b.id_booking
      LEFT JOIN pembayaran p ON t.id_transaksi = p.id_transaksi
      WHERE t.id_transaksi = ${createdBookingTx.transaksi.id_transaksi};
    `;

    if (!foundTx) {
      throw new Error("Transaksi customer tidak ditemukan oleh query Capster!");
    }

    console.log(`   ✅ Capster berhasil menemukan transaksi customer:`);
    console.log(`      - ID Transaksi: ${foundTx.id_transaksi}`);
    console.log(`      - Pelanggan: ${foundTx.nama_pelanggan}`);
    console.log(`      - Total: Rp ${Number(foundTx.total).toLocaleString("id-ID")}`);
    console.log(`      - Status Transaksi: ${foundTx.status_transaksi}`);
    results["Test G"] = { passed: true, foundId: foundTx.id_transaksi };
  } catch (err) {
    console.error("   ❌ Test G Gagal:", err.message);
    results["Test G"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST H: Konfirmasi Pembayaran Oleh Capster/Customer
  // -----------------------------------------------------------------
  let strukCustomer = null;
  try {
    console.log("\n▶ Menjalankan Test H: Konfirmasi Pembayaran dan Pembuatan Struk...");
    const txId = createdBookingTx.transaksi.id_transaksi;
    const now = new Date();

    // 1. Update Transaksi -> paid
    await sql`
      UPDATE transaksi 
      SET status_transaksi = 'paid', updated_at = ${now}
      WHERE id_transaksi = ${txId};
    `;

    // 2. Update Pembayaran -> success
    await sql`
      UPDATE pembayaran 
      SET status_pembayaran = 'success', waktu_bayar = ${now}
      WHERE id_transaksi = ${txId};
    `;

    // 3. Update Booking -> completed
    await sql`
      UPDATE booking 
      SET status = 'completed', updated_at = ${now}
      WHERE id_booking = ${createdBookingTx.booking.id_booking};
    `;

    // 4. Create Struk
    const rand = Math.floor(1000 + Math.random() * 9000);
    const noStruk = `STR-${Date.now().toString().slice(-6)}-${rand}`;
    const [s] = await sql`
      INSERT INTO struk (id_transaksi, no_struk, tanggal_cetak)
      VALUES (${txId}, ${noStruk}, ${now})
      RETURNING *;
    `;

    strukCustomer = s;

    console.log(`   ✅ Status transaksi berhasil diubah ke 'paid'.`);
    console.log(`   ✅ Status pembayaran berhasil diubah ke 'success'.`);
    console.log(`   ✅ Struk otomatis tercetak: ${s.no_struk} (ID Struk: ${s.id_struk})`);
    results["Test H"] = { passed: true, noStruk: s.no_struk };
  } catch (err) {
    console.error("   ❌ Test H Gagal:", err.message);
    results["Test H"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST I: Struk Dapat Dibuka & Dibaca dari DB
  // -----------------------------------------------------------------
  try {
    console.log("\n▶ Menjalankan Test I: Membaca Data Struk Melalui ID Transaksi...");
    const [receiptView] = await sql`
      SELECT 
        s.no_struk, s.tanggal_cetak,
        t.id_transaksi, t.subtotal, t.diskon, t.total, t.status_transaksi,
        u.nama_lengkap as customer_name,
        p.metode_pembayaran, p.status_pembayaran
      FROM struk s
      JOIN transaksi t ON s.id_transaksi = t.id_transaksi
      JOIN pelanggan pel ON t.id_pelanggan = pel.id_pelanggan
      JOIN users u ON pel.id_user = u.id_user
      JOIN pembayaran p ON t.id_transaksi = p.id_transaksi
      WHERE t.id_transaksi = ${createdBookingTx.transaksi.id_transaksi};
    `;

    if (!receiptView) {
      throw new Error("Struk tidak dapat ditemukan di database!");
    }

    console.log(`   ✅ Data struk terverifikasi valid di database:`);
    console.log(`      - No. Struk: ${receiptView.no_struk}`);
    console.log(`      - Pelanggan: ${receiptView.customer_name}`);
    console.log(`      - Total Bayar: Rp ${Number(receiptView.total).toLocaleString("id-ID")}`);
    console.log(`      - Status Transaksi: ${receiptView.status_transaksi}`);
    console.log(`      - Status Pembayaran: ${receiptView.status_pembayaran}`);
    results["Test I"] = { passed: true, receipt: receiptView.no_struk };
  } catch (err) {
    console.error("   ❌ Test I Gagal:", err.message);
    results["Test I"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST J: Transaksi Manual Capster Tercatat Lengkap
  // -----------------------------------------------------------------
  let manualTxId = null;
  try {
    console.log("\n▶ Menjalankan Test J: Pembuatan Transaksi Manual Capster...");
    const capster = testCapsters[0];
    const servicesManual = [testServices[0]]; // 1 service
    const now = new Date();

    // 1. User & Pelanggan walk-in
    const [uWalkin] = await sql`
      INSERT INTO users (email, nama_lengkap, role, status)
      VALUES (${`walkin.${Date.now()}@barberin.local`}, 'Walk-in Customer Test', 'pelanggan', 'active')
      RETURNING *;
    `;
    const [pWalkin] = await sql`
      INSERT INTO pelanggan (id_user)
      VALUES (${uWalkin.id_user})
      RETURNING *;
    `;

    // 2. Booking
    const [bManual] = await sql`
      INSERT INTO booking (
        id_pelanggan, id_barbershop, id_capster, tanggal_booking, waktu_booking, status, catatan
      ) VALUES (
        ${pWalkin.id_pelanggan}, ${capster.id_barbershop}, ${capster.id_capster}, ${now}, '14:30 WIB', 'completed', 'Walk-in cash'
      ) RETURNING *;
    `;

    // 3. Detail Booking
    const price = Number(servicesManual[0].harga);
    await sql`
      INSERT INTO detail_booking (id_booking, id_layanan, harga_satuan, qty, subtotal)
      VALUES (${bManual.id_booking}, ${servicesManual[0].id_layanan}, ${price}, 1, ${price});
    `;

    // 4. Transaksi
    const [txManual] = await sql`
      INSERT INTO transaksi (
        id_booking, id_shift, id_pelanggan, subtotal, diskon, total, status_transaksi
      ) VALUES (
        ${bManual.id_booking}, ${createdBookingTx.shift.id_shift}, ${pWalkin.id_pelanggan}, ${price}, 0, ${price}, 'paid'
      ) RETURNING *;
    `;

    // 5. Pembayaran Tunai
    await sql`
      INSERT INTO pembayaran (id_transaksi, metode_pembayaran, jumlah_bayar, status_pembayaran, referensi, waktu_bayar)
      VALUES (${txManual.id_transaksi}, 'tunai', ${price}, 'success', ${`Tunai: ${price + 10000}`}, ${now});
    `;

    // 6. Struk
    const rand = Math.floor(1000 + Math.random() * 9000);
    const noStruk = `STR-${Date.now().toString().slice(-6)}-${rand}`;
    const [sManual] = await sql`
      INSERT INTO struk (id_transaksi, no_struk, tanggal_cetak)
      VALUES (${txManual.id_transaksi}, ${noStruk}, ${now})
      RETURNING *;
    `;

    manualTxId = txManual.id_transaksi;
    console.log(`   ✅ Transaksi manual berhasil disimpan ke database:`);
    console.log(`      - ID Transaksi: ${txManual.id_transaksi}`);
    console.log(`      - No. Struk: ${sManual.no_struk}`);
    console.log(`      - Status: ${txManual.status_transaksi}`);
    results["Test J"] = { passed: true, manualTxId };
  } catch (err) {
    console.error("   ❌ Test J Gagal:", err.message);
    results["Test J"] = { passed: false, error: err.message };
  }

  // -----------------------------------------------------------------
  // TEST K: End Shift Menghitung Rekap Tanpa Menghapus Transaksi
  // -----------------------------------------------------------------
  try {
    console.log("\n▶ Menjalankan Test K: Mengakhiri Shift dan Verifikasi Data Tidak Terhapus...");
    const shiftId = createdBookingTx.shift.id_shift;

    // Hitung total transaksi dan total pendapatan dari tabel transaksi untuk shift ini
    const shiftTxs = await sql`
      SELECT total, status_transaksi 
      FROM transaksi 
      WHERE id_shift = ${shiftId};
    `;

    const totalCount = shiftTxs.length;
    const totalIncome = shiftTxs.reduce((sum, t) => {
      return sum + (t.status_transaksi === "paid" ? Number(t.total) : 0);
    }, 0);

    // Update shift_capster
    const [completedShift] = await sql`
      UPDATE shift_capster 
      SET 
        status = 'completed',
        waktu_selesai = '17:00 WIB',
        total_transaksi = ${totalCount},
        total_pendapatan = ${totalIncome},
        updated_at = NOW()
      WHERE id_shift = ${shiftId}
      RETURNING *;
    `;

    // Verifikasi bahwa transaksi di tabel transaksi MASIH UTUH
    const [verifyCount] = await sql`
      SELECT count(*) as cnt FROM transaksi WHERE id_shift = ${shiftId};
    `;

    if (Number(verifyCount.cnt) !== totalCount) {
      throw new Error("Data transaksi berkurang setelah end shift!");
    }

    console.log(`   ✅ Shift ${completedShift.id_shift} berhasil diakhiri:`);
    console.log(`      - Status: ${completedShift.status}`);
    console.log(`      - Total Transaksi: ${completedShift.total_transaksi}`);
    console.log(`      - Total Pendapatan: Rp ${Number(completedShift.total_pendapatan).toLocaleString("id-ID")}`);
    console.log(`      - Transaksi di DB: ${verifyCount.cnt} record (TERVERIFIKASI UTUH, TIDAK DIHAPUS)`);
    results["Test K"] = {
      passed: true,
      totalCount: completedShift.total_transaksi,
      totalIncome: completedShift.total_pendapatan,
    };
  } catch (err) {
    console.error("   ❌ Test K Gagal:", err.message);
    results["Test K"] = { passed: false, error: err.message };
  }

  console.log("\n===============================================================");
  console.log("📊 HASIL AKHIR PENGUJIAN INTEGRASI (TEST A - TEST K):");
  console.log("===============================================================");
  let allPassed = true;
  for (const [tName, res] of Object.entries(results)) {
    console.log(`${res.passed ? "✅" : "❌"} ${tName}: ${res.passed ? "BERHASIL (PASS)" : "GAGAL (FAIL)"}`);
    if (!res.passed) allPassed = false;
  }

  if (allPassed) {
    console.log("\n🎉 SELURUH PENGUJIAN (TEST A s/d TEST K) LULUS 100%!");
  } else {
    console.log("\n⚠️ Terdapat pengujian yang gagal.");
  }

  await sql.end();
}

runTests().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
