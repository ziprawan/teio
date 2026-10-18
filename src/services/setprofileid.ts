import { sql } from "drizzle-orm";
import { db, users } from "../db";
import { umaMoeFetch } from "../utils/uma-moe";

export interface DiscordCommandOption {
  name?: string;
  type?: number;
  value?: unknown;
}

export interface DiscordInteraction {
  type?: number;
  guild_id?: string;
  channel_id?: string;
  member?: {
    permissions?: string;
    user?: {
      id?: string;
      username?: string;
    };
  };
  user?: {
    id?: string;
    username?: string;
  };
  data?: {
    name?: string;
    options?: DiscordCommandOption[];
  };
}


interface UmaMoeProfileResponse {
  trainer?: {
    account_id?: string;
    name?: string;
  };
}
export async function setProfileIdHandler(interaction: DiscordInteraction) {
  const callerDiscordId =
    interaction?.member?.user?.id ?? interaction?.user?.id;
  if (!callerDiscordId) {
    return {
      type: 4,
      data: {
        content: "Could not determine Discord user ID",
      },
    };
  }

  const options = interaction?.data?.options;
  if (!Array.isArray(options) || options.length < 1 || options.length > 2) {
    return {
      type: 4,
      data: {
        content: "Invalid arguments",
      },
    };
  }

  let idOption: DiscordCommandOption | undefined;
  let userOption: DiscordCommandOption | undefined;
  for (const opt of options) {
    if (opt.name === "id") {
      idOption = opt;
    } else if (opt.name === "user") {
      userOption = opt;
    }
  }
  if (!idOption && options.length === 1) {
    idOption = options[0];
  }

  let targetDiscordId = callerDiscordId;
  if (userOption && userOption.value !== undefined && userOption.value !== null) {
    if (!interaction?.guild_id) {
      return {
        type: 4,
        data: {
          content:
            "Assigning another user's profile ID can only be done inside a server",
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
          content:
            "Only server administrators can assign another user's profile ID",
        },
      };
    }

    if (typeof userOption.value !== "string" || userOption.value.trim() === "") {
      return {
        type: 4,
        data: {
          content: "Invalid argument: target user ID is invalid",
        },
      };
    }
    targetDiscordId = userOption.value;
  }

  const rawValue = idOption?.value;
  const profileId =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string" && rawValue.trim() !== ""
        ? Number(rawValue)
        : NaN;

  if (!Number.isFinite(profileId)) {
    return {
      type: 4,
      data: {
        content: "Invalid argument: profile ID must be a number",
      },
    };
  }

  try {
    const res = await umaMoeFetch<UmaMoeProfileResponse>(
      `/api/v4/user/profile/${profileId}`,
    );

    if (res.status === 200) {
      await db
        .insert(users)
        .values({
          discordId: targetDiscordId,
          profileId,
        })
        .onConflictDoUpdate({
          target: users.discordId,
          set: {
            profileId,
            updatedAt: sql`now()`,
          },
        });

      const trainerName = res.data?.trainer?.name;
      const suffix = trainerName ? ` (${trainerName})` : "";
      const content =
        targetDiscordId !== callerDiscordId
          ? `Saved trainer profile ID preference for <@${targetDiscordId}>: **${profileId}**${suffix}`
          : `Saved your trainer profile ID preference: **${profileId}**${suffix}`;
      return {
        type: 4,
        data: {
          content,
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
