import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserRound } from "lucide-react";

import {
  BottomActionBar,
  CapsterCard,
  CustomerHeader,
  EmptyState,
  ErrorState,
  MobileShell,
  PrimaryButton,
} from "@/components/barberin/ui";
import { CAPSTERS, actions, useBarberin } from "@/lib/barberin-store";

export const Route = createFileRoute("/customer/capster")({
  head: () => ({
    meta: [
      { title: "Pilih Capster — BARBERIN" },
      {
        name: "description",
        content: "Pilih capster BARBERIN yang akan melayani Anda sesuai ketersediaannya.",
      },
      { property: "og:title", content: "Pilih Capster — BARBERIN" },
      { property: "og:description", content: "Pilih capster yang ingin melayani Anda." },
    ],
  }),
  component: CapsterPage,
});

function CapsterPage() {
  const navigate = useNavigate();
  const { selectedCapster } = useBarberin();

  const available = CAPSTERS.filter((c) => c.status === "AVAILABLE");
  const selectedUnavailable =
    selectedCapster && !available.some((c) => c.id === selectedCapster.id);

  return (
    <MobileShell>
      <CustomerHeader
        title="Pilih Capster"
        subtitle="Pilih capster yang ingin melayani Anda."
        backTo="/customer/services"
      />

      <main className="flex-1 space-y-3 px-4 pb-6 pt-4">
        {available.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Belum ada capster yang tersedia."
            description="Semua capster sedang melayani atau tidak tersedia. Silakan coba beberapa saat lagi."
          />
        ) : (
          <>
            {selectedUnavailable ? (
              <ErrorState
                title="Capster tidak tersedia"
                message="Capster yang Anda pilih sudah tidak tersedia. Silakan pilih capster lain."
              />
            ) : null}
            {CAPSTERS.map((capster) => (
              <CapsterCard
                key={capster.id}
                capster={capster}
                selected={selectedCapster?.id === capster.id}
                onSelect={() => actions.setCapster(capster)}
              />
            ))}
          </>
        )}
      </main>

      <BottomActionBar>
        <PrimaryButton
          disabled={!selectedCapster || !!selectedUnavailable}
          onClick={() => navigate({ to: "/customer/cart" })}
        >
          Lanjutkan
        </PrimaryButton>
      </BottomActionBar>
    </MobileShell>
  );
}
