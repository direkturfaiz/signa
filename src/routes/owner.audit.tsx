import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/audit")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/audit-activities" });
  },
  component: () => null,
});


