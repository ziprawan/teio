import "dotenv";

const port = parseInt(process.env.PORT ?? "2004");
const publicKey = Buffer.from(process.env.DISCORD_PUBLIC_KEY ?? "", "hex");

if (isNaN(port)) {
  throw new Error("PORT cannot be another than a number");
}

if (publicKey.length == 0) {
  throw new Error("Discord app public key is not defined");
}

const config = { port, publicKey };

export { config };
