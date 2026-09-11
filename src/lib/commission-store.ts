import { useSyncExternalStore } from "react";
import { getIndonesianMonthYear } from "@/lib/format";
import type { OwnerCapsterItem } from "@/lib/capsters";
import type { LiveSalarySummary } from "@/lib/salary";

export type CapsterCommissionItem = {
  id: string;
  capsterId: string;
  name: string;
  noPegawai: string;
  avatarLetter: string;
  period: string; // e.g. "Mei 2025"
  transactionCount: number;
  serviceRevenue: number;
  commissionPercentage: number | null; // null if Belum Diatur
  statusCommission: "Diatur" | "Belum Diatur";
  totalCommission: number;
  paymentStatus: "Belum Dibayar" | "Sudah Dibayar" | "Diproses" | "Belum Diatur";
};

export type CommissionPaymentHistory = {
  id: string;
  paymentDate: string; // e.g. "15 Mei 2025 14:30"
  capsterName: string;
  capsterId: string;
  noPegawai: string;
  period: string; // e.g. "Mei 2025"
  serviceRevenue: number;
  commissionPercentage: number;
  commissionAmount: number;
  paidBy: string; // e.g. "Owner"
  status: "Sudah Dibayar";
  notes?: string;
};

export type CapsterBaseTransaction = {
  id: string;
  transactionNumber: string; // e.g. "TRX-001"
  dateTime: string; // e.g. "20 Mei 2025 10:24"
  customerName: string;
  serviceName: string;
  amount: number;
  paymentMethod: "Tunai" | "QRIS" | "Transfer";
  status: "Berhasil" | "Dibatalkan";
  paymentStatus: "Lunas" | "Batal";
  countedInCommission: boolean;
};

export type CommissionStoreState = {
  capsters: CapsterCommissionItem[];
  paymentHistory: CommissionPaymentHistory[];
  baseTransactions: Record<string, CapsterBaseTransaction[]>;
};

// Use v5 to smoothly integrate live database transactions

export const CURRENT_COMMISSION_PERIOD = getIndonesianMonthYear(0);
export const PREV_COMMISSION_PERIOD_1 = getIndonesianMonthYear(-1);
export const PREV_COMMISSION_PERIOD_2 = getIndonesianMonthYear(-2);

const STORAGE_KEY = "barberin_commission_store_v6";

// 3 Capsters matching database Manajemen Akun Capster: Budi, Andi, Singgih
const DEFAULT_CAPSTERS: CapsterCommissionItem[] = [
  {
    id: "cps-budi",
    capsterId: "cps-budi",
    name: "Budi",
    noPegawai: "CAP-001",
    avatarLetter: "B",
    period: CURRENT_COMMISSION_PERIOD,
    transactionCount: 12,
    serviceRevenue: 600000,
    commissionPercentage: 15,
    statusCommission: "Diatur",
    totalCommission: 90000,
    paymentStatus: "Belum Dibayar",
  },
  {
    id: "cps-andi",
    capsterId: "cps-andi",
    name: "Andi",
    noPegawai: "CAP-002",
    avatarLetter: "A",
    period: CURRENT_COMMISSION_PERIOD,
    transactionCount: 8,
    serviceRevenue: 440000,
    commissionPercentage: 15,
    statusCommission: "Diatur",
    totalCommission: 66000,
    paymentStatus: "Sudah Dibayar",
  },
  {
    id: "cps-singgih",
    capsterId: "cps-singgih",
    name: "Singgih",
    noPegawai: "CAP-003",
    avatarLetter: "S",
    period: CURRENT_COMMISSION_PERIOD,
    transactionCount: 5,
    serviceRevenue: 250000,
    commissionPercentage: 10,
    statusCommission: "Diatur",
    totalCommission: 25000,
    paymentStatus: "Belum Dibayar",
  },
];

const DEFAULT_PAYMENT_HISTORY: CommissionPaymentHistory[] = [
  {
    id: "PAY-001",
    paymentDate: `15 ${PREV_COMMISSION_PERIOD_1} 14:30`,
    capsterName: "Andi",
    capsterId: "cps-andi",
    noPegawai: "CAP-002",
    period: CURRENT_COMMISSION_PERIOD,
    serviceRevenue: 440000,
    commissionPercentage: 15,
    commissionAmount: 66000,
    paidBy: "Owner",
    status: "Sudah Dibayar",
    notes: `Pembayaran komisi periode ${PREV_COMMISSION_PERIOD_1} termin 1`,
  },
  {
    id: "PAY-002",
    paymentDate: `10 ${PREV_COMMISSION_PERIOD_2} 10:20`,
    capsterName: "Budi",
    capsterId: "cps-budi",
    noPegawai: "CAP-001",
    period: PREV_COMMISSION_PERIOD_2,
    serviceRevenue: 520000,
    commissionPercentage: 15,
    commissionAmount: 78000,
    paidBy: "Owner",
    status: "Sudah Dibayar",
    notes: `Pembayaran komisi bulanan ${PREV_COMMISSION_PERIOD_2}`,
  },
  {
    id: "PAY-003",
    paymentDate: `10 ${PREV_COMMISSION_PERIOD_2} 10:15`,
    capsterName: "Singgih",
    capsterId: "cps-singgih",
    noPegawai: "CAP-003",
    period: PREV_COMMISSION_PERIOD_2,
    serviceRevenue: 350000,
    commissionPercentage: 10,
    commissionAmount: 35000,
    paidBy: "Owner",
    status: "Sudah Dibayar",
    notes: `Pembayaran komisi bulanan ${PREV_COMMISSION_PERIOD_2}`,
  },
];

const BUDI_TRANSACTIONS: CapsterBaseTransaction[] = [
  {
    id: "t1",
    transactionNumber: "TRX-001",
    dateTime: `20 ${CURRENT_COMMISSION_PERIOD} 10:24`,
    customerName: "Andi",
    serviceName: "Gentleman Cut",
    amount: 40000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t2",
    transactionNumber: "TRX-004",
    dateTime: `20 ${CURRENT_COMMISSION_PERIOD} 08:12`,
    customerName: "Citra",
    serviceName: "Crew Cut",
    amount: 40000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t3",
    transactionNumber: "TRX-008",
    dateTime: `19 ${CURRENT_COMMISSION_PERIOD} 14:10`,
    customerName: "Hadi",
    serviceName: "Hair Wash",
    amount: 30000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t4",
    transactionNumber: "TRX-010",
    dateTime: `18 ${CURRENT_COMMISSION_PERIOD} 16:30`,
    customerName: "Rian",
    serviceName: "Fade Cut",
    amount: 50000,
    paymentMethod: "Transfer",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t5",
    transactionNumber: "TRX-012",
    dateTime: `17 ${CURRENT_COMMISSION_PERIOD} 11:15`,
    customerName: "Eko",
    serviceName: "Hair Coloring",
    amount: 150000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t6",
    transactionNumber: "TRX-014",
    dateTime: `16 ${CURRENT_COMMISSION_PERIOD} 13:40`,
    customerName: "Reza",
    serviceName: "Gentleman Cut",
    amount: 40000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t7",
    transactionNumber: "TRX-018",
    dateTime: `15 ${CURRENT_COMMISSION_PERIOD} 15:20`,
    customerName: "Bayu",
    serviceName: "Beard Trim",
    amount: 30000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t8",
    transactionNumber: "TRX-020",
    dateTime: `14 ${CURRENT_COMMISSION_PERIOD} 17:00`,
    customerName: "Farhan",
    serviceName: "Hair Styling",
    amount: 40000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t9",
    transactionNumber: "TRX-023",
    dateTime: `12 ${CURRENT_COMMISSION_PERIOD} 11:30`,
    customerName: "Dani",
    serviceName: "Gentleman Cut",
    amount: 40000,
    paymentMethod: "Transfer",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t10",
    transactionNumber: "TRX-025",
    dateTime: `10 ${CURRENT_COMMISSION_PERIOD} 14:15`,
    customerName: "Irfan",
    serviceName: "Hair Wash & Massage",
    amount: 50000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t11",
    transactionNumber: "TRX-028",
    dateTime: `08 ${CURRENT_COMMISSION_PERIOD} 16:45`,
    customerName: "Gilang",
    serviceName: "Crew Cut",
    amount: 40000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t12",
    transactionNumber: "TRX-030",
    dateTime: `05 ${CURRENT_COMMISSION_PERIOD} 10:00`,
    customerName: "Yoga",
    serviceName: "Gentleman Cut",
    amount: 50000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "t13_cancelled",
    transactionNumber: "TRX-031",
    dateTime: `04 ${CURRENT_COMMISSION_PERIOD} 11:10`,
    customerName: "Doni",
    serviceName: "Beard Trim",
    amount: 30000,
    paymentMethod: "Tunai",
    status: "Dibatalkan",
    paymentStatus: "Batal",
    countedInCommission: false,
  },
];

const ANDI_TRANSACTIONS: CapsterBaseTransaction[] = [
  {
    id: "r1",
    transactionNumber: "TRX-002",
    dateTime: `20 ${CURRENT_COMMISSION_PERIOD} 11:15`,
    customerName: "Teguh",
    serviceName: "Gentleman Cut",
    amount: 50000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "r2",
    transactionNumber: "TRX-005",
    dateTime: `19 ${CURRENT_COMMISSION_PERIOD} 16:20`,
    customerName: "Agus",
    serviceName: "Hair Coloring",
    amount: 150000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "r3",
    transactionNumber: "TRX-009",
    dateTime: `18 ${CURRENT_COMMISSION_PERIOD} 13:10`,
    customerName: "Dedi",
    serviceName: "Fade Cut",
    amount: 50000,
    paymentMethod: "Transfer",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "r4",
    transactionNumber: "TRX-011",
    dateTime: `17 ${CURRENT_COMMISSION_PERIOD} 15:40`,
    customerName: "Fajar",
    serviceName: "Gentleman Cut",
    amount: 40000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "r5",
    transactionNumber: "TRX-015",
    dateTime: `16 ${CURRENT_COMMISSION_PERIOD} 18:00`,
    customerName: "Lukman",
    serviceName: "Crew Cut",
    amount: 40000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "r6",
    transactionNumber: "TRX-017",
    dateTime: `15 ${CURRENT_COMMISSION_PERIOD} 14:10`,
    customerName: "Arya",
    serviceName: "Hair Wash",
    amount: 30000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "r7",
    transactionNumber: "TRX-021",
    dateTime: `14 ${CURRENT_COMMISSION_PERIOD} 10:30`,
    customerName: "Galih",
    serviceName: "Beard Trim",
    amount: 30000,
    paymentMethod: "Transfer",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "r8",
    transactionNumber: "TRX-024",
    dateTime: `13 ${CURRENT_COMMISSION_PERIOD} 16:50`,
    customerName: "Rian",
    serviceName: "Gentleman Cut",
    amount: 50000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
];

const SINGGIH_TRANSACTIONS: CapsterBaseTransaction[] = [
  {
    id: "s1",
    transactionNumber: "TRX-003",
    dateTime: `19 ${CURRENT_COMMISSION_PERIOD} 09:30`,
    customerName: "Wahyu",
    serviceName: "Gentleman Cut",
    amount: 50000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "s2",
    transactionNumber: "TRX-006",
    dateTime: `18 ${CURRENT_COMMISSION_PERIOD} 15:00`,
    customerName: "Bambang",
    serviceName: "Hair Wash",
    amount: 30000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "s3",
    transactionNumber: "TRX-013",
    dateTime: `17 ${CURRENT_COMMISSION_PERIOD} 11:45`,
    customerName: "Surya",
    serviceName: "Fade Cut",
    amount: 50000,
    paymentMethod: "Transfer",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "s4",
    transactionNumber: "TRX-019",
    dateTime: `16 ${CURRENT_COMMISSION_PERIOD} 16:15`,
    customerName: "Kurnia",
    serviceName: "Beard Trim",
    amount: 40000,
    paymentMethod: "Tunai",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
  {
    id: "s5",
    transactionNumber: "TRX-022",
    dateTime: `15 ${CURRENT_COMMISSION_PERIOD} 13:20`,
    customerName: "Ilham",
    serviceName: "Gentleman Cut",
    amount: 80000,
    paymentMethod: "QRIS",
    status: "Berhasil",
    paymentStatus: "Lunas",
    countedInCommission: true,
  },
];

const DEFAULT_BASE_TRANSACTIONS: Record<string, CapsterBaseTransaction[]> = {
  "cps-budi": BUDI_TRANSACTIONS,
  "cps-andi": ANDI_TRANSACTIONS,
  "cps-singgih": SINGGIH_TRANSACTIONS,
};

function loadInitialState(): CommissionStoreState {
  if (typeof window === "undefined") {
    return {
      capsters: DEFAULT_CAPSTERS,
      paymentHistory: DEFAULT_PAYMENT_HISTORY,
      baseTransactions: DEFAULT_BASE_TRANSACTIONS,
    };
  }

  try {
    localStorage.removeItem("barberin_commission_store_v5");
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.capsters) && parsed.capsters.length > 0) {
        const migratedCapsters = parsed.capsters.map((c: CapsterCommissionItem) => ({
          ...c,
          period: c.period?.includes("2025") ? CURRENT_COMMISSION_PERIOD : c.period || CURRENT_COMMISSION_PERIOD,
        }));
        const migratedHistory = (Array.isArray(parsed.paymentHistory) ? parsed.paymentHistory : DEFAULT_PAYMENT_HISTORY).map((h: CommissionPaymentHistory) => ({
          ...h,
          period: h.period?.includes("2025")
            ? h.period.includes("Mei")
              ? PREV_COMMISSION_PERIOD_1
              : PREV_COMMISSION_PERIOD_2
            : h.period,
          paymentDate: h.paymentDate?.includes("2025")
            ? h.paymentDate.replace(/2025/g, String(new Date().getFullYear()))
            : h.paymentDate,
        }));
        return {
          capsters: migratedCapsters,
          paymentHistory: migratedHistory,
          baseTransactions: parsed.baseTransactions || DEFAULT_BASE_TRANSACTIONS,
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    capsters: DEFAULT_CAPSTERS,
    paymentHistory: DEFAULT_PAYMENT_HISTORY,
    baseTransactions: DEFAULT_BASE_TRANSACTIONS,
  };
}

let currentState: CommissionStoreState = loadInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.warn("Gagal menyimpan commission store ke localStorage:", e);
    }
  }
  listeners.forEach((listener) => listener());
}

export const commissionActions = {
  // Sync with live database salary metrics (omset, transaction counts, period)
  syncWithLiveSalaryData: (liveData: LiveSalarySummary) => {
    if (!liveData || !liveData.capsters || liveData.capsters.length === 0) return;

    const existingMap = new Map<string, CapsterCommissionItem>();
    currentState.capsters.forEach((c) => {
      existingMap.set(c.name.toLowerCase(), c);
      existingMap.set(c.noPegawai.toLowerCase(), c);
      existingMap.set(c.capsterId.toLowerCase(), c);
      existingMap.set(c.id.toLowerCase(), c);
    });

    const updated: CapsterCommissionItem[] = liveData.capsters.map((lc) => {
      const found =
        existingMap.get(lc.name.toLowerCase()) ||
        existingMap.get(lc.noPegawai.toLowerCase()) ||
        existingMap.get(lc.capsterId.toLowerCase()) ||
        existingMap.get(lc.id.toLowerCase());

      const percent = found && found.commissionPercentage !== null
        ? found.commissionPercentage
        : (lc.noPegawai === "CAP-003" ? 10 : 15);

      const revenue = lc.serviceRevenue;
      const trxCount = lc.transactionCount;
      const totalCommission = percent !== null ? Math.round(revenue * (percent / 100)) : 0;

      return {
        id: lc.id,
        capsterId: lc.capsterId,
        name: lc.name,
        noPegawai: lc.noPegawai,
        avatarLetter: lc.avatarLetter,
        period: lc.period || liveData.periodLabel || "Bulan Ini",
        transactionCount: trxCount,
        serviceRevenue: revenue,
        commissionPercentage: percent,
        statusCommission: percent !== null ? "Diatur" : "Belum Diatur",
        totalCommission,
        paymentStatus:
          found && found.paymentStatus
            ? found.paymentStatus
            : "Belum Dibayar",
      };
    });

    currentState = {
      ...currentState,
      capsters: updated,
    };
    emitChange();
  },

  // Set live base transactions for a specific capster (detail view)
  setLiveBaseTransactions: (
    capsterId: string,
    transactions: CapsterBaseTransaction[],
  ) => {
    currentState = {
      ...currentState,
      baseTransactions: {
        ...currentState.baseTransactions,
        [capsterId]: transactions,
      },
    };
    emitChange();
  },

  // Sync with actual capsters from DB (Budi, Andi, Singgih, etc.)
  syncWithDatabaseCapsters: (dbCapsters: OwnerCapsterItem[]) => {
    if (!dbCapsters || dbCapsters.length === 0) return;

    const existingMap = new Map<string, CapsterCommissionItem>();
    currentState.capsters.forEach((c) => {
      existingMap.set(c.name.toLowerCase(), c);
      existingMap.set(c.noPegawai.toLowerCase(), c);
      existingMap.set(c.capsterId.toLowerCase(), c);
    });

    const updated: CapsterCommissionItem[] = dbCapsters.map((dc, idx) => {
      const found =
        existingMap.get(dc.name.toLowerCase()) ||
        (dc.no_pegawai ? existingMap.get(dc.no_pegawai.toLowerCase()) : null) ||
        existingMap.get(dc.id_capster.toLowerCase());

      const percent = found ? found.commissionPercentage : 15;
      const revenue = dc.totalRevenue > 0 ? dc.totalRevenue : found ? found.serviceRevenue : (12 - idx * 3) * 50000;
      const trxCount = dc.totalTransactions > 0 ? dc.totalTransactions : found ? found.transactionCount : (12 - idx * 4);
      const totalCommission = percent !== null ? Math.round(revenue * (percent / 100)) : 0;

      return {
        id: dc.id_capster,
        capsterId: dc.id_capster,
        name: dc.name,
        noPegawai: dc.no_pegawai || `CAP-00${idx + 1}`,
        avatarLetter: dc.name.charAt(0).toUpperCase() || "C",
        period: CURRENT_COMMISSION_PERIOD,
        transactionCount: trxCount,
        serviceRevenue: revenue,
        commissionPercentage: percent,
        statusCommission: percent !== null ? "Diatur" : "Belum Diatur",
        totalCommission,
        paymentStatus:
          found && found.paymentStatus !== "Diproses"
            ? found.paymentStatus
            : idx === 1
              ? "Sudah Dibayar"
              : "Belum Dibayar",
      };
    });

    currentState = {
      ...currentState,
      capsters: updated,
    };
    emitChange();
  },

  // Update payment status for a capster (e.g. Belum Dibayar, Diproses, Sudah Dibayar)
  setPaymentStatus: (
    capsterId: string,
    status: "Belum Dibayar" | "Sudah Dibayar" | "Diproses" | "Belum Diatur",
  ) => {
    currentState = {
      ...currentState,
      capsters: currentState.capsters.map((c) => {
        if (
          c.capsterId === capsterId ||
          c.id === capsterId ||
          c.noPegawai === capsterId ||
          c.name.toLowerCase() === capsterId.toLowerCase()
        ) {
          return {
            ...c,
            paymentStatus: status,
          };
        }
        return c;
      }),
    };
    emitChange();
  },

  // Update commission percentage for a capster
  setCommissionPercentage: (capsterId: string, percentage: number) => {
    const validPercent = Math.max(0, Math.min(100, Math.round(percentage)));

    currentState = {
      ...currentState,
      capsters: currentState.capsters.map((c) => {
        if (
          c.capsterId === capsterId ||
          c.id === capsterId ||
          c.noPegawai === capsterId ||
          c.name.toLowerCase() === capsterId.toLowerCase()
        ) {
          const newTotal = Math.round(c.serviceRevenue * (validPercent / 100));
          const newStatusPayment =
            c.paymentStatus === "Belum Diatur" ? "Belum Dibayar" : c.paymentStatus;

          return {
            ...c,
            commissionPercentage: validPercent,
            statusCommission: "Diatur",
            totalCommission: newTotal,
            paymentStatus: newStatusPayment,
          };
        }
        return c;
      }),
    };
    emitChange();
  },

  // Pay commission to a capster
  payCommission: (
    capsterId: string,
    paymentDateStr?: string,
    notes?: string,
  ) => {
    const capster = currentState.capsters.find(
      (c) =>
        c.capsterId === capsterId ||
        c.id === capsterId ||
        c.noPegawai === capsterId ||
        c.name.toLowerCase() === capsterId.toLowerCase(),
    );

    if (!capster) return false;

    const now = new Date();
    const defaultDateStr =
      paymentDateStr ||
      `${now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      })} ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })}`;

    const newPaymentId = `PAY-${String(currentState.paymentHistory.length + 1).padStart(3, "0")}`;

    const newHistoryItem: CommissionPaymentHistory = {
      id: newPaymentId,
      paymentDate: defaultDateStr,
      capsterName: capster.name,
      capsterId: capster.capsterId,
      noPegawai: capster.noPegawai,
      period: capster.period,
      serviceRevenue: capster.serviceRevenue,
      commissionPercentage: capster.commissionPercentage || 0,
      commissionAmount: capster.totalCommission,
      paidBy: "Owner",
      status: "Sudah Dibayar",
      notes: notes || "Pembayaran komisi capster",
    };

    currentState = {
      ...currentState,
      capsters: currentState.capsters.map((c) => {
        if (
          c.capsterId === capsterId ||
          c.id === capsterId ||
          c.noPegawai === capsterId ||
          c.name.toLowerCase() === capsterId.toLowerCase()
        ) {
          return {
            ...c,
            paymentStatus: "Sudah Dibayar",
          };
        }
        return c;
      }),
      paymentHistory: [newHistoryItem, ...currentState.paymentHistory],
    };

    emitChange();
    return true;
  },

  // Reset store back to defaults
  resetToDefaults: () => {
    currentState = {
      capsters: DEFAULT_CAPSTERS,
      paymentHistory: DEFAULT_PAYMENT_HISTORY,
      baseTransactions: DEFAULT_BASE_TRANSACTIONS,
    };
    emitChange();
  },
};

const SERVER_SNAPSHOT: CommissionStoreState = {
  capsters: DEFAULT_CAPSTERS,
  paymentHistory: DEFAULT_PAYMENT_HISTORY,
  baseTransactions: DEFAULT_BASE_TRANSACTIONS,
};

export function useCommissionStore(): CommissionStoreState {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => currentState,
    () => SERVER_SNAPSHOT,
  );
}
