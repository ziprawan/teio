CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"discord_id" text NOT NULL,
	"profile_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);
