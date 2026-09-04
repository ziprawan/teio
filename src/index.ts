import { Elysia } from "elysia";
import { pingHandler } from "./services/ping";

let PORT: number = 2004;
if (process.env.PORT) {
  const port = parseInt(process.env.PORT);
  if (!isNaN(port)) PORT = port;
}

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .post("/api/discord/webhook", async (ctx) => {
    const json = ctx.body as any;
    const interaction_type = json.type;
    if (typeof interaction_type !== "number" || isNaN(interaction_type)) {
      ctx.status(400);
      return { description: "Given interaction type is not a number" };
    }

    await Bun.write(
      `dumps/${Date.now()}_${interaction_type}.json`,
      JSON.stringify(json, null, 2),
    );

    switch (interaction_type) {
      case 1:
        return await pingHandler();

      default:
        return {
          description: `Unhandled interaction type ${interaction_type}`,
        };
    }
  });

app.listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
