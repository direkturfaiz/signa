import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Coins, Receipt, Scissors, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { MobileShell } from "@/components/barberin/ui";
import {
  CapsterBottomNav,
  CapsterHeader,
  DailySummaryCard,
  ServiceStatusSection,
  ShiftEndModal,
  SummaryCard,
} from "@/components/capster/ui";
import { formatRupiah } from "@/lib/format";
import { capsterActions, useCapster } from "@/lib/capster-store";
import { getDashboardMetrics } from "@/lib/capster-transactions";
import { endShift } from "@/lib/shifts";

export const Route = createFileRoute("/capster/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Capster — BARBERIN" },
      { name: "description", content: "Dashboard manajemen harian Capster BARBERIN." },
    ],
  }),
  component: CapsterDashboardPage,
});

function CapsterDashboardPage() {
  const navigate = useNavigate();
  const { capsterId, userId, capsterName, dashboardMetrics, shiftId } = useCapster();
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchMetrics = async () => {
      try {
        const metrics = await getDashboardMetrics({
          data: {
            capsterId: capsterId ?? undefined,
            userId: userId ?? undefined,
          },
        });
        if (!mounted) return;
        capsterActions.setDashboardMetrics(metrics);
      } catch (e) {
        console.error("Gagal memuat metrik dashboard:", e);
      }
    };

    fetchMetrics();
    const intervalId = setInterval(fetchMetrics, 4000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [capsterId, userId]);

  const handleEndShiftConfirm = async () => {
    if (shiftId) {
      try {
        await endShift({ data: { shiftId } });
      } catch (e) {
        console.error("Gagal mengakhiri shift di database:", e);
      }
    }
    capsterActions.endShift();
    setShowEndShiftModal(false);
    navigate({ to: "/capster/shift-saved" });
  };

  return (
    <MobileShell>
      <CapsterHeader
        title="Dashboard"
        showBack={false}
        showActions={true}
      />

      <main className="flex-1 space-y-4 px-4 pb-8 pt-3">
        {/* Sapaan Capster */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[20px] font-extrabold text-foreground">
              Halo, {capsterName.split(" ")[0] ?? "Admin"}! 👋
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Kamu ke dashboard capster mu.
            </p>
          </div>
          <div className="glass-2 flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold text-primary-soft">
            <span>Hari ini</span>
            <span className="text-[10px]">▼</span>
          </div>
        </div>

        {/* 4 Summary Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={Receipt}
            title="TOTAL TRANSAKSI"
            value={dashboardMetrics.totalTransaksi}
            delta={dashboardMetrics.deltaTransaksi}
            tone="primary"
          />
          <SummaryCard
            icon={Coins}
            title="TOTAL PENDAPATAN"
            value={formatRupiah(dashboardMetrics.totalPendapatan)}
            delta={dashboardMetrics.deltaPendapatan}
            tone="success"
          />
          <SummaryCard
            icon={Scissors}
            title="TOTAL LAYANAN"
            value={dashboardMetrics.totalLayanan}
            delta={dashboardMetrics.deltaLayanan}
            tone="purple"
          />
          <SummaryCard
            icon={Users}
            title="CAPSTER AKTIF"
            value={String(dashboardMetrics.capsterAktif).padStart(2, "0")}
            delta={dashboardMetrics.deltaCapster}
            tone="warning"
          />
        </div>

        {/* Status Layanan Section */}
        <ServiceStatusSection
          selesai={dashboardMetrics.statusLayanan.selesai}
          sedangDikerjakan={dashboardMetrics.statusLayanan.sedangDikerjakan}
          menunggu={dashboardMetrics.statusLayanan.menunggu}
          dibatalkan={dashboardMetrics.statusLayanan.dibatalkan}
        />

        {/* Ringkasan Hari Ini Section */}
        <DailySummaryCard
          pendapatan={dashboardMetrics.ringkasanHariIni.totalPendapatan}
          transaksi={dashboardMetrics.ringkasanHariIni.totalTransaksi}
          layanan={dashboardMetrics.ringkasanHariIni.totalLayanan}
          selesai={dashboardMetrics.ringkasanHariIni.selesai}
          belumSelesai={dashboardMetrics.ringkasanHariIni.belumSelesai}
          onEndShift={() => setShowEndShiftModal(true)}
        />
      </main>

      {/* Modal Konfirmasi Akhiri Shift */}
      <ShiftEndModal
        open={showEndShiftModal}
        onConfirm={handleEndShiftConfirm}
        onCancel={() => setShowEndShiftModal(false)}
      />

      <CapsterBottomNav activeTab="dashboard" />
    </MobileShell>
  );
}
