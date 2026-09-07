import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Scissors, Clock, Tag, Plus, CheckCircle2 } from "lucide-react";

import {
  OwnerSidebar,
  OwnerHeader,
  OwnerMobileHeader,
  OwnerBottomNav,
} from "@/components/owner/ui";
import { formatRupiah } from "@/lib/format";
import { getServices } from "@/lib/services";

export const Route = createFileRoute("/owner/services")({
  head: () => ({
    meta: [
      { title: "Manajemen Layanan — BARBERIN Owner" },
      { name: "description", content: "Kelola menu dan tarif layanan barbershop." },
    ],
  }),
  component: OwnerServicesPage,
});

function OwnerServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((res) => setServices(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row antialiased">
      <OwnerSidebar activePath="/owner/services" />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerMobileHeader activePath="/owner/services" />
        <OwnerHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Manajemen Layanan
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Katalog menu, tarif dinamis, dan estimasi waktu pengerjaan.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-colors self-start sm:self-auto shadow-md shadow-blue-600/25"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Layanan</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-36 bg-[#0F1D33]/60 rounded-2xl border border-slate-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <div
                  key={s.id_layanan}
                  className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Scissors className="h-4 w-4 rotate-90" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Aktif</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-3">
                      {s.nama_layanan}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {s.deskripsi || "Layanan potong dan perawatan rambut profesional."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{s.durasi_menit || 30} menit</span>
                    </div>
                    <div className="text-base font-bold text-emerald-400">
                      {formatRupiah(s.price || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <OwnerBottomNav activePath="/owner/services" />
      </div>
    </div>
  );
}
