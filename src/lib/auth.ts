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
});

export type Session = typeof auth.$Infer.Session;
