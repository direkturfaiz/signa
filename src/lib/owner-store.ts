import { useSyncExternalStore } from "react";
import type { OwnerPeriodFilter } from "@/lib/owner";

export type OwnerUser = {
  id_user: string;
  email: string;
  nama_lengkap: string;
  role: string;
  barbershopName: string;
  no_hp?: string;
  alamat?: string;
  jam_buka?: string;
  jam_tutup?: string;
  no_hp_barbershop?: string;
};

export type OwnerState = {
  isLoggedIn: boolean;
  user: OwnerUser;
  activePeriod: OwnerPeriodFilter;
  searchKeyword: string;
};

const DEFAULT_OWNER_USER: OwnerUser = {
  id_user: "owner-system-id",
  email: "owner@barberin.test",
  nama_lengkap: "Owner Barbershop",
  role: "owner",
  barbershopName: "BARBERIN Barbershop",
  no_hp: "0812-3456-7890",
  alamat: "Jl. Jenderal Soedirman No. 123, Purbalingga",
  jam_buka: "08:00",
  jam_tutup: "21:00",
  no_hp_barbershop: "0812-3456-7890",
};

const STORAGE_KEY = "barberin_owner_state_v1";

function loadInitialState(): OwnerState {
  if (typeof window === "undefined") {
    return {
      isLoggedIn: true,
      user: DEFAULT_OWNER_USER,
      activePeriod: "today",
      searchKeyword: "",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        isLoggedIn: parsed.isLoggedIn ?? true,
        user: {
          ...DEFAULT_OWNER_USER,
          ...(parsed.user || {}),
        },
        activePeriod: parsed.activePeriod ?? "today",
        searchKeyword: "",
      };
    }
  } catch {
    // fallback
  }

  return {
    isLoggedIn: true,
    user: DEFAULT_OWNER_USER,
    activePeriod: "today",
    searchKeyword: "",
  };
}

let currentState: OwnerState = loadInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch {}
  }
  listeners.forEach((listener) => listener());
}

export const ownerActions = {
  login: (user: Partial<OwnerUser>) => {
    currentState = {
      ...currentState,
      isLoggedIn: true,
      user: {
        ...DEFAULT_OWNER_USER,
        ...user,
      },
    };
    emitChange();
  },

  updateUser: (user: Partial<OwnerUser>) => {
    currentState = {
      ...currentState,
      user: {
        ...currentState.user,
        ...user,
      },
    };
    emitChange();
  },

  logout: () => {
    currentState = {
      ...currentState,
      isLoggedIn: false,
    };
    emitChange();
  },

  setPeriod: (period: OwnerPeriodFilter) => {
    currentState = {
      ...currentState,
      activePeriod: period,
    };
    emitChange();
  },

  setSearchKeyword: (searchKeyword: string) => {
    currentState = {
      ...currentState,
      searchKeyword,
    };
    emitChange();
  },
};

export function useOwner(): OwnerState {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => currentState,
    () => ({
      isLoggedIn: true,
      user: DEFAULT_OWNER_USER,
      activePeriod: "today",
      searchKeyword: "",
    }),
  );
}
