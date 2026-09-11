import { verifyAsync } from "@noble/ed25519";
import { Elysia } from "elysia";
import { pingHandler } from "./services/ping";
import { config } from "./config";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .post("/api/discord/webhook", async (ctx) => {
    const body = await ctx.request.text();

    let json: any;
    try {
      json = JSON.parse(body);
    } catch {
      return ctx.status("Bad Request", {
        description: "Given body is not parsable as a JSON",
      });
    }

    const interaction_type = json.type;
    if (typeof interaction_type !== "number" || isNaN(interaction_type)) {
      return ctx.status(400, {
        description: "Given interaction type is not a number",
      });
    }

    await Bun.write(
      `dumps/${Date.now()}_${interaction_type}.json`,
      JSON.stringify({ body: json, headers: ctx.headers }, null, 2),
    );

    const signature = ctx.headers["x-signature-ed25519"];
    const timestamp = ctx.headers["x-signature-timestamp"];
    if (!signature || !timestamp) {
      return ctx.status(401, { description: "Malformed request" });
    }

    const is_valid = await verifyAsync(
      Buffer.from(signature, "hex"),
      Buffer.concat([Buffer.from(timestamp), Buffer.from(body)]),
      config.publicKey,
    );
    if (!is_valid) {
      return ctx.status(401, { description: "Invalid signature" });
    }

    switch (interaction_type) {
      case 1:
        return await pingHandler();

      default:
        return {
          description: `Unhandled interaction type ${interaction_type}`,
        };
    }
  });

app.listen(config.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
