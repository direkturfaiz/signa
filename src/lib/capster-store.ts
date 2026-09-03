import { useSyncExternalStore } from "react";
import { CAPSTERS, type Capster } from "@/lib/barberin-store";

export { CAPSTERS, type Capster };

export type CapsterService = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export const CAPSTER_SERVICES: CapsterService[] = [
  { id: "haircut", name: "Haircut", price: 30000, category: "Potong Rambut" },
  { id: "hair-wash", name: "Hair Wash", price: 20000, category: "Perawatan" },
  { id: "styling", name: "Styling", price: 25000, category: "Tata Rambut" },
  { id: "shaving", name: "Shaving", price: 15000, category: "Cukur" },
  { id: "hair-coloring", name: "Hair Coloring", price: 60000, category: "Pewarnaan" },
  { id: "beard-trim", name: "Beard Trim", price: 15000, category: "Cukur" },
  { id: "kids-haircut", name: "Kids Haircut", price: 25000, category: "Potong Rambut" },
];

export type TransactionStatus = "Selesai" | "Menunggu" | "Batal";
export type PaymentMethod = "tunai" | "qris" | "transfer";

export type CapsterTransaction = {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone?: string;
  notes?: string;
  items: { service: CapsterService; quantity: number }[];
  serviceNames: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  status: TransactionStatus;
  capsterId?: string;
  capsterName: string;
};

export type ShiftInfo = {
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  hasOtherCheckedIn: boolean;
  isShiftEnded: boolean;
};

export type DashboardMetrics = {
  totalTransaksi: number;
  deltaTransaksi: string;
  totalPendapatan: number;
  deltaPendapatan: string;
  totalLayanan: number;
  deltaLayanan: string;
  capsterAktif: number;
  deltaCapster: string;
  statusLayanan: {
    selesai: number;
    sedangDikerjakan: number;
    menunggu: number;
    dibatalkan: number;
  };
  ringkasanHariIni: {
    totalPendapatan: number;
    totalTransaksi: number;
    totalLayanan: number;
    selesai: number;
    belumSelesai: number;
  };
};

export type ManualTransactionDraft = {
  capsterId: string | null;
  capsterName: string;
  capsterRole: string;
  selectedServiceIds: string[];
  customerName: string;
  customerPhone: string;
  notes: string;
  paymentMethod: PaymentMethod | null;
  cashReceived: number;
  status: "DRAFT";
};

export type CapsterState = {
  isLoggedIn: boolean;
  capsterId: string | null;
  barbershopId: string | null;
  shiftId: string | null;
  capsterName: string;
  capsterRole: string;
  shiftInfo: ShiftInfo;
  dashboardMetrics: DashboardMetrics;
  transactions: CapsterTransaction[];
  manualDraft: ManualTransactionDraft;
  lastCreatedTransaction: CapsterTransaction | null;
};

const INITIAL_METRICS: DashboardMetrics = {
  totalTransaksi: 12,
  deltaTransaksi: "↑ 2 dari kemarin",
  totalPendapatan: 450000,
  deltaPendapatan: "↑ 15% dari kemarin",
  totalLayanan: 18,
  deltaLayanan: "↑ 3 dari kemarin",
  capsterAktif: 3,
  deltaCapster: "↑ 5% dari kemarin",
  statusLayanan: {
    selesai: 18,
    sedangDikerjakan: 6,
    menunggu: 12,
    dibatalkan: 2,
  },
  ringkasanHariIni: {
    totalPendapatan: 450000,
    totalTransaksi: 12,
    totalLayanan: 18,
    selesai: 10,
    belumSelesai: 2,
  },
};

const INITIAL_TRANSACTIONS: CapsterTransaction[] = [
  {
    id: "TRX-20260903-0001",
    date: "03 September 2026",
    time: "11:15",
    customerName: "Ricky Pratama",
    customerPhone: "0812-3456-7890",
    items: [{ service: CAPSTER_SERVICES[0]!, quantity: 1 }],
    serviceNames: "Haircut",
    subtotal: 30000,
    discount: 0,
    total: 30000,
    paymentMethod: "tunai",
    cashReceived: 50000,
    change: 20000,
    status: "Selesai",
    capsterId: "CAP001",
    capsterName: "Budi",
  },
  {
    id: "TRX-20260903-0002",
    date: "03 September 2026",
    time: "10:45",
    customerName: "Andi Pratama",
    customerPhone: "0821-9876-5432",
    items: [
      { service: CAPSTER_SERVICES[0]!, quantity: 1 },
      { service: CAPSTER_SERVICES[1]!, quantity: 1 },
    ],
    serviceNames: "Haircut + Hair Wash",
    subtotal: 50000,
    discount: 0,
    total: 50000,
    paymentMethod: "qris",
    status: "Selesai",
    capsterId: "CAP002",
    capsterName: "Andi",
  },
  {
    id: "TRX-20260903-0003",
    date: "03 September 2026",
    time: "09:45",
    customerName: "Dimas Saputra",
    customerPhone: "0857-1122-3344",
    items: [{ service: CAPSTER_SERVICES[2]!, quantity: 1 }],
    serviceNames: "Styling",
    subtotal: 25000,
    discount: 0,
    total: 25000,
    paymentMethod: "transfer",
    status: "Menunggu",
    capsterId: "CAP001",
    capsterName: "Budi",
  },
  {
    id: "TRX-20260903-0004",
    date: "03 September 2026",
    time: "09:20",
    customerName: "Suci S.",
    customerPhone: "0813-5566-7788",
    items: [{ service: CAPSTER_SERVICES[0]!, quantity: 1 }],
    serviceNames: "Haircut",
    subtotal: 30000,
    discount: 0,
    total: 30000,
    paymentMethod: "tunai",
    cashReceived: 30000,
    change: 0,
    status: "Selesai",
    capsterId: "CAP001",
    capsterName: "Budi",
  },
  {
    id: "TRX-20260903-0005",
    date: "03 September 2026",
    time: "08:50",
    customerName: "Budi Santoso",
    customerPhone: "0878-9900-1122",
    items: [{ service: CAPSTER_SERVICES[3]!, quantity: 1 }],
    serviceNames: "Shaving",
    subtotal: 15000,
    discount: 0,
    total: 15000,
    paymentMethod: "tunai",
    status: "Batal",
    capsterId: "CAP002",
    capsterName: "Andi",
  },
];

const initialCapsterState: CapsterState = {
  isLoggedIn: true,
  capsterId: "4bac18cd-d0c8-4933-a24b-2eacf56294ac",
  barbershopId: "d6c11b82-69d4-4778-9990-a0a18e436336",
  shiftId: "7d271050-f2b0-4851-aca0-d0fa3f548874",
  capsterName: "Budi",
  capsterRole: "Senior Barber",
  shiftInfo: {
    date: "03 September 2026",
    day: "Kamis",
    startTime: "08:00 WIB",
    endTime: "17:00 WIB",
    isCheckedIn: true,
    checkedInAt: "08:00 WIB",
    hasOtherCheckedIn: false,
    isShiftEnded: false,
  },
  dashboardMetrics: INITIAL_METRICS,
  transactions: INITIAL_TRANSACTIONS,
  manualDraft: {
    capsterId: "4bac18cd-d0c8-4933-a24b-2eacf56294ac",
    capsterName: "Budi",
    capsterRole: "Senior Barber",
    selectedServiceIds: [],
    customerName: "",
    customerPhone: "",
    notes: "",
    paymentMethod: "tunai",
    cashReceived: 0,
    status: "DRAFT",
  },
  lastCreatedTransaction: null,
};

const CAPSTER_STORAGE_KEY = "barberin-capster-state";

let state: CapsterState = initialCapsterState;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CAPSTER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

let hydrated = false;
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(CAPSTER_STORAGE_KEY);
    if (raw) state = { ...initialCapsterState, ...(JSON.parse(raw) as CapsterState) };
  } catch {
    /* ignore */
  }
}

function setState(patch: Partial<CapsterState>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}

export function useCapster(): CapsterState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initialCapsterState,
  );
}

export const capsterActions = {
  login(payload: string | { id?: string; name: string; role?: string; barbershopId?: string; shiftId?: string }) {
    if (typeof payload === "string") {
      setState({ isLoggedIn: true, capsterName: payload });
    } else {
      setState({
        isLoggedIn: true,
        capsterName: payload.name,
        capsterRole: payload.role ?? state.capsterRole,
        capsterId: payload.id ?? state.capsterId,
        barbershopId: payload.barbershopId ?? state.barbershopId,
        shiftId: payload.shiftId ?? state.shiftId,
      });
    }
  },

  logout() {
    setState({ isLoggedIn: false });
  },

  setDashboardMetrics(metrics: DashboardMetrics) {
    setState({ dashboardMetrics: metrics });
  },

  setTransactions(transactions: CapsterTransaction[]) {
    setState({ transactions });
  },

  setShiftId(shiftId: string | null) {
    setState({ shiftId });
  },

  checkIn(shiftId?: string) {
    setState({
      shiftId: shiftId ?? state.shiftId,
      shiftInfo: {
        ...state.shiftInfo,
        isCheckedIn: true,
        checkedInAt:
          new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        isShiftEnded: false,
      },
    });
  },

  endShift() {
    setState({
      shiftId: null,
      shiftInfo: {
        ...state.shiftInfo,
        isCheckedIn: false,
        isShiftEnded: true,
      },
    });
  },

  resetDailyData() {
    setState({
      shiftId: null,
      shiftInfo: {
        ...state.shiftInfo,
        isCheckedIn: false,
        isShiftEnded: false,
        checkedInAt: null,
      },
    });
  },

  initManualDraft() {
    setState({
      manualDraft: {
        capsterId: null,
        capsterName: "",
        capsterRole: "",
        selectedServiceIds: [],
        customerName: "",
        customerPhone: "",
        notes: "",
        paymentMethod: "tunai",
        cashReceived: 0,
        status: "DRAFT",
      },
    });
  },

  setManualCapster(capster: Capster) {
    setState({
      manualDraft: {
        ...state.manualDraft,
        capsterId: capster.id,
        capsterName: capster.name,
        capsterRole: capster.role,
      },
    });
  },

  toggleManualService(serviceId: string) {
    const current = state.manualDraft.selectedServiceIds;
    const exists = current.includes(serviceId);
    const updated = exists ? current.filter((id) => id !== serviceId) : [...current, serviceId];
    setState({
      manualDraft: {
        ...state.manualDraft,
        selectedServiceIds: updated,
      },
    });
  },

  setManualCustomerData(data: { name?: string; phone?: string; notes?: string }) {
    setState({
      manualDraft: {
        ...state.manualDraft,
        customerName: data.name ?? state.manualDraft.customerName,
        customerPhone: data.phone ?? state.manualDraft.customerPhone,
        notes: data.notes ?? state.manualDraft.notes,
      },
    });
  },

  setManualPaymentMethod(method: PaymentMethod) {
    setState({
      manualDraft: {
        ...state.manualDraft,
        paymentMethod: method,
      },
    });
  },

  setManualCashReceived(amount: number) {
    setState({
      manualDraft: {
        ...state.manualDraft,
        cashReceived: amount,
      },
    });
  },

  setLastCreatedTransaction(trx: CapsterTransaction) {
    setState({
      lastCreatedTransaction: trx,
      transactions: [trx, ...state.transactions.filter((t) => t.id !== trx.id)],
    });
  },

  clearManualDraft() {
    setState({
      manualDraft: {
        capsterId: null,
        capsterName: "",
        capsterRole: "",
        selectedServiceIds: [],
        customerName: "",
        customerPhone: "",
        notes: "",
        paymentMethod: "tunai",
        cashReceived: 0,
        status: "DRAFT",
      },
    });
  },

  commitManualTransaction(): CapsterTransaction {
    const selectedServices = state.manualDraft.selectedServiceIds
      .map((id) => CAPSTER_SERVICES.find((s) => s.id === id))
      .filter((s): s is CapsterService => Boolean(s));

    const total = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const seq = String(state.transactions.length + 1).padStart(4, "0");
    const trxId = `TRX-${ymd}-${seq}`;
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const items = selectedServices.map((service) => ({ service, quantity: 1 }));
    const serviceNames = selectedServices.map((s) => s.name).join(" + ");

    const cashReceived =
      state.manualDraft.paymentMethod === "tunai"
        ? state.manualDraft.cashReceived > 0
          ? state.manualDraft.cashReceived
          : total
        : total;
    const change = Math.max(0, cashReceived - total);

    const capsterName = state.manualDraft.capsterName || state.capsterName || "Budi";
    const capsterId = state.manualDraft.capsterId ?? "CAP001";

    const newTrx: CapsterTransaction = {
      id: trxId,
      date: state.shiftInfo.date,
      time: timeStr,
      customerName: state.manualDraft.customerName.trim() || "Pelanggan Umum",
      ...(state.manualDraft.customerPhone.trim()
        ? { customerPhone: state.manualDraft.customerPhone.trim() }
        : {}),
      ...(state.manualDraft.notes.trim() ? { notes: state.manualDraft.notes.trim() } : {}),
      items,
      serviceNames,
      subtotal: total,
      discount: 0,
      total,
      paymentMethod: state.manualDraft.paymentMethod ?? "tunai",
      cashReceived,
      change,
      status: "Selesai",
      capsterId,
      capsterName,
    };

    const updatedTransactions = [newTrx, ...state.transactions];

    const newMetrics: DashboardMetrics = {
      ...state.dashboardMetrics,
      totalTransaksi: state.dashboardMetrics.totalTransaksi + 1,
      totalPendapatan: state.dashboardMetrics.totalPendapatan + total,
      totalLayanan: state.dashboardMetrics.totalLayanan + selectedServices.length,
      statusLayanan: {
        ...state.dashboardMetrics.statusLayanan,
        selesai: state.dashboardMetrics.statusLayanan.selesai + 1,
      },
      ringkasanHariIni: {
        ...state.dashboardMetrics.ringkasanHariIni,
        totalTransaksi: state.dashboardMetrics.ringkasanHariIni.totalTransaksi + 1,
        totalPendapatan: state.dashboardMetrics.ringkasanHariIni.totalPendapatan + total,
        totalLayanan:
          state.dashboardMetrics.ringkasanHariIni.totalLayanan + selectedServices.length,
        selesai: state.dashboardMetrics.ringkasanHariIni.selesai + 1,
      },
    };

    setState({
      transactions: updatedTransactions,
      dashboardMetrics: newMetrics,
      lastCreatedTransaction: newTrx,
      manualDraft: {
        capsterId: null,
        capsterName: "",
        capsterRole: "",
        selectedServiceIds: [],
        customerName: "",
        customerPhone: "",
        notes: "",
        paymentMethod: "tunai",
        cashReceived: 0,
        status: "DRAFT",
      },
    });

    return newTrx;
  },
};
