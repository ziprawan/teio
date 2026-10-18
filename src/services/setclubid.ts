import { sql } from "drizzle-orm";
import { db, guilds } from "../db";
import { umaMoeFetch } from "../utils/uma-moe";
import type { DiscordInteraction } from "./setprofileid";

interface UmaMoeCircleResponse {
  circle?: {
    circle_id?: number;
    name?: string;
  };
}

export async function setClubIdHandler(interaction: DiscordInteraction) {
  if (!interaction?.guild_id || !interaction?.channel_id) {
    return {
      type: 4,
      data: {
        content: "This command can only be executed inside a server channel",
      },
    };
  }

  const rawPerms = interaction?.member?.permissions ?? "0";
  let isAdmin = false;
  try {
    isAdmin = (BigInt(rawPerms) & 8n) === 8n;
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    return {
      type: 4,
      data: {
        content: "Only server administrators can set the server club ID",
      },
    };
  }

  const options = interaction?.data?.options;
  if (!Array.isArray(options) || options.length !== 1) {
    return {
      type: 4,
      data: {
        content: "Invalid argument: expected 1 number argument",
      },
    };
  }

  const rawValue = options[0]?.value;
  const clubId =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string" && rawValue.trim() !== ""
        ? Number(rawValue)
        : NaN;

  if (!Number.isFinite(clubId)) {
    return {
      type: 4,
      data: {
        content: "Invalid argument: club ID must be a number",
      },
    };
  }

  try {
    const res = await umaMoeFetch<UmaMoeCircleResponse>("/api/v4/circles", {
      params: { circle_id: clubId },
    });

    if (res.status === 200) {
      await db
        .insert(guilds)
        .values({
          guildId: interaction.guild_id,
          clubId,
        })
        .onConflictDoUpdate({
          target: guilds.guildId,
          set: {
            clubId,
            updatedAt: sql`now()`,
          },
        });

      const circleName = res.data?.circle?.name;
      return {
        type: 4,
        data: {
          content: circleName
            ? `Saved club ID preference for this server: **${clubId}** (${circleName})`
            : `Saved club ID preference for this server: **${clubId}**`,
        },
      };
    }

    if (res.status >= 500) {
      return {
        type: 4,
        data: {
          content: "API error, please report it to the developer",
        },
      };
    }

    return {
      type: 4,
      data: {
        content: "user not found",
      },
    };
  } catch {
    return {
      type: 4,
      data: {
        content: "API error, please report it to the developer",
      },
    };
  }
}
