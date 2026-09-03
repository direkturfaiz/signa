import { createFileRoute } from "@tanstack/react-router";
import { Info, Scissors, Search, Sparkles } from "lucide-react";
import { useState } from "react";

import { GlassCard, MobileShell } from "@/components/barberin/ui";
import { CapsterBottomNav, CapsterHeader } from "@/components/capster/ui";
import { formatRupiah } from "@/lib/format";
import { CAPSTER_SERVICES } from "@/lib/capster-store";

export const Route = createFileRoute("/capster/services")({
  head: () => ({
    meta: [
      { title: "Daftar Layanan — BARBERIN Capster" },
      { name: "description", content: "Katalog layanan barbershop BARBERIN untuk Capster." },
    ],
  }),
  component: CapsterServicesPage,
});

function CapsterServicesPage() {
  const [search, setSearch] = useState("");

  const filtered = CAPSTER_SERVICES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MobileShell>
      <CapsterHeader
        title="Daftar Layanan"
        backTo="/capster/dashboard"
        showBack={true}
        showActions={true}
      />

      <main className="flex-1 space-y-4 px-4 pb-8 pt-3">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-muted-foreground">
            <Search className="h-4 w-4" strokeWidth={2} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari layanan..."
            className="min-h-[46px] w-full rounded-[12px] border border-white/16 bg-white/8 pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-soft"
          />
        </div>

        {/* List of Read-Only Services */}
        <div className="space-y-2.5">
          {filtered.map((service) => (
            <GlassCard key={service.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/15 text-primary-soft">
                  <Scissors className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-foreground">{service.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{service.category}</p>
                </div>
              </div>
              <span className="shrink-0 text-[14px] font-bold text-primary-soft">
                {formatRupiah(service.price)}
              </span>
            </GlassCard>
          ))}
          {filtered.length === 0 ? (
            <p className="text-center text-[13px] text-muted-foreground py-8">
              Tidak ada layanan yang sesuai pencarian.
            </p>
          ) : null}
        </div>

        {/* Notice Info Card (Read Only) */}
        <GlassCard className="flex items-start gap-3 border-info/30 bg-info/10 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" strokeWidth={2.2} />
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Capster hanya dapat melihat daftar layanan. Pengelolaan data layanan dilakukan oleh Admin / Owner.
          </p>
        </GlassCard>
      </main>

      <CapsterBottomNav activeTab="services" />
    </MobileShell>
  );
}
