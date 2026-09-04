import { Link, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Grid,
  Info,
  ListOrdered,
  LogOut,
  Receipt,
  Scissors,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import { BarberinLogo, GlassCard } from "@/components/barberin/ui";
import type {
  CapsterService,
  CapsterTransaction,
  ShiftInfo,
  TransactionStatus,
} from "@/lib/capster-store";

// Header Capster
export function CapsterHeader({
  title,
  subtitle,
  showBack = true,
  backTo,
  showActions = true,
}: {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  showActions?: boolean;
}) {
  const router = useRouter();

  return (
    <header className="glass-3 safe-top sticky top-0 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-x-0 border-t-0 px-4 pb-3">
      {showBack ? (
        <button
          type="button"
          aria-label="Kembali"
          onClick={() => (backTo ? router.navigate({ to: backTo }) : router.history.back())}
          className="glass-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] transition-colors active:bg-white/15"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
      ) : (
        <BarberinLogo className="h-9 w-9" />
      )}

      <div className="min-w-0 text-center">
        {title ? <h1 className="truncate text-[18px] font-bold leading-tight">{title}</h1> : null}
        {subtitle ? (
          <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2">
        {showActions ? (
          <>
            <button
              type="button"
              aria-label="Notifikasi"
              className="glass-1 relative flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors active:bg-white/15"
            >
              <Bell className="h-4 w-4 text-primary-soft" strokeWidth={2} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <Link
              to="/capster/login"
              aria-label="Profil Capster"
              className="glass-1 flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors active:bg-white/15"
            >
              <User className="h-4 w-4 text-primary-soft" strokeWidth={2} />
            </Link>
          </>
        ) : (
          <div className="h-10 w-10 shrink-0" aria-hidden />
        )}
      </div>
    </header>
  );
}

// Bottom Navigation Capster
export function CapsterBottomNav({
  activeTab,
}: {
  activeTab?: "dashboard" | "transactions" | "services" | "account";
}) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Grid, to: "/capster/dashboard" },
    { id: "transactions", label: "Transaksi", icon: ListOrdered, to: "/capster/transactions" },
    { id: "services", label: "Layanan", icon: Scissors, to: "/capster/services" },
  ] as const;

  return (
    <nav
      aria-label="Navigasi Capster"
      className="glass-3 safe-bottom sticky bottom-0 z-20 mt-auto border-x-0 border-b-0 px-3 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
    >
      <div className="grid grid-cols-3 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              to={tab.to}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[12px] py-1.5 transition-colors",
                isActive
                  ? "text-primary-soft font-semibold"
                  : "text-muted-foreground hover:text-foreground active:bg-white/5",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                  isActive && "bg-primary/20 ring-1 ring-primary/40",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[11px] leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Summary Card untuk Dashboard
export function SummaryCard({
  icon: Icon,
  title,
  value,
  delta,
  tone = "primary",
}: {
  icon: LucideIcon;
  title: string;
  value: string | number;
  delta?: string;
  tone?: "primary" | "success" | "purple" | "warning";
}) {
  const toneBg: Record<string, string> = {
    primary: "bg-primary/20 text-primary-soft ring-1 ring-primary/30",
    success: "bg-success/20 text-success ring-1 ring-success/30",
    purple: "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30",
    warning: "bg-warning/20 text-warning ring-1 ring-warning/30",
  };

  return (
    <GlassCard className="p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-[8px]", toneBg[tone])}>
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </div>
      </div>
      <div className="text-[20px] font-extrabold tracking-tight">{value}</div>
      {delta ? (
        <p className="text-[11px] font-medium text-success flex items-center gap-1">
          {delta}
        </p>
      ) : null}
    </GlassCard>
  );
}

// Card Info Shift
export function ShiftInfoCard({ shift }: { shift: ShiftInfo }) {
  return (
    <GlassCard className="space-y-3 p-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
        <Calendar className="h-4 w-4 text-primary-soft" strokeWidth={2} />
        <h2 className="text-[14px] font-bold">Informasi Shift Hari Ini</h2>
      </div>
      <div className="space-y-2 text-[13px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tanggal</span>
          <span className="font-semibold">{shift.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hari</span>
          <span className="font-semibold">{shift.day}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Waktu Mulai</span>
          <span className="font-semibold text-primary-soft">{shift.startTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Waktu Akhir</span>
          <span className="font-semibold text-primary-soft">{shift.endTime}</span>
        </div>
      </div>
    </GlassCard>
  );
}

// Card Status Check In
export function CheckInStatusCard({ isCheckedIn }: { isCheckedIn: boolean }) {
  return (
    <GlassCard className="space-y-3 p-4">
      <h2 className="text-[14px] font-bold">Status Check In</h2>
      <div className="glass-2 flex items-center gap-3 rounded-[14px] p-3.5">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            isCheckedIn ? "bg-success/20 text-success ring-1 ring-success/40" : "bg-primary/20 text-primary-soft",
          )}
        >
          <CheckCircle2 className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold">
            {isCheckedIn ? "Anda Sudah Check In" : "Belum Ada Capster Yang Check In"}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {isCheckedIn
              ? "Shift Anda aktif dan dapat memproses transaksi."
              : "Jadilah capster pertama yang check in hari ini."}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

// Section Transaksi Belum Dikonfirmasi di Dashboard
export function UnconfirmedTransactionsSection({
  transactions,
}: {
  transactions: CapsterTransaction[];
}) {
  return (
    <GlassCard className="space-y-3.5 p-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-bold uppercase tracking-wider">
            TRANSAKSI BELUM DIKONFIRMASI
          </h2>
          {transactions.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warning/20 px-1.5 text-[11px] font-bold text-warning ring-1 ring-warning/30">
              {transactions.length}
            </span>
          )}
        </div>
        <Link
          to="/capster/transactions"
          className="text-[12px] font-semibold text-primary-soft hover:underline"
        >
          Lihat Semua &gt;
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground">
          <CheckCircle2 className="mx-auto h-8 w-8 text-success/70 mb-2" strokeWidth={2} />
          <p className="text-[13px] font-semibold text-foreground">
            Tidak Ada Transaksi Menunggu
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Semua transaksi saat ini sudah dikonfirmasi.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5">
          {transactions.map((trx) => (
            <Link
              key={trx.id}
              to="/capster/transactions/$transactionId"
              params={{ transactionId: trx.id }}
              className="glass-2 block rounded-[14px] p-3 border border-white/5 space-y-2 transition-all hover:bg-white/[0.08] active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[12px] font-bold text-primary-soft truncate">
                    #{trx.id.length > 14 ? `${trx.id.slice(0, 14)}...` : trx.id}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0">• {trx.time}</span>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning ring-1 ring-warning/30">
                  <Clock className="h-3 w-3" strokeWidth={2.5} />
                  Menunggu
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-foreground">
                  {trx.customerName}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {trx.serviceNames}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[13px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {trx.paymentMethod}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px] text-foreground">
                    {formatRupiah(trx.total)}
                  </span>
                  <span className="flex h-6 items-center justify-center rounded-[8px] bg-primary/20 px-2 text-[11px] font-bold text-primary-soft ring-1 ring-primary/40">
                    Konfirmasi &gt;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// Card Section Status Layanan di Dashboard (kompatibilitas)
export function ServiceStatusSection({
  selesai,
  sedangDikerjakan,
  menunggu,
  dibatalkan,
}: {
  selesai: number;
  sedangDikerjakan: number;
  menunggu: number;
  dibatalkan: number;
}) {
  const items = [
    { label: "Selesai", count: selesai, color: "bg-success", text: "text-success" },
    { label: "Sedang Dikerjakan", count: sedangDikerjakan, color: "bg-info", text: "text-info" },
    { label: "Menunggu", count: menunggu, color: "bg-warning", text: "text-warning" },
    { label: "Dibatalkan", count: dibatalkan, color: "bg-danger", text: "text-danger" },
  ];

  return (
    <GlassCard className="space-y-3 p-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h2 className="text-[14px] font-bold uppercase tracking-wider">STATUS LAYANAN</h2>
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2.5">
              <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-white/10", item.color)} />
              <span className="font-medium">{item.label}</span>
            </div>
            <span className={cn("font-bold text-[14px]", item.text)}>{item.count}</span>
          </div>
        ))}
      </div>
      <Link
        to="/capster/services"
        className="mt-2 flex items-center justify-end text-[12px] font-semibold text-primary-soft hover:underline"
      >
        Lihat Semua Layanan &gt;
      </Link>
    </GlassCard>
  );
}

// Action Buttons Hari Ini (Transaksi Hari Ini & Akhiri Shift)
export function DailyActionButtons({
  onEndShift,
}: {
  onEndShift: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 pt-1">
      <Link
        to="/capster/transactions/today"
        className="glass-2 flex h-11 items-center justify-center rounded-[12px] px-3 text-[13px] font-semibold text-foreground transition-all active:scale-[0.98]"
      >
        Transaksi Hari Ini
      </Link>
      <button
        type="button"
        onClick={onEndShift}
        className="flex h-11 items-center justify-center gap-1.5 rounded-[12px] border border-danger/40 bg-danger/15 px-3 text-[13px] font-semibold text-danger transition-all active:scale-[0.98]"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
        Akhiri Shift
      </button>
    </div>
  );
}

// Kompatibilitas DailySummaryCard (hanya tombol aksi)
export function DailySummaryCard({
  onEndShift,
}: {
  pendapatan?: number;
  transaksi?: number;
  layanan?: number;
  selesai?: number;
  belumSelesai?: number;
  onEndShift: () => void;
}) {
  return <DailyActionButtons onEndShift={onEndShift} />;
}

// Badge Status Transaksi
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const map: Record<TransactionStatus, { bg: string; text: string; icon: LucideIcon }> = {
    Selesai: { bg: "bg-success/20 ring-success/40", text: "text-success", icon: CheckCircle2 },
    Menunggu: { bg: "bg-warning/20 ring-warning/40", text: "text-warning", icon: Clock },
    Batal: { bg: "bg-danger/20 ring-danger/40", text: "text-danger", icon: AlertCircle },
  };

  const conf = map[status] ?? map.Menunggu;
  const Icon = conf.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1",
        conf.bg,
        conf.text,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {status}
    </span>
  );
}

// Card Transaksi Item
export function CapsterTransactionCard({
  trx,
  onClick,
}: {
  trx: CapsterTransaction;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left transition-all active:scale-[0.99]"
    >
      <GlassCard className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="font-mono text-[13px] font-bold text-primary-soft">#{trx.id}</span>
            <p className="text-[11px] text-muted-foreground">
              {trx.date} • {trx.time}
            </p>
          </div>
          <TransactionStatusBadge status={trx.status} />
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[14px] font-bold leading-tight text-foreground">
              {trx.customerName}
            </p>
            <span className="shrink-0 text-[11px] font-semibold text-primary-soft">
              Capster: {trx.capsterName}
            </span>
          </div>
          <p className="truncate text-[12px] text-muted-foreground">{trx.serviceNames}</p>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[13px]">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {trx.paymentMethod}
          </span>
          <span className="font-bold text-[14px] text-foreground">{formatRupiah(trx.total)}</span>
        </div>
      </GlassCard>
    </button>
  );
}

// Modal Konfirmasi Akhiri Shift
export function ShiftEndModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <GlassCard className="w-full max-w-[360px] rounded-[24px] p-5 space-y-4 shadow-2xl border-white/20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/20 text-danger ring-1 ring-danger/40 mx-auto">
          <LogOut className="h-7 w-7" strokeWidth={2} />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-[18px] font-bold text-foreground">Akhiri Shift?</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Data transaksi dan ringkasan hari ini akan disimpan sebelum dashboard di-reset untuk siklus berikutnya.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="glass-2 flex h-11 items-center justify-center rounded-[12px] text-[14px] font-semibold text-foreground transition-all active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 items-center justify-center rounded-[12px] bg-danger text-[14px] font-semibold text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98]"
          >
            Akhiri Shift
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
