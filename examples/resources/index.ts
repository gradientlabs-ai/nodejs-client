/**
 * Resources example: the full ResourceType → ResourceSource loop. Creates a
 * resource source, infers its schema from example payloads, creates a resource
 * type backed by that source, then cleans both up. Requires a Management API key.
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
  const source = await client.resourceSources.create({
    display_name: `Example source ${Date.now()}`,
    description: "Customer profile lookup, created by the Node.js example.",
    source_type: "http",
    http_config: {
      method: "GET",
      url_template: "https://example.com/customers/${params.customer_id}",
    },
  });
  console.log("Created resource source:", source.id);

  await client.resourceSources.updateSchemaByExamples(source.id, {
    examples: [{ name: "Ada Lovelace", tier: "premium", lifetime_value: 4200 }],
    schema_update_strategy: "replace",
  });
  console.log("Inferred schema from examples");

  const type = await client.resourceTypes.create({
    display_name: `Example type ${Date.now()}`,
    description: "Per-customer profile.",
    scope: "local",
    refresh_strategy: "dynamic",
    is_enabled: true,
    source_config: { source_id: source.id, attributes: [], cache: "1h" },
  });
  console.log("Created resource type:", type.id);

  // Clean up.
  await client.resourceTypes.delete(type.id);
  await client.resourceSources.delete(source.id);
  console.log("Cleaned up resource type and source");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
