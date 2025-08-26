import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./migrations",
	schema: "./src/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		url: process.env.DATABASE_URL!,
	},
});