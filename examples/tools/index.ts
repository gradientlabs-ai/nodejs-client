/**
 * Tools example: lists existing tools, creates a simple HTTP tool, reads it
 * back, then deletes it. Requires a Management API key.
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
  const tools = await client.tools.list();
  console.log(`You have ${tools.length} tool(s).`);

  const id = `example-tool-${Date.now()}`;
  const created = await client.tools.create({
    id,
    name: "Example weather lookup",
    description: "Looks up the weather for a city. Created by the Node.js example.",
    parameters: [
      {
        name: "city",
        description: "The city to look up the weather for.",
        type: "string",
        allowed_sources: ["llm"],
        required: true,
      },
    ],
    http: {
      method: "GET",
      url_template: "https://example.com/weather?city=${params.city}",
    },
  });
  console.log("Created tool:", created.id);

  const fetched = await client.tools.get(id);
  console.log("Read tool:", fetched.name);

  await client.tools.delete(id);
  console.log("Deleted tool");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
