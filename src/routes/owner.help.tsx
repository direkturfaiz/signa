import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, MessageSquare, BookOpen, ExternalLink, Shield } from "lucide-react";

import {
  OwnerSidebar,
  OwnerHeader,
  OwnerMobileHeader,
  OwnerBottomNav,
} from "@/components/owner/ui";

export const Route = createFileRoute("/owner/help")({
  head: () => ({
    meta: [
      { title: "Pusat Bantuan — BARBERIN Owner" },
      { name: "description", content: "Panduan dan bantuan operasional BARBERIN." },
    ],
  }),
  component: OwnerHelpPage,
});

function OwnerHelpPage() {
  const guides = [
    {
      title: "Monitoring Omzet & Transaksi Realtime",
      desc: "Pelajari cara membaca grafik pendapatan, omzet per metode bayar, dan indikator persentase pertumbuhan harian.",
    },
    {
      title: "Manajemen Shift & Transaksi Capster",
      desc: "Pahami relasi shift capster, pembagian transaksi per capster, dan perhitungan otomatis komisi 15%.",
    },
    {
      title: "Audit & Kebijakan Pembatalan Pesanan",
      desc: "SOP penanganan order yang dibatalkan oleh pelanggan maupun capster beserta audit trail anti-fraud.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row antialiased">
      <OwnerSidebar activePath="/owner/help" />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerMobileHeader activePath="/owner/help" />
        <OwnerHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12 max-w-[1600px] w-full mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Pusat Bantuan & Panduan Owner
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Dokumentasi alur kerja sistem operasional BARBERIN berbasis BPMN.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guides.map((g, idx) => (
              <div
                key={idx}
                className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {g.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {g.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-semibold">
                  <span>Baca Panduan</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </main>

        <OwnerBottomNav activePath="/owner/help" />
      </div>
    </div>
  );
}
