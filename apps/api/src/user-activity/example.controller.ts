import { Controller, Get, Param } from "@nestjs/common";
import { CurrentUser } from "../user-activity/decorators";
import type { UserActivityService } from "../user-activity/user-activity.service";

// Example of a simple auth guard (you'll need to implement this)
// @UseGuards(AuthGuard)
@Controller("example")
export class ExampleController {
	constructor(private readonly userActivityService: UserActivityService) {}

	@Get("manual-log")
	async manualLogExample(@CurrentUser() user: any) {
		// Manual activity logging example
		if (user?.id) {
			await this.userActivityService.logActivity({
				userId: user.id,
				activityType: "manual_action",
				activityData: {
					description: "User performed a manual action",
					timestamp: new Date().toISOString(),
				},
			});
		}

		return { message: "Activity logged manually" };
	}

	@Get("user/:id/activities")
	async getUserActivities(@Param("id") id: string) {
		const userId = parseInt(id, 10);
		const activities = await this.userActivityService.getUserActivities(
			userId,
			20,
		);
		return { activities };
	}

	@Get("user/:id/last-activity")
	async getLastActivity(@Param("id") id: string) {
		const userId = parseInt(id, 10);
		const lastActivity = await this.userActivityService.getLastActivity(userId);
		return { lastActivity };
	}
}
