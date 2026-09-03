import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { users } from "@/db/schema";

export const testDatabase = createServerFn({
  method: "GET",
}).handler(async () => {
  const result = await db.select().from(users).limit(5);

  return {
    success: true,
    count: result.length,
    users: result,
  };
});