import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote, Building2, Check, QrCode } from "lucide-react";
import { useState } from "react";

import {
  BottomActionBar,
  GlassCard,
  MobileShell,
  PrimaryButton,
} from "@/components/barberin/ui";
import { CapsterHeader } from "@/components/capster/ui";
import { formatRupiah } from "@/lib/format";
import {
  CAPSTER_SERVICES,
  capsterActions,
  useCapster,
  type PaymentMethod,
} from "@/lib/capster-store";
import { createManualTransaction } from "@/lib/capster-transactions";

export const Route = createFileRoute("/capster/transactions/manual/payment")({
  head: () => ({
    meta: [
      { title: "Konfirmasi Pembayaran — Buat Transaksi Manual" },
      {
        name: "description",
        content: "Pilih metode bayar dan input nominal uang diterima.",
      },
    ],
  }),
  component: ManualPaymentConfirmationPage,
});

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  name: string;
  icon: typeof Banknote;
}[] = [
  { id: "tunai", name: "Tunai", icon: Banknote },
  { id: "qris", name: "QRIS", icon: QrCode },
  { id: "transfer", name: "Transfer Bank", icon: Building2 },
];

function ManualPaymentConfirmationPage() {
  const navigate = useNavigate();
  const { manualDraft, capsterName } = useCapster();

  const selectedServices = CAPSTER_SERVICES.filter((s) =>
    manualDraft.selectedServiceIds.includes(s.id),
  );

  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    manualDraft.paymentMethod ?? "tunai",
  );

  const [cashReceived, setCashReceived] = useState<number>(
    manualDraft.cashReceived > 0 ? manualDraft.cashReceived : total,
  );

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const change = Math.max(0, cashReceived - total);

  const handleConfirm = async () => {
    if (processing) return;

    if (!manualDraft.selectedServiceIds.length) {
      setError("Belum ada layanan yang dipilih.");
      return;
    }

    if (!manualDraft.capsterId) {
      setError("Belum ada capster yang dipilih.");
      return;
    }

    if (paymentMethod === "tunai" && cashReceived < total) {
      setError("Jumlah uang yang diterima belum mencukupi.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Simpan pilihan pembayaran ke draft lokal
      capsterActions.setManualPaymentMethod(paymentMethod);

      capsterActions.setManualCashReceived(
        paymentMethod === "tunai" ? cashReceived : total,
      );

      // ==============================
      // SIMPAN TRANSAKSI KE DATABASE
      // ==============================
      const result = await createManualTransaction({
        data: {
          customerName: manualDraft.customerName,
          customerPhone: manualDraft.customerPhone,
          notes: manualDraft.notes,
          capsterId: manualDraft.capsterId,
          serviceIds: manualDraft.selectedServiceIds,
          paymentMethod,
          cashReceived:
            paymentMethod === "tunai" ? cashReceived : total,
        },
      });

      console.log("Transaksi berhasil dibuat:", result);

      capsterActions.setLastCreatedTransaction({
        id: result.transactionId,
        date: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        customerName: result.customerName,
        customerPhone: manualDraft.customerPhone,
        items: selectedServices.map((s) => ({
          service: s,
          quantity: 1,
        })),
        serviceNames: result.serviceNames,
        subtotal: result.subtotal,
        discount: result.discount,
        total: result.total,
        paymentMethod: result.paymentMethod,
        cashReceived: result.cashReceived,
        change: result.change,
        status: "Selesai",
        capsterId: result.capsterId,
        capsterName: result.capsterName,
      });

      // Hapus draft lokal setelah berhasil
      capsterActions.clearManualDraft();

      navigate({
        to: "/capster/transactions/success",
      });
    } catch (err) {
      console.error("Gagal membuat transaksi:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat transaksi.",
      );

      setProcessing(false);
    }
  };

  return (
    <MobileShell>
      <CapsterHeader
        title="Konfirmasi Pembayaran"
        backTo="/capster/transactions/manual/detail"
        showBack={true}
        showActions={false}
      />

      <main className="flex-1 space-y-4 px-4 pb-28 pt-3">
        {/* Total Bayar */}
        <GlassCard className="space-y-1 border-primary/30 bg-primary/10 p-4 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Bayar
          </p>

          <p className="text-[28px] font-black text-primary-soft">
            {formatRupiah(total)}
          </p>
        </GlassCard>

        {/* Metode Pembayaran */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-foreground">
            Metode Pembayaran
          </label>

          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_OPTIONS.map((opt) => {
              const isSelected = paymentMethod === opt.id;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(opt.id);
                    setError("");
                  }}
                  className={
                    isSelected
                      ? "glass-2 flex flex-col items-center justify-center gap-1.5 rounded-[12px] border-primary-soft bg-primary/20 p-3 text-primary-soft ring-2 ring-primary-soft transition-all"
                      : "glass-1 flex flex-col items-center justify-center gap-1.5 rounded-[12px] p-3 text-muted-foreground transition-all hover:text-foreground"
                  }
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />

                  <span className="text-[12px] font-bold">
                    {opt.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Informasi Transaksi */}
        <GlassCard className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Customer
            </span>

            <span className="text-[13px] font-bold text-foreground">
              {manualDraft.customerName || "Pelanggan Umum"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Capster
            </span>

            <span className="text-[13px] font-bold text-foreground">
              {manualDraft.capsterName || capsterName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Layanan
            </span>

            <span className="max-w-[65%] text-right text-[13px] font-bold text-foreground">
              {selectedServices.map((s) => s.name).join(" + ")}
            </span>
          </div>
        </GlassCard>

        {/* Tunai */}
        {paymentMethod === "tunai" ? (
          <GlassCard className="space-y-3.5 p-4">
            <div className="space-y-1.5">
              <label
                htmlFor="cash-input"
                className="block text-[13px] font-bold text-foreground"
              >
                Uang Diterima
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[14px] font-bold text-muted-foreground">
                  Rp
                </span>

                <input
                  id="cash-input"
                  type="number"
                  value={cashReceived || ""}
                  onChange={(e) => {
                    setCashReceived(Number(e.target.value) || 0);
                    setError("");
                  }}
                  placeholder="0"
                  className="min-h-[46px] w-full rounded-[10px] border border-white/16 bg-white/8 pl-11 pr-4 text-[16px] font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary-soft"
                />
              </div>

              {/* Quick Cash */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCashReceived(total)}
                  className="glass-1 rounded-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground active:bg-white/20"
                >
                  Uang Pas
                </button>

                {[50000, 100000].map((amt) => {
                  if (amt < total) return null;

                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashReceived(amt)}
                      className="glass-1 rounded-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground active:bg-white/20"
                    >
                      {formatRupiah(amt)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kembalian */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-[13px] font-medium text-muted-foreground">
                Kembalian
              </span>

              <span className="text-[16px] font-extrabold text-success">
                {formatRupiah(change)}
              </span>
            </div>

            {cashReceived < total ? (
              <p
                role="alert"
                className="pt-1 text-[12px] font-semibold text-danger"
              >
                Jumlah pembayaran belum mencukupi.
              </p>
            ) : null}
          </GlassCard>
        ) : null}

        {/* Error */}
        {error ? (
          <GlassCard className="border-danger/30 bg-danger/10 p-3">
            <p
              role="alert"
              className="text-[12px] font-semibold text-danger"
            >
              {error}
            </p>
          </GlassCard>
        ) : null}
      </main>

      <BottomActionBar>
        <PrimaryButton
          onClick={handleConfirm}
          loading={processing}
          disabled={
            processing ||
            !manualDraft.selectedServiceIds.length ||
            !manualDraft.capsterId ||
            (paymentMethod === "tunai" && cashReceived < total)
          }
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
          {processing ? "MENYIMPAN..." : "KONFIRMASI"}
        </PrimaryButton>
      </BottomActionBar>
    </MobileShell>
  );
}