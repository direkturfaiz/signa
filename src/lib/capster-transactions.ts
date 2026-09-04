import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  barbershop,
  booking,
  capster,
  detailBooking,
  layanan,
  pelanggan,
  pembayaran,
  shiftCapster,
  struk,
  transaksi,
  users,
} from "@/db/schema";

type CreateManualTransactionInput = {
  customerName: string;
  customerPhone?: string;
  notes?: string;
  capsterId: string;
  serviceIds: string[];
  paymentMethod: "tunai" | "qris" | "transfer";
  cashReceived?: number;
};

function generateStrukNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `STR-${ymd}-${rand}`;
}

export const getCapsterTransactions = createServerFn({
  method: "GET",
})
  .validator(
    (
      data:
        | {
            capsterId?: string;
            todayOnly?: boolean;
          }
        | undefined,
    ) => data,
  )
  .handler(async ({ data }) => {
    let query = db
      .select({
        id: transaksi.id_transaksi,
        id_booking: transaksi.id_booking,
        id_shift: transaksi.id_shift,
        id_pelanggan: transaksi.id_pelanggan,
        subtotal: transaksi.subtotal,
        discount: transaksi.diskon,
        total: transaksi.total,
        status_transaksi: transaksi.status_transaksi,
        created_at: transaksi.created_at,
        customerName: users.nama_lengkap,
        customerPhone: users.no_hp,
      })
      .from(transaksi)
      .innerJoin(pelanggan, eq(transaksi.id_pelanggan, pelanggan.id_pelanggan))
      .innerJoin(users, eq(pelanggan.id_user, users.id_user))
      .orderBy(desc(transaksi.created_at));

    const rows = await query;
    const results = [];

    for (const r of rows) {
      if (data?.todayOnly) {
        const today = new Date();
        const txDate = new Date(r.created_at);
        if (
          txDate.getDate() !== today.getDate() ||
          txDate.getMonth() !== today.getMonth() ||
          txDate.getFullYear() !== today.getFullYear()
        ) {
          continue;
        }
      }

      let capsterName = "Capster";
      let capsterId = "";
      if (r.id_booking) {
        const b = await db
          .select({ id_capster: booking.id_capster })
          .from(booking)
          .where(eq(booking.id_booking, r.id_booking))
          .limit(1);

        if (b[0]?.id_capster) {
          capsterId = b[0].id_capster;
          const c = await db
            .select({ name: users.nama_lengkap })
            .from(capster)
            .innerJoin(users, eq(capster.id_user, users.id_user))
            .where(eq(capster.id_capster, b[0].id_capster))
            .limit(1);
          if (c[0]) capsterName = c[0].name;
        }
      }

      const items: {
        service: {
          id: string;
          name: string;
          price: number;
          category: string;
        };
        quantity: number;
      }[] = [];

      if (r.id_booking) {
        const details = await db
          .select({
            id_layanan: detailBooking.id_layanan,
            nama_layanan: layanan.nama_layanan,
            harga_satuan: detailBooking.harga_satuan,
            qty: detailBooking.qty,
          })
          .from(detailBooking)
          .innerJoin(layanan, eq(detailBooking.id_layanan, layanan.id_layanan))
          .where(eq(detailBooking.id_booking, r.id_booking));

        details.forEach((d) => {
          items.push({
            service: {
              id: d.id_layanan,
              name: d.nama_layanan,
              price: Number(d.harga_satuan),
              category: "Barbershop",
            },
            quantity: d.qty,
          });
        });
      }

      const serviceNames =
        items.length > 0
          ? items.map((i) => i.service.name).join(" + ")
          : "Layanan Barbershop";

      const [pay] = await db
        .select()
        .from(pembayaran)
        .where(eq(pembayaran.id_transaksi, r.id))
        .limit(1);

      const cashReceived = pay?.referensi?.startsWith("Tunai: ")
        ? Number(pay.referensi.replace("Tunai: ", ""))
        : Number(r.total);

      const change = Math.max(0, cashReceived - Number(r.total));

      let displayStatus: "Selesai" | "Menunggu" | "Batal" = "Menunggu";
      if (r.status_transaksi === "paid") {
        displayStatus = "Selesai";
      } else if (r.status_transaksi === "cancelled") {
        displayStatus = "Batal";
      }

      results.push({
        id: r.id,
        date: r.created_at.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        time: r.created_at.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        customerName: r.customerName,
        customerPhone: r.customerPhone ?? undefined,
        items,
        serviceNames,
        subtotal: Number(r.subtotal),
        discount: Number(r.discount),
        total: Number(r.total),
        paymentMethod: (pay?.metode_pembayaran ?? "tunai") as
          | "tunai"
          | "qris"
          | "transfer",
        cashReceived,
        change,
        status: displayStatus,
        capsterId,
        capsterName,
      });
    }

    return results;
  });

export const getDashboardMetrics = createServerFn({
  method: "GET",
})
  .validator(
    (
      data:
        | {
            capsterId?: string;
            userId?: string;
          }
        | undefined,
    ) => data,
  )
  .handler(async ({ data }) => {
    let targetCapsterId = data?.capsterId;

    if (!targetCapsterId && data?.userId) {
      const [c] = await db
        .select({ id_capster: capster.id_capster })
        .from(capster)
        .where(eq(capster.id_user, data.userId))
        .limit(1);
      if (c) targetCapsterId = c.id_capster;
    }

    // Jika tidak ada capster yang teridentifikasi, kembalikan data kosong (0)
    // agar tidak menampilkan data global seluruh barbershop ataupun capster lain
    if (!targetCapsterId) {
      return {
        totalTransaksi: 0,
        deltaTransaksi: "Hari ini",
        totalPendapatan: 0,
        deltaPendapatan: "Hari ini",
        totalLayanan: 0,
        deltaLayanan: "Hari ini",
        capsterAktif: 0,
        deltaCapster: "Aktif",
        statusLayanan: {
          selesai: 0,
          sedangDikerjakan: 0,
          menunggu: 0,
          dibatalkan: 0,
        },
        ringkasanHariIni: {
          totalPendapatan: 0,
          totalTransaksi: 0,
          totalLayanan: 0,
          selesai: 0,
          belumSelesai: 0,
        },
      };
    }

    // Hitung rentang hari ini (WIB / Asia/Jakarta)
    const now = new Date();
    const jakartaDateStr = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });
    const startOfToday = new Date(`${jakartaDateStr}T00:00:00+07:00`);
    const endOfToday = new Date(`${jakartaDateStr}T23:59:59.999+07:00`);

    // Sesuai ERD: CAPSTER -> SHIFT CAPSTER -> TRANSAKSI
    const txs = await db
      .select({
        id_transaksi: transaksi.id_transaksi,
        id_booking: transaksi.id_booking,
        total: transaksi.total,
        status_transaksi: transaksi.status_transaksi,
        created_at: transaksi.created_at,
      })
      .from(transaksi)
      .innerJoin(shiftCapster, eq(transaksi.id_shift, shiftCapster.id_shift))
      .where(
        and(
          eq(shiftCapster.id_capster, targetCapsterId),
          gte(transaksi.created_at, startOfToday),
          lte(transaksi.created_at, endOfToday),
        ),
      );

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

      // Quantity detail layanan hanya dihitung untuk transaksi non-cancelled
      if (
        t.id_booking &&
        t.status_transaksi !== "cancelled" &&
        t.status_transaksi !== "refunded"
      ) {
        const dbRows = await db
          .select({ qty: detailBooking.qty })
          .from(detailBooking)
          .where(eq(detailBooking.id_booking, t.id_booking));
        totalLayanan += dbRows.reduce((s, d) => s + (d.qty || 1), 0);
      }
    }

    // Capster aktif: jumlah capster yang sedang check-in / memiliki shift "ongoing" pada hari ini
    const activeCapsters = await db
      .select({ count: sql<number>`count(distinct ${shiftCapster.id_capster})` })
      .from(shiftCapster)
      .where(
        and(
          eq(shiftCapster.status, "ongoing"),
          gte(shiftCapster.tanggal, startOfToday),
          lte(shiftCapster.tanggal, endOfToday),
        ),
      );

    const capsterAktif = Number(activeCapsters[0]?.count ?? 0);

    return {
      totalTransaksi,
      deltaTransaksi: `Hari ini`,
      totalPendapatan,
      deltaPendapatan: `Hari ini`,
      totalLayanan,
      deltaLayanan: `Hari ini`,
      capsterAktif,
      deltaCapster: `Aktif`,
      statusLayanan: {
        selesai,
        sedangDikerjakan: 0,
        menunggu,
        dibatalkan,
      },
      ringkasanHariIni: {
        totalPendapatan,
        totalTransaksi,
        totalLayanan,
        selesai,
        belumSelesai: menunggu,
      },
    };
  });

export const createManualTransaction = createServerFn({
  method: "POST",
})
  .validator((data: CreateManualTransactionInput) => data)
  .handler(async ({ data }) => {
    const customerName = data.customerName.trim() || "Pelanggan Umum";
    const customerPhone = data.customerPhone?.trim() || null;
    const notes = data.notes?.trim() || null;

    if (!data.capsterId) {
      throw new Error("Capster belum dipilih.");
    }
    if (data.serviceIds.length === 0) {
      throw new Error("Minimal pilih satu layanan.");
    }

    // 1. Get Barbershop
    const [shop] = await db
      .select()
      .from(barbershop)
      .where(eq(barbershop.status, "active"))
      .limit(1);

    if (!shop) {
      throw new Error("Barbershop tidak ditemukan.");
    }

    // 2. Find or Create User & Pelanggan
    let userRow;
    if (customerPhone) {
      const existingUser = await db
        .select()
        .from(users)
        .where(and(eq(users.no_hp, customerPhone), eq(users.role, "pelanggan")))
        .limit(1);
      userRow = existingUser[0];
    }

    if (!userRow) {
      const email = `manual.${Date.now()}.${Math.floor(Math.random() * 1000)}@barberin.local`;
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          nama_lengkap: customerName,
          no_hp: customerPhone,
          role: "pelanggan",
          status: "active",
        })
        .returning();
      userRow = newUser;
    }

    if (!userRow) {
      throw new Error("Gagal memproses akun pengguna.");
    }

    let [pelangganRow] = await db
      .select()
      .from(pelanggan)
      .where(eq(pelanggan.id_user, userRow.id_user))
      .limit(1);

    if (!pelangganRow) {
      [pelangganRow] = await db
        .insert(pelanggan)
        .values({
          id_user: userRow.id_user,
        })
        .returning();
    }

    if (!pelangganRow) {
      throw new Error("Gagal memproses data pelanggan.");
    }

    // 3. Find or Create active shift for capster
    let [activeShift] = await db
      .select()
      .from(shiftCapster)
      .where(
        and(
          eq(shiftCapster.id_capster, data.capsterId),
          eq(shiftCapster.status, "ongoing"),
        ),
      )
      .limit(1);

    if (!activeShift) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
      [activeShift] = await db
        .insert(shiftCapster)
        .values({
          id_capster: data.capsterId,
          tanggal: now,
          waktu_mulai: timeStr,
          status: "ongoing",
          total_transaksi: 0,
          total_pendapatan: "0",
        })
        .returning();
    }

    if (!activeShift) {
      throw new Error("Gagal memproses shift capster.");
    }

    // 4. Fetch services
    const serviceRows = await db
      .select()
      .from(layanan)
      .where(inArray(layanan.id_layanan, data.serviceIds));

    if (serviceRows.length === 0) {
      throw new Error("Layanan tidak ditemukan.");
    }

    const subtotal = serviceRows.reduce((sum, s) => sum + Number(s.harga), 0);
    const discount = 0;
    const total = subtotal - discount;

    if (data.paymentMethod === "tunai") {
      const received = data.cashReceived ?? total;
      if (received < total) {
        throw new Error("Jumlah uang yang diterima belum mencukupi.");
      }
    }

    const cashReceived =
      data.paymentMethod === "tunai"
        ? Math.max(data.cashReceived ?? total, total)
        : total;

    const change = Math.max(0, cashReceived - total);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // 5. Create Booking
    const [bookingRow] = await db
      .insert(booking)
      .values({
        id_pelanggan: pelangganRow.id_pelanggan,
        id_barbershop: shop.id_barbershop,
        id_capster: data.capsterId,
        tanggal_booking: now,
        waktu_booking: timeStr,
        status: "completed",
        catatan: notes,
      })
      .returning();

    if (!bookingRow) {
      throw new Error("Gagal membuat data booking.");
    }

    // 6. Create Detail Booking
    for (const s of serviceRows) {
      await db.insert(detailBooking).values({
        id_booking: bookingRow.id_booking,
        id_layanan: s.id_layanan,
        harga_satuan: String(s.harga),
        qty: 1,
        subtotal: String(s.harga),
      });
    }

    // 7. Create Transaksi
    const [transaksiRow] = await db
      .insert(transaksi)
      .values({
        id_booking: bookingRow.id_booking,
        id_shift: activeShift.id_shift,
        id_pelanggan: pelangganRow.id_pelanggan,
        subtotal: String(subtotal),
        diskon: String(discount),
        total: String(total),
        status_transaksi: "paid",
      })
      .returning();

    if (!transaksiRow) {
      throw new Error("Gagal membuat data transaksi.");
    }

    // 8. Create Pembayaran
    await db.insert(pembayaran).values({
      id_transaksi: transaksiRow.id_transaksi,
      metode_pembayaran: data.paymentMethod,
      jumlah_bayar: String(total),
      status_pembayaran: "success",
      waktu_bayar: now,
      referensi:
        data.paymentMethod === "tunai" ? `Tunai: ${cashReceived}` : "Non-tunai",
    });

    // 9. Create Struk
    const no_struk = generateStrukNumber();
    await db.insert(struk).values({
      id_transaksi: transaksiRow.id_transaksi,
      no_struk,
      tanggal_cetak: now,
    });

    // Fetch capster name
    const [capsterUser] = await db
      .select({ nama_lengkap: users.nama_lengkap })
      .from(capster)
      .innerJoin(users, eq(capster.id_user, users.id_user))
      .where(eq(capster.id_capster, data.capsterId))
      .limit(1);

    return {
      success: true,
      transactionId: transaksiRow.id_transaksi,
      noStruk: no_struk,
      customerId: pelangganRow.id_pelanggan,
      customerName: userRow.nama_lengkap,
      capsterId: data.capsterId,
      capsterName: capsterUser?.nama_lengkap ?? "Capster",
      subtotal,
      discount,
      total,
      paymentMethod: data.paymentMethod,
      cashReceived,
      change,
      serviceNames: serviceRows.map((s) => s.nama_layanan).join(" + "),
    };
  });