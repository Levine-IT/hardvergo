CREATE TYPE "public"."attribute_type" AS ENUM('numeric', 'select');--> statement-breakpoint
CREATE TYPE "public"."image_format" AS ENUM('webp', 'jpeg', 'png', 'avif');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."numeric_attribute_type" AS ENUM('integer', 'float');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ranking" AS ENUM('newbie', 'apprentice', 'trader', 'regular', 'veteran', 'elite_member', 'trusted_seller', 'top_dealer');--> statement-breakpoint
CREATE TYPE "public"."rated_as" AS ENUM('buyer', 'seller');--> statement-breakpoint
CREATE TYPE "public"."select_attribute_type" AS ENUM('single');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'reserved');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'moderator');--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"category_id" uuid NOT NULL,
	"key" varchar(255) NOT NULL,
	"label" varchar(255) NOT NULL,
	"type" "attribute_type" NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"min_value" real,
	"max_value" real,
	"numeric_type" numeric_attribute_type,
	"select_type" "select_attribute_type",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "draft_listings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"state" varchar(1024) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "draft_listings_media" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_variants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"media_item_id" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"file_size" integer NOT NULL,
	"format" "image_format" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"price" integer NOT NULL,
	"seller_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"attributes" json,
	"locations" json,
	"cover_item_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_items" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"listing_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"type" "media_type" NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"alt_text" text,
	"video_url" text,
	"video_duration" integer,
	"video_thumbnail_url" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"agreed_price" integer NOT NULL,
	"notes" text,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "select_attribute_values" (
	"id" uuid PRIMARY KEY NOT NULL,
	"attribute_id" uuid NOT NULL,
	"key" varchar(255) NOT NULL,
	"label" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" varchar(100) NOT NULL,
	"activity_data" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_ratings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"rater_id" uuid NOT NULL,
	"rated_user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"rated_as" "rated_as" NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"bio" varchar(500) DEFAULT '' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"ranking" "ranking" DEFAULT 'newbie' NOT NULL,
	"profile_picture_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_listings" ADD CONSTRAINT "draft_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_listings_media" ADD CONSTRAINT "draft_listings_media_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "select_attribute_values" ADD CONSTRAINT "select_attribute_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_rater_id_users_id_fk" FOREIGN KEY ("rater_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_rated_user_id_users_id_fk" FOREIGN KEY ("rated_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;