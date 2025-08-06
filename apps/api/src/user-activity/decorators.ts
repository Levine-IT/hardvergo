import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

// Decorator to extract user from request
export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<Request>();
		return request.user;
	},
);

// Activity logging decorator
export const LogActivity = (activityType?: string) => {
	return (
		_target: any,
		propertyName: string,
		descriptor: PropertyDescriptor,
	) => {
		const method = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			// Execute the original method
			const result = await method.apply(this, args);

			// Log activity (this would need to be implemented based on your DI setup)
			// For now, this is a placeholder that shows the pattern
			console.log(`Activity logged: ${activityType || propertyName}`);

			return result;
		};
	};
};
