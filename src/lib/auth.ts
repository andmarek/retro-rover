import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { getPostgresPoolConfig } from "@/lib/postgres-config";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  "http://localhost:3000";

const trustedOrigins = Array.from(
  new Set(
    [baseURL, "http://localhost:3000", "https://localhost:3000"]
      .map((url) => {
        try {
          return new URL(url).origin;
        } catch {
          return null;
        }
      })
      .filter((url): url is string => Boolean(url))
  )
);

export const auth = betterAuth({
	baseURL,
	database: new Pool(getPostgresPoolConfig()),
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins,
});

export type Session = typeof auth.$Infer.Session;
