import {
  pgTable,
  bigserial,
  bigint,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    discordId: text("discord_id").notNull(),
    profileId: bigint("profile_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("users_discord_id_unique").on(table.discordId)],
);

export const guilds = pgTable(
  "guilds",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    guildId: text("guild_id").notNull(),
    clubId: bigint("club_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("guilds_guild_id_unique").on(table.guildId)],
);
