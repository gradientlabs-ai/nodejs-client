/**
 * Procedures example: lists procedures (auto-following pagination), reads one,
 * and lists its versions. Requires a Management API key.
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
  let count = 0;
  let firstId: string | undefined;

  // listAll transparently follows pagination cursors.
  for await (const procedure of client.procedures.listAll()) {
    if (count === 0) {
      firstId = procedure.id;
    }
    count += 1;
  }
  console.log(`Found ${count} procedure(s).`);

  if (firstId) {
    const procedure = await client.procedures.get(firstId);
    console.log("First procedure:", procedure.name, `(${procedure.status})`);

    const versions = await client.procedures.listVersions(firstId);
    console.log(`It has ${versions.length} version(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
