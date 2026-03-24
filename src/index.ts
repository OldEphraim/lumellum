import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { streamAgent } from "./agent.js";
import { getSession, resetSession } from "./session.js";
import { TOOLS } from "./tools/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = new Hono();

app.get("/", async (c) => {
  const html = await readFile(
    join(__dirname, "..", "public", "index.html"),
    "utf-8"
  );
  return c.html(html);
});

app.post("/chat", async (c) => {
  const body = (await c.req.json()) as { sessionId: string; message: string };
  const { sessionId, message } = body;

  const history = getSession(sessionId);
  history.push({ role: "user", content: message });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullText = "";

      const gen = streamAgent([...history], TOOLS);

      let result = await gen.next();
      while (!result.done) {
        const chunk = result.value;
        fullText += chunk;
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        result = await gen.next();
      }

      const returnedMessages = result.value;
      if (returnedMessages && returnedMessages.length > 0) {
        const lastMsg = returnedMessages[returnedMessages.length - 1];
        if (lastMsg) {
          history.push(lastMsg);
        }
      } else {
        history.push({ role: "assistant", content: fullText });
      }

      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

app.post("/reset", async (c) => {
  const body = (await c.req.json()) as { sessionId: string };
  resetSession(body.sessionId);
  return c.json({ ok: true });
});

const port = parseInt(process.env["PORT"] ?? "3000", 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Lumellum listening on http://localhost:${port}`);
});
