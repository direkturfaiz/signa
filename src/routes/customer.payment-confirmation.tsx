import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, ShieldCheck } from "lucide-react";
import { useState } from "react";

import {
  BottomActionBar,
  CustomerHeader,
  GlassCard,
  MobileShell,
  PrimaryButton,
  StatusBadge,
} from "@/components/barberin/ui";
import { formatRupiah } from "@/lib/format";
import { actions, cartTotal, paymentMethodName, useBarberin } from "@/lib/barberin-store";

export const Route = createFileRoute("/customer/payment-confirmation")({
  head: () => ({
    meta: [
      { title: "Menunggu Konfirmasi Pembayaran — BARBERIN" },
      {
        name: "description",
        content: "Pembayaran Anda sedang menunggu konfirmasi dari capster barbershop.",
      },
      { property: "og:title", content: "Menunggu Konfirmasi Pembayaran — BARBERIN" },
      { property: "og:description", content: "Pembayaran sedang menunggu konfirmasi capster." },
    ],
  }),
  component: PaymentConfirmationPage,
});

function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const { cartItems, paymentMethod, transactionId, paymentConfirmationStatus } = useBarberin();
  const [confirming, setConfirming] = useState(false);
  const total = cartTotal(cartItems);

  const simulate = () => {
    setConfirming(true);
    setTimeout(() => {
      actions.confirmPayment();
      setConfirming(false);
      navigate({ to: "/customer/success" });
    }, 1200);
  };

  return (
    <MobileShell>
      <CustomerHeader
        title="Menunggu Konfirmasi"
        subtitle="Konfirmasi pembayaran"
        backTo="/customer/service-execution"
      />

      <main className="flex-1 space-y-4 px-4 pb-6 pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="glass-2 flex h-24 w-24 items-center justify-center rounded-full">
            <Clock className="h-11 w-11 animate-pulse text-primary-soft" strokeWidth={2} />
          </div>
          <h2 className="mt-5 text-[20px] font-bold">Menunggu Konfirmasi Pembayaran</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Pembayaran Anda sedang menunggu konfirmasi.
          </p>
          <div className="mt-4">
            <StatusBadge tone="warning" icon={Clock}>
              {paymentConfirmationStatus === "DIKONFIRMASI"
                ? "Sudah dikonfirmasi"
                : "Menunggu konfirmasi"}
            </StatusBadge>
          </div>
        </div>

        <GlassCard className="space-y-2">
          <div className="flex justify-between gap-3 text-[14px]">
            <span className="text-muted-foreground">ID Transaksi</span>
            <span className="font-semibold">{transactionId ?? "-"}</span>
          </div>
          <div className="flex justify-between gap-3 text-[14px]">
            <span className="text-muted-foreground">Metode Pembayaran</span>
            <span className="font-semibold">{paymentMethodName(paymentMethod)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-[14px]">
            <span className="text-muted-foreground">Total Pembayaran</span>
            <span className="text-[18px] font-bold text-primary-soft">{formatRupiah(total)}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-info" strokeWidth={2} />
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Setelah pembayaran dikonfirmasi oleh capster, status transaksi Anda akan berubah menjadi
            berhasil dan struk otomatis dibuat.
          </p>
        </GlassCard>
      </main>

      <BottomActionBar>
        <PrimaryButton onClick={simulate} loading={confirming}>
          {confirming ? "Memproses konfirmasi..." : "Simulasikan Konfirmasi Pembayaran"}
        </PrimaryButton>
      </BottomActionBar>
    </MobileShell>
  );
}
