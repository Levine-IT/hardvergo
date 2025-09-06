import { ValueObject } from "@/value-object";

export class UserId implements ValueObject<string> {
	public constructor(readonly value: string) {}
}
