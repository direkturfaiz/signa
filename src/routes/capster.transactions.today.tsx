import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";

import {
  BottomActionBar,
  GlassCard,
  MobileShell,
  PrimaryButton,
  SkeletonCard,
} from "@/components/barberin/ui";
import { CapsterHeader, TransactionStatusBadge } from "@/components/capster/ui";
import { formatRupiah } from "@/lib/format";
import { capsterActions, useCapster, type CapsterTransaction } from "@/lib/capster-store";
import { getCapsterTransactions } from "@/lib/capster-transactions";

export const Route = createFileRoute("/capster/transactions/today")({
  head: () => ({
    meta: [
      { title: "Transaksi Hari Ini — BARBERIN Capster" },
      { name: "description", content: "Daftar transaksi real-time hari ini." },
    ],
  }),
  component: TodayTransactionsPage,
});

function TodayTransactionsPage() {
  const navigate = useNavigate();
  const { transactions, dashboardMetrics } = useCapster();
  const [filter, setFilter] = useState<"Semua" | "Selesai" | "Batal">("Semua");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCapsterTransactions({ data: { todayOnly: true } })
      .then((data) => {
        if (!mounted) return;
        capsterActions.setTransactions(data as CapsterTransaction[]);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totalCount = transactions.length;
  const selesaiCount = transactions.filter((t) => t.status === "Selesai").length;
  const batalCount = transactions.filter((t) => t.status === "Batal").length;

  const filtered = transactions.filter((t) => {
    if (filter === "Semua") return true;
    return t.status === filter;
  });

  return (
    <MobileShell>
      <CapsterHeader
        title="Transaksi Hari Ini"
        backTo="/capster/dashboard"
        showBack={true}
        showActions={true}
      />

      <main className="flex-1 space-y-4 px-4 pb-28 pt-3">
        {/* Filter Tabs with Counts */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setFilter("Semua")}
            className={
              filter === "Semua"
                ? "rounded-[12px] bg-primary py-2 text-[12px] font-bold text-white shadow-md transition-all"
                : "glass-1 rounded-[12px] py-2 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-all"
            }
          >
            Semua ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("Selesai")}
            className={
              filter === "Selesai"
                ? "rounded-[12px] bg-success py-2 text-[12px] font-bold text-white shadow-md transition-all"
                : "glass-1 rounded-[12px] py-2 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-all"
            }
          >
            Selesai ({selesaiCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("Batal")}
            className={
              filter === "Batal"
                ? "rounded-[12px] bg-danger py-2 text-[12px] font-bold text-white shadow-md transition-all"
                : "glass-1 rounded-[12px] py-2 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-all"
            }
          >
            Batal ({batalCount})
          </button>
        </div>

        {/* List of Today Transactions */}
        <div className="space-y-2.5">
          {filtered.map((trx) => (
            <button
              key={trx.id}
              type="button"
              onClick={() =>
                navigate({
                  to: "/capster/transactions/$transactionId",
                  params: { transactionId: trx.id },
                })
              }
              className="w-full text-left transition-all active:scale-[0.99]"
            >
              <GlassCard className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-primary-soft">
                      <Clock className="h-3 w-3" strokeWidth={2} />
                      {trx.time}
                    </span>
                    <TransactionStatusBadge status={trx.status} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[14px] font-bold text-foreground">
                      {trx.customerName}
                    </p>
                    <span className="shrink-0 text-[11px] font-semibold text-primary-soft">
                      Capster: {trx.capsterName}
                    </span>
                  </div>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {trx.serviceNames}
                  </p>
                </div>
                <span className="shrink-0 font-extrabold text-[14px] text-foreground">
                  {formatRupiah(trx.total)}
                </span>
              </GlassCard>
            </button>
          ))}

          {filtered.length === 0 ? (
            <p className="text-center text-[13px] text-muted-foreground py-10">
              Tidak ada transaksi untuk filter ini.
            </p>
          ) : null}
        </div>
      </main>

      {/* Bottom Summary Bar & Action */}
      <BottomActionBar>
        <div className="space-y-1 pb-1">
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground font-medium">Total Transaksi</span>
            <span className="font-bold">{dashboardMetrics.totalTransaksi}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-muted-foreground font-medium">Total Pendapatan</span>
            <span className="font-extrabold text-primary-soft text-[16px]">
              {formatRupiah(dashboardMetrics.totalPendapatan)}
            </span>
          </div>
        </div>

        <PrimaryButton onClick={() => navigate({ to: "/capster/transactions" })}>
          LIHAT SEMUA TRANSAKSI
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </PrimaryButton>
      </BottomActionBar>
    </MobileShell>
  );
}
