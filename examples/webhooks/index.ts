/**
 * Webhooks example: a minimal HTTP server that receives Gradient Labs webhooks,
 * verifies their signature, and dispatches on the event type.
 *
 * Run it, then point your workspace's webhook URL at http://localhost:3000/.
 *
 * Requires GL_WEBHOOK_SIGNING_KEY (the signing key from your workspace).
 * In your own project: import { GradientLabs } from "@gradientlabs/client";
 */
import { createServer } from "node:http";

import {
  GradientLabs,
  InvalidWebhookSignatureError,
  UnknownWebhookTypeError,
} from "../../src/index.js";

const signingKey = process.env.GL_WEBHOOK_SIGNING_KEY;
if (!signingKey) {
  throw new Error("GL_WEBHOOK_SIGNING_KEY environment variable is required");
}

// An API key is required to construct the client, even though webhook
// verification itself does not call the API.
const client = new GradientLabs({
  apiKey: process.env.GRADIENT_LABS_API_KEY ?? "unused-for-webhooks",
  webhookSigningKey: signingKey,
});

const server = createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on("data", (chunk) => chunks.push(chunk as Buffer));
  req.on("end", () => {
    const body = Buffer.concat(chunks).toString("utf8");
    try {
      const { event, token } = client.webhooks.parse({ body, headers: req.headers });
      console.log(`Received ${event.type} (token present: ${token !== undefined})`);

      switch (event.type) {
        case "agent.message":
          console.log("  agent says:", event.data.body);
          break;
        case "conversation.hand_off":
          console.log("  handing off:", event.data.reason_code);
          break;
        case "conversation.finished":
          console.log("  conversation finished");
          break;
        default:
          console.log("  (no specific handler)");
      }

      res.writeHead(200).end("ok");
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        res.writeHead(401).end("invalid signature");
      } else if (err instanceof UnknownWebhookTypeError) {
        // Log and acknowledge so Gradient Labs does not retry.
        console.warn("unknown webhook type:", err.type);
        res.writeHead(200).end("ok");
      } else {
        console.error(err);
        res.writeHead(500).end("error");
      }
    }
  });
});

server.listen(3000, () => console.log("Listening for webhooks on http://localhost:3000/"));
