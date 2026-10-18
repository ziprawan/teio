import { config } from "../config";

interface DiscordApplication {
  id: string;
  name: string;
}

const commands = [
  {
    name: "setprofileid",
    description: "Set your Umamusume trainer profile ID",
    type: 1,
    options: [
      {
        name: "id",
        description: "Your trainer profile ID",
        type: 4,
        required: true,
      },
    ],
  },
];

if (!config.discordAppToken) {
  throw new Error("DISCORD_APP_TOKEN is not defined in .env");
}

const authHeaders = {
  Authorization: `Bot ${config.discordAppToken}`,
  "Content-Type": "application/json",
};

const appRes = await fetch("https://discord.com/api/v10/applications/@me", {
  headers: authHeaders,
});

if (!appRes.ok) {
  const errText = await appRes.text();
  throw new Error(
    `Failed to fetch Discord application info (${appRes.status}): ${errText}`,
  );
}

const appData = (await appRes.json()) as DiscordApplication;

const putRes = await fetch(
  `https://discord.com/api/v10/applications/${appData.id}/commands`,
  {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify(commands),
  },
);

if (!putRes.ok) {
  const errText = await putRes.text();
  throw new Error(
    `Failed to register commands (${putRes.status}): ${errText}`,
  );
}

const registered = await putRes.json();
console.log(
  `Registered ${Array.isArray(registered) ? registered.length : 0} command(s) for ${appData.name} (${appData.id}):`,
);
console.log(JSON.stringify(registered, null, 2));
