import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Wallet,
  Scissors,
  Users,
  Calendar,
  TrendingUp,
  Download,
  Receipt,
  FileCheck,
  ChevronDown,
  Award,
} from "lucide-react";

import {
  OwnerSidebar,
  OwnerHeader,
  OwnerMobileHeader,
  OwnerBottomNav,
} from "@/components/owner/ui";
import { formatRupiah } from "@/lib/format";
import {
  getOwnerAuditFinance,
  type OwnerAuditFinanceResult,
  type OwnerPeriodFilter,
} from "@/lib/owner";

export const Route = createFileRoute("/owner/gaji")({
  head: () => ({
    meta: [
      { title: "Gaji & Komisi Capster — BARBERIN Owner" },
      {
        name: "description",
        content: "Perhitungan gaji dan komisi bagi hasil capster barbershop.",
      },
    ],
  }),
  component: OwnerGajiPage,
});

function OwnerGajiPage() {
  const [data, setData] = useState<OwnerAuditFinanceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<OwnerPeriodFilter>("month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await getOwnerAuditFinance({
        data: {
          period,
          pageSize: 50,
        },
      });
      setData(res);
    } catch (err) {
      console.error("Gagal memuat payroll capster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [period]);

  const totalAllCommissions = (data?.capsterCommissions || []).reduce(
    (acc, c) => acc + c.totalCommission,
    0,
  );

  const totalAllTrx = (data?.capsterCommissions || []).reduce(
    (acc, c) => acc + c.transactionCount,
    0,
  );

  const topCapster = (data?.capsterCommissions || [])[0];

  const periodOptions: { key: OwnerPeriodFilter; label: string }[] = [
    { key: "today", label: "Hari Ini" },
    { key: "7d", label: "7 Hari Terakhir" },
    { key: "30d", label: "30 Hari Terakhir" },
    { key: "month", label: "Bulan Ini" },
  ];

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row antialiased">
      <OwnerSidebar activePath="/owner/gaji" />

      <div className="flex-1 flex flex-col min-w-0">
        <OwnerMobileHeader
          activePath="/owner/gaji"
          onRefresh={fetchPayroll}
          isRefreshing={loading}
        />
        <OwnerHeader onRefresh={fetchPayroll} isRefreshing={loading} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12 max-w-[1600px] w-full mx-auto">
          {/* Header Title & Date Range */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Gaji & Komisi Capster
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Sistem otomatis menghitung bagi hasil capster berdasarkan transaksi layanan yang dikerjakan.
              </p>
            </div>

            {/* Period Selector */}
            <div className="relative self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#0F1D33] border border-slate-700/80 rounded-xl text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>{data?.periodLabel || "Bulan Ini"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#0F1D33] border border-slate-700 rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {periodOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setPeriod(opt.key);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                        period === opt.key
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4 Overview Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
            <div className="bg-[#0F1D33] border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span>Total Komisi Periode Ini</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white tracking-tight mt-2 truncate">
                {formatRupiah(totalAllCommissions)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Bagi hasil 15% dari omzet layanan
              </div>
            </div>

            <div className="bg-[#0F1D33] border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Receipt className="h-4 w-4 text-blue-400" />
                <span>Total Transaksi Dilayani</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white tracking-tight mt-2">
                {totalAllTrx}{" "}
                <span className="text-sm font-normal text-slate-400">transaksi</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Seluruh capster terdaftar
              </div>
            </div>

            <div className="bg-[#0F1D33] border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Users className="h-4 w-4 text-purple-400" />
                <span>Jumlah Capster Aktif</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white tracking-tight mt-2">
                {data?.capsterCommissions.length || 0}{" "}
                <span className="text-sm font-normal text-slate-400">orang</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Memiliki catatan transaksi
              </div>
            </div>

            <div className="bg-[#0F1D33] border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Capster Tertinggi</span>
              </div>
              <div className="text-base md:text-lg font-bold text-white tracking-tight mt-2 truncate">
                {topCapster?.name || "-"}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                {topCapster ? formatRupiah(topCapster.totalCommission) : "Rp 0"}
              </div>
            </div>
          </div>

          {/* Table: Rincian Gaji & Komisi Capster */}
          <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Rincian Komisi Per Capster
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setiap transaksi dicatat secara ketat hanya pada capster yang mengerjakan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Slip komisi siap dicetak.")}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#0A1424] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 hover:text-white self-start sm:self-auto"
              >
                <Download className="h-3.5 w-3.5 text-blue-400" />
                <span>Export Rekap Komisi</span>
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500 text-xs animate-pulse">
                Menghitung komisi capster...
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 font-medium">
                      <th className="py-3 px-3">No</th>
                      <th className="py-3 px-3">Nama Capster</th>
                      <th className="py-3 px-3">No. Pegawai</th>
                      <th className="py-3 px-3">Jumlah Transaksi</th>
                      <th className="py-3 px-3">Total Omzet Layanan</th>
                      <th className="py-3 px-3">Persentase Bagi Hasil</th>
                      <th className="py-3 px-3 text-right">Total Komisi Diterima</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {data?.capsterCommissions.map((c) => (
                      <tr key={c.capsterId} className="hover:bg-slate-800/30">
                        <td className="py-4 px-3 text-slate-400">{c.no}</td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                              {c.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-white">
                              {c.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3 font-mono text-slate-400">
                          {c.noPegawai}
                        </td>
                        <td className="py-4 px-3 text-slate-300">
                          {c.transactionCount} transaksi
                        </td>
                        <td className="py-4 px-3 text-slate-300">
                          {formatRupiah(c.serviceRevenue)}
                        </td>
                        <td className="py-4 px-3">
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/30">
                            {c.commissionPercentage}%
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right font-bold text-emerald-400 text-sm">
                          {formatRupiah(c.totalCommission)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <OwnerBottomNav activePath="/owner/gaji" />
      </div>
    </div>
  );
}
