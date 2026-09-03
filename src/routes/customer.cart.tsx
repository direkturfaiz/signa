import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import {
  BottomActionBar,
  CartItem,
  CustomerHeader,
  MobileShell,
  PrimaryButton,
  PriceSummary,
  EmptyState,
  SelectedCapsterCard,
  SecondaryButton,
} from "@/components/barberin/ui";
import { formatRupiah } from "@/lib/format";
import { actions, cartTotal, useBarberin } from "@/lib/barberin-store";

export const Route = createFileRoute("/customer/cart")({
  head: () => ({
    meta: [
      { title: "Keranjang — BARBERIN" },
      { name: "description", content: "Periksa layanan dan total pembayaran Anda di BARBERIN." },
      { property: "og:title", content: "Keranjang — BARBERIN" },
      { property: "og:description", content: "Periksa layanan dan total pembayaran Anda." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, selectedCapster } = useBarberin();
  const total = cartTotal(cartItems);

  return (
    <MobileShell>
      <CustomerHeader title="Keranjang" subtitle="Langkah 2 dari 5" backTo="/customer/capster" />

      <main className="flex-1 space-y-3 px-4 pb-6 pt-4">
        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Keranjang masih kosong."
            description="Silakan pilih layanan terlebih dahulu."
            action={
              <PrimaryButton onClick={() => navigate({ to: "/customer/services" })}>
                Pilih Layanan
              </PrimaryButton>
            }
          />
        ) : (
          <>
            {cartItems.map((item) => (
              <CartItem
                key={item.service.id}
                item={item}
                onDecrease={() => actions.setQuantity(item.service.id, item.quantity - 1)}
                onIncrease={() => actions.setQuantity(item.service.id, item.quantity + 1)}
                onRemove={() => actions.removeService(item.service.id)}
              />
            ))}
            {selectedCapster ? (
              <SelectedCapsterCard
                capster={selectedCapster}
                action={
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/customer/capster" })}
                    className="rounded-[12px] px-2 py-1 text-[13px] font-semibold text-primary-soft transition-colors active:bg-white/10"
                  >
                    Ganti Capster
                  </button>
                }
              />
            ) : (
              <SecondaryButton onClick={() => navigate({ to: "/customer/capster" })}>
                Pilih Capster
              </SecondaryButton>
            )}
            <PriceSummary items={cartItems} total={total} />
          </>
        )}
      </main>

      {cartItems.length > 0 ? (
        <BottomActionBar>
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-muted-foreground">Total</span>
            <span className="text-[18px] font-bold">{formatRupiah(total)}</span>
          </div>
          <PrimaryButton
            disabled={!selectedCapster}
            onClick={() => navigate({ to: "/customer/customer-info" })}
          >
            Lanjutkan
          </PrimaryButton>
        </BottomActionBar>
      ) : null}
    </MobileShell>
  );
}
