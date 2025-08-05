import { registerAs } from "@nestjs/config";

export interface S3Config {
	region: string;
	credentials: {
		accessKeyId: string;
		secretAccessKey: string;
	};
	bucketName: string;
	tempPrefix: string;
	persistentPrefix: string;
}

export default registerAs(
	"s3",
	(): S3Config => ({
		region: process.env.AWS_REGION || "us-east-1",
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
		},
		bucketName: process.env.S3_BUCKET_NAME || "",
		tempPrefix: "temp/images/",
		persistentPrefix: "images/",
	}),
);
