import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, Phone, BadgeCheck, Clock, Plus } from "lucide-react";

import {
  OwnerSidebar,
  OwnerHeader,
  OwnerMobileHeader,
  OwnerBottomNav,
} from "@/components/owner/ui";
import { getCapsters, type CapsterView } from "@/lib/capsters";

export const Route = createFileRoute("/owner/capsters")({
  head: () => ({
    meta: [
      { title: "Manajemen Capster — BARBERIN Owner" },
      { name: "description", content: "Kelola akun staf dan jadwal capster." },
    ],
  }),
  component: OwnerCapstersPage,
});

function OwnerCapstersPage() {
  const [capsters, setCapsters] = useState<CapsterView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCapsters()
      .then((res) => setCapsters(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row antialiased">
      <OwnerSidebar activePath="/owner/capsters" />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerMobileHeader activePath="/owner/capsters" />
        <OwnerHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Manajemen Akun Capster
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Daftar staf barbershop, nomor pegawai, status shift, dan hak akses.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-colors self-start sm:self-auto shadow-md shadow-blue-600/25"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Capster</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-[#0F1D33]/60 rounded-2xl border border-slate-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capsters.map((c) => {
                const isOnline = c.status === "AVAILABLE";
                return (
                  <div
                    key={c.id_capster}
                    className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-blue-600/25 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-base">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                              <span>{c.name}</span>
                              <BadgeCheck className="h-4 w-4 text-blue-400" />
                            </h3>
                            <div className="text-xs text-slate-400 font-mono">
                              {c.no_pegawai || "CAP-000"} • {c.role}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                            isOnline
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-slate-700/40 text-slate-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                            }`}
                          />
                          <span>{isOnline ? "Sedang Shift" : "Offline"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        <span>{c.phone || "0812-xxxx-xxxx"}</span>
                      </div>
                      <div className="font-medium text-slate-300">
                        Status: Aktif
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <OwnerBottomNav activePath="/owner/capsters" />
      </div>
    </div>
  );
}
