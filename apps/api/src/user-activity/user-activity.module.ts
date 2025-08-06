import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { UserActivityInterceptor } from "./user-activity.interceptor";
import { UserActivityService } from "./user-activity.service";

@Module({
	providers: [
		UserActivityService,
		{
			provide: APP_INTERCEPTOR,
			useClass: UserActivityInterceptor,
		},
	],
	exports: [UserActivityService],
})
export class UserActivityModule {}
