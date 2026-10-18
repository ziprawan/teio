import { umaMoeFetch } from "../utils/uma-moe";

export interface DiscordCommandOption {
  name?: string;
  type?: number;
  value?: unknown;
}

export interface DiscordInteraction {
  type?: number;
  data?: {
    name?: string;
    options?: DiscordCommandOption[];
  };
}

export async function setProfileIdHandler(interaction: DiscordInteraction) {
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
    const res = await umaMoeFetch(`/api/v4/user/profile/${profileId}`);

    if (res.status === 200) {
      return {
        type: 4,
        data: {
          content: "okay",
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
