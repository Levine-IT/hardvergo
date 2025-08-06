import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "../../db/schema";
import { userActivity } from "../../db/schema";

export interface UserActivityData {
	userId: number;
	activityType: string;
	activityData?: Record<string, unknown>;
}

@Injectable()
export class UserActivityService {
	constructor(
		@Inject("DB") private readonly drizzle: NodePgDatabase<typeof schema>,
	) {}

	async logActivity(data: UserActivityData): Promise<void> {
		try {
			await this.drizzle.insert(userActivity).values({
				userId: data.userId,
				activityType: data.activityType,
				activityData: data.activityData || {},
			});
		} catch (error) {
			// Log error but don't throw to avoid breaking the main request
			console.error("Failed to log user activity:", error);
		}
	}

	async getUserActivities(userId: number, limit = 50) {
		return await this.drizzle.query.userActivity.findMany({
			where: eq(userActivity.userId, userId),
			orderBy: (userActivity, { desc }) => [desc(userActivity.createdAt)],
			limit,
		});
	}

	async getLastActivity(userId: number) {
		const activities = await this.drizzle.query.userActivity.findMany({
			where: eq(userActivity.userId, userId),
			orderBy: (userActivity, { desc }) => [desc(userActivity.createdAt)],
			limit: 1,
		});

		return activities[0] || null;
	}
}
