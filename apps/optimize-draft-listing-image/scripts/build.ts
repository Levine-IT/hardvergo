import * as esbuild from "esbuild";
import * as fs from "fs";

const isWatchMode = process.argv.includes("--watch");

const buildConfig: esbuild.BuildOptions = {
	entryPoints: ["src/index.ts"],
	bundle: true,
	platform: "node",
	target: "node22",
	outfile: "dist/index.js",
	external: ["sharp"], // Keep sharp as external since it has native binaries
	minify: true,
	sourcemap: true,
	format: "cjs",
	logLevel: "info",
	metafile: true,
};

const build = async (): Promise<void> => {
	try {
		if (isWatchMode) {
			const ctx = await esbuild.context(buildConfig);
			console.log("Starting esbuild in watch mode...");
			await ctx.watch();
			console.log("Exiting esbuild in watch mode...");
		} else {
			const result = await esbuild.build(buildConfig);

			// Write metafile for bundle analysis
			if (result.metafile) {
				fs.writeFileSync(
					"dist/meta.json",
					JSON.stringify(result.metafile, null, 2),
				);
			}
			console.log("Build completed successfully!");
		}
	} catch (error) {
		console.error("Build failed:", error);
		process.exit(1);
	}
};

void build();
