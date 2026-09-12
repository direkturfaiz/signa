import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/superadmin/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/superadmin/tenants" });
  },
  component: () => null,
});
