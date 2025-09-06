import { ValueObject } from "@/value-object";

export class DraftListingState implements ValueObject<string> {
	private constructor(public readonly value: string) {}

	static create(jsonState: string): DraftListingState {
		const validation = DraftListingState.validateJSON(jsonState);
		if (validation.valid === false) {
			throw new Error(
				`Draft listing state must be valid JSON. Error: ${validation.error}`,
			);
		}

		const canonical = JSON.stringify(jsonState); // minified, stable whitespace
		if (canonical.length > 100_000) {
			throw new Error("Draft listing state exceeds 100KB.");
		}

		return new DraftListingState(canonical);
	}

	private static validateJSON(jsonString: string): {
		valid: boolean;
		error: string;
	} {
		try {
			const parsed: unknown = JSON.parse(jsonString);

			if (parsed === null || typeof parsed !== "object") {
				return {
					valid: false,
					error: "Draft listing state must be a JSON object.",
				};
			}

			return { valid: true, error: "" };
		} catch (error) {
			return {
				valid: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}
}
