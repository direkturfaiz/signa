import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useBarberin } from "@/lib/barberin-store";
import { getTransactionDetail } from "@/lib/bookings";

export const Route = createFileRoute("/customer/payment-confirmation")({
  head: () => ({
    meta: [
      { title: "BARBERIN" },
    ],
  }),
  component: PaymentConfirmationRedirect,
});

function PaymentConfirmationRedirect() {
  const navigate = useNavigate();
  const { transactionId } = useBarberin();

  useEffect(() => {
    if (!transactionId) {
      navigate({ to: "/customer/services" });
      return;
    }

    getTransactionDetail({ data: { transactionId } })
      .then((detail) => {
        if (detail && (detail.status === "paid" || detail.paymentStatus === "success")) {
          navigate({
            to: "/customer/receipt/$transactionId",
            params: { transactionId },
          });
        } else {
          navigate({ to: "/customer/service-execution" });
        }
      })
      .catch(() => {
        navigate({ to: "/customer/service-execution" });
      });
  }, [transactionId, navigate]);

  return null;
}

