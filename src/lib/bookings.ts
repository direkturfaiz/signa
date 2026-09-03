import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray } from "drizzle-orm";
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

type CreateBookingInput = {
  customerName: string;
  customerPhone?: string;
  capsterId: string;
  items: { serviceId: string; quantity: number }[];
  paymentMethod: "tunai" | "qris" | "transfer";
};

function generateStrukNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `STR-${ymd}-${rand}`;
}

export const createCustomerBookingAndTransaction = createServerFn({
  method: "POST",
})
  .validator((data: CreateBookingInput) => data)
  .handler(async ({ data }) => {
    const customerName = data.customerName.trim() || "Pelanggan Umum";
    const customerPhone = data.customerPhone?.trim() || null;

    if (!data.capsterId) {
      throw new Error("Capster wajib dipilih.");
    }
    if (!data.items || data.items.length === 0) {
      throw new Error("Minimal pilih satu layanan.");
    }

    // 1. Get Barbershop
    const [shop] = await db
      .select()
      .from(barbershop)
      .where(eq(barbershop.status, "active"))
      .limit(1);

    if (!shop) {
      throw new Error("Barbershop tidak ditemukan atau sedang tidak aktif.");
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
      const email = `pelanggan.${Date.now()}.${Math.floor(Math.random() * 1000)}@barberin.local`;
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

    // 3. Find or create active shift for selected capster
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

    // 4. Fetch service details to calculate prices
    const serviceIds = data.items.map((i) => i.serviceId);
    const serviceRows = await db
      .select()
      .from(layanan)
      .where(inArray(layanan.id_layanan, serviceIds));

    if (serviceRows.length === 0) {
      throw new Error("Layanan tidak valid.");
    }

    let subtotalNum = 0;
    const itemsToInsert: {
      serviceId: string;
      serviceName: string;
      price: number;
      qty: number;
      subtotal: number;
    }[] = [];

    for (const item of data.items) {
      const svc = serviceRows.find((s) => s.id_layanan === item.serviceId);
      if (svc) {
        const p = Number(svc.harga);
        const st = p * item.quantity;
        subtotalNum += st;
        itemsToInsert.push({
          serviceId: svc.id_layanan,
          serviceName: svc.nama_layanan,
          price: p,
          qty: item.quantity,
          subtotal: st,
        });
      }
    }

    const discountNum = 0;
    const totalNum = subtotalNum - discountNum;

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
        status: "pending",
      })
      .returning();

    if (!bookingRow) {
      throw new Error("Gagal membuat data booking.");
    }

    // 6. Create Detail Booking
    for (const item of itemsToInsert) {
      await db.insert(detailBooking).values({
        id_booking: bookingRow.id_booking,
        id_layanan: item.serviceId,
        harga_satuan: String(item.price),
        qty: item.qty,
        subtotal: String(item.subtotal),
      });
    }

    // 7. Create Transaksi
    const [transaksiRow] = await db
      .insert(transaksi)
      .values({
        id_booking: bookingRow.id_booking,
        id_shift: activeShift.id_shift,
        id_pelanggan: pelangganRow.id_pelanggan,
        subtotal: String(subtotalNum),
        diskon: String(discountNum),
        total: String(totalNum),
        status_transaksi: "pending",
      })
      .returning();

    if (!transaksiRow) {
      throw new Error("Gagal membuat data transaksi.");
    }

    // 8. Create Pembayaran
    await db
      .insert(pembayaran)
      .values({
        id_transaksi: transaksiRow.id_transaksi,
        metode_pembayaran: data.paymentMethod,
        jumlah_bayar: String(totalNum),
        status_pembayaran: "pending",
      })
      .returning();

    // Fetch capster user name
    const [capsterUser] = await db
      .select({
        nama_lengkap: users.nama_lengkap,
      })
      .from(capster)
      .innerJoin(users, eq(capster.id_user, users.id_user))
      .where(eq(capster.id_capster, data.capsterId))
      .limit(1);

    return {
      success: true,
      transactionId: transaksiRow.id_transaksi,
      bookingId: bookingRow.id_booking,
      customerId: pelangganRow.id_pelanggan,
      customerName: userRow.nama_lengkap,
      capsterId: data.capsterId,
      capsterName: capsterUser?.nama_lengkap ?? "Capster",
      total: totalNum,
      subtotal: subtotalNum,
      paymentMethod: data.paymentMethod,
      serviceNames: itemsToInsert.map((i) => i.serviceName).join(" + "),
      createdAt: now.toISOString(),
    };
  });

export const getTransactionDetail = createServerFn({
  method: "GET",
})
  .validator((data: { transactionId: string }) => data)
  .handler(async ({ data }) => {
    const txRows = await db
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
        customer_name: users.nama_lengkap,
        customer_phone: users.no_hp,
      })
      .from(transaksi)
      .innerJoin(pelanggan, eq(transaksi.id_pelanggan, pelanggan.id_pelanggan))
      .innerJoin(users, eq(pelanggan.id_user, users.id_user))
      .where(eq(transaksi.id_transaksi, data.transactionId))
      .limit(1);

    if (!txRows[0]) {
      return null;
    }

    const tx = txRows[0];

    // Get Booking & Capster
    let bookingInfo = null;
    let capsterName = "Capster";
    let capsterRole = "Barber";

    if (tx.id_booking) {
      const bRows = await db
        .select({
          id_booking: booking.id_booking,
          id_capster: booking.id_capster,
          status: booking.status,
          waktu_booking: booking.waktu_booking,
          catatan: booking.catatan,
        })
        .from(booking)
        .where(eq(booking.id_booking, tx.id_booking))
        .limit(1);

      if (bRows[0]) {
        bookingInfo = bRows[0];
        if (bRows[0].id_capster) {
          const capRows = await db
            .select({
              nama_lengkap: users.nama_lengkap,
              no_pegawai: capster.no_pegawai,
            })
            .from(capster)
            .innerJoin(users, eq(capster.id_user, users.id_user))
            .where(eq(capster.id_capster, bRows[0].id_capster))
            .limit(1);

          if (capRows[0]) {
            capsterName = capRows[0].nama_lengkap;
            capsterRole =
              capRows[0].no_pegawai === "CAP-001" ? "Senior Barber" : "Barber";
          }
        }
      }
    }

    // Get Items (Detail Booking)
    const items: {
      serviceId: string;
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    if (tx.id_booking) {
      const details = await db
        .select({
          id_layanan: detailBooking.id_layanan,
          harga_satuan: detailBooking.harga_satuan,
          qty: detailBooking.qty,
          subtotal: detailBooking.subtotal,
          nama_layanan: layanan.nama_layanan,
        })
        .from(detailBooking)
        .innerJoin(layanan, eq(detailBooking.id_layanan, layanan.id_layanan))
        .where(eq(detailBooking.id_booking, tx.id_booking));

      details.forEach((d) => {
        items.push({
          serviceId: d.id_layanan,
          name: d.nama_layanan,
          price: Number(d.harga_satuan),
          quantity: d.qty,
          subtotal: Number(d.subtotal),
        });
      });
    }

    // Get Pembayaran
    const payRows = await db
      .select()
      .from(pembayaran)
      .where(eq(pembayaran.id_transaksi, tx.id_transaksi))
      .limit(1);

    const payment = payRows[0] ?? null;

    // Get Struk
    const strukRows = await db
      .select()
      .from(struk)
      .where(eq(struk.id_transaksi, tx.id_transaksi))
      .limit(1);

    const strukData = strukRows[0] ?? null;

    return {
      transactionId: tx.id_transaksi,
      bookingId: tx.id_booking,
      bookingStatus: bookingInfo?.status ?? "confirmed",
      customerId: tx.id_pelanggan,
      customerName: tx.customer_name,
      customerPhone: tx.customer_phone,
      capsterName,
      capsterRole,
      createdAt: tx.created_at.toISOString(),
      subtotal: Number(tx.subtotal),
      discount: Number(tx.diskon),
      total: Number(tx.total),
      status: tx.status_transaksi,
      paymentMethod: payment?.metode_pembayaran ?? "tunai",
      paymentStatus: payment?.status_pembayaran ?? "pending",
      items,
      struk: strukData,
    };
  });

export const confirmPaymentAndGenerateStruk = createServerFn({
  method: "POST",
})
  .validator(
    (data: {
      transactionId: string;
      cashReceived?: number;
      referensi?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const now = new Date();

    // 1. Update Transaksi
    const [updatedTx] = await db
      .update(transaksi)
      .set({
        status_transaksi: "paid",
        updated_at: now,
      })
      .where(eq(transaksi.id_transaksi, data.transactionId))
      .returning();

    if (!updatedTx) {
      throw new Error("Transaksi tidak ditemukan.");
    }

    // 2. Update Pembayaran
    await db
      .update(pembayaran)
      .set({
        status_pembayaran: "success",
        waktu_bayar: now,
        referensi: data.referensi ?? (data.cashReceived ? `Tunai: ${data.cashReceived}` : null),
      })
      .where(eq(pembayaran.id_transaksi, data.transactionId));

    // 3. Update Booking
    if (updatedTx.id_booking) {
      await db
        .update(booking)
        .set({
          status: "confirmed",
          updated_at: now,
        })
        .where(eq(booking.id_booking, updatedTx.id_booking));
    }

    // 4. Create or get Struk
    let [strukRow] = await db
      .select()
      .from(struk)
      .where(eq(struk.id_transaksi, data.transactionId))
      .limit(1);

    if (!strukRow) {
      const no_struk = generateStrukNumber();
      [strukRow] = await db
        .insert(struk)
        .values({
          id_transaksi: data.transactionId,
          no_struk,
          tanggal_cetak: now,
        })
        .returning();
    }

    if (!strukRow) {
      throw new Error("Gagal membuat struk transaksi.");
    }

    return {
      success: true,
      transactionId: updatedTx.id_transaksi,
      noStruk: strukRow.no_struk,
      status: "paid",
    };
  });

export const getCustomerTransactions = createServerFn({
  method: "GET",
})
  .validator((data: { customerId?: string; customerName?: string } | undefined) => data)
  .handler(async ({ data }) => {
    let customerId = data?.customerId;

    if (!customerId && data?.customerName) {
      const cust = await db
        .select({ id_pelanggan: pelanggan.id_pelanggan })
        .from(pelanggan)
        .innerJoin(users, eq(pelanggan.id_user, users.id_user))
        .where(eq(users.nama_lengkap, data.customerName))
        .limit(1);

      if (cust[0]) customerId = cust[0].id_pelanggan;
    }

    if (!customerId) {
      return [];
    }

    const txs = await db
      .select({
        id_transaksi: transaksi.id_transaksi,
        id_booking: transaksi.id_booking,
        total: transaksi.total,
        status_transaksi: transaksi.status_transaksi,
        created_at: transaksi.created_at,
        customerName: users.nama_lengkap,
      })
      .from(transaksi)
      .innerJoin(pelanggan, eq(transaksi.id_pelanggan, pelanggan.id_pelanggan))
      .innerJoin(users, eq(pelanggan.id_user, users.id_user))
      .where(eq(transaksi.id_pelanggan, customerId))
      .orderBy(desc(transaksi.created_at));

    const results = [];

    for (const t of txs) {
      let serviceNames = "Layanan Barbershop";
      if (t.id_booking) {
        const details = await db
          .select({ nama: layanan.nama_layanan })
          .from(detailBooking)
          .innerJoin(layanan, eq(detailBooking.id_layanan, layanan.id_layanan))
          .where(eq(detailBooking.id_booking, t.id_booking));

        if (details.length > 0) {
          serviceNames = details.map((d) => d.nama).join(" + ");
        }
      }

      const [pay] = await db
        .select({ method: pembayaran.metode_pembayaran })
        .from(pembayaran)
        .where(eq(pembayaran.id_transaksi, t.id_transaksi))
        .limit(1);

      results.push({
        id: t.id_transaksi,
        date: t.created_at.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        time: t.created_at.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        serviceNames,
        total: Number(t.total),
        status: t.status_transaksi === "paid" ? "Selesai" : "Menunggu",
        paymentMethod: pay?.method ?? "tunai",
      });
    }

    return results;
  });

export const getOrCreateCustomer = createServerFn({
  method: "POST",
})
  .validator((data: { name: string; phone?: string }) => data)
  .handler(async ({ data }) => {
    const name = data.name.trim() || "Pelanggan Umum";
    const phone = data.phone?.trim() || null;
    let userRow;

    if (phone) {
      const existing = await db
        .select()
        .from(users)
        .where(and(eq(users.no_hp, phone), eq(users.role, "pelanggan")))
        .limit(1);
      userRow = existing[0];
    }

    if (!userRow) {
      const email = `pelanggan.${Date.now()}.${Math.floor(Math.random() * 1000)}@barberin.local`;
      const [u] = await db
        .insert(users)
        .values({
          email,
          nama_lengkap: name,
          no_hp: phone,
          role: "pelanggan",
          status: "active",
        })
        .returning();
      userRow = u;
    }

    if (!userRow) {
      throw new Error("Gagal membuat user.");
    }

    let [p] = await db
      .select()
      .from(pelanggan)
      .where(eq(pelanggan.id_user, userRow.id_user))
      .limit(1);

    if (!p) {
      [p] = await db
        .insert(pelanggan)
        .values({
          id_user: userRow.id_user,
        })
        .returning();
    }

    if (!p) {
      throw new Error("Gagal membuat data pelanggan.");
    }

    return {
      customerId: p.id_pelanggan,
      userId: userRow.id_user,
      name: userRow.nama_lengkap,
    };
  });
