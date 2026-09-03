import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Info, LogIn } from "lucide-react";
import { useState } from "react";

import {
  BottomActionBar,
  GlassCard,
  MobileShell,
  PrimaryButton,
} from "@/components/barberin/ui";
import {
  CapsterHeader,
  CheckInStatusCard,
  ShiftInfoCard,
} from "@/components/capster/ui";
import { capsterActions, useCapster } from "@/lib/capster-store";

export const Route = createFileRoute("/capster/check-in")({
  head: () => ({
    meta: [
      { title: "Check In Shift — BARBERIN" },
      { name: "description", content: "Check in shift harian Capster BARBERIN." },
    ],
  }),
  component: CheckInPage,
});

function CheckInPage() {
  const navigate = useNavigate();
  const { shiftInfo } = useCapster();
  const [checking, setChecking] = useState(false);

  const handleCheckIn = () => {
    if (shiftInfo.isCheckedIn) {
      navigate({ to: "/capster/dashboard" });
      return;
    }
    setChecking(true);
    setTimeout(() => {
      capsterActions.checkIn();
      setChecking(false);
      navigate({ to: "/capster/dashboard" });
    }, 600);
  };

  return (
    <MobileShell>
      <CapsterHeader
        title="Check In Shift"
        backTo="/capster/login"
        showBack={true}
        showActions={false}
      />

      <main className="flex-1 space-y-4 px-4 pb-8 pt-4">
        {/* Card Informasi Shift Hari Ini */}
        <ShiftInfoCard shift={shiftInfo} />

        {/* Card Status Check In */}
        <CheckInStatusCard isCheckedIn={shiftInfo.isCheckedIn} />

        {/* Kotak Perhatian Aturan Check In (BPMN) */}
        <GlassCard className="flex items-start gap-3 border-info/30 bg-info/10 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" strokeWidth={2.2} />
          <div className="space-y-1 text-[13px]">
            <p className="font-bold text-info">Perhatian!</p>
            <p className="text-muted-foreground leading-relaxed">
              Hanya 1 capster yang dapat check in setiap hari. Jika sudah ada yang check in, Anda tidak dapat check in lagi.
            </p>
          </div>
        </GlassCard>
      </main>

      <BottomActionBar>
        <PrimaryButton onClick={handleCheckIn} loading={checking}>
          <LogIn className="h-4 w-4" strokeWidth={2} />
          {shiftInfo.isCheckedIn ? "MENUJU DASHBOARD" : "CHECK IN"}
        </PrimaryButton>
        <p className="text-center text-[11px] text-muted-foreground pt-1">
          Setelah shift selesai dan data di-reset, sistem akan kembali ke halaman ini.
        </p>
      </BottomActionBar>
    </MobileShell>
  );
}
