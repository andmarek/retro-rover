import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
	database: new Pool({
		connectionString: process.env.POSTGRES_CONNECTION_STRING,
		// DigitalOcean managed Postgres typically requires SSL
		ssl: { rejectUnauthorized: false },
	}),
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins: ["http://localhost:3000", "https://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
