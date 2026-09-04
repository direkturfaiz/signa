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
  selectedServices: CapsterService[];
  customerName: string;
  customerPhone: string;
  notes: string;
  paymentMethod: PaymentMethod | null;
  cashReceived: number;
  status: "DRAFT";
};

export type CapsterState = {
  isLoggedIn: boolean;
  userId: string | null;
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

export const EMPTY_METRICS: DashboardMetrics = {
  totalTransaksi: 0,
  deltaTransaksi: "Hari ini",
  totalPendapatan: 0,
  deltaPendapatan: "Hari ini",
  totalLayanan: 0,
  deltaLayanan: "Hari ini",
  capsterAktif: 0,
  deltaCapster: "Aktif",
  statusLayanan: {
    selesai: 0,
    sedangDikerjakan: 0,
    menunggu: 0,
    dibatalkan: 0,
  },
  ringkasanHariIni: {
    totalPendapatan: 0,
    totalTransaksi: 0,
    totalLayanan: 0,
    selesai: 0,
    belumSelesai: 0,
  },
};

const INITIAL_METRICS: DashboardMetrics = EMPTY_METRICS;

const INITIAL_TRANSACTIONS: CapsterTransaction[] = [];

const initialCapsterState: CapsterState = {
  isLoggedIn: true,
  userId: "f6c60035-fbc2-4e17-9fc2-015e7f478b94",
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
    selectedServices: [],
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
  login(
    payload:
      | string
      | {
          id?: string;
          userId?: string;
          name: string;
          role?: string;
          barbershopId?: string;
          shiftId?: string;
        },
  ) {
    if (typeof payload === "string") {
      setState({
        isLoggedIn: true,
        capsterName: payload,
        dashboardMetrics: EMPTY_METRICS,
      });
    } else {
      const isSwitchingCapster =
        Boolean(payload.id && state.capsterId && payload.id !== state.capsterId);
      setState({
        isLoggedIn: true,
        capsterName: payload.name,
        capsterRole: payload.role ?? state.capsterRole,
        capsterId: payload.id ?? state.capsterId,
        userId: payload.userId ?? state.userId,
        barbershopId: payload.barbershopId ?? state.barbershopId,
        shiftId: payload.shiftId ?? (isSwitchingCapster ? null : state.shiftId),
        dashboardMetrics: isSwitchingCapster ? EMPTY_METRICS : state.dashboardMetrics,
      });
    }
  },

  logout() {
    setState({
      isLoggedIn: false,
      capsterId: null,
      userId: null,
      shiftId: null,
      capsterName: "",
      dashboardMetrics: EMPTY_METRICS,
      transactions: [],
    });
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
        selectedServices: [],
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

  toggleManualService(serviceOrId: string | CapsterService) {
    const serviceId = typeof serviceOrId === "string" ? serviceOrId : serviceOrId.id;
    const currentIds = state.manualDraft.selectedServiceIds;
    const currentServices = state.manualDraft.selectedServices ?? [];
    const exists = currentIds.includes(serviceId);

    const updatedIds = exists
      ? currentIds.filter((id) => id !== serviceId)
      : [...currentIds, serviceId];

    let updatedServices: CapsterService[];
    if (exists) {
      updatedServices = currentServices.filter((s) => s.id !== serviceId);
    } else {
      if (typeof serviceOrId !== "string") {
        updatedServices = [...currentServices, serviceOrId];
      } else {
        const found = CAPSTER_SERVICES.find((s) => s.id === serviceId);
        updatedServices = found ? [...currentServices, found] : currentServices;
      }
    }

    setState({
      manualDraft: {
        ...state.manualDraft,
        selectedServiceIds: updatedIds,
        selectedServices: updatedServices,
      },
    });
  },

  setSelectedServices(services: CapsterService[]) {
    setState({
      manualDraft: {
        ...state.manualDraft,
        selectedServices: services,
        selectedServiceIds: services.map((s) => s.id),
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
        selectedServices: [],
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
    const selectedServices =
      state.manualDraft.selectedServices && state.manualDraft.selectedServices.length > 0
        ? state.manualDraft.selectedServices
        : state.manualDraft.selectedServiceIds
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
