import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { layanan } from "@/db/schema";

export const getServices = createServerFn({
  method: "GET",
}).handler(async () => {
  const result = await db
    .select({
      id: layanan.id_layanan,
      id_layanan: layanan.id_layanan,
      name: layanan.nama_layanan,
      nama_layanan: layanan.nama_layanan,
      description: layanan.deskripsi,
      deskripsi: layanan.deskripsi,
      durasi_menit: layanan.durasi_menit,
      price: layanan.harga,
      harga: layanan.harga,
      status: layanan.status,
    })
    .from(layanan)
    .where(eq(layanan.status, "active"));

  return result.map((s) => ({
    ...s,
    price: Number(s.price),
  }));
});