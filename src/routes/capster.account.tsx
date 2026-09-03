import { createFileRoute } from "@tanstack/react-router";
import { LogOut, User, Phone, ShieldCheck } from "lucide-react";

import {
  GlassCard,
  MobileShell,
} from "@/components/barberin/ui";
import {
  CapsterHeader,
  CapsterBottomNav,
} from "@/components/capster/ui";

export const Route = createFileRoute("/capster/account")({
  head: () => ({
    meta: [
      { title: "Akun Capster" },
      {
        name: "description",
        content: "Informasi akun Capster",
      },
    ],
  }),
  component: CapsterAccountPage,
});

function CapsterAccountPage() {
  return (
    <MobileShell>
      <CapsterHeader
        title="Akun"
        showBack={false}
        showActions={false}
      />

      <main className="flex-1 space-y-4 px-4 pb-28 pt-4">
        {/* Profile */}
        <GlassCard className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/40">
              <User
                className="h-9 w-9 text-primary-soft"
                strokeWidth={2}
              />
            </div>

            <h2 className="mt-3 text-[18px] font-bold">
              Capster
            </h2>

            <p className="text-[12px] text-muted-foreground">
              Barber
            </p>
          </div>
        </GlassCard>

        {/* Informasi Akun */}
        <GlassCard className="space-y-4 p-4">
          <h2 className="text-[14px] font-bold border-b border-white/10 pb-2">
            Informasi Akun
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/15">
              <User
                className="h-4 w-4 text-primary-soft"
                strokeWidth={2}
              />
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">
                Nama
              </p>
              <p className="text-[13px] font-semibold">
                Capster
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/15">
              <Phone
                className="h-4 w-4 text-primary-soft"
                strokeWidth={2}
              />
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">
                Nomor Telepon
              </p>
              <p className="text-[13px] font-semibold">
                Belum tersedia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/15">
              <ShieldCheck
                className="h-4 w-4 text-primary-soft"
                strokeWidth={2}
              />
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">
                Role
              </p>
              <p className="text-[13px] font-semibold">
                Capster
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Logout */}
        <button
          type="button"
          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-danger/30 bg-danger/10 text-[13px] font-semibold text-danger transition-all active:scale-[0.98]"
        >
          <LogOut
            className="h-4 w-4"
            strokeWidth={2}
          />
          Keluar
        </button>
      </main>

      <CapsterBottomNav activeTab="account" />
    </MobileShell>
  );
}