import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { capster, shiftCapster, users } from "@/db/schema";

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
  .validator((data: { emailOrName: string }) => data)
  .handler(async ({ data }) => {
    const term = data.emailOrName.trim().toLowerCase();

    // Query active capsters
    const all = await db
      .select({
        id_capster: capster.id_capster,
        id_user: capster.id_user,
        id_barbershop: capster.id_barbershop,
        nama_lengkap: users.nama_lengkap,
        email: users.email,
        no_pegawai: capster.no_pegawai,
      })
      .from(capster)
      .innerJoin(users, eq(capster.id_user, users.id_user))
      .where(and(eq(users.role, "capster"), eq(capster.status, "active")));

    const matched = all.find(
      (c) =>
        c.nama_lengkap.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.no_pegawai && c.no_pegawai.toLowerCase().includes(term)) ||
        term.includes(c.nama_lengkap.toLowerCase()),
    );

    const target = matched ?? all[0];
    if (!target) {
      throw new Error("Akun capster tidak ditemukan.");
    }

    return {
      id_capster: target.id_capster,
      id_user: target.id_user,
      id_barbershop: target.id_barbershop,
      nama_lengkap: target.nama_lengkap,
      role: target.no_pegawai === "CAP-001" ? "Senior Barber" : "Barber",
    };
  });
