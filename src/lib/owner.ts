import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  alasanPembatalan,
  barbershop,
  booking,
  capster,
  detailBooking,
  layanan,
  pelanggan,
  pembayaran,
  pembatalan,
  shiftCapster,
  struk,
  transaksi,
  users,
} from "@/db/schema";
import { formatTransactionId } from "@/lib/format";

export type OwnerPeriodFilter = "today" | "7d" | "30d" | "month" | "custom";

export type RevenueChartPoint = {
  date: string;
  rawDate: string;
  revenue: number;
  count: number;
};

export type PaymentMethodSummary = {
  method: "tunai" | "qris" | "transfer";
  label: string;
  count: number;
  percentage: number;
  color: string;
};

export type OwnerRecentTransaction = {
  id: string;
  shortId: string;
  customerName: string;
  serviceNames: string;
  capsterName: string;
  capsterId: string | null;
  amount: number;
  paymentMethod: "tunai" | "qris" | "transfer";
  paymentMethodLabel: string;
  status: "Selesai" | "Diproses" | "Menunggu" | "Batal";
  time: string;
  date: string;
  dateTime: string;
  notes?: string;
};

export type OwnerCapsterPerformance = {
  capsterId: string;
  name: string;
  noPegawai: string;
  avatarLetter: string;
  totalTransactions: number;
  totalServices: number;
  totalRevenue: number;
  commissionPercentage: number;
  commissionAmount: number;
};

export type OwnerRecentCancellation = {
  id: string;
  transactionId: string;
  shortId: string;
  serviceNames: string;
  capsterName: string;
  cancelledBy: string;
  reason: string;
  time: string;
  date: string;
  status: "Dibatalkan";
};

export type OwnerDashboardMetrics = {
  totalRevenue: number;
  totalRevenueDeltaText: string;
  revenueDeltaPercent: number;
  isRevenueUp: boolean;

  totalTransactions: number;
  totalTransactionsDeltaText: string;
  transactionsDeltaPercent: number;
  isTransactionsUp: boolean;

  activeCapstersCount: number;
  totalCapstersCount: number;
  activeCapstersText: string;

  cancellationsCount: number;
  cancellationsText: string;

  chartData: RevenueChartPoint[];
  paymentMethods: PaymentMethodSummary[];
  totalPaymentTransactions: number;

  recentTransactions: OwnerRecentTransaction[];
  capsterPerformance: OwnerCapsterPerformance[];
  recentCancellations: OwnerRecentCancellation[];

  periodLabel: string;
  dateRangeText: string;
};

function getPeriodDates(
  period: OwnerPeriodFilter,
  customStart?: string,
  customEnd?: string,
) {
  const now = new Date();
  const jakartaTodayStr = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });

  let startDate: Date;
  let endDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;
  let deltaLabel = "dari hari sebelumnya";

  if (period === "today") {
    startDate = new Date(`${jakartaTodayStr}T00:00:00+07:00`);
    endDate = new Date(`${jakartaTodayStr}T23:59:59.999+07:00`);

    const yesterday = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });
    prevStartDate = new Date(`${yesterdayStr}T00:00:00+07:00`);
    prevEndDate = new Date(`${yesterdayStr}T23:59:59.999+07:00`);
    deltaLabel = "dari hari sebelumnya";
  } else if (period === "7d") {
    endDate = new Date(`${jakartaTodayStr}T23:59:59.999+07:00`);
    startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000 + 1);

    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getTime() - 7 * 24 * 60 * 60 * 1000 + 1);
    deltaLabel = "dari 7 hari sebelumnya";
  } else if (period === "30d") {
    endDate = new Date(`${jakartaTodayStr}T23:59:59.999+07:00`);
    startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000 + 1);

    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getTime() - 30 * 24 * 60 * 60 * 1000 + 1);
    deltaLabel = "dari 30 hari sebelumnya";
  } else if (period === "month") {
    const [y, m] = jakartaTodayStr.split("-").map(Number);
    startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    prevStartDate = new Date(Date.UTC(y, m - 2, 1, 0, 0, 0));
    prevEndDate = new Date(Date.UTC(y, m - 1, 0, 23, 59, 59, 999));
    deltaLabel = "dari bulan sebelumnya";
  } else {
    // Custom
    if (customStart && customEnd) {
      startDate = new Date(`${customStart}T00:00:00+07:00`);
      endDate = new Date(`${customEnd}T23:59:59.999+07:00`);
      const diff = endDate.getTime() - startDate.getTime();
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(prevEndDate.getTime() - diff);
    } else {
      startDate = new Date(`${jakartaTodayStr}T00:00:00+07:00`);
      endDate = new Date(`${jakartaTodayStr}T23:59:59.999+07:00`);
      prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      prevEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    }
    deltaLabel = "dari periode sebelumnya";
  }

  return { startDate, endDate, prevStartDate, prevEndDate, deltaLabel };
}

function calculateDelta(current: number, previous: number, label: string) {
  if (previous === 0) {
    if (current > 0) {
      return {
        percent: 100,
        isUp: true,
        text: `↑ 100% ${label}`,
      };
    }
    return {
      percent: 0,
      isUp: true,
      text: `0% ${label}`,
    };
  }

  const diff = current - previous;
  const percent = Math.round((diff / previous) * 100);
  const isUp = percent >= 0;
  const sign = isUp ? "↑" : "↓";
  return {
    percent: Math.abs(percent),
    isUp,
    text: `${sign} ${Math.abs(percent)}% ${label}`,
  };
}

export const getOwnerDashboardMetrics = createServerFn({
  method: "GET",
})
  .validator(
    (
      data:
        | {
            period?: OwnerPeriodFilter;
            startDate?: string;
            endDate?: string;
          }
        | undefined,
    ) => data,
  )
  .handler(async ({ data }): Promise<OwnerDashboardMetrics> => {
    const now = new Date();
    const period = data?.period || "today";
    const { startDate, endDate, prevStartDate, prevEndDate, deltaLabel } =
      getPeriodDates(period, data?.startDate, data?.endDate);

    // 1. Ambil transaksi pada periode sekarang & periode lalu
    const [currentTxs, prevTxs, allCapsters, activeShifts, cancellations] =
      await Promise.all([
        // Transaksi periode aktif
        db
          .select({
            id_transaksi: transaksi.id_transaksi,
            id_booking: transaksi.id_booking,
            id_shift: transaksi.id_shift,
            id_pelanggan: transaksi.id_pelanggan,
            subtotal: transaksi.subtotal,
            diskon: transaksi.diskon,
            total: transaksi.total,
            status_transaksi: transaksi.status_transaksi,
            created_at: transaksi.created_at,
          })
          .from(transaksi)
          .where(
            and(
              gte(transaksi.created_at, startDate),
              lte(transaksi.created_at, endDate),
            ),
          )
          .orderBy(desc(transaksi.created_at)),

        // Transaksi periode sebelumnya untuk perbandingan delta
        db
          .select({
            id_transaksi: transaksi.id_transaksi,
            total: transaksi.total,
            status_transaksi: transaksi.status_transaksi,
          })
          .from(transaksi)
          .where(
            and(
              gte(transaksi.created_at, prevStartDate),
              lte(transaksi.created_at, prevEndDate),
            ),
          ),

        // Semua capster yang aktif di barbershop
        db
          .select({
            id_capster: capster.id_capster,
            id_user: capster.id_user,
            no_pegawai: capster.no_pegawai,
            nama_lengkap: users.nama_lengkap,
            status: capster.status,
          })
          .from(capster)
          .innerJoin(users, eq(capster.id_user, users.id_user))
          .where(eq(capster.status, "active")),

        // Shift yang sedang ONGOING
        db
          .select({
            id_shift: shiftCapster.id_shift,
            id_capster: shiftCapster.id_capster,
            status: shiftCapster.status,
          })
          .from(shiftCapster)
          .where(eq(shiftCapster.status, "ongoing")),

        // Data Pembatalan pada periode
        db
          .select({
            id_pembatalan: pembatalan.id_pembatalan,
            id_transaksi: pembatalan.id_transaksi,
            dibatalkan_oleh: pembatalan.dibatalkan_oleh,
            waktu_pembatalan: pembatalan.waktu_pembatalan,
            catatan: pembatalan.catatan,
            alasan_text: alasanPembatalan.alasan,
          })
          .from(pembatalan)
          .leftJoin(
            alasanPembatalan,
            eq(pembatalan.id_alasan, alasanPembatalan.id_alasan),
          )
          .where(
            and(
              gte(pembatalan.waktu_pembatalan, startDate),
              lte(pembatalan.waktu_pembatalan, endDate),
            ),
          )
          .orderBy(desc(pembatalan.waktu_pembatalan)),
      ]);

    // 2. Kalkulasi Ringkasan Pendapatan & Transaksi
    // Total Pendapatan HANYA dari transaksi yang statusnya 'paid'
    const validCurrentPaidTxs = currentTxs.filter(
      (t) => t.status_transaksi === "paid",
    );
    const validPrevPaidTxs = prevTxs.filter((t) => t.status_transaksi === "paid");

    const currentRevenue = validCurrentPaidTxs.reduce(
      (sum, t) => sum + Number(t.total || 0),
      0,
    );
    const prevRevenue = validPrevPaidTxs.reduce(
      (sum, t) => sum + Number(t.total || 0),
      0,
    );

    const revenueDelta = calculateDelta(currentRevenue, prevRevenue, deltaLabel);

    // Total Transaksi (semua transaksi valid/tercatat di periode ini)
    const currentTxCount = currentTxs.length;
    const prevTxCount = prevTxs.length;
    const txDelta = calculateDelta(currentTxCount, prevTxCount, deltaLabel);

    // Capster Aktif (yang memiliki shift status 'ongoing')
    const activeCapsterIds = new Set(activeShifts.map((s) => s.id_capster));
    const activeCapstersCount = activeCapsterIds.size;
    const totalCapstersCount = allCapsters.length;
    const activeCapstersText = `dari total ${totalCapstersCount} capster`;

    // Pembatalan
    // Hitung dari tabel pembatalan atau transaksi cancelled
    const cancelledTxIds = new Set(
      currentTxs
        .filter((t) => t.status_transaksi === "cancelled")
        .map((t) => t.id_transaksi),
    );
    cancellations.forEach((c) => cancelledTxIds.add(c.id_transaksi));
    const cancellationsCount = cancelledTxIds.size;
    const cancellationsText = "transaksi dibatalkan";

    // 3. Data Pendapatan untuk Grafik (7 Hari Terakhir atau sesuai rentang)
    // Buat rentang 7 hari terakhir mundur dari endDate
    const chartDays = 7;
    const chartData: RevenueChartPoint[] = [];
    const dayMap = new Map<string, { revenue: number; count: number }>();

    // Siapkan bucket untuk 7 hari terakhir
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const isoDate = d.toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
      });
      const dayName = d.toLocaleDateString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "short",
      });
      dayMap.set(isoDate, { revenue: 0, count: 0 });
      chartData.push({
        date: dayName,
        rawDate: isoDate,
        revenue: 0,
        count: 0,
      });
    }

    // Ambil transaksi 7 hari terakhir untuk grafik
    const chartStartDate = new Date(
      endDate.getTime() - chartDays * 24 * 60 * 60 * 1000 + 1,
    );
    const chartTxs = await db
      .select({
        total: transaksi.total,
        status_transaksi: transaksi.status_transaksi,
        created_at: transaksi.created_at,
      })
      .from(transaksi)
      .where(
        and(
          gte(transaksi.created_at, chartStartDate),
          lte(transaksi.created_at, endDate),
          eq(transaksi.status_transaksi, "paid"),
        ),
      );

    for (const tx of chartTxs) {
      const txDateStr = tx.created_at.toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
      });
      const existing = dayMap.get(txDateStr);
      if (existing) {
        existing.revenue += Number(tx.total || 0);
        existing.count += 1;
      }
    }

    chartData.forEach((point) => {
      const val = dayMap.get(point.rawDate);
      if (val) {
        point.revenue = val.revenue;
        point.count = val.count;
      }
    });

    // 4. Metode Pembayaran
    // Query metode pembayaran dari transaksi periode sekarang yang paid
    const currentTxIds = currentTxs.map((t) => t.id_transaksi);
    let paymentRows: { metode_pembayaran: string; count: number; total: number }[] =
      [];

    if (currentTxIds.length > 0) {
      const payments = await db
        .select({
          metode_pembayaran: pembayaran.metode_pembayaran,
          id_transaksi: pembayaran.id_transaksi,
          jumlah_bayar: pembayaran.jumlah_bayar,
        })
        .from(pembayaran)
        .where(inArray(pembayaran.id_transaksi, currentTxIds));

      const methodCounts = {
        tunai: 0,
        qris: 0,
        transfer: 0,
      };
      payments.forEach((p) => {
        const m = p.metode_pembayaran as "tunai" | "qris" | "transfer";
        if (methodCounts[m] !== undefined) {
          methodCounts[m] += 1;
        }
      });

      const totalPaidMethods =
        methodCounts.tunai + methodCounts.qris + methodCounts.transfer || 1;

      paymentRows = [
        {
          metode_pembayaran: "tunai",
          count: methodCounts.tunai,
          total: methodCounts.tunai,
        },
        {
          metode_pembayaran: "qris",
          count: methodCounts.qris,
          total: methodCounts.qris,
        },
        {
          metode_pembayaran: "transfer",
          count: methodCounts.transfer,
          total: methodCounts.transfer,
        },
      ];
    } else {
      paymentRows = [
        { metode_pembayaran: "tunai", count: 0, total: 0 },
        { metode_pembayaran: "qris", count: 0, total: 0 },
        { metode_pembayaran: "transfer", count: 0, total: 0 },
      ];
    }

    const totalValidPaymentCount = paymentRows.reduce(
      (sum, p) => sum + p.count,
      0,
    );

    const paymentMethods: PaymentMethodSummary[] = [
      {
        method: "tunai",
        label: "Tunai",
        count: paymentRows.find((p) => p.metode_pembayaran === "tunai")?.count || 0,
        percentage:
          totalValidPaymentCount > 0
            ? Math.round(
                ((paymentRows.find((p) => p.metode_pembayaran === "tunai")
                  ?.count || 0) /
                  totalValidPaymentCount) *
                  100,
              )
            : 0,
        color: "#10B981", // Green
      },
      {
        method: "qris",
        label: "QRIS",
        count: paymentRows.find((p) => p.metode_pembayaran === "qris")?.count || 0,
        percentage:
          totalValidPaymentCount > 0
            ? Math.round(
                ((paymentRows.find((p) => p.metode_pembayaran === "qris")
                  ?.count || 0) /
                  totalValidPaymentCount) *
                  100,
              )
            : 0,
        color: "#3B82F6", // Blue
      },
      {
        method: "transfer",
        label: "Transfer Antar Bank",
        count:
          paymentRows.find((p) => p.metode_pembayaran === "transfer")?.count || 0,
        percentage:
          totalValidPaymentCount > 0
            ? Math.round(
                ((paymentRows.find((p) => p.metode_pembayaran === "transfer")
                  ?.count || 0) /
                  totalValidPaymentCount) *
                  100,
              )
            : 0,
        color: "#8B5CF6", // Purple
      },
    ];

    // 5. Transaksi Terbaru (Latest 10)
    // Ambil detail lengkap untuk 10 transaksi teratas
    const recentTxRows = await db
      .select({
        id_transaksi: transaksi.id_transaksi,
        id_booking: transaksi.id_booking,
        id_shift: transaksi.id_shift,
        id_pelanggan: transaksi.id_pelanggan,
        subtotal: transaksi.subtotal,
        diskon: transaksi.diskon,
        total: transaksi.total,
        status_transaksi: transaksi.status_transaksi,
        created_at: transaksi.created_at,
        customerName: users.nama_lengkap,
        customerPhone: users.no_hp,
      })
      .from(transaksi)
      .innerJoin(pelanggan, eq(transaksi.id_pelanggan, pelanggan.id_pelanggan))
      .innerJoin(users, eq(pelanggan.id_user, users.id_user))
      .orderBy(desc(transaksi.created_at))
      .limit(10);

    const recentTxIds = recentTxRows.map((r) => r.id_transaksi);
    const recentBookingIds = recentTxRows
      .map((r) => r.id_booking)
      .filter((b): b is string => Boolean(b));
    const recentShiftIds = recentTxRows.map((r) => r.id_shift);

    const [recentBookings, recentDetails, recentPayments, recentShifts] =
      await Promise.all([
        recentBookingIds.length > 0
          ? db
              .select({
                id_booking: booking.id_booking,
                id_capster: booking.id_capster,
                catatan: booking.catatan,
                capsterName: users.nama_lengkap,
              })
              .from(booking)
              .leftJoin(capster, eq(booking.id_capster, capster.id_capster))
              .leftJoin(users, eq(capster.id_user, users.id_user))
              .where(inArray(booking.id_booking, recentBookingIds))
          : Promise.resolve([]),

        recentBookingIds.length > 0
          ? db
              .select({
                id_booking: detailBooking.id_booking,
                nama_layanan: layanan.nama_layanan,
                harga_satuan: detailBooking.harga_satuan,
                qty: detailBooking.qty,
              })
              .from(detailBooking)
              .innerJoin(layanan, eq(detailBooking.id_layanan, layanan.id_layanan))
              .where(inArray(detailBooking.id_booking, recentBookingIds))
          : Promise.resolve([]),

        recentTxIds.length > 0
          ? db
              .select({
                id_transaksi: pembayaran.id_transaksi,
                metode_pembayaran: pembayaran.metode_pembayaran,
                status_pembayaran: pembayaran.status_pembayaran,
                jumlah_bayar: pembayaran.jumlah_bayar,
              })
              .from(pembayaran)
              .where(inArray(pembayaran.id_transaksi, recentTxIds))
          : Promise.resolve([]),

        recentShiftIds.length > 0
          ? db
              .select({
                id_shift: shiftCapster.id_shift,
                id_capster: shiftCapster.id_capster,
                capsterName: users.nama_lengkap,
              })
              .from(shiftCapster)
              .innerJoin(capster, eq(shiftCapster.id_capster, capster.id_capster))
              .innerJoin(users, eq(capster.id_user, users.id_user))
              .where(inArray(shiftCapster.id_shift, recentShiftIds))
          : Promise.resolve([]),
      ]);

    const recentTransactions: OwnerRecentTransaction[] = recentTxRows.map(
      (tx) => {
        const bInfo = recentBookings.find((b) => b.id_booking === tx.id_booking);
        const shiftInfo = recentShifts.find((s) => s.id_shift === tx.id_shift);
        const pay = recentPayments.find(
          (p) => p.id_transaksi === tx.id_transaksi,
        );
        const details = recentDetails.filter(
          (d) => d.id_booking === tx.id_booking,
        );

        const capsterName =
          bInfo?.capsterName || shiftInfo?.capsterName || "Capster";
        const capsterId = bInfo?.id_capster || shiftInfo?.id_capster || null;

        const serviceNames =
          details.length > 0
            ? details.map((d) => d.nama_layanan).join(", ")
            : "Layanan Barbershop";

        let status: "Selesai" | "Diproses" | "Menunggu" | "Batal" = "Selesai";
        if (tx.status_transaksi === "cancelled") {
          status = "Batal";
        } else if (tx.status_transaksi === "pending") {
          status = "Menunggu";
        } else if (tx.status_transaksi === "paid") {
          status = "Selesai";
        }

        const method = (pay?.metode_pembayaran || "tunai") as
          | "tunai"
          | "qris"
          | "transfer";
        const methodLabels: Record<string, string> = {
          tunai: "Tunai",
          qris: "QRIS",
          transfer: "Transfer",
        };

        const dateStr = tx.created_at.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        const timeStr = tx.created_at.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          id: tx.id_transaksi,
          shortId: formatTransactionId(tx.id_transaksi, tx.created_at),
          customerName: tx.customerName,
          serviceNames,
          capsterName,
          capsterId,
          amount: Number(tx.total),
          paymentMethod: method,
          paymentMethodLabel: methodLabels[method] || "Tunai",
          status,
          time: timeStr,
          date: dateStr,
          dateTime: `${dateStr} ${timeStr}`,
          notes: bInfo?.catatan || undefined,
        };
      },
    );

    // 6. Performa Capster (Strictly separated per capster!)
    // Ambil semua transaksi pada rentang yang terikat pada capster
    const capsterStatsMap = new Map<
      string,
      {
        totalTransactions: number;
        totalServices: number;
        totalRevenue: number;
      }
    >();

    allCapsters.forEach((c) => {
      capsterStatsMap.set(c.id_capster, {
        totalTransactions: 0,
        totalServices: 0,
        totalRevenue: 0,
      });
    });

    // Ambil transaksi capster melalui shift_capster dan booking
    const txCapsterRows = await db
      .select({
        id_transaksi: transaksi.id_transaksi,
        id_booking: transaksi.id_booking,
        total: transaksi.total,
        status_transaksi: transaksi.status_transaksi,
        bookingCapsterId: booking.id_capster,
        shiftCapsterId: shiftCapster.id_capster,
      })
      .from(transaksi)
      .leftJoin(booking, eq(transaksi.id_booking, booking.id_booking))
      .leftJoin(shiftCapster, eq(transaksi.id_shift, shiftCapster.id_shift))
      .where(
        and(
          gte(transaksi.created_at, startDate),
          lte(transaksi.created_at, endDate),
          eq(transaksi.status_transaksi, "paid"),
        ),
      );

    for (const r of txCapsterRows) {
      // Prioritas capster booking, jika null fallback ke shift capster
      const cId = r.bookingCapsterId || r.shiftCapsterId;
      if (cId && capsterStatsMap.has(cId)) {
        const stat = capsterStatsMap.get(cId)!;
        stat.totalTransactions += 1;
        stat.totalServices += 1; // 1 transaksi = minimal 1 layanan
        stat.totalRevenue += Number(r.total || 0);
      }
    }

    const defaultCommissionPercent = 15; // 15% sesuai wireframe

    const capsterPerformance: OwnerCapsterPerformance[] = allCapsters.map(
      (c) => {
        const stat = capsterStatsMap.get(c.id_capster) || {
          totalTransactions: 0,
          totalServices: 0,
          totalRevenue: 0,
        };
        const commissionAmount = Math.round(
          stat.totalRevenue * (defaultCommissionPercent / 100),
        );
        return {
          capsterId: c.id_capster,
          name: c.nama_lengkap,
          noPegawai: c.no_pegawai || "-",
          avatarLetter: (c.nama_lengkap[0] || "C").toUpperCase(),
          totalTransactions: stat.totalTransactions,
          totalServices: stat.totalServices,
          totalRevenue: stat.totalRevenue,
          commissionPercentage: defaultCommissionPercent,
          commissionAmount,
        };
      },
    );

    // Urutkan performa capster berdasarkan total transaksi tertinggi
    capsterPerformance.sort((a, b) => b.totalTransactions - a.totalTransactions);

    // 7. Pembatalan Terbaru (Latest 5-10)
    const recentCancelRows = await db
      .select({
        id_pembatalan: pembatalan.id_pembatalan,
        id_transaksi: pembatalan.id_transaksi,
        dibatalkan_oleh: pembatalan.dibatalkan_oleh,
        waktu_pembatalan: pembatalan.waktu_pembatalan,
        catatan: pembatalan.catatan,
        alasan_text: alasanPembatalan.alasan,
        bookingCapsterId: booking.id_capster,
        shiftCapsterId: shiftCapster.id_capster,
        bookingNotes: booking.catatan,
      })
      .from(pembatalan)
      .leftJoin(
        alasanPembatalan,
        eq(pembatalan.id_alasan, alasanPembatalan.id_alasan),
      )
      .leftJoin(transaksi, eq(pembatalan.id_transaksi, transaksi.id_transaksi))
      .leftJoin(booking, eq(transaksi.id_booking, booking.id_booking))
      .leftJoin(shiftCapster, eq(transaksi.id_shift, shiftCapster.id_shift))
      .orderBy(desc(pembatalan.waktu_pembatalan))
      .limit(10);

    const capsterUserMap = new Map<string, string>();
    allCapsters.forEach((c) => capsterUserMap.set(c.id_capster, c.nama_lengkap));

    const recentCancellations: OwnerRecentCancellation[] = recentCancelRows.map(
      (c) => {
        const cId = c.bookingCapsterId || c.shiftCapsterId;
        const capsterName = cId ? capsterUserMap.get(cId) || "Capster" : "Capster";
        const dateStr = c.waktu_pembatalan.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        const timeStr = c.waktu_pembatalan.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          id: c.id_pembatalan,
          transactionId: c.id_transaksi,
          shortId: formatTransactionId(c.id_transaksi, c.waktu_pembatalan),
          serviceNames: "Layanan Barbershop",
          capsterName,
          cancelledBy: c.dibatalkan_oleh === "pelanggan" ? "Pelanggan" : "Capster",
          reason: c.alasan_text || c.catatan || "Permintaan pembatalan",
          time: timeStr,
          date: dateStr,
          status: "Dibatalkan",
        };
      },
    );

    const periodLabels: Record<OwnerPeriodFilter, string> = {
      today: "Hari ini",
      "7d": "7 Hari Terakhir",
      "30d": "30 Hari Terakhir",
      month: "Bulan Ini",
      custom: "Kustom",
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const dateRangeText = now.toLocaleDateString("id-ID", dateOptions);

    return {
      totalRevenue: currentRevenue,
      totalRevenueDeltaText: revenueDelta.text,
      revenueDeltaPercent: revenueDelta.percent,
      isRevenueUp: revenueDelta.isUp,

      totalTransactions: currentTxCount,
      totalTransactionsDeltaText: txDelta.text,
      transactionsDeltaPercent: txDelta.percent,
      isTransactionsUp: txDelta.isUp,

      activeCapstersCount,
      totalCapstersCount,
      activeCapstersText,

      cancellationsCount,
      cancellationsText,

      chartData,
      paymentMethods,
      totalPaymentTransactions: totalValidPaymentCount,

      recentTransactions,
      capsterPerformance,
      recentCancellations,

      periodLabel: periodLabels[period],
      dateRangeText,
    };
  });

export const loginOwner = createServerFn({
  method: "POST",
})
  .validator((data: { email: string; password?: string }) => data)
  .handler(async ({ data }) => {
    const email = (data.email || "").trim().toLowerCase();
    const password = data.password || "";

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

    const [user] = await db
      .select({
        id_user: users.id_user,
        email: users.email,
        nama_lengkap: users.nama_lengkap,
        role: users.role,
        status: users.status,
        password: users.password,
      })
      .from(users)
      .where(and(eq(users.email, email), eq(users.role, "owner")))
      .limit(1);

    if (!user) {
      throw new Error("Akun Owner tidak ditemukan.");
    }

    if (user.status !== "active") {
      throw new Error("Akun Owner Anda sedang nonaktif.");
    }

    if (user.password && user.password !== password) {
      throw new Error("Password yang Anda masukkan salah.");
    }

    // Ambil barbershop default
    const [shop] = await db
      .select({
        id_barbershop: barbershop.id_barbershop,
        nama_barbershop: barbershop.nama_barbershop,
        alamat: barbershop.alamat,
      })
      .from(barbershop)
      .limit(1);

    return {
      id_user: user.id_user,
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      barbershop: shop || {
        id_barbershop: "default",
        nama_barbershop: "BARBERIN Barbershop",
        alamat: "Jl. Jenderal Soedirman",
      },
    };
  });
