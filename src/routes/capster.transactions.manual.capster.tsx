import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, UserRound } from "lucide-react";
import { useState } from "react";

import {
  BottomActionBar,
  CapsterCard,
  EmptyState,
  MobileShell,
  PrimaryButton,
} from "@/components/barberin/ui";
import { CapsterHeader } from "@/components/capster/ui";
import { CAPSTERS, capsterActions, useCapster } from "@/lib/capster-store";

export const Route = createFileRoute("/capster/transactions/manual/capster")({
  head: () => ({
    meta: [
      { title: "Pilih Capster — Buat Transaksi Manual" },
      {
        name: "description",
        content: "Pilih capster yang akan melayani transaksi manual.",
      },
    ],
  }),
  component: ManualSelectCapsterPage,
});

function ManualSelectCapsterPage() {
  const navigate = useNavigate();
  const { manualDraft } = useCapster();
  const [error, setError] = useState<string | null>(null);

  const available = CAPSTERS.filter((c) => c.status === "AVAILABLE");
  const selectedCapsterId = manualDraft.capsterId;

  const handleSelectCapster = (capster: (typeof CAPSTERS)[number]) => {
    capsterActions.setManualCapster(capster);

    if (error) {
      setError(null);
    }
  };

  const handleNext = () => {
  if (!selectedCapsterId) {
    setError("Silakan pilih capster terlebih dahulu.");
    return;
  }

  navigate({
    to: "/capster/transactions/manual/detail",
  });
};

  return (
    <MobileShell>
      <CapsterHeader
        title="Pilih Capster"
        subtitle="Pilih capster yang melayani"
        backTo="/capster/transactions/manual/services"
        showBack={true}
        showActions={false}
      />

      <main className="flex-1 space-y-3 px-4 pb-28 pt-4">
        {available.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Belum ada capster yang tersedia."
            description="Semua capster sedang melayani atau tidak tersedia."
          />
        ) : (
          <>
            <p className="text-[13px] text-muted-foreground">
              Pilih capster yang bertugas menangani pesanan ini.
            </p>

            {CAPSTERS.map((capster) => (
              <CapsterCard
                key={capster.id}
                capster={capster}
                selected={selectedCapsterId === capster.id}
                onSelect={() => handleSelectCapster(capster)}
              />
            ))}
          </>
        )}

        {error ? (
          <p
            role="alert"
            className="pt-2 text-center text-[13px] font-medium text-danger"
          >
            {error}
          </p>
        ) : null}
      </main>

      <BottomActionBar>
        <PrimaryButton
          disabled={!selectedCapsterId}
          onClick={handleNext}
        >
          LANJUT
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </PrimaryButton>
      </BottomActionBar>
    </MobileShell>
  );
}