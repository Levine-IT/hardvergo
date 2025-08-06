import { ListingId } from "src/listings/model/listing-id";
import { UserId } from "src/users/model/user-id";

interface S3Image {
	readonly bucketName: string;
	getPath(): string;
	getKey(): string;
}

export class DraftImage implements S3Image {
	readonly bucketName: string;
	readonly userId: UserId;
	/**
	 * Filename with extenison
	 */
	readonly fileName: string;

	constructor(bucketName: string, userId: UserId, fileName: string) {
		this.bucketName = bucketName;
		this.userId = userId;
		this.fileName = fileName;
	}

	/**
	 * Full path with bucket name
	 */
	getPath(): string {
		return `${this.bucketName}/${this.userId.toString()}/${this.fileName}`;
	}

	/**
	 * Relative path without bucket
	 */
	getKey(): string {
		return `${this.userId.toString()}/${this.fileName}`;
	}

	toPersistantImage(persistentBucketName: string, listingId: ListingId): PersistantImage {
		return new PersistantImage(persistentBucketName, this.userId, listingId, this.fileName)
	}

}

export class PersistantImage implements S3Image {
	readonly bucketName: string;
	readonly listingId: ListingId;
	readonly userId: UserId;
	/**
	 * Filename with extenison
	 */
	readonly fileName: string;

	constructor(bucketName: string, userId: UserId, listingId: ListingId, fileName: string) {
		this.bucketName = bucketName;
		this.listingId = listingId;
		this.userId = userId;
		this.fileName = fileName;
	}

	/**
	 * Full path with bucket name
	 */
	getPath(): string {
		return `${this.bucketName}/${this.userId.toString()}/${this.listingId.toString()}/${this.fileName}`;
	}

	/**
	 * Relative path without bucket
	 */
	getKey(): string {
		return `${this.userId.toString()}/${this.fileName}`;
	}
}