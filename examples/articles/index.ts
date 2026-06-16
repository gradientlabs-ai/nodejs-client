/**
 * Articles example: upserts a help article, toggles whether the agent may use
 * it, then deletes it. Requires a Management API key.
 *
 * In your own project: import { GradientLabs } from "@gradientlabs/client";
 */
import { GradientLabs } from "../../src/index.js";

const apiKey = process.env.GRADIENT_LABS_API_KEY;
if (!apiKey) {
  throw new Error("GRADIENT_LABS_API_KEY environment variable is required");
}

const client = new GradientLabs({ apiKey });

async function main(): Promise<void> {
  const id = `example-article-${Date.now()}`;
  const now = new Date().toISOString();

  await client.articles.upsert({
    id,
    author_id: "author-1",
    title: "How to reset your password",
    description: "Step-by-step password reset guide.",
    body: "1. Go to settings. 2. Click reset password. 3. Follow the email link.",
    visibility: "public",
    topic_id: "",
    status: "published",
    data: {},
    created: now,
    last_edited: now,
    public_url: "https://help.example.com/reset-password",
  });
  console.log("Upserted article:", id);

  await client.articles.setUsageStatus(id, { usage_status: "on" });
  console.log("Enabled article for the agent");

  await client.articles.delete(id);
  console.log("Deleted article");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
