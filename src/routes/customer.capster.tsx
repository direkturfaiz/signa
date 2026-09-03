import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserRound } from "lucide-react";

import { useEffect, useState } from "react";
import {
  BottomActionBar,
  CapsterCard,
  CustomerHeader,
  EmptyState,
  ErrorState,
  MobileShell,
  PrimaryButton,
  SkeletonCard,
} from "@/components/barberin/ui";
import { actions, useBarberin, type Capster } from "@/lib/barberin-store";
import { getCapsters } from "@/lib/capsters";

export const Route = createFileRoute("/customer/capster")({
  loader: async () => {
    try {
      return await getCapsters({ data: { onlyCheckedIn: true } });
    } catch (e) {
      console.error("Loader error getCapsters:", e);
      return [];
    }
  },
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
  const loaderData = Route.useLoaderData();
  const { selectedCapster } = useBarberin();
  const [capsters, setCapsters] = useState<Capster[]>(() => {
    if (loaderData && loaderData.length > 0) {
      return loaderData.map((c) => ({
        id: c.id_capster,
        name: c.name,
        role: c.role,
        status: c.status,
      }));
    }
    return [];
  });
  const [loading, setLoading] = useState(capsters.length === 0);

  useEffect(() => {
    if (capsters.length > 0) {
      setLoading(false);
      return;
    }
    let mounted = true;
    getCapsters({ data: { onlyCheckedIn: true } })
      .then((data) => {
        if (!mounted) return;
        const mapped: Capster[] = data.map((c) => ({
          id: c.id_capster,
          name: c.name,
          role: c.role,
          status: c.status,
        }));
        setCapsters(mapped);
      })
      .catch((err) => {
        console.error("Gagal memuat capster:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [capsters.length]);

  const available = capsters.filter((c) => c.status === "AVAILABLE");
  const selectedUnavailable =
    selectedCapster && !available.some((c) => c.id === selectedCapster.id);

  useEffect(() => {
    if (selectedUnavailable) {
      actions.setCapster(null);
    }
  }, [selectedUnavailable]);

  return (
    <MobileShell>
      <CustomerHeader
        title="Pilih Capster"
        subtitle="Pilih capster yang ingin melayani Anda."
        backTo="/customer/services"
      />

      <main className="flex-1 space-y-3 px-4 pb-6 pt-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : available.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Belum ada capster yang bertugas"
            description="Saat ini belum ada capster yang check-in atau sedang aktif bertugas. Silakan tunggu capster memulai shift."
          />
        ) : (
          <>
            {selectedUnavailable ? (
              <ErrorState
                title="Capster tidak tersedia"
                message="Capster yang Anda pilih sudah tidak bertugas. Silakan pilih capster lain."
              />
            ) : null}
            {available.map((capster) => (
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
