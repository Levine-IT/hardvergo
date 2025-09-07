import { ValueObject } from "@/value-object";

export class DraftListingImageSourceId implements ValueObject<string> {
	constructor(readonly value: string) {}

	toString(): string {
		return this.value;
	}
}
