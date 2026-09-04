import { Elysia } from "elysia";

let PORT: number = 2004;
if (process.env.PORT) {
  const port = parseInt(process.env.PORT);
  if (!isNaN(port)) PORT = port;
}

const app = new Elysia().get("/", () => "Hello Elysia").listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
