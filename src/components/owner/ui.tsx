import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Scissors,
  Home,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  XCircle,
  Clock,
  CheckCircle2,
  X,
  Menu,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { formatRupiah } from "@/lib/format";
import {
  type OwnerDashboardMetrics,
  type OwnerPeriodFilter,
  type OwnerRecentTransaction,
  type OwnerCapsterPerformance,
  type OwnerRecentCancellation,
} from "@/lib/owner";
import { ownerActions, useOwner } from "@/lib/owner-store";

// ============================================================================
// 1. SIDEBAR (DESKTOP)
// ============================================================================
export function OwnerSidebar({ activePath }: { activePath: string }) {
  const navigate = useNavigate();
  const navItems = [
    { label: "Dashboard", href: "/owner/dashboard", icon: Home },
    { label: "Services", href: "/owner/services", icon: Scissors },
    { label: "Capster", href: "/owner/capsters", icon: Users },
    { label: "Audit", href: "/owner/audit", icon: FileText },
  ];

  const bottomItems = [
    { label: "Setelan", href: "/owner/settings", icon: Settings },
    { label: "Pusat Bantuan", href: "/owner/help", icon: HelpCircle },
  ];

  const handleLogout = () => {
    ownerActions.logout();
    navigate({ to: "/owner/login" });
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0A1424] border-r border-slate-800/80 min-h-screen text-slate-300 p-5 select-none shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
          <Scissors className="h-5 w-5 rotate-90" />
        </div>
        <div>
          <div className="font-extrabold tracking-wider text-white text-base leading-none">
            BARBERIN
          </div>
          <div className="text-[11px] text-slate-400 mt-1 leading-tight font-medium">
            Modern Barbershop
            <br />
            Management System
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-slate-800/80 my-4" />

      {/* Bottom Nav */}
      <div className="space-y-1.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

// ============================================================================
// 2. TOP HEADER (DESKTOP)
// ============================================================================
export function OwnerHeader({
  onRefresh,
  isRefreshing,
}: {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { user, searchKeyword } = useOwner();

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-[#0A1424] border-b border-slate-800/80 sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => ownerActions.setSearchKeyword(e.target.value)}
          placeholder="Cari transaksi, layanan, atau capster..."
          className="w-full pl-10 pr-4 py-2 bg-[#121F33] text-sm text-white placeholder-slate-400 border border-slate-700/60 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors relative"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
            />
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0A1424]" />
          </button>
        </div>

        {/* Owner Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            {user.nama_lengkap.charAt(0) || "O"}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white leading-tight">
              {user.nama_lengkap || "Owner"}
            </div>
            <div className="text-xs text-slate-400 leading-tight">
              {user.barbershopName || "Barbershop Barbershop"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// 3. MOBILE HEADER & DRAWER & BOTTOM NAV
// ============================================================================
export function OwnerMobileHeader({
  activePath,
  onRefresh,
  isRefreshing,
}: {
  activePath: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useOwner();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", href: "/owner/dashboard", icon: Home },
    { label: "Services", href: "/owner/services", icon: Scissors },
    { label: "Capster", href: "/owner/capsters", icon: Users },
    { label: "Audit", href: "/owner/audit", icon: FileText },
    { label: "Setelan", href: "/owner/settings", icon: Settings },
    { label: "Pusat Bantuan", href: "/owner/help", icon: HelpCircle },
  ];

  const handleLogout = () => {
    ownerActions.logout();
    setDrawerOpen(false);
    navigate({ to: "/owner/login" });
  };

  return (
    <>
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0A1424] border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Scissors className="h-4 w-4 rotate-90" />
            </div>
            <span className="font-extrabold text-white tracking-wider text-sm">
              BARBERIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
              />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>

          <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            {user.nama_lengkap.charAt(0) || "O"}
          </div>
        </div>
      </header>

      {/* Slide-out Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-72 bg-[#0A1424] border-r border-slate-800 h-full p-5 flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Scissors className="h-4 w-4 rotate-90" />
                </div>
                <div className="font-extrabold text-white text-base">BARBERIN</div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 border-b border-slate-800/80">
              <div className="text-sm font-semibold text-white">
                {user.nama_lengkap}
              </div>
              <div className="text-xs text-slate-400">{user.barbershopName}</div>
            </div>

            <nav className="space-y-1.5 flex-1 py-4 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full text-left"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function OwnerBottomNav({ activePath }: { activePath: string }) {
  const navItems = [
    { label: "Dashboard", href: "/owner/dashboard", icon: Home },
    { label: "Services", href: "/owner/services", icon: Scissors },
    { label: "Capster", href: "/owner/capsters", icon: Users },
    { label: "Audit", href: "/owner/audit", icon: FileText },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A1424]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
              isActive ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ============================================================================
// 4. SUMMARY METRIC CARD
// ============================================================================
export function OwnerSummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div
            className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
              trendUp
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-rose-400 bg-rose-500/10"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-xs text-slate-400 font-medium">{title}</div>
        <div className="text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">
          {value}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">{subtitle}</div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. REVENUE AREA CHART
// ============================================================================
export function RevenueChartCard({
  data,
  period,
  onPeriodChange,
}: {
  data: { date: string; revenue: number; count: number }[];
  period: OwnerPeriodFilter;
  onPeriodChange?: (p: OwnerPeriodFilter) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Grafik Pendapatan</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Perbandingan pendapatan 7 hari terakhir
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total Periode:</span>
          <div className="text-sm font-bold text-blue-400">
            {formatRupiah(total)}
          </div>
        </div>
      </div>

      <div className="h-56 md:h-64 w-full">
        {mounted && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `${Math.round(val / 1000)}K`;
                  return `${val}`;
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rev = Number(payload[0]?.value || 0);
                    const cnt = (payload[0]?.payload as any)?.count || 0;
                    return (
                      <div className="bg-[#0B1526] border border-blue-500/30 rounded-xl px-3 py-2 shadow-xl">
                        <div className="text-[11px] text-slate-400 font-medium">
                          {label}
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {formatRupiah(rev)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {cnt} transaksi
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#3B82F6", stroke: "#0B1526", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#60A5FA", stroke: "#fff", strokeWidth: 2 }}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Memuat grafik pendapatan...
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 6. PAYMENT METHODS DONUT CHART
// ============================================================================
export function PaymentMethodsDonutCard({
  methods,
  totalTransactions,
}: {
  methods: {
    method: "tunai" | "qris" | "transfer";
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  totalTransactions: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = methods.map((m) => ({
    name: m.label,
    value: m.count,
    color: m.color,
  }));

  const hasData = methods.some((m) => m.count > 0);

  return (
    <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white">Metode Pembayaran</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Distribusi pembayaran pelanggan
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto">
        {/* Donut Chart with Center Total */}
        <div className="relative w-40 h-40 shrink-0">
          {mounted && hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F1D33" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full rounded-full border-4 border-slate-800 flex items-center justify-center text-xs text-slate-500">
              0 Transaksi
            </div>
          )}
          {hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-white leading-tight">
                {totalTransactions}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                Transaksi
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-3 w-full sm:w-auto flex-1">
          {methods.map((m) => (
            <div
              key={m.method}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-slate-300 font-medium">{m.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{m.count}</span>
                <span className="text-slate-400 w-9 text-right font-mono text-[11px]">
                  {m.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. RECENT TRANSACTIONS TABLE
// ============================================================================
export function RecentTransactionsTable({
  transactions,
  onSelectTransaction,
}: {
  transactions: OwnerRecentTransaction[];
  onSelectTransaction?: (tx: OwnerRecentTransaction) => void;
}) {
  return (
    <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Transaksi Terbaru</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar transaksi terkini dari pelanggan
          </p>
        </div>
        <Link
          to="/owner/audit"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
        >
          Lihat Semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 font-medium">
              <th className="pb-3 font-medium">No. Transaksi</th>
              <th className="pb-3 font-medium">Layanan</th>
              <th className="pb-3 font-medium">Capster</th>
              <th className="pb-3 font-medium">Nominal</th>
              <th className="pb-3 font-medium">Metode</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                  Belum ada transaksi pada periode ini
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isPaid = tx.status === "Selesai";
                const isCancelled = tx.status === "Batal";
                const isPending = tx.status === "Menunggu" || tx.status === "Diproses";

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction?.(tx)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 font-mono text-slate-300 font-semibold">
                      {tx.shortId}
                    </td>
                    <td className="py-3.5 text-white font-medium max-w-[180px] truncate">
                      {tx.serviceNames}
                    </td>
                    <td className="py-3.5 text-slate-300">{tx.capsterName}</td>
                    <td className="py-3.5 font-semibold text-white">
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                          tx.paymentMethod === "tunai"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : tx.paymentMethod === "qris"
                            ? "bg-blue-500/15 text-blue-300"
                            : "bg-purple-500/15 text-purple-300"
                        }`}
                      >
                        {tx.paymentMethodLabel}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-300"
                            : isCancelled
                            ? "bg-rose-500/15 text-rose-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-right font-mono text-[11px]">
                      {tx.dateTime}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 8. CAPSTER PERFORMANCE TABLE
// ============================================================================
export function CapsterPerformanceTable({
  performance,
}: {
  performance: OwnerCapsterPerformance[];
}) {
  return (
    <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Performa Capster</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Kontribusi transaksi dan estimasi komisi per capster
          </p>
        </div>
        <Link
          to="/owner/capsters"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
        >
          Lihat Capster <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 font-medium">
              <th className="pb-3 font-medium">Nama Capster</th>
              <th className="pb-3 font-medium text-center">Total Transaksi</th>
              <th className="pb-3 font-medium">Total Pendapatan Layanan</th>
              <th className="pb-3 font-medium">Komisi</th>
              <th className="pb-3 font-medium text-right">Persentase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {performance.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  Belum ada data performa capster
                </td>
              </tr>
            ) : (
              performance.map((c) => (
                <tr key={c.capsterId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
                        {c.avatarLetter}
                      </div>
                      <div>
                        <div className="text-white font-medium">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {c.noPegawai}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-center font-semibold text-white">
                    {c.totalTransactions}
                  </td>
                  <td className="py-3.5 font-semibold text-white">
                    {formatRupiah(c.totalRevenue)}
                  </td>
                  <td className="py-3.5 font-semibold text-emerald-400">
                    {formatRupiah(c.commissionAmount)}
                  </td>
                  <td className="py-3.5 text-right text-slate-300 font-mono">
                    {c.commissionPercentage}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 9. RECENT CANCELLATIONS TABLE
// ============================================================================
export function RecentCancellationsTable({
  cancellations,
}: {
  cancellations: OwnerRecentCancellation[];
}) {
  return (
    <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Pembatalan Terbaru</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit riwayat transaksi yang dibatalkan
          </p>
        </div>
        <Link
          to="/owner/audit"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
        >
          Lihat Semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 font-medium">
              <th className="pb-3 font-medium">No. Transaksi</th>
              <th className="pb-3 font-medium">Capster</th>
              <th className="pb-3 font-medium">Alasan Pembatalan</th>
              <th className="pb-3 font-medium">Dibatalkan Oleh</th>
              <th className="pb-3 font-medium text-right">Waktu</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {cancellations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                  Tidak ada transaksi yang dibatalkan
                </td>
              </tr>
            ) : (
              cancellations.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono text-slate-300 font-semibold">
                    {c.shortId}
                  </td>
                  <td className="py-3 text-slate-300">{c.capsterName}</td>
                  <td className="py-3 text-rose-300 max-w-[200px] truncate">
                    {c.reason}
                  </td>
                  <td className="py-3 text-slate-400">{c.cancelledBy}</td>
                  <td className="py-3 text-slate-400 text-right font-mono text-[11px]">
                    {c.date} {c.time}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/15 text-rose-300">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 10. TRANSACTION DETAIL MODAL
// ============================================================================
export function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: OwnerRecentTransaction | null;
  onClose: () => void;
}) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0F1D33] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Detail Transaksi</h3>
            <p className="text-xs text-slate-400 font-mono">
              {transaction.shortId}
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Status</span>
            <span
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                transaction.status === "Selesai"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : transaction.status === "Batal"
                  ? "bg-rose-500/15 text-rose-300"
                  : "bg-amber-500/15 text-amber-300"
              }`}
            >
              {transaction.status}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Pelanggan</span>
            <span className="text-white font-medium">
              {transaction.customerName}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Capster yang Melayani</span>
            <span className="text-white font-medium">
              {transaction.capsterName}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Layanan</span>
            <span className="text-white font-medium text-right max-w-[200px]">
              {transaction.serviceNames}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Metode Pembayaran</span>
            <span className="text-white font-medium capitalize">
              {transaction.paymentMethodLabel}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Waktu Transaksi</span>
            <span className="text-white font-mono">{transaction.dateTime}</span>
          </div>

          {transaction.notes && (
            <div className="py-2 border-b border-slate-800">
              <span className="text-slate-400 block mb-1">Catatan</span>
              <span className="text-slate-200">{transaction.notes}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-semibold text-slate-300">Total Biaya</span>
            <span className="text-lg font-extrabold text-emerald-400">
              {formatRupiah(transaction.amount)}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
