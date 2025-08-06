import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import type { UserActivityService } from "./user-activity.service";

// Extend Express Request interface to include user information
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: number;
				username?: string;
				email?: string;
				role?: string;
			};
		}
	}
}

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
	constructor(private readonly userActivityService: UserActivityService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();

		return next.handle().pipe(
			tap({
				next: () => {
					// Log activity after successful response
					if (
						request.user?.id &&
						response.statusCode >= 200 &&
						response.statusCode < 300
					) {
						// Use setImmediate to avoid blocking the response
						setImmediate(() => {
							this.logActivity(request, response).catch((error) => {
								console.error("Failed to log user activity:", error);
							});
						});
					}
				},
				error: () => {
					// Optionally log failed requests too
					if (request.user?.id) {
						setImmediate(() => {
							this.logFailedActivity(request, response).catch((error) => {
								console.error("Failed to log user activity:", error);
							});
						});
					}
				},
			}),
		);
	}

	private async logFailedActivity(req: Request, res: Response): Promise<void> {
		if (!req.user?.id) {
			return;
		}

		const activityData = {
			method: req.method,
			path: req.path,
			statusCode: res.statusCode,
			userAgent: req.get("User-Agent"),
			ip: req.ip,
			timestamp: new Date().toISOString(),
			error: true,
		};

		await this.userActivityService.logActivity({
			userId: req.user.id,
			activityType: "api_error",
			activityData,
		});
	}

	private async logActivity(req: Request, res: Response): Promise<void> {
		if (!req.user?.id) {
			return;
		}

		const activityType = this.determineActivityType(
			req.method,
			req.path,
			res.statusCode,
		);

		if (activityType) {
			const activityData = {
				method: req.method,
				path: req.path,
				statusCode: res.statusCode,
				userAgent: req.get("User-Agent"),
				ip: req.ip,
				timestamp: new Date().toISOString(),
				...this.extractRelevantData(req, activityType),
			};

			await this.userActivityService.logActivity({
				userId: req.user.id,
				activityType,
				activityData,
			});
		}
	}

	private determineActivityType(
		method: string,
		path: string,
		statusCode: number,
	): string | null {
		// Only log successful requests (2xx status codes)
		if (statusCode < 200 || statusCode >= 300) {
			return null;
		}

		const normalizedPath = path.toLowerCase();

		// Authentication activities
		if (normalizedPath.includes("/auth/login")) {
			return "login";
		}
		if (normalizedPath.includes("/auth/logout")) {
			return "logout";
		}

		// Listing activities
		if (method === "POST" && normalizedPath.includes("/listings")) {
			return "listing_created";
		}
		if (method === "PUT" && normalizedPath.includes("/listings")) {
			return "listing_updated";
		}
		if (method === "DELETE" && normalizedPath.includes("/listings")) {
			return "listing_deleted";
		}
		if (method === "GET" && normalizedPath.includes("/listings/")) {
			return "listing_viewed";
		}

		// Order activities
		if (method === "POST" && normalizedPath.includes("/orders")) {
			return "order_created";
		}
		if (method === "PUT" && normalizedPath.includes("/orders")) {
			return "order_updated";
		}

		// User profile activities
		if (method === "PUT" && normalizedPath.includes("/users/")) {
			return "profile_updated";
		}
		if (
			method === "GET" &&
			normalizedPath.includes("/users/") &&
			!normalizedPath.endsWith("/users")
		) {
			return "profile_viewed";
		}

		// Generic API activity for other endpoints
		if (method === "GET") {
			return "api_access";
		}

		return null;
	}

	private extractRelevantData(
		req: Request,
		activityType: string,
	): Record<string, unknown> {
		const data: Record<string, unknown> = {};

		// Extract ID from URL path for resource-specific activities
		const pathSegments = req.path.split("/").filter(Boolean);
		const lastSegment = pathSegments[pathSegments.length - 1];

		if (/^\d+$/.test(lastSegment)) {
			data.resourceId = parseInt(lastSegment, 10);
		}

		// Add activity-specific data
		switch (activityType) {
			case "listing_created":
			case "listing_updated":
				if (req.body) {
					data.listingTitle = req.body.title;
					data.categoryId = req.body.categoryId;
					data.price = req.body.price;
				}
				break;
			case "order_created":
				if (req.body) {
					data.listingId = req.body.listingId;
					data.agreedPrice = req.body.agreedPrice;
				}
				break;
			case "profile_updated":
				if (req.body) {
					data.updatedFields = Object.keys(req.body);
				}
				break;
		}

		return data;
	}
}
