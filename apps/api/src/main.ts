import { ConsoleLogger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: new ConsoleLogger({
			prefix: "HadrverGo", // Default is "Nest"
		}),
	});

	const config = new DocumentBuilder()
		.setTitle("HardverGo")
		.setDescription(
			"Platform for users to list and sell their used electronic devices",
		)
		.setVersion("1.0")
		.build();
	const document = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("swagger", app, document);

	app.use(
		"/reference",
		apiReference({
			content: document,
		}),
	);

	await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
