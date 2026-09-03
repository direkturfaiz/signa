import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2, Scissors, UserRound } from "lucide-react";
import { useEffect } from "react";

import {
  BottomActionBar,
  CustomerHeader,
  GlassCard,
  MobileShell,
  PrimaryButton,
  StatusBadge,
} from "@/components/barberin/ui";
import { formatRupiah } from "@/lib/format";
import {
  actions,
  cartTotal,
  useBarberin,
  type ServiceExecutionStatus,
} from "@/lib/barberin-store";

export const Route = createFileRoute("/customer/service-execution")({
  head: () => ({
    meta: [
      { title: "Layanan Sedang Diproses — BARBERIN" },
      { name: "description", content: "Pantau status pengerjaan layanan Anda oleh capster." },
      { property: "og:title", content: "Layanan Sedang Diproses — BARBERIN" },
      { property: "og:description", content: "Status pengerjaan layanan barbershop Anda." },
    ],
  }),
  component: ServiceExecutionPage,
});

const STEPS: { id: ServiceExecutionStatus; label: string }[] = [
  { id: "MENUNGGU", label: "Menunggu layanan dimulai" },
  { id: "DIKERJAKAN", label: "Sedang dikerjakan" },
  { id: "HAMPIR_SELESAI", label: "Layanan hampir selesai" },
  { id: "DISELESAIKAN", label: "Sedang diselesaikan" },
];

export function ServiceExecutionStatusView({ status }: { status: ServiceExecutionStatus }) {
  const currentIndex = STEPS.findIndex((s) => s.id === status);
  return (
    <GlassCard className="space-y-3">
      <h2 className="text-[15px] font-semibold">Status Pengerjaan</h2>
      <ol className="space-y-3">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.id} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-success" strokeWidth={2} />
                ) : active ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary-soft" strokeWidth={2} />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
                )}
              </span>
              <span
                className={
                  active
                    ? "text-[14px] font-semibold"
                    : "text-[14px] text-muted-foreground"
                }
              >
                {step.label}
              </span>
              {active ? (
                <span className="ml-auto">
                  <StatusBadge tone="info">Berlangsung</StatusBadge>
                </span>
              ) : done ? (
                <span className="ml-auto">
                  <StatusBadge tone="success">Selesai</StatusBadge>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}

import { getTransactionDetail } from "@/lib/bookings";

function ServiceExecutionPage() {
  const navigate = useNavigate();
  const { cartItems, serviceExecutionStatus, transactionId, selectedCapster } = useBarberin();
  const total = cartTotal(cartItems);

  useEffect(() => {
    if (!transactionId) return;

    let mounted = true;
    const check = async () => {
      try {
        const detail = await getTransactionDetail({ data: { transactionId } });
        if (!mounted || !detail) return;

        if (detail.status === "paid" || detail.bookingStatus === "completed") {
          actions.setServiceExecutionStatus("DISELESAIKAN");
        } else if (detail.bookingStatus === "confirmed") {
          actions.setServiceExecutionStatus("DIKERJAKAN");
        }
      } catch (err) {
        console.error("Polling status error:", err);
      }
    };

    check();
    const interval = setInterval(check, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [transactionId]);

  return (
    <MobileShell>
      <CustomerHeader
        title="Layanan Sedang Diproses"
        subtitle={transactionId ?? "Langkah 5 dari 5"}
        backTo="/customer/payment"
      />

      <main className="flex-1 space-y-3 px-4 pb-6 pt-4">
        <GlassCard className="flex items-start gap-3">
          <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-primary-soft" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold">
              Capster: {selectedCapster?.name ?? "-"}
              {selectedCapster ? ` — ${selectedCapster.role}` : ""}
            </p>
            <p className="text-[13px] text-muted-foreground">
              Layanan Anda sedang dikerjakan. Silakan menunggu hingga proses selesai.
            </p>
          </div>
        </GlassCard>

        <GlassCard className="space-y-2">
          <h2 className="text-[15px] font-semibold">Layanan Anda</h2>
          {cartItems.map((item) => (
            <div key={item.service.id} className="flex items-center gap-2 text-[14px]">
              <Scissors className="h-4 w-4 shrink-0 text-primary-soft" strokeWidth={2} />
              <span className="min-w-0 truncate">
                {item.service.name} ({item.quantity}x)
              </span>
              <span className="ml-auto shrink-0 text-[13px] text-muted-foreground">
                {formatRupiah(item.service.price * item.quantity)}
              </span>
            </div>
          ))}
        </GlassCard>

        <ServiceExecutionStatusView status={serviceExecutionStatus} />
      </main>

      <BottomActionBar>
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-muted-foreground">Total Pembayaran</span>
          <span className="text-[18px] font-bold">{formatRupiah(total)}</span>
        </div>
        <PrimaryButton
          onClick={() => {
            actions.startWaitingConfirmation();
            navigate({ to: "/customer/payment-confirmation" });
          }}
        >
          Lanjut ke Konfirmasi Pembayaran
        </PrimaryButton>
      </BottomActionBar>
    </MobileShell>
  );
}
