import { ValueObject } from "@/value-object";

export class UserId implements ValueObject<string> {
	private constructor(readonly value: string) {}
}
