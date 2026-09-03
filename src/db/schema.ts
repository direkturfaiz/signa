import {
  mysqlTable,
  varchar,
  int,
  decimal,
  datetime,
  mysqlEnum,
  text,
  index,
} from "drizzle-orm/mysql-core";

// ==============================
// USERS
// Customer dan Capster
// ==============================
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    name: varchar("name", { length: 100 }).notNull(),

    email: varchar("email", { length: 150 }).notNull().unique(),

    phone: varchar("phone", { length: 20 }),

    role: mysqlEnum("role", ["customer", "capster"]).notNull(),

    capsterRole: varchar("capster_role", { length: 100 }),

    status: mysqlEnum("status", ["active", "inactive"])
      .notNull()
      .default("active"),

    createdAt: datetime("created_at").notNull().default(new Date()),

    updatedAt: datetime("updated_at").notNull().default(new Date()),
  },
  (table) => ({
    roleIdx: index("users_role_idx").on(table.role),
  }),
);

// ==============================
// SERVICES
// Daftar layanan BARBERIN
// ==============================
export const services = mysqlTable(
  "services",
  {
    id: varchar("id", { length: 50 }).primaryKey(),

    name: varchar("name", { length: 100 }).notNull(),

    category: varchar("category", { length: 100 }).notNull(),

    price: decimal("price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    status: mysqlEnum("status", ["active", "inactive"])
      .notNull()
      .default("active"),

    createdAt: datetime("created_at").notNull().default(new Date()),

    updatedAt: datetime("updated_at").notNull().default(new Date()),
  },
);

// ==============================
// TRANSACTIONS
// Pesanan utama Customer
// ==============================
export const transactions = mysqlTable(
  "transactions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    transactionNumber: varchar("transaction_number", {
      length: 30,
    })
      .notNull()
      .unique(),

    customerId: varchar("customer_id", {
      length: 36,
    }).notNull(),

    capsterId: varchar("capster_id", {
      length: 36,
    }),

    subtotal: decimal("subtotal", {
      precision: 12,
      scale: 2,
    }).notNull(),

    discount: decimal("discount", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    total: decimal("total", {
      precision: 12,
      scale: 2,
    }).notNull(),

    status: mysqlEnum("status", [
      "PENDING_CAPSTER",
      "ACCEPTED",
      "IN_PROGRESS",
      "WAITING_PAYMENT",
      "PAYMENT_CONFIRMED",
      "COMPLETED",
      "CANCELLED",
    ])
      .notNull()
      .default("PENDING_CAPSTER"),

    notes: text("notes"),

    createdAt: datetime("created_at").notNull().default(new Date()),

    updatedAt: datetime("updated_at").notNull().default(new Date()),
  },
  (table) => ({
    customerIdx: index("transactions_customer_idx").on(table.customerId),

    capsterIdx: index("transactions_capster_idx").on(table.capsterId),

    statusIdx: index("transactions_status_idx").on(table.status),

    createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
  }),
);

// ==============================
// TRANSACTION ITEMS
// Layanan yang dipilih Customer
// ==============================
export const transactionItems = mysqlTable(
  "transaction_items",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    transactionId: varchar("transaction_id", {
      length: 36,
    }).notNull(),

    serviceId: varchar("service_id", {
      length: 50,
    }).notNull(),

    serviceName: varchar("service_name", {
      length: 100,
    }).notNull(),

    price: decimal("price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    quantity: int("quantity").notNull().default(1),

    subtotal: decimal("subtotal", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    transactionIdx: index("transaction_items_transaction_idx").on(
      table.transactionId,
    ),

    serviceIdx: index("transaction_items_service_idx").on(table.serviceId),
  }),
);

// ==============================
// PAYMENTS
// Pembayaran transaksi
// ==============================
export const payments = mysqlTable(
  "payments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    transactionId: varchar("transaction_id", {
      length: 36,
    })
      .notNull()
      .unique(),

    method: mysqlEnum("method", ["tunai", "qris", "transfer"]).notNull(),

    amount: decimal("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    cashReceived: decimal("cash_received", {
      precision: 12,
      scale: 2,
    }),

    changeAmount: decimal("change_amount", {
      precision: 12,
      scale: 2,
    }),

    status: mysqlEnum("status", [
      "PENDING",
      "CONFIRMED",
      "FAILED",
    ])
      .notNull()
      .default("PENDING"),

    confirmedBy: varchar("confirmed_by", {
      length: 36,
    }),

    confirmedAt: datetime("confirmed_at"),

    createdAt: datetime("created_at").notNull().default(new Date()),
  },
  (table) => ({
    transactionIdx: index("payments_transaction_idx").on(table.transactionId),

    confirmedByIdx: index("payments_confirmed_by_idx").on(table.confirmedBy),
  }),
);

// ==============================
// TYPE HELPERS
// ==============================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;