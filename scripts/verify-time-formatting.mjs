import {
  formatTanggal,
  formatWaktu,
  formatTanggalWaktu,
  formatWaktuRelatif,
  getWibTimeString,
  getIndonesianMonthYear,
  formatWibClock,
} from "../src/lib/format.ts";

console.log("🔍 Verifikasi Format Waktu & Tanggal BARBERIN...");

const now = new Date();
console.log("Waktu lokal mesin:", now.toISOString());

const wibTime = getWibTimeString(now);
console.log("getWibTimeString:", wibTime);

const tgl = formatTanggal(now);
console.log("formatTanggal:", tgl);

const wkt = formatWaktu(now, true);
console.log("formatWaktu (withWib):", wkt);

const tglWkt = formatTanggalWaktu(now);
console.log("formatTanggalWaktu:", tglWkt);

const curMonthYear = getIndonesianMonthYear(0);
console.log("Bulan Ini (0):", curMonthYear);

const prevMonthYear = getIndonesianMonthYear(-1);
console.log("Bulan Lalu (-1):", prevMonthYear);

const prevMonthYear2 = getIndonesianMonthYear(-2);
console.log("2 Bulan Lalu (-2):", prevMonthYear2);

const clockFull = formatWibClock(now, { withSeconds: true, withDay: true, withYear: true });
console.log("formatWibClock (Full):", clockFull);

const clockNoSec = formatWibClock(now, { withSeconds: false, withDay: true, withYear: true });
console.log("formatWibClock (No Seconds):", clockNoSec);

// Basic assertions
if (!wibTime.includes("WIB")) {
  console.error("❌ getWibTimeString missing WIB suffix");
  process.exit(1);
}

if (!tgl.includes("2026")) {
  console.error("❌ formatTanggal did not produce expected year 2026:", tgl);
  process.exit(1);
}

if (!curMonthYear.includes("September 2026")) {
  console.error("❌ curMonthYear did not produce September 2026:", curMonthYear);
  process.exit(1);
}

if (!prevMonthYear.includes("Agustus 2026")) {
  console.error("❌ prevMonthYear did not produce Agustus 2026:", prevMonthYear);
  process.exit(1);
}

console.log("✅ SEMUA PENGECEKAN FORMAT WAKTU DAN TANGGAL BERHASIL!");
