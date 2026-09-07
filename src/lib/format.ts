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

export function formatTanggal(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatWaktu(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatTanggalWaktu(iso: string): string {
  return `${formatTanggal(iso)} • ${formatWaktu(iso)}`;
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

