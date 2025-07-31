ALTER TABLE "blogs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "excerpt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "tags" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "author" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "author" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "is_featured" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "slug" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_carts" ALTER COLUMN "items" SET DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "custom_orders" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "custom_orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "meta_title" varchar(255);--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "meta_title" varchar(255);--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "views";