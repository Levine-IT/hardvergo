import {
	boolean,
	integer,
	json,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

// Enums
export const rankingEnum = pgEnum("ranking", [
	"newbie",
	"apprentice",
	"trader",
	"regular",
	"veteran",
	"elite_member",
	"trusted_seller",
	"top_dealer",
]);
export const status = pgEnum("status", ["active", "inactive", "reserved"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "user", "moderator"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const imageFormatEnum = pgEnum("image_format", [
	"webp",
	"jpeg",
	"png",
	"avif",
]);
export const attributeTypeEnum = pgEnum("attribute_type", [
	"numeric",
	"select",
]);
export const numericAttributeTypeEnum = pgEnum("numeric_attribute_type", [
	"integer",
	"float",
]);
export const selectAttributeTypeEnum = pgEnum("select_attribute_type", [
	"single",
]);
export const ratedAsEnum = pgEnum("rated_as", ["buyer", "seller"]);
export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"confirmed",
	"in_progress",
	"completed",
	"cancelled",
]);

// Users table
export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	username: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	passwordHash: text("password_hash"),
	bio: varchar({ length: 500 }).notNull().default(""),
	role: userRoleEnum("role").notNull().default("user"),
	rank: rankingEnum("ranking").notNull().default("newbie"),
	profilePictureUrl: text("profile_picture_url"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	key: varchar({ length: 255 }).notNull().unique(),
	name: varchar({ length: 255 }).notNull(),
	parentId: integer("parent_id").references(() => categories.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Attributes table
export const attributes = pgTable("attributes", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	categoryId: integer("category_id")
		.notNull()
		.references(() => categories.id),
	key: varchar({ length: 255 }).notNull(),
	label: varchar({ length: 255 }).notNull(),
	type: attributeTypeEnum("type").notNull(),
	required: boolean().notNull().default(false),
	// For numeric attributes
	minValue: real("min_value"),
	maxValue: real("max_value"),
	numericType: numericAttributeTypeEnum("numeric_type"),
	// For select attributes
	selectType: selectAttributeTypeEnum("select_type"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Select attribute values table
export const selectAttributeValues = pgTable("select_attribute_values", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	attributeId: integer("attribute_id")
		.notNull()
		.references(() => attributes.id),
	key: varchar({ length: 255 }).notNull(),
	label: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Listings table
export const listings = pgTable("listings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	status: status("status").notNull().default("active"),
	price: integer().notNull(),
	sellerId: integer("seller_id")
		.notNull()
		.references(() => users.id),
	categoryId: integer("category_id")
		.notNull()
		.references(() => categories.id),
	attributes: json("attributes").$type<Record<string, unknown>>(), // Category-specific attributes
	locations: json("locations").$type<string[]>(), // Cities for personal trade
	coverItemId: varchar("cover_item_id", { length: 255 }), // Reference to media item
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	listingId: integer("listing_id")
		.notNull()
		.references(() => listings.id),
	buyerId: integer("buyer_id")
		.notNull()
		.references(() => users.id),
	sellerId: integer("seller_id")
		.notNull()
		.references(() => users.id),
	status: orderStatusEnum("status").notNull().default("pending"),
	agreedPrice: integer("agreed_price").notNull(), // Final agreed price
	notes: text(), // Additional notes from buyer or seller
	orderDate: timestamp("order_date").notNull().defaultNow(), // When order was placed
	confirmedAt: timestamp("confirmed_at"), // When seller confirmed
	completedAt: timestamp("completed_at"), // When transaction was completed
	cancelledAt: timestamp("cancelled_at"), // When order was cancelled
	cancellationReason: text("cancellation_reason"), // Reason for cancellation
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Media items table
export const mediaItems = pgTable("media_items", {
	id: varchar({ length: 255 }).primaryKey(), // Custom ID like "media_abc123def456"
	listingId: integer("listing_id")
		.notNull()
		.references(() => listings.id),
	filename: varchar({ length: 255 }).notNull(),
	type: mediaTypeEnum("type").notNull(),
	order: integer().notNull().default(0),
	uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
	// Image data
	altText: text("alt_text"),
	// Video data
	videoUrl: text("video_url"),
	videoDuration: integer("video_duration"), // Duration in seconds
	videoThumbnailUrl: text("video_thumbnail_url"),
});

// Image variants table (for different sizes/formats of the same image)
export const imageVariants = pgTable("image_variants", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	mediaItemId: varchar("media_item_id", { length: 255 })
		.notNull()
		.references(() => mediaItems.id),
	url: text().notNull(),
	width: integer().notNull(),
	height: integer().notNull(),
	fileSize: integer("file_size").notNull(), // File size in bytes
	format: imageFormatEnum("format").notNull(),
});

// User ratings table (to support averageRating and ratingCount in UserDto)
export const userRatings = pgTable("user_ratings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	raterId: integer("rater_id")
		.notNull()
		.references(() => users.id),
	ratedUserId: integer("rated_user_id")
		.notNull()
		.references(() => users.id),
	rating: integer().notNull(), // 1-5 rating
	ratedAs: ratedAsEnum("rated_as").notNull(),
	comment: text(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User activity table (to track lastActivity in UserDto)
export const userActivity = pgTable("user_activity", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	activityType: varchar("activity_type", { length: 100 }).notNull(), // login, listing_created, etc.
	activityData: json("activity_data").$type<Record<string, unknown>>(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
