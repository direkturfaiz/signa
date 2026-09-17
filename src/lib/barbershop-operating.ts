import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { barbershop } from "@/db/schema";

export {
  parseTimeToMinutes,
  getWibTimeParts,
  isBarbershopOpen,
  type PublicBarbershopInfo,
} from "./operating-hours";
import { isBarbershopOpen, type PublicBarbershopInfo } from "./operating-hours";

/**
 * Server function to fetch public profile and real-time open/closed status for customers.
 */
export const getPublicBarbershopInfo = createServerFn({
  method: "GET",
}).handler(async (): Promise<PublicBarbershopInfo> => {
  try {
    const [shop] = await db.select().from(barbershop).limit(1);

    const nama = shop?.nama_barbershop || "BARBERIN Headquarter";
    const alamat = shop?.alamat || "Jl. Jenderal Soedirman No. 123, Purbalingga";
    const noHp = shop?.no_hp || "0812-3456-7890";
    const jamBuka = shop?.jam_buka || "08:00 WIB";
    const jamTutup = shop?.jam_tutup || "21:00 WIB";

    const { isOpen, currentWibTime } = isBarbershopOpen(jamBuka, jamTutup);

    return {
      id_barbershop: shop?.id_barbershop,
      nama_barbershop: nama,
      alamat,
      no_hp: noHp,
      jam_buka: jamBuka,
      jam_tutup: jamTutup,
      isOpen,
      currentWibTime,
    };
  } catch (err) {
    console.error("Gagal mengambil profil publik barbershop:", err);
    const { isOpen, currentWibTime } = isBarbershopOpen("08:00", "21:00");
    return {
      nama_barbershop: "BARBERIN Headquarter",
      alamat: "Jl. Jenderal Soedirman No. 123, Purbalingga",
      no_hp: "0812-3456-7890",
      jam_buka: "08:00 WIB",
      jam_tutup: "21:00 WIB",
      isOpen,
      currentWibTime,
    };
  }
});
