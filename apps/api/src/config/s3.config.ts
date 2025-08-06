import { registerAs } from "@nestjs/config";

export interface S3Config {
	endpoint: string;
	region: string;
	credentials: {
		accessKeyId: string;
		secretAccessKey: string;
	};
	bucketName: string;
	draftPrefix: string;
	persistentPrefix: string;
}

export default registerAs(
	"s3",
	(): S3Config => ({
		endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
		region: process.env.S3_REGION || "eu-central-1",
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
		},
		bucketName: process.env.S3_BUCKET_NAME || "",
		draftPrefix: "draft/images/",
		persistentPrefix: "images/",
	}),
);
