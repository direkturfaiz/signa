import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FileText, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";

import {
  OwnerSidebar,
  OwnerHeader,
  OwnerMobileHeader,
  OwnerBottomNav,
} from "@/components/owner/ui";
import { getOwnerDashboardMetrics, type OwnerRecentCancellation } from "@/lib/owner";

export const Route = createFileRoute("/owner/audit")({
  head: () => ({
    meta: [
      { title: "Audit & Pembatalan — BARBERIN Owner" },
      { name: "description", content: "Log audit transaksi dan pembatalan barbershop." },
    ],
  }),
  component: OwnerAuditPage,
});

function OwnerAuditPage() {
  const [cancellations, setCancellations] = useState<OwnerRecentCancellation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerDashboardMetrics({
      data: { period: "30d" },
    })
      .then((res) => setCancellations(res.recentCancellations))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row antialiased">
      <OwnerSidebar activePath="/owner/audit" />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerMobileHeader activePath="/owner/audit" />
        <OwnerHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Audit Transaksi & Anti-Fraud
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Rekap pembatalan order, aktor pembatal, serta alasan pembatalan.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 self-start sm:self-auto">
              <ShieldCheck className="h-4 w-4" />
              <span>Sistem Proteksi Aktif</span>
            </div>
          </div>

          <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-white mb-1">
              Log Pembatalan Layanan
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Semua order yang dibatalkan wajib memiliki alasan valid sesuai SOP BARBERIN
            </p>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs animate-pulse">
                Memuat data audit pembatalan...
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 font-medium">
                      <th className="pb-3 font-medium">No. Transaksi</th>
                      <th className="pb-3 font-medium">Capster</th>
                      <th className="pb-3 font-medium">Alasan Pembatalan</th>
                      <th className="pb-3 font-medium">Dibatalkan Oleh</th>
                      <th className="pb-3 font-medium text-right">Waktu</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cancellations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          Belum ada catatan pembatalan
                        </td>
                      </tr>
                    ) : (
                      cancellations.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 font-mono text-slate-300 font-semibold">
                            {c.shortId}
                          </td>
                          <td className="py-3.5 text-slate-300">{c.capsterName}</td>
                          <td className="py-3.5 text-rose-300 max-w-[240px] truncate font-medium">
                            {c.reason}
                          </td>
                          <td className="py-3.5 text-slate-400">{c.cancelledBy}</td>
                          <td className="py-3.5 text-slate-400 text-right font-mono text-[11px]">
                            {c.date} {c.time}
                          </td>
                          <td className="py-3.5 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/15 text-rose-300">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <OwnerBottomNav activePath="/owner/audit" />
      </div>
    </div>
  );
}
