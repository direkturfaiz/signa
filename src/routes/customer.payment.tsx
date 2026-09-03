import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote, Building2, QrCode, Check } from "lucide-react";
import { useState } from "react";

import {
  BottomActionBar,
  CustomerHeader,
  GlassCard,
  MobileShell,
  PrimaryButton,
} from "@/components/barberin/ui";
import { formatRupiah } from "@/lib/format";
import {
  PAYMENT_METHODS,
  actions,
  cartTotal,
  generateTransactionId,
  useBarberin,
  type PaymentMethodId,
} from "@/lib/barberin-store";

export const Route = createFileRoute("/customer/payment")({
  head: () => ({
    meta: [
      { title: "Metode Pembayaran — BARBERIN" },
      { name: "description", content: "Pilih metode pembayaran: Tunai, QRIS, atau Transfer Bank." },
      { property: "og:title", content: "Metode Pembayaran — BARBERIN" },
      { property: "og:description", content: "Pilih metode pembayaran untuk transaksi Anda." },
    ],
  }),
  component: PaymentPage,
});

const ICONS = { tunai: Banknote, qris: QrCode, transfer: Building2 } as const;

function PaymentPage() {
  const navigate = useNavigate();
  const { cartItems, paymentMethod, customerName, customerId } = useBarberin();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const total = cartTotal(cartItems);

  const confirm = () => {
    if (!paymentMethod) {
      setError("Silakan pilih metode pembayaran.");
      return;
    }
    setError(null);
    setProcessing(true);
    setTimeout(() => {
      actions.createTransaction(generateTransactionId());
      setProcessing(false);
      navigate({ to: "/customer/service-execution" });
    }, 800);
  };

  return (
    <MobileShell>
      <CustomerHeader
        title="Metode Pembayaran"
        subtitle="Langkah 4 dari 5"
        backTo="/customer/customer-info"
      />

      <main className="flex-1 space-y-3 px-4 pb-6 pt-4">
        <GlassCard className="space-y-1">
          <p className="text-[13px] text-muted-foreground">Pelanggan</p>
          <p className="text-[15px] font-semibold">{customerName || "-"}</p>
          <p className="text-[12px] text-muted-foreground">ID: {customerId ?? "-"}</p>
        </GlassCard>

        <p className="pt-2 text-[14px] text-muted-foreground">
          Pilih metode pembayaran yang ingin digunakan.
        </p>

        <div role="radiogroup" aria-label="Metode pembayaran" className="space-y-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = ICONS[method.id as PaymentMethodId];
            const selected = paymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  actions.setPaymentMethod(method.id);
                  setError(null);
                }}
                className="w-full text-left"
              >
                <GlassCard selected={selected}>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <span className="glass-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]">
                      <Icon className="h-5 w-5 text-primary-soft" strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold">{method.name}</span>
                      <span className="block text-[13px] text-muted-foreground">
                        {method.description}
                      </span>
                    </span>
                    <span
                      className={
                        selected
                          ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary"
                          : "h-6 w-6 shrink-0 rounded-full border border-white/30"
                      }
                    >
                      {selected ? (
                        <Check className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
                      ) : null}
                    </span>
                  </div>
                </GlassCard>
              </button>
            );
          })}
        </div>

        {error ? (
          <p role="alert" className="text-[13px] font-medium text-danger">
            {error}
          </p>
        ) : null}
      </main>

      <BottomActionBar>
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-muted-foreground">Total Pembayaran</span>
          <span className="text-[18px] font-bold text-primary-soft">{formatRupiah(total)}</span>
        </div>
        <PrimaryButton onClick={confirm} loading={processing}>
          {processing ? "Memproses transaksi..." : "Konfirmasi Pembayaran"}
        </PrimaryButton>
      </BottomActionBar>
    </MobileShell>
  );
}
