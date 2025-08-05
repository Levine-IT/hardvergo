CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."rated_as" AS ENUM('buyer', 'seller');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"listing_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
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
ALTER TABLE "users" ALTER COLUMN "ranking" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "ranking" SET DEFAULT 'newbie'::text;--> statement-breakpoint
DROP TYPE "public"."ranking";--> statement-breakpoint
CREATE TYPE "public"."ranking" AS ENUM('newbie', 'apprentice', 'trader', 'regular', 'veteran', 'elite_member', 'trusted_seller', 'top_dealer');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "ranking" SET DEFAULT 'newbie'::"public"."ranking";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "ranking" SET DATA TYPE "public"."ranking" USING "ranking"::"public"."ranking";--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DEFAULT 'active'::text;--> statement-breakpoint
DROP TYPE "public"."status";--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'reserved');--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."status";--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "user_ratings" ADD COLUMN "rated_as" "rated_as" NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;