import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  payments,
  services,
  transactionItems,
  transactions,
  users,
} from "@/db/schema";

type PaymentMethod = "tunai" | "qris" | "transfer";

type CreateManualTransactionInput = {
  customerName: string;
  customerPhone?: string;
  notes?: string;
  capsterId: string;
  serviceIds: string[];
  paymentMethod: PaymentMethod;
  cashReceived?: number;
};

function generateId() {
  return crypto.randomUUID();
}

function generateTransactionNumber() {
  const now = new Date();

  const date =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, "0")}` +
    `${String(now.getDate()).padStart(2, "0")}`;

  const random = Math.floor(1000 + Math.random() * 9000);

  return `TRX-${date}-${random}`;
}

export const createManualTransaction = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateManualTransactionInput) => data)
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

    // ==============================
    // CEK CAPSTER
    // ==============================
    const capster = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, data.capsterId),
          eq(users.role, "capster"),
          eq(users.status, "active"),
        ),
      )
      .limit(1);

    if (!capster[0]) {
      throw new Error("Capster tidak ditemukan atau tidak aktif.");
    }

    // ==============================
    // CARI CUSTOMER
    // ==============================
    let customer;

    if (customerPhone) {
      const existingCustomer = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.phone, customerPhone),
            eq(users.role, "customer"),
          ),
        )
        .limit(1);

      customer = existingCustomer[0];
    }

    // Kalau customer belum ada, buat customer baru
    if (!customer) {
      const customerId = generateId();

      await db.insert(users).values({
        id: customerId,
        name: customerName,
        email: `${customerId}@customer.barberin.local`,
        phone: customerPhone,
        role: "customer",
        status: "active",
      });

      const createdCustomer = await db
        .select()
        .from(users)
        .where(eq(users.id, customerId))
        .limit(1);

      customer = createdCustomer[0];
    }

    if (!customer) {
      throw new Error("Customer gagal dibuat.");
    }

    // ==============================
    // AMBIL LAYANAN DARI DATABASE
    // ==============================
    const selectedServices = [];

    for (const serviceId of data.serviceIds) {
      const result = await db
        .select()
        .from(services)
        .where(
          and(
            eq(services.id, serviceId),
            eq(services.status, "active"),
          ),
        )
        .limit(1);

      if (!result[0]) {
        throw new Error(`Layanan ${serviceId} tidak ditemukan.`);
      }

      selectedServices.push(result[0]);
    }

    // ==============================
    // HITUNG TOTAL
    // ==============================
    const subtotal = selectedServices.reduce(
      (total, service) => total + Number(service.price),
      0,
    );

    const discount = 0;
    const total = subtotal - discount;

    const cashReceived =
      data.paymentMethod === "tunai"
        ? Math.max(data.cashReceived ?? total, total)
        : total;

    const changeAmount =
      data.paymentMethod === "tunai"
        ? Math.max(0, cashReceived - total)
        : 0;

    // ==============================
    // ID TRANSAKSI
    // ==============================
    const transactionId = generateId();
    const paymentId = generateId();

    let transactionNumber = generateTransactionNumber();

    // Hindari nomor transaksi duplicate
    let existingNumber = await db
      .select()
      .from(transactions)
      .where(eq(transactions.transactionNumber, transactionNumber))
      .limit(1);

    while (existingNumber.length > 0) {
      transactionNumber = generateTransactionNumber();

      existingNumber = await db
        .select()
        .from(transactions)
        .where(eq(transactions.transactionNumber, transactionNumber))
        .limit(1);
    }

    const now = new Date();

    // ==============================
    // INSERT TRANSAKSI
    // ==============================
    await db.insert(transactions).values({
      id: transactionId,
      transactionNumber,
      customerId: customer.id,
      capsterId: data.capsterId,
      subtotal: String(subtotal),
      discount: String(discount),
      total: String(total),

      // Karena transaksi manual langsung dibayar
      // kita tandai pembayaran sudah dikonfirmasi.
      status: "COMPLETED",

      notes,

      createdAt: now,
      updatedAt: now,
    });

    // ==============================
    // INSERT ITEMS
    // ==============================
    await db.insert(transactionItems).values(
      selectedServices.map((service) => ({
        id: generateId(),
        transactionId,
        serviceId: service.id,
        serviceName: service.name,
        price: String(service.price),
        quantity: 1,
        subtotal: String(service.price),
      })),
    );

    // ==============================
    // INSERT PAYMENT
    // ==============================
    await db.insert(payments).values({
      id: paymentId,
      transactionId,
      method: data.paymentMethod,
      amount: String(total),
      cashReceived:
        data.paymentMethod === "tunai"
          ? String(cashReceived)
          : null,
      changeAmount:
        data.paymentMethod === "tunai"
          ? String(changeAmount)
          : null,
      status: "CONFIRMED",
      confirmedBy: data.capsterId,
      confirmedAt: now,
      createdAt: now,
    });

    return {
      success: true,
      transactionId,
      transactionNumber,
      customerId: customer.id,
      customerName: customer.name,
      capsterId: data.capsterId,
      capsterName: capster[0].name,
      subtotal,
      discount,
      total,
      paymentMethod: data.paymentMethod,
      cashReceived,
      changeAmount,
      serviceNames: selectedServices
        .map((service) => service.name)
        .join(" + "),
    };
  });