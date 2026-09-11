import { useState, useEffect } from "react";

export function formatRupiah(value: number): string {
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatTanggal(iso: string | Date | null | undefined): string {
  if (!iso) return "-";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export function formatWaktu(
  iso: string | Date | null | undefined,
  withWib: boolean = false,
): string {
  if (!iso) return "-";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "-";
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(d);
  return withWib ? `${timeStr} WIB` : timeStr;
}

export function formatTanggalWaktu(iso: string | Date | null | undefined): string {
  if (!iso) return "-";
  return `${formatTanggal(iso)} • ${formatWaktu(iso, true)}`;
}

export function formatWaktuRelatif(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return "Baru saja";
  if (diffMin < 60) return `${diffMin} mnt yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatTanggal(date);
}

/**
 * Format string jam Asia/Jakarta (WIB) saat ini atau dari objek Date tertentu
 */
export function getWibTimeString(date: Date = new Date(), withWib: boolean = true): string {
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return withWib ? `${timeStr} WIB` : timeStr;
}

/**
 * Menghasilkan nama bulan dan tahun Indonesia secara dinamis (contoh: "September 2026")
 * Mendukung offset bulan (misal -1 untuk "Agustus 2026")
 */
export function getIndonesianMonthYear(
  offsetMonths: number = 0,
  baseDate: Date = new Date(),
): string {
  const d = new Date(baseDate);
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMonths);
  return d.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/**
 * Hook React untuk mendapatkan jam & tanggal real-time (live clock)
 */
export function useLiveClock(intervalMs: number = 1000): Date {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return currentTime;
}

/**
 * Format jam dan tanggal real-time WIB
 */
export function formatWibClock(
  date: Date = new Date(),
  options?: {
    withSeconds?: boolean;
    withDay?: boolean;
    withDate?: boolean;
    withYear?: boolean;
  },
): string {
  const {
    withSeconds = false,
    withDay = true,
    withDate = true,
    withYear = true,
  } = options || {};

  const timeStr = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);

  if (!withDate) {
    return `${timeStr} WIB`;
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    ...(withDay ? { weekday: "long" } : {}),
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "Asia/Jakarta",
  };
  const dateStr = date.toLocaleDateString("id-ID", dateOptions);

  return `${dateStr} • ${timeStr} WIB`;
}

/**
 * Format ID panjang (seperti UUID: 89010419-6294-4c10-a5aa-7c0d9b52bb7d)
 * menjadi format ringkas dan terstruktur:
 * - Pelanggan: PLG-YYMM-XXXX (contoh: PLG-2609-8901)
 * - Transaksi: TRX-YYMM-XXXX (contoh: TRX-2609-8901)
 */
export function formatShortId(
  id?: string | null,
  type: "PLG" | "TRX" = "PLG",
  dateInput?: string | Date | null,
): string {
  if (!id) return "-";

  const cleanId = String(id).trim();
  // Jika sudah berformat PLG-YYMM-XXXX atau TRX-YYMM-XXXX, kembalikan langsung
  if (/^(PLG|TRX)-\d{4}-[A-Za-z0-9]{4}$/i.test(cleanId)) {
    return cleanId.toUpperCase();
  }

  let yearStr = "";
  let monthStr = "";

  if (dateInput) {
    try {
      const d = new Date(dateInput);
      if (!isNaN(d.getTime())) {
        yearStr = String(d.getFullYear()).slice(-2);
        monthStr = String(d.getMonth() + 1).padStart(2, "0");
      }
    } catch {
      // fallback
    }
  }

  if (!yearStr || !monthStr) {
    const now = new Date();
    yearStr = String(now.getFullYear()).slice(-2);
    monthStr = String(now.getMonth() + 1).padStart(2, "0");
  }

  const yymm = `${yearStr}${monthStr}`;
  const hexPart = cleanId.replace(/[^a-zA-Z0-9]/g, "");
  const code = (hexPart.slice(0, 4) || "0000").toUpperCase();

  return `${type}-${yymm}-${code}`;
}

export function formatCustomerId(id?: string | null, dateInput?: string | Date | null): string {
  return formatShortId(id, "PLG", dateInput);
}

export function formatTransactionId(id?: string | null, dateInput?: string | Date | null): string {
  return formatShortId(id, "TRX", dateInput);
}

/**
 * Format string atau angka dengan pemisah ribuan titik (contoh: 50000 -> "50.000")
 */
export function formatNumberWithDots(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

/**
 * Mengonversi string berformat titik ribuan ke angka murni (contoh: "50.000" -> 50000)
 */
export function parseNumberFromDots(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === "") return 0;
  const digits = String(val).replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

