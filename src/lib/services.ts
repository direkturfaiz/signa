import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { services } from "@/db/schema";

export const getServices = createServerFn({
  method: "GET",
}).handler(async () => {
  const result = await db
    .select({
      id: services.id,
      name: services.name,
      category: services.category,
      price: services.price,
      status: services.status,
    })
    .from(services);

  return result;
});