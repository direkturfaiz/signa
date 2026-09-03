import {
  pgTable,
  varchar,
  integer,
  numeric,
  timestamp,
  pgEnum,
  text,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==============================
// ENUMS (SESUAI ERD)
// ==============================
export const userRoleEnum = pgEnum("user_role", [
  "pelanggan",
  "capster",
  "owner",
  "admin_platform",
]);

export const commonStatusEnum = pgEnum("common_status", ["active", "inactive"]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const shiftStatusEnum = pgEnum("shift_status", [
  "ongoing",
  "completed",
  "cancelled",
]);

export const transaksiStatusEnum = pgEnum("transaksi_status", [
  "pending",
  "paid",
  "cancelled",
  "refunded",
]);

export const metodePembayaranEnum = pgEnum("metode_pembayaran", [
  "tunai",
  "qris",
  "transfer",
]);

export const pembayaranStatusEnum = pgEnum("pembayaran_status", [
  "pending",
  "success",
  "failed",
  "refunded",
]);

// ==============================
// 1. USER
// ==============================
export const users = pgTable(
  "users",
  {
    id_user: uuid("id_user").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password"),
    nama_lengkap: varchar("nama_lengkap", { length: 255 }).notNull(),
    no_hp: varchar("no_hp", { length: 50 }),
    role: userRoleEnum("role").notNull(),
    status: commonStatusEnum("status").notNull().default("active"),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("users_role_idx").on(table.role),
    index("users_email_idx").on(table.email),
  ],
);

// ==============================
// 2. PELANGGAN
// ==============================
export const pelanggan = pgTable(
  "pelanggan",
  {
    id_pelanggan: uuid("id_pelanggan").defaultRandom().primaryKey(),
    id_user: uuid("id_user")
      .notNull()
      .unique()
      .references(() => users.id_user, { onDelete: "cascade" }),
    alamat: text("alamat"),
    tanggal_lahir: timestamp("tanggal_lahir", { mode: "date" }),
    jenis_kelamin: varchar("jenis_kelamin", { length: 20 }),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("pelanggan_user_idx").on(table.id_user)],
);

// ==============================
// 3. BARBERSHOP
// ==============================
export const barbershop = pgTable("barbershop", {
  id_barbershop: uuid("id_barbershop").defaultRandom().primaryKey(),
  nama_barbershop: varchar("nama_barbershop", { length: 255 }).notNull(),
  alamat: text("alamat"),
  no_hp: varchar("no_hp", { length: 50 }),
  foto: text("foto"),
  jam_buka: varchar("jam_buka", { length: 20 }),
  jam_tutup: varchar("jam_tutup", { length: 20 }),
  status: commonStatusEnum("status").notNull().default("active"),
  created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// ==============================
// 4. CAPSTER
// ==============================
export const capster = pgTable(
  "capster",
  {
    id_capster: uuid("id_capster").defaultRandom().primaryKey(),
    id_user: uuid("id_user")
      .notNull()
      .unique()
      .references(() => users.id_user, { onDelete: "cascade" }),
    id_barbershop: uuid("id_barbershop")
      .notNull()
      .references(() => barbershop.id_barbershop, { onDelete: "cascade" }),
    no_pegawai: varchar("no_pegawai", { length: 50 }),
    tanggal_bergabung: timestamp("tanggal_bergabung", { mode: "date" }),
    status: commonStatusEnum("status").notNull().default("active"),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("capster_user_idx").on(table.id_user),
    index("capster_barbershop_idx").on(table.id_barbershop),
  ],
);

// ==============================
// 5. LAYANAN
// ==============================
export const layanan = pgTable(
  "layanan",
  {
    id_layanan: uuid("id_layanan").defaultRandom().primaryKey(),
    id_barbershop: uuid("id_barbershop")
      .notNull()
      .references(() => barbershop.id_barbershop, { onDelete: "cascade" }),
    nama_layanan: varchar("nama_layanan", { length: 255 }).notNull(),
    deskripsi: text("deskripsi"),
    durasi_menit: integer("durasi_menit"),
    harga: numeric("harga", { precision: 12, scale: 2 }).notNull(),
    status: commonStatusEnum("status").notNull().default("active"),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("layanan_barbershop_idx").on(table.id_barbershop)],
);

// ==============================
// 6. BOOKING
// ==============================
export const booking = pgTable(
  "booking",
  {
    id_booking: uuid("id_booking").defaultRandom().primaryKey(),
    id_pelanggan: uuid("id_pelanggan")
      .notNull()
      .references(() => pelanggan.id_pelanggan, { onDelete: "cascade" }),
    id_barbershop: uuid("id_barbershop")
      .notNull()
      .references(() => barbershop.id_barbershop, { onDelete: "cascade" }),
    id_capster: uuid("id_capster").references(() => capster.id_capster, {
      onDelete: "set null",
    }),
    tanggal_booking: timestamp("tanggal_booking", { mode: "date" }).notNull(),
    waktu_booking: varchar("waktu_booking", { length: 30 }).notNull(),
    status: bookingStatusEnum("status").notNull().default("pending"),
    catatan: text("catatan"),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("booking_pelanggan_idx").on(table.id_pelanggan),
    index("booking_capster_idx").on(table.id_capster),
    index("booking_status_idx").on(table.status),
  ],
);

// ==============================
// 7. DETAIL BOOKING
// ==============================
export const detailBooking = pgTable(
  "detail_booking",
  {
    id_detail_booking: uuid("id_detail_booking").defaultRandom().primaryKey(),
    id_booking: uuid("id_booking")
      .notNull()
      .references(() => booking.id_booking, { onDelete: "cascade" }),
    id_layanan: uuid("id_layanan")
      .notNull()
      .references(() => layanan.id_layanan, { onDelete: "restrict" }),
    harga_satuan: numeric("harga_satuan", { precision: 12, scale: 2 }).notNull(),
    qty: integer("qty").notNull().default(1),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    index("detail_booking_booking_idx").on(table.id_booking),
    index("detail_booking_layanan_idx").on(table.id_layanan),
  ],
);

// ==============================
// 8. SHIFT CAPSTER
// ==============================
export const shiftCapster = pgTable(
  "shift_capster",
  {
    id_shift: uuid("id_shift").defaultRandom().primaryKey(),
    id_capster: uuid("id_capster")
      .notNull()
      .references(() => capster.id_capster, { onDelete: "cascade" }),
    tanggal: timestamp("tanggal", { mode: "date" }).notNull(),
    waktu_mulai: varchar("waktu_mulai", { length: 30 }).notNull(),
    waktu_selesai: varchar("waktu_selesai", { length: 30 }),
    status: shiftStatusEnum("status").notNull().default("ongoing"),
    total_transaksi: integer("total_transaksi").notNull().default(0),
    total_pendapatan: numeric("total_pendapatan", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("shift_capster_capster_idx").on(table.id_capster),
    index("shift_capster_status_idx").on(table.status),
  ],
);

// ==============================
// 9. TRANSAKSI
// ==============================
export const transaksi = pgTable(
  "transaksi",
  {
    id_transaksi: uuid("id_transaksi").defaultRandom().primaryKey(),
    id_booking: uuid("id_booking").references(() => booking.id_booking, {
      onDelete: "set null",
    }),
    id_shift: uuid("id_shift")
      .notNull()
      .references(() => shiftCapster.id_shift, { onDelete: "restrict" }),
    id_pelanggan: uuid("id_pelanggan")
      .notNull()
      .references(() => pelanggan.id_pelanggan, { onDelete: "restrict" }),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    diskon: numeric("diskon", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    status_transaksi: transaksiStatusEnum("status_transaksi")
      .notNull()
      .default("pending"),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("transaksi_booking_idx").on(table.id_booking),
    index("transaksi_shift_idx").on(table.id_shift),
    index("transaksi_pelanggan_idx").on(table.id_pelanggan),
    index("transaksi_status_idx").on(table.status_transaksi),
  ],
);

// ==============================
// 10. PEMBAYARAN
// ==============================
export const pembayaran = pgTable(
  "pembayaran",
  {
    id_pembayaran: uuid("id_pembayaran").defaultRandom().primaryKey(),
    id_transaksi: uuid("id_transaksi")
      .notNull()
      .references(() => transaksi.id_transaksi, { onDelete: "cascade" }),
    metode_pembayaran: metodePembayaranEnum("metode_pembayaran").notNull(),
    jumlah_bayar: numeric("jumlah_bayar", {
      precision: 12,
      scale: 2,
    }).notNull(),
    status_pembayaran: pembayaranStatusEnum("status_pembayaran")
      .notNull()
      .default("pending"),
    waktu_bayar: timestamp("waktu_bayar", { mode: "date" }),
    referensi: varchar("referensi", { length: 255 }),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("pembayaran_transaksi_idx").on(table.id_transaksi),
    index("pembayaran_status_idx").on(table.status_pembayaran),
  ],
);

// ==============================
// 11. STRUK
// ==============================
export const struk = pgTable(
  "struk",
  {
    id_struk: uuid("id_struk").defaultRandom().primaryKey(),
    id_transaksi: uuid("id_transaksi")
      .notNull()
      .unique()
      .references(() => transaksi.id_transaksi, { onDelete: "cascade" }),
    no_struk: varchar("no_struk", { length: 50 }).notNull().unique(),
    tanggal_cetak: timestamp("tanggal_cetak", { mode: "date" })
      .notNull()
      .defaultNow(),
    url_struk: text("url_struk"),
    created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("struk_transaksi_idx").on(table.id_transaksi),
    index("struk_no_struk_idx").on(table.no_struk),
  ],
);

// ==============================
// RELATIONS
// ==============================
export const usersRelations = relations(users, ({ one }) => ({
  pelanggan: one(pelanggan, {
    fields: [users.id_user],
    references: [pelanggan.id_user],
  }),
  capster: one(capster, {
    fields: [users.id_user],
    references: [capster.id_user],
  }),
}));

export const pelangganRelations = relations(pelanggan, ({ one, many }) => ({
  user: one(users, {
    fields: [pelanggan.id_user],
    references: [users.id_user],
  }),
  bookings: many(booking),
  transaksi: many(transaksi),
}));

export const barbershopRelations = relations(barbershop, ({ many }) => ({
  capsters: many(capster),
  layanan: many(layanan),
  bookings: many(booking),
}));

export const capsterRelations = relations(capster, ({ one, many }) => ({
  user: one(users, {
    fields: [capster.id_user],
    references: [users.id_user],
  }),
  barbershop: one(barbershop, {
    fields: [capster.id_barbershop],
    references: [barbershop.id_barbershop],
  }),
  shifts: many(shiftCapster),
  bookings: many(booking),
}));

export const layananRelations = relations(layanan, ({ one, many }) => ({
  barbershop: one(barbershop, {
    fields: [layanan.id_barbershop],
    references: [barbershop.id_barbershop],
  }),
  detailBookings: many(detailBooking),
}));

export const bookingRelations = relations(booking, ({ one, many }) => ({
  pelanggan: one(pelanggan, {
    fields: [booking.id_pelanggan],
    references: [pelanggan.id_pelanggan],
  }),
  barbershop: one(barbershop, {
    fields: [booking.id_barbershop],
    references: [barbershop.id_barbershop],
  }),
  capster: one(capster, {
    fields: [booking.id_capster],
    references: [capster.id_capster],
  }),
  detailBookings: many(detailBooking),
  transaksi: one(transaksi, {
    fields: [booking.id_booking],
    references: [transaksi.id_booking],
  }),
}));

export const detailBookingRelations = relations(detailBooking, ({ one }) => ({
  booking: one(booking, {
    fields: [detailBooking.id_booking],
    references: [booking.id_booking],
  }),
  layanan: one(layanan, {
    fields: [detailBooking.id_layanan],
    references: [layanan.id_layanan],
  }),
}));

export const shiftCapsterRelations = relations(shiftCapster, ({ one, many }) => ({
  capster: one(capster, {
    fields: [shiftCapster.id_capster],
    references: [capster.id_capster],
  }),
  transaksi: many(transaksi),
}));

export const transaksiRelations = relations(transaksi, ({ one, many }) => ({
  booking: one(booking, {
    fields: [transaksi.id_booking],
    references: [booking.id_booking],
  }),
  shift: one(shiftCapster, {
    fields: [transaksi.id_shift],
    references: [shiftCapster.id_shift],
  }),
  pelanggan: one(pelanggan, {
    fields: [transaksi.id_pelanggan],
    references: [pelanggan.id_pelanggan],
  }),
  pembayaran: many(pembayaran),
  struk: one(struk, {
    fields: [transaksi.id_transaksi],
    references: [struk.id_transaksi],
  }),
}));

export const pembayaranRelations = relations(pembayaran, ({ one }) => ({
  transaksi: one(transaksi, {
    fields: [pembayaran.id_transaksi],
    references: [transaksi.id_transaksi],
  }),
}));

export const strukRelations = relations(struk, ({ one }) => ({
  transaksi: one(transaksi, {
    fields: [struk.id_transaksi],
    references: [transaksi.id_transaksi],
  }),
}));

// ==============================
// TYPE HELPERS
// ==============================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Pelanggan = typeof pelanggan.$inferSelect;
export type NewPelanggan = typeof pelanggan.$inferInsert;

export type Barbershop = typeof barbershop.$inferSelect;
export type NewBarbershop = typeof barbershop.$inferInsert;

export type Capster = typeof capster.$inferSelect;
export type NewCapster = typeof capster.$inferInsert;

export type Layanan = typeof layanan.$inferSelect;
export type NewLayanan = typeof layanan.$inferInsert;

export type Booking = typeof booking.$inferSelect;
export type NewBooking = typeof booking.$inferInsert;

export type DetailBooking = typeof detailBooking.$inferSelect;
export type NewDetailBooking = typeof detailBooking.$inferInsert;

export type ShiftCapster = typeof shiftCapster.$inferSelect;
export type NewShiftCapster = typeof shiftCapster.$inferInsert;

export type Transaksi = typeof transaksi.$inferSelect;
export type NewTransaksi = typeof transaksi.$inferInsert;

export type Pembayaran = typeof pembayaran.$inferSelect;
export type NewPembayaran = typeof pembayaran.$inferInsert;

export type Struk = typeof struk.$inferSelect;
export type NewStruk = typeof struk.$inferInsert;