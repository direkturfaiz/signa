import { createServerFn } from "@tanstack/react-start";
import { and, eq, ne, count } from "drizzle-orm";
import { db } from "@/db";
import { capster, shiftCapster, users, barbershop, booking, transaksi } from "@/db/schema";

export type CapsterView = {
  id: string;
  id_capster: string;
  id_user: string;
  id_barbershop: string;
  name: string;
  role: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
  phone?: string | null;
  no_pegawai?: string | null;
};

export const getCapsters = createServerFn({
  method: "GET",
})
  .validator((data: { onlyCheckedIn?: boolean } | undefined) => data)
  .handler(async ({ data }) => {
    const capsterRows = await db
      .select({
        id_capster: capster.id_capster,
        id_user: capster.id_user,
        id_barbershop: capster.id_barbershop,
        nama_lengkap: users.nama_lengkap,
        no_hp: users.no_hp,
        no_pegawai: capster.no_pegawai,
        status: capster.status,
      })
      .from(capster)
      .innerJoin(users, eq(capster.id_user, users.id_user))
      .where(and(eq(capster.status, "active"), eq(users.status, "active")));

    // Check ongoing shifts to determine availability
    const results: CapsterView[] = [];

    for (const c of capsterRows) {
      const shifts = await db
        .select()
        .from(shiftCapster)
        .where(
          and(
            eq(shiftCapster.id_capster, c.id_capster),
            eq(shiftCapster.status, "ongoing"),
          ),
        )
        .limit(1);

      const isCheckedIn = shifts.length > 0;

      // Jika hanya ingin capster yang sudah check-in, lewati yang belum
      if (data?.onlyCheckedIn && !isCheckedIn) {
        continue;
      }

      results.push({
        id: c.id_capster,
        id_capster: c.id_capster,
        id_user: c.id_user,
        id_barbershop: c.id_barbershop,
        name: c.nama_lengkap,
        role: c.no_pegawai === "CAP-001" ? "Senior Barber" : "Barber",
        status: isCheckedIn ? "AVAILABLE" : "OFFLINE",
        phone: c.no_hp,
        no_pegawai: c.no_pegawai,
      });
    }

    return results;
  });

export const loginCapster = createServerFn({
  method: "POST",
})
  .validator((data: { emailOrName: string; password?: string }) => data)
  .handler(async ({ data }) => {
    const term = (data.emailOrName || "").trim().toLowerCase();
    const inputPassword = data.password || "";

    if (!term) {
      throw new Error("Email atau username wajib diisi.");
    }
    if (!inputPassword) {
      throw new Error("Password wajib diisi.");
    }

    // Query active capsters
    const all = await db
      .select({
        id_capster: capster.id_capster,
        id_user: capster.id_user,
        id_barbershop: capster.id_barbershop,
        nama_lengkap: users.nama_lengkap,
        email: users.email,
        password: users.password,
        no_pegawai: capster.no_pegawai,
      })
      .from(capster)
      .innerJoin(users, eq(capster.id_user, users.id_user))
      .where(and(eq(users.role, "capster"), eq(capster.status, "active")));

    const matched = all.find(
      (c) =>
        c.email.toLowerCase() === term ||
        c.nama_lengkap.toLowerCase() === term ||
        (c.no_pegawai && c.no_pegawai.toLowerCase() === term) ||
        c.email.toLowerCase().startsWith(term) ||
        term.includes(c.nama_lengkap.toLowerCase()),
    );

    if (!matched) {
      throw new Error("Akun capster dengan email atau username tersebut tidak ditemukan.");
    }

    const expectedPassword = matched.password || "password";
    if (inputPassword !== expectedPassword) {
      throw new Error("Password yang Anda masukkan salah.");
    }

    // Cek apakah toko capster sedang dinonaktifkan (suspended)
    if (matched.id_barbershop) {
      const [shop] = await db
        .select({ status: barbershop.status })
        .from(barbershop)
        .where(eq(barbershop.id_barbershop, matched.id_barbershop))
        .limit(1);

      if (shop && (shop.status === "suspended" || shop.status === "inactive")) {
        throw new Error("Akun toko Anda sedang dinonaktifkan, hubungi admin.");
      }
    }

    return {
      id_capster: matched.id_capster,
      id_user: matched.id_user,
      id_barbershop: matched.id_barbershop,
      nama_lengkap: matched.nama_lengkap,
      role: matched.no_pegawai === "CAP-001" ? "Senior Barber" : "Barber",
    };
  });

// ============================================================================
// OWNER CAPSTER CRUD SERVER FUNCTIONS
// ============================================================================

export type OwnerCapsterItem = {
  id: string;
  id_capster: string;
  id_user: string;
  id_barbershop: string;
  name: string;
  email: string;
  phone: string | null;
  no_pegawai: string | null;
  role: string;
  status: "active" | "inactive";
  isShiftActive: boolean;
  shiftStatus: "AVAILABLE" | "OFFLINE";
  shiftTime: string | null;
  totalTransactions: number;
  totalRevenue: number;
  joinedDate: string | null;
};

export type CreateCapsterInput = {
  nama_lengkap: string;
  email: string;
  no_hp?: string | null | undefined;
  no_pegawai?: string | null | undefined;
  password?: string | null | undefined;
  status?: "active" | "inactive" | undefined;
};

export type UpdateCapsterInput = {
  id_capster: string;
  nama_lengkap: string;
  email: string;
  no_hp?: string | null | undefined;
  no_pegawai?: string | null | undefined;
  password?: string | null | undefined;
  status?: "active" | "inactive" | undefined;
};

export type ToggleCapsterStatusInput = {
  id_capster: string;
};

export type DeleteCapsterInput = {
  id_capster: string;
};

// 1. READ: Get all capsters for Owner Management
export const getOwnerCapsters = createServerFn({
  method: "GET",
}).handler(async (): Promise<OwnerCapsterItem[]> => {
  const capsterRows = await db
    .select({
      id_capster: capster.id_capster,
      id_user: capster.id_user,
      id_barbershop: capster.id_barbershop,
      nama_lengkap: users.nama_lengkap,
      email: users.email,
      no_hp: users.no_hp,
      no_pegawai: capster.no_pegawai,
      status: capster.status,
      tanggal_bergabung: capster.tanggal_bergabung,
    })
    .from(capster)
    .innerJoin(users, eq(capster.id_user, users.id_user))
    .orderBy(capster.no_pegawai);

  const results: OwnerCapsterItem[] = [];

  for (const c of capsterRows) {
    // Check ongoing shift
    const shifts = await db
      .select({
        id_shift: shiftCapster.id_shift,
        status: shiftCapster.status,
        waktu_mulai: shiftCapster.waktu_mulai,
      })
      .from(shiftCapster)
      .where(
        and(
          eq(shiftCapster.id_capster, c.id_capster),
          eq(shiftCapster.status, "ongoing"),
        ),
      )
      .limit(1);

    const isShiftActive = shifts.length > 0;
    const shiftTime = isShiftActive && shifts[0] ? shifts[0].waktu_mulai : null;

    // Calculate transaction stats for this capster
    const capsterTxs = await db
      .select({
        total: transaksi.total,
      })
      .from(transaksi)
      .innerJoin(shiftCapster, eq(transaksi.id_shift, shiftCapster.id_shift))
      .where(
        and(
          eq(shiftCapster.id_capster, c.id_capster),
          eq(transaksi.status_transaksi, "paid"),
        ),
      );

    const totalTransactions = capsterTxs.length;
    const totalRevenue = capsterTxs.reduce((acc, t) => acc + Number(t.total || 0), 0);

    const joinedFormatted = c.tanggal_bergabung
      ? new Date(c.tanggal_bergabung).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

    results.push({
      id: c.id_capster,
      id_capster: c.id_capster,
      id_user: c.id_user,
      id_barbershop: c.id_barbershop,
      name: c.nama_lengkap,
      email: c.email,
      phone: c.no_hp,
      no_pegawai: c.no_pegawai,
      role: c.no_pegawai === "CAP-001" ? "Senior Barber" : "Barber",
      status: c.status as "active" | "inactive",
      isShiftActive,
      shiftStatus: isShiftActive ? "AVAILABLE" : "OFFLINE",
      shiftTime,
      totalTransactions,
      totalRevenue,
      joinedDate: joinedFormatted,
    });
  }

  return results;
});

// 2. CREATE: Add new Capster account
export const createOwnerCapster = createServerFn({
  method: "POST",
})
  .validator((data: CreateCapsterInput) => data)
  .handler(async ({ data }) => {
    const nama = data.nama_lengkap?.trim();
    if (!nama) {
      throw new Error("Nama lengkap capster wajib diisi.");
    }

    const email = data.email?.trim().toLowerCase();
    if (!email) {
      throw new Error("Email akun wajib diisi.");
    }

    // Check if email already exists
    const [existingUser] = await db
      .select({ id_user: users.id_user })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw new Error("Email sudah digunakan oleh akun lain. Silakan gunakan email berbeda.");
    }

    // Resolve no_pegawai (auto generate if empty e.g. CAP-003)
    let noPegawai = data.no_pegawai?.trim().toUpperCase();
    if (!noPegawai) {
      const allCapsters = await db.select({ no_pegawai: capster.no_pegawai }).from(capster);
      const nextNum = allCapsters.length + 1;
      noPegawai = `CAP-${String(nextNum).padStart(3, "0")}`;
    } else {
      // Check if no_pegawai is duplicate
      const [existingNo] = await db
        .select({ id_capster: capster.id_capster })
        .from(capster)
        .where(eq(capster.no_pegawai, noPegawai))
        .limit(1);
      if (existingNo) {
        throw new Error(`Nomor pegawai "${noPegawai}" sudah digunakan oleh capster lain.`);
      }
    }

    // Resolve barbershop
    let [shop] = await db
      .select({ id_barbershop: barbershop.id_barbershop })
      .from(barbershop)
      .where(eq(barbershop.status, "active"))
      .limit(1);

    if (!shop) {
      const [anyShop] = await db
        .select({ id_barbershop: barbershop.id_barbershop })
        .from(barbershop)
        .limit(1);
      shop = anyShop;
    }

    if (!shop) {
      throw new Error("Barbershop tidak ditemukan dalam sistem.");
    }

    const password = data.password?.trim() || "password123";
    const status = data.status || "active";

    // 1. Create User
    const [newUser] = await db
      .insert(users)
      .values({
        nama_lengkap: nama,
        email,
        password,
        no_hp: data.no_hp?.trim() || null,
        role: "capster",
        status,
      })
      .returning();

    if (!newUser) {
      throw new Error("Gagal membuat data pengguna untuk capster.");
    }

    // 2. Create Capster
    const [newCapster] = await db
      .insert(capster)
      .values({
        id_user: newUser.id_user,
        id_barbershop: shop.id_barbershop,
        no_pegawai: noPegawai,
        tanggal_bergabung: new Date(),
        status,
      })
      .returning();

    if (!newCapster) {
      throw new Error("Gagal membuat profil staf capster.");
    }

    return {
      success: true,
      capster: {
        id_capster: newCapster.id_capster,
        nama_lengkap: newUser.nama_lengkap,
        no_pegawai: newCapster.no_pegawai,
        email: newUser.email,
        status: newCapster.status,
      },
    };
  });

// 3. UPDATE: Edit Capster account
export const updateOwnerCapster = createServerFn({
  method: "POST",
})
  .validator((data: UpdateCapsterInput) => data)
  .handler(async ({ data }) => {
    if (!data.id_capster) {
      throw new Error("ID capster tidak valid.");
    }
    const nama = data.nama_lengkap?.trim();
    if (!nama) {
      throw new Error("Nama lengkap capster wajib diisi.");
    }
    const email = data.email?.trim().toLowerCase();
    if (!email) {
      throw new Error("Email wajib diisi.");
    }

    // Find capster
    const [target] = await db
      .select({
        id_capster: capster.id_capster,
        id_user: capster.id_user,
        no_pegawai: capster.no_pegawai,
      })
      .from(capster)
      .where(eq(capster.id_capster, data.id_capster))
      .limit(1);

    if (!target) {
      throw new Error("Data capster tidak ditemukan.");
    }

    // Check if email taken by another user
    const [emailCollision] = await db
      .select({ id_user: users.id_user })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id_user, target.id_user)))
      .limit(1);

    if (emailCollision) {
      throw new Error("Email sudah digunakan oleh akun lain.");
    }

    // Check if no_pegawai taken by another capster
    const noPegawai = data.no_pegawai?.trim().toUpperCase() || target.no_pegawai;
    if (noPegawai) {
      const [noCollision] = await db
        .select({ id_capster: capster.id_capster })
        .from(capster)
        .where(
          and(
            eq(capster.no_pegawai, noPegawai),
            ne(capster.id_capster, target.id_capster),
          ),
        )
        .limit(1);

      if (noCollision) {
        throw new Error(`Nomor pegawai "${noPegawai}" sudah digunakan oleh capster lain.`);
      }
    }

    const status = data.status || "active";

    // Update users
    const userUpdateData: any = {
      nama_lengkap: nama,
      email,
      no_hp: data.no_hp !== undefined ? (data.no_hp?.trim() || null) : undefined,
      status,
      updated_at: new Date(),
    };

    if (data.password && data.password.trim()) {
      userUpdateData.password = data.password.trim();
    }

    await db
      .update(users)
      .set(userUpdateData)
      .where(eq(users.id_user, target.id_user));

    // Update capster
    await db
      .update(capster)
      .set({
        no_pegawai: noPegawai,
        status,
        updated_at: new Date(),
      })
      .where(eq(capster.id_capster, target.id_capster));

    // If deactivated, close ongoing shifts
    if (status === "inactive") {
      await db
        .update(shiftCapster)
        .set({ status: "completed", waktu_selesai: "Nonaktif oleh Owner" })
        .where(
          and(
            eq(shiftCapster.id_capster, target.id_capster),
            eq(shiftCapster.status, "ongoing"),
          ),
        );
    }

    return {
      success: true,
      message: "Data capster berhasil diperbarui.",
    };
  });

// 4. TOGGLE: Fast switch status active <-> inactive
export const toggleOwnerCapsterStatus = createServerFn({
  method: "POST",
})
  .validator((data: ToggleCapsterStatusInput) => data)
  .handler(async ({ data }) => {
    if (!data.id_capster) {
      throw new Error("ID capster tidak valid.");
    }

    const [target] = await db
      .select({
        id_capster: capster.id_capster,
        id_user: capster.id_user,
        status: capster.status,
      })
      .from(capster)
      .where(eq(capster.id_capster, data.id_capster))
      .limit(1);

    if (!target) {
      throw new Error("Data capster tidak ditemukan.");
    }

    const newStatus = target.status === "active" ? "inactive" : "active";

    await db
      .update(capster)
      .set({ status: newStatus, updated_at: new Date() })
      .where(eq(capster.id_capster, target.id_capster));

    await db
      .update(users)
      .set({ status: newStatus, updated_at: new Date() })
      .where(eq(users.id_user, target.id_user));

    if (newStatus === "inactive") {
      await db
        .update(shiftCapster)
        .set({ status: "completed", waktu_selesai: "Dinonaktifkan oleh Owner" })
        .where(
          and(
            eq(shiftCapster.id_capster, target.id_capster),
            eq(shiftCapster.status, "ongoing"),
          ),
        );
    }

    return {
      success: true,
      newStatus,
      message:
        newStatus === "active"
          ? "Akun capster berhasil diaktifkan kembali."
          : "Akun capster berhasil dinonaktifkan.",
    };
  });

// 5. DELETE: Safe delete capster (or deactivate if historical data exists)
export const deleteOwnerCapster = createServerFn({
  method: "POST",
})
  .validator((data: DeleteCapsterInput) => data)
  .handler(async ({ data }) => {
    if (!data.id_capster) {
      throw new Error("ID capster tidak valid.");
    }

    const [target] = await db
      .select({
        id_capster: capster.id_capster,
        id_user: capster.id_user,
        nama_lengkap: users.nama_lengkap,
      })
      .from(capster)
      .innerJoin(users, eq(capster.id_user, users.id_user))
      .where(eq(capster.id_capster, data.id_capster))
      .limit(1);

    if (!target) {
      throw new Error("Data capster tidak ditemukan.");
    }

    // Check if capster has shifts or bookings
    const [shiftsCount] = await db
      .select({ count: count() })
      .from(shiftCapster)
      .where(eq(shiftCapster.id_capster, target.id_capster));

    const [bookingsCount] = await db
      .select({ count: count() })
      .from(booking)
      .where(eq(booking.id_capster, target.id_capster));

    const totalUsage = Number(shiftsCount?.count || 0) + Number(bookingsCount?.count || 0);

    if (totalUsage > 0) {
      // Historical data exists: soft-delete to protect financial & payroll integrity
      await db
        .update(capster)
        .set({ status: "inactive", updated_at: new Date() })
        .where(eq(capster.id_capster, target.id_capster));

      await db
        .update(users)
        .set({ status: "inactive", updated_at: new Date() })
        .where(eq(users.id_user, target.id_user));

      // Close ongoing shifts
      await db
        .update(shiftCapster)
        .set({ status: "completed", waktu_selesai: "Akun dinonaktifkan" })
        .where(
          and(
            eq(shiftCapster.id_capster, target.id_capster),
            eq(shiftCapster.status, "ongoing"),
          ),
        );

      return {
        success: true,
        softDeleted: true,
        message: `Capster "${target.nama_lengkap}" memiliki ${totalUsage} riwayat shift/booking sehingga akun dinonaktifkan agar rekap transaksi & komisi tetap aman.`,
      };
    }

    // No historical data: hard delete
    await db.delete(capster).where(eq(capster.id_capster, target.id_capster));
    await db.delete(users).where(eq(users.id_user, target.id_user));

    return {
      success: true,
      softDeleted: false,
      message: `Akun capster "${target.nama_lengkap}" berhasil dihapus secara permanen.`,
    };
  });

