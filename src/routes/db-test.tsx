import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { testDatabase } from "@/lib/db-test";

export const Route = createFileRoute("/db-test")({
  component: DbTestPage,
});

function DbTestPage() {
  const [result, setResult] = useState<{
    success: boolean;
    count: number;
    users: unknown[];
  } | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    testDatabase()
      .then((data) => setResult(data))
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Database error");
      });
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>BARBERIN Database Test</h1>

      {error && (
        <div>
          <h2>❌ Database Error</h2>
          <pre>{error}</pre>
        </div>
      )}

      {!result && !error && <p>Testing database...</p>}

      {result && (
        <div>
          <h2>✅ Database Connected</h2>
          <p>Jumlah user: {result.count}</p>

          <pre>{JSON.stringify(result.users, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}