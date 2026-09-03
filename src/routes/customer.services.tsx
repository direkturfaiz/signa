import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Plus, Scissors, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import {
  BarberinLogo,
  BottomActionBar,
  ErrorState,
  GlassCard,
  MobileShell,
  PrimaryButton,
  SkeletonCard,
} from "@/components/barberin/ui";
import { formatRupiah } from "@/lib/format";
import { SERVICES, actions, cartCount, cartTotal, useBarberin } from "@/lib/barberin-store";

export const Route = createFileRoute("/customer/services")({
  head: () => ({
    meta: [
      { title: "Pilih Layanan — BARBERIN" },
      {
        name: "description",
        content:
          "Pilih layanan barbershop BARBERIN langsung dari ponsel Anda: potong rambut, keramas, dan cukur.",
      },
      { property: "og:title", content: "Pilih Layanan — BARBERIN" },
      {
        property: "og:description",
        content: "Katalog layanan barbershop BARBERIN. Pilih layanan, bayar, dan terima struk.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const navigate = useNavigate();
  const { cartItems } = useBarberin();
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const total = cartTotal(cartItems);
  const count = cartCount(cartItems);

  return (
    <MobileShell>
      <header className="safe-top px-4 pb-2">
        <div className="flex items-center gap-3">
          <BarberinLogo className="h-10 w-10" />
          <div className="min-w-0">
            <p className="truncate text-[18px] font-bold leading-tight">BARBERIN</p>
            <p className="truncate text-[12px] text-muted-foreground">
              Modern Barbershop Management System
            </p>
          </div>
        </div>
        <h1 className="mt-6 text-[24px] font-bold">Pilih Layanan</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Anda dapat memilih lebih dari satu layanan dalam satu transaksi.
        </p>
      </header>

      <main className="flex-1 space-y-3 px-4 pb-6 pt-4">
        {error ? (
          <ErrorState message="Gagal memuat layanan. Silakan coba lagi." />
        ) : loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          SERVICES.map((service) => {
            const selected = cartItems.some((i) => i.service.id === service.id);
            return (
              <GlassCard key={service.id} selected={selected}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 shrink-0 text-primary-soft" strokeWidth={2} />
                      <p className="min-w-0 text-[15px] font-semibold leading-snug">
                        {service.name}
                      </p>
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                      {service.description}
                    </p>
                    <p className="mt-2 text-[16px] font-bold text-primary-soft">
                      {formatRupiah(service.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={
                      selected ? `Hapus ${service.name} dari keranjang` : `Tambah ${service.name}`
                    }
                    onClick={() => actions.toggleService(service)}
                    className={
                      selected
                        ? "flex h-11 min-w-[44px] items-center gap-1 rounded-[12px] bg-success/20 px-3 text-[13px] font-semibold text-success ring-1 ring-success/40 transition-all active:scale-95"
                        : "glass-2 flex h-11 min-w-[44px] items-center gap-1 rounded-[12px] px-3 text-[13px] font-semibold transition-all active:scale-95"
                    }
                  >
                    {selected ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={2} /> Dipilih
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" strokeWidth={2} /> Tambah
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </main>

      <BottomActionBar>
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-muted-foreground">
            {count > 0 ? `${count} layanan dipilih` : "Belum ada layanan dipilih"}
          </span>
          <span className="text-[16px] font-bold">{formatRupiah(total)}</span>
        </div>
        <PrimaryButton
          disabled={count === 0}
          onClick={() => navigate({ to: "/customer/capster" })}
        >
          <ShoppingCart className="h-4 w-4" strokeWidth={2} />
          Lanjut Pilih Capster
        </PrimaryButton>
      </BottomActionBar>
    </MobileShell>
  );
}
