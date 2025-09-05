export class DraftListingState {
	private constructor(private readonly value: string) {}

	static create(jsonState: string): DraftListingState {
		const validation = DraftListingState.validateJSON(jsonState);
		if (validation.valid === false) {
			throw new Error(
				`Draft listing state has to be a valid json, error: ${validation.error}`,
			);
		}

		return new DraftListingState(jsonState);
	}

	private static validateJSON(jsonString: string): {
		valid: boolean;
		error?: string;
	} {
		try {
			JSON.parse(jsonString);
			return { valid: true };
		} catch (error) {
			return {
				valid: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	toString(): string {
		return this.value;
	}

	equals(other: DraftListingState): boolean {
		return this.value === other.value;
	}
}
