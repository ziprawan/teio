import "dotenv";

const port = parseInt(process.env.PORT ?? "2004");
const publicKey = Buffer.from(process.env.DISCORD_PUBLIC_KEY ?? "", "hex");
const umaMoeApiKey = process.env.UMA_MOE_API_KEY ?? "";
const discordAppToken = process.env.DISCORD_APP_TOKEN ?? "";

if (isNaN(port)) {
  throw new Error("PORT cannot be another than a number");
}

if (publicKey.length == 0) {
  throw new Error("Discord app public key is not defined");
}

if (umaMoeApiKey.length == 0) {
  throw new Error("uma.moe API key is not defined");
}

const config = { port, publicKey, umaMoeApiKey, discordAppToken };

export { config };
