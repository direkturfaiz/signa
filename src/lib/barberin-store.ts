import { useSyncExternalStore } from "react";

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type CartItem = {
  service: Service;
  quantity: number;
};

export type CapsterStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

export type Capster = {
  id: string;
  name: string;
  role: string;
  status: CapsterStatus;
};

export const CAPSTERS: Capster[] = [
  { id: "CAP001", name: "Budi", role: "Senior Barber", status: "AVAILABLE" },
  { id: "CAP002", name: "Andi", role: "Barber", status: "AVAILABLE" },
  { id: "CAP003", name: "Rizky", role: "Barber", status: "BUSY" },
  { id: "CAP004", name: "Dimas", role: "Barber", status: "OFFLINE" },
];

export const CAPSTER_STATUS_LABEL: Record<CapsterStatus, string> = {
  AVAILABLE: "Tersedia",
  BUSY: "Sedang Melayani",
  OFFLINE: "Tidak Tersedia",
};

export type PaymentMethodId = "tunai" | "qris" | "transfer";

export type TransactionStatus = "IDLE" | "PENDING" | "WAITING_CONFIRMATION" | "SUCCESS";
export type ServiceExecutionStatus =
  | "MENUNGGU"
  | "DIKERJAKAN"
  | "HAMPIR_SELESAI"
  | "DISELESAIKAN";
export type PaymentConfirmationStatus = "MENUNGGU" | "DIKONFIRMASI";

export type ReceiptData = {
  transactionId: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethodId;
  capster: Capster | null;
  status: "Berhasil";
};

export const SERVICES: Service[] = [
  {
    id: "haircut",
    name: "Haircut / Potong Rambut",
    description: "Potong rambut rapi oleh capster berpengalaman.",
    price: 30000,
  },
  {
    id: "hair-wash",
    name: "Hair Wash / Keramas",
    description: "Cuci rambut dengan shampo premium dan pijat kepala.",
    price: 20000,
  },
  {
    id: "shaving",
    name: "Shaving / Cukur Kumis & Jenggot",
    description: "Merapikan kumis dan jenggot dengan pisau steril.",
    price: 15000,
  },
];

export const PAYMENT_METHODS: { id: PaymentMethodId; name: string; description: string }[] = [
  { id: "tunai", name: "Tunai", description: "Bayar langsung di kasir barbershop." },
  { id: "qris", name: "QRIS", description: "Scan kode QRIS dari aplikasi pembayaran Anda." },
  { id: "transfer", name: "Transfer Bank", description: "Transfer ke rekening barbershop." },
];

export function paymentMethodName(id: PaymentMethodId | null): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.name ?? "-";
}

export type BarberinState = {
  cartItems: CartItem[];
  selectedCapster: Capster | null;
  customerName: string;
  customerId: string | null;
  paymentMethod: PaymentMethodId | null;
  transactionId: string | null;
  transactionStatus: TransactionStatus;
  serviceExecutionStatus: ServiceExecutionStatus;
  paymentConfirmationStatus: PaymentConfirmationStatus;
  receiptData: ReceiptData | null;
};

const initialState: BarberinState = {
  cartItems: [],
  selectedCapster: null,
  customerName: "",
  customerId: null,
  paymentMethod: null,
  transactionId: null,
  transactionStatus: "IDLE",
  serviceExecutionStatus: "MENUNGGU",
  paymentConfirmationStatus: "MENUNGGU",
  receiptData: null,
};

const STORAGE_KEY = "barberin-customer-state";

let state: BarberinState = initialState;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

let hydrated = false;
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...initialState, ...(JSON.parse(raw) as BarberinState) };
  } catch {
    /* ignore */
  }
}

function setState(patch: Partial<BarberinState>) {
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

export function useBarberin(): BarberinState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initialState,
  );
}

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.service.price * i.quantity, 0);

export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.quantity, 0);

export const actions = {
  addService(service: Service) {
    const existing = state.cartItems.find((i) => i.service.id === service.id);
    if (existing) {
      actions.setQuantity(service.id, existing.quantity + 1);
      return;
    }
    setState({ cartItems: [...state.cartItems, { service, quantity: 1 }] });
  },
  removeService(serviceId: string) {
    setState({ cartItems: state.cartItems.filter((i) => i.service.id !== serviceId) });
  },
  toggleService(service: Service) {
    const exists = state.cartItems.some((i) => i.service.id === service.id);
    if (exists) actions.removeService(service.id);
    else actions.addService(service);
  },
  setQuantity(serviceId: string, quantity: number) {
    if (quantity < 1) {
      actions.removeService(serviceId);
      return;
    }
    setState({
      cartItems: state.cartItems.map((i) =>
        i.service.id === serviceId ? { ...i, quantity } : i,
      ),
    });
  },
  setCapster(capster: Capster) {
    setState({ selectedCapster: capster });
  },
  setCustomer(name: string, customerId: string) {
    setState({ customerName: name, customerId });
  },
  setPaymentMethod(method: PaymentMethodId) {
    setState({ paymentMethod: method });
  },
  createTransaction(transactionId: string) {
    setState({
      transactionId,
      transactionStatus: "PENDING",
      serviceExecutionStatus: "MENUNGGU",
      paymentConfirmationStatus: "MENUNGGU",
    });
  },
  setServiceExecutionStatus(status: ServiceExecutionStatus) {
    setState({ serviceExecutionStatus: status });
  },
  startWaitingConfirmation() {
    setState({ transactionStatus: "WAITING_CONFIRMATION" });
  },
  confirmPayment() {
    const receiptData: ReceiptData = {
      transactionId: state.transactionId ?? generateTransactionId(),
      customerId: state.customerId ?? "-",
      customerName: state.customerName,
      createdAt: new Date().toISOString(),
      items: state.cartItems,
      total: cartTotal(state.cartItems),
      paymentMethod: state.paymentMethod ?? "tunai",
      capster: state.selectedCapster,
      status: "Berhasil",
    };
    setState({
      transactionStatus: "SUCCESS",
      paymentConfirmationStatus: "DIKONFIRMASI",
      receiptData,
    });
  },
  reset() {
    state = { ...initialState };
    persist();
    listeners.forEach((l) => l());
  },
};

function seq(): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return String(n);
}

function ymd(): string {
  const d = new Date();
  return (
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0")
  );
}

export function generateCustomerId(): string {
  return `PLG${ymd()}${seq()}`;
}

export function generateTransactionId(): string {
  return `TRX${ymd()}${seq()}`;
}
