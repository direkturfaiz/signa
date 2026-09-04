import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ppyyebodwmvxtbdaazbm:kelompoksigna@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";
const sql = postgres(connectionString, { prepare: false });

async function getMetrics(targetCapsterId) {
  const now = new Date();
  const jakartaDateStr = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  const startOfToday = new Date(`${jakartaDateStr}T00:00:00+07:00`);
  const endOfToday = new Date(`${jakartaDateStr}T23:59:59.999+07:00`);

  const txs = await sql`
    SELECT 
      t.id_transaksi,
      t.id_booking,
      t.total,
      t.status_transaksi,
      t.created_at
    FROM transaksi t
    INNER JOIN shift_capster sc ON t.id_shift = sc.id_shift
    WHERE sc.id_capster = ${targetCapsterId}
      AND t.created_at >= ${startOfToday}
      AND t.created_at <= ${endOfToday}
  `;

  const totalTransaksi = txs.length;
  const totalPendapatan = txs.reduce((sum, t) => {
    return sum + (t.status_transaksi === "paid" ? Number(t.total) : 0);
  }, 0);

  let totalLayanan = 0;
  let selesai = 0;
  let menunggu = 0;
  let dibatalkan = 0;

  for (const t of txs) {
    if (t.status_transaksi === "paid") {
      selesai++;
    } else if (
      t.status_transaksi === "cancelled" ||
      t.status_transaksi === "refunded"
    ) {
      dibatalkan++;
    } else {
      menunggu++;
    }

    if (
      t.id_booking &&
      t.status_transaksi !== "cancelled" &&
      t.status_transaksi !== "refunded"
    ) {
      const dbRows = await sql`
        SELECT qty FROM detail_booking WHERE id_booking = ${t.id_booking}
      `;
      totalLayanan += dbRows.reduce((s, d) => s + (d.qty || 1), 0);
    }
  }

  const activeCapsters = await sql`
    SELECT count(*)::int as count FROM capster WHERE status = 'active'
  `;
  const capsterAktif = activeCapsters[0]?.count ?? 2;

  return {
    totalTransaksi,
    totalPendapatan,
    totalLayanan,
    capsterAktif,
    statusLayanan: { selesai, sedangDikerjakan: 0, menunggu, dibatalkan },
    ringkasanHariIni: {
      totalPendapatan,
      totalTransaksi,
      totalLayanan,
      selesai,
      belumSelesai: menunggu,
    },
  };
}

async function runVerification() {
  console.log("=================================================");
  console.log("🔍 TESTING METRIK DASHBOARD CAPSTER PERSONAL");
  console.log("=================================================\n");

  const budiId = "4bac18cd-d0c8-4933-a24b-2eacf56294ac";
  const andiId = "8b020274-d637-4d0f-b454-b8d387338865";

  // TEST 1: Ambil metrik Budi
  console.log("▶ TEST 1: Metrik Budi (CAP-001)...");
  const metricsBudi = await getMetrics(budiId);
  console.log("Statistik Budi Hari Ini:", {
    totalTransaksi: metricsBudi.totalTransaksi,
    totalPendapatan: `Rp${metricsBudi.totalPendapatan.toLocaleString("id-ID")}`,
    totalLayanan: metricsBudi.totalLayanan,
    statusLayanan: metricsBudi.statusLayanan,
  });

  // TEST 2: Ambil metrik Andi
  console.log("\n▶ TEST 2: Metrik Andi (CAP-002)...");
  const metricsAndi = await getMetrics(andiId);
  console.log("Statistik Andi Hari Ini:", {
    totalTransaksi: metricsAndi.totalTransaksi,
    totalPendapatan: `Rp${metricsAndi.totalPendapatan.toLocaleString("id-ID")}`,
    totalLayanan: metricsAndi.totalLayanan,
    statusLayanan: metricsAndi.statusLayanan,
  });

  // Verifikasi kedua statistik tidak sama (berbeda antar capster)
  console.log("\n▶ VALIDASI PERBEDAAN STATISTIK:");
  console.log(
    `- Budi Transaksi: ${metricsBudi.totalTransaksi} vs Andi Transaksi: ${metricsAndi.totalTransaksi}`,
  );
  console.log(
    `- Budi Pendapatan: Rp${metricsBudi.totalPendapatan.toLocaleString("id-ID")} vs Andi Pendapatan: Rp${metricsAndi.totalPendapatan.toLocaleString("id-ID")}`,
  );
  console.log(
    `- Budi Layanan: ${metricsBudi.totalLayanan} vs Andi Layanan: ${metricsAndi.totalLayanan}`,
  );

  if (
    metricsBudi.totalTransaksi === metricsAndi.totalTransaksi &&
    metricsBudi.totalPendapatan === metricsAndi.totalPendapatan &&
    metricsBudi.totalTransaksi > 0
  ) {
    console.error("❌ GAGAL: Statistik Budi dan Andi sama!");
    process.exit(1);
  } else {
    console.log("✅ SUKSES: Statistik Budi dan Andi berbeda dan terisolasi!");
  }

  // TEST 3 & 4: Simulasi pembuatan transaksi untuk Andi hari ini, dan validasi Budi tidak terpengaruh
  console.log(
    "\n▶ TEST 3 & 4: Membuat transaksi baru untuk Andi dan memastikan Budi tidak terpengaruh...",
  );

  // Cari shift ongoing untuk Andi atau buat
  let [shiftAndi] = await sql`
    SELECT id_shift FROM shift_capster 
    WHERE id_capster = ${andiId} AND status = 'ongoing'
    LIMIT 1
  `;
  if (!shiftAndi) {
    [shiftAndi] = await sql`
      INSERT INTO shift_capster (id_capster, tanggal, waktu_mulai, status)
      VALUES (${andiId}, NOW(), '08:00 WIB', 'ongoing')
      RETURNING id_shift
    `;
  }

  // Dapatkan barbershop dan pelanggan
  const [shop] = await sql`SELECT id_barbershop FROM barbershop LIMIT 1`;
  const [cust] = await sql`SELECT id_pelanggan FROM pelanggan LIMIT 1`;
  const [srv] = await sql`SELECT id_layanan, harga FROM layanan LIMIT 1`;

  // Buat booking untuk Andi
  const [newBooking] = await sql`
    INSERT INTO booking (id_pelanggan, id_barbershop, id_capster, tanggal_booking, waktu_booking, status)
    VALUES (${cust.id_pelanggan}, ${shop.id_barbershop}, ${andiId}, NOW(), '08:30', 'completed')
    RETURNING id_booking
  `;

  // Detail booking: 2 layanan
  await sql`
    INSERT INTO detail_booking (id_booking, id_layanan, harga_satuan, qty, subtotal)
    VALUES (${newBooking.id_booking}, ${srv.id_layanan}, ${srv.harga}, 2, ${Number(srv.harga) * 2})
  `;

  // Buat transaksi untuk Andi
  const txTotal = Number(srv.harga) * 2;
  const [newTx] = await sql`
    INSERT INTO transaksi (id_booking, id_shift, id_pelanggan, subtotal, diskon, total, status_transaksi)
    VALUES (${newBooking.id_booking}, ${shiftAndi.id_shift}, ${cust.id_pelanggan}, ${txTotal}, 0, ${txTotal}, 'paid')
    RETURNING id_transaksi
  `;

  // Ambil metrik baru untuk Budi dan Andi
  const updatedAndi = await getMetrics(andiId);
  const updatedBudi = await getMetrics(budiId);

  console.log("Statistik Andi Setelah Transaksi Baru:", {
    totalTransaksi: updatedAndi.totalTransaksi,
    totalPendapatan: `Rp${updatedAndi.totalPendapatan.toLocaleString("id-ID")}`,
    totalLayanan: updatedAndi.totalLayanan,
  });
  console.log("Statistik Budi Setelah Transaksi Andi:", {
    totalTransaksi: updatedBudi.totalTransaksi,
    totalPendapatan: `Rp${updatedBudi.totalPendapatan.toLocaleString("id-ID")}`,
    totalLayanan: updatedBudi.totalLayanan,
  });

  if (updatedAndi.totalTransaksi !== metricsAndi.totalTransaksi + 1) {
    console.error("❌ GAGAL: Total Transaksi Andi tidak bertambah!");
    process.exit(1);
  }
  if (updatedAndi.totalLayanan !== metricsAndi.totalLayanan + 2) {
    console.error("❌ GAGAL: Total Layanan Andi tidak bertambah 2!");
    process.exit(1);
  }
  if (updatedBudi.totalTransaksi !== metricsBudi.totalTransaksi) {
    console.error(
      "❌ GAGAL: Statistik Budi ikut berubah akibat transaksi Andi!",
    );
    process.exit(1);
  }
  if (updatedBudi.totalPendapatan !== metricsBudi.totalPendapatan) {
    console.error(
      "❌ GAGAL: Pendapatan Budi ikut berubah akibat transaksi Andi!",
    );
    process.exit(1);
  }

  console.log(
    "✅ SUKSES: Transaksi Andi berhasil ditambahkan hanya ke Andi! Statistik Budi tetap 100% aman dan tidak terpengaruh!",
  );

  // TEST 5: Validasi transaksi cancelled/refunded tidak masuk pendapatan
  console.log(
    "\n▶ TEST 5: Menguji bahwa transaksi cancelled tidak dihitung sebagai pendapatan...",
  );
  const [cancelledBooking] = await sql`
    INSERT INTO booking (id_pelanggan, id_barbershop, id_capster, tanggal_booking, waktu_booking, status)
    VALUES (${cust.id_pelanggan}, ${shop.id_barbershop}, ${andiId}, NOW(), '08:45', 'cancelled')
    RETURNING id_booking
  `;
  await sql`
    INSERT INTO detail_booking (id_booking, id_layanan, harga_satuan, qty, subtotal)
    VALUES (${cancelledBooking.id_booking}, ${srv.id_layanan}, ${srv.harga}, 1, ${srv.harga})
  `;
  await sql`
    INSERT INTO transaksi (id_booking, id_shift, id_pelanggan, subtotal, diskon, total, status_transaksi)
    VALUES (${cancelledBooking.id_booking}, ${shiftAndi.id_shift}, ${cust.id_pelanggan}, ${srv.harga}, 0, ${srv.harga}, 'cancelled')
    RETURNING id_transaksi
  `;

  const cancelledTestMetrics = await getMetrics(andiId);
  console.log("Statistik Andi Setelah Transaksi Cancelled:", {
    totalTransaksi: cancelledTestMetrics.totalTransaksi,
    totalPendapatan: `Rp${cancelledTestMetrics.totalPendapatan.toLocaleString("id-ID")}`,
    dibatalkan: cancelledTestMetrics.statusLayanan.dibatalkan,
  });

  if (cancelledTestMetrics.totalPendapatan !== updatedAndi.totalPendapatan) {
    console.error(
      "❌ GAGAL: Transaksi cancelled masuk ke pendapatan!",
      cancelledTestMetrics.totalPendapatan,
      updatedAndi.totalPendapatan,
    );
    process.exit(1);
  }
  if (cancelledTestMetrics.statusLayanan.dibatalkan !== updatedAndi.statusLayanan.dibatalkan + 1) {
    console.error("❌ GAGAL: Status dibatalkan tidak tercatat!");
    process.exit(1);
  }
  console.log(
    "✅ SUKSES: Transaksi cancelled tidak dihitung sebagai pendapatan!",
  );

  console.log("\n🎉 SEMUA PENGUJIAN DATABASE & LOGIKA STATISTIK BERHASIL!");
  await sql.end();
}

runVerification().catch(console.error);
