# Gradient Labs Node.js / TypeScript client

Official client for the [Gradient Labs API](https://api.gradient-labs.ai). Written
in TypeScript, ships full type declarations and both ESM and CommonJS builds, and
has **zero runtime dependencies** (it uses Node's built-in `fetch` and `crypto`).

Requires **Node.js 20** or newer.

## Installation

```bash
npm install @gradientlabs/client
```

## Quick start

```ts
import { GradientLabs } from "@gradientlabs/client";

const client = new GradientLabs({ apiKey: process.env.GRADIENT_LABS_API_KEY! });

const conversation = await client.conversations.start({
  id: "ticket-12345",
  customer_id: "customer-678",
  channel: "web",
  assignee_type: "AI Agent",
});

console.log(conversation.status);
```

The client is organised into resource namespaces, e.g. `client.conversations`,
`client.tools`, `client.procedures`. There are two API key roles:

- **Integration** — conversation runtime endpoints (`conversations`,
  `outboundConversations`, `backOfficeTasks`, `voice`).
- **Management** — configuration endpoints (`tools`, `articles`, `topics`,
  `procedures`, `handOffTargets`, `resourceSources`, `resourceTypes`, `secrets`,
  `notes`, `terminologySubstitutions`, `trafficGroups`, `ipAddresses`).

## Configuration

```ts
const client = new GradientLabs({
  apiKey: "sk_live_...", // required
  baseUrl: "https://api.gradient-labs.ai", // optional (this is the default)
  webhookSigningKey: "whsec_...", // optional, required to verify webhooks
  webhookLeewayMs: 5 * 60 * 1000, // optional, default 5 minutes
  timeoutMs: 30_000, // optional per-request timeout
  fetch: myFetch, // optional, inject a custom fetch (tests, proxies, instrumentation)
});
```

Every method accepts an optional final argument carrying an `AbortSignal` for
cancellation:

```ts
const controller = new AbortController();
const tools = await client.tools.list({ signal: controller.signal });
```

## Error handling

Non-2xx responses throw an `ApiError`; client misconfiguration throws a
`ConfigurationError`. Both extend `GradientLabsError`.

```ts
import { ApiError, ErrorCode } from "@gradientlabs/client";

try {
  await client.conversations.get("missing");
} catch (err) {
  if (err instanceof ApiError) {
    console.error(err.statusCode, err.code, err.message);
    if (err.code === ErrorCode.NotFound) {
      // handle 404
    }
    console.error("trace id:", err.traceId); // give this to support
  }
}
```

The client never retries failed requests — retry policy is left to you.

## Pagination

List endpoints that paginate return a `Page<T>` with opaque `next`/`prev`
cursors. Use `listAll()` to iterate every page automatically:

```ts
for await (const procedure of client.procedures.listAll()) {
  console.log(procedure.name);
}

// or page manually:
const page = await client.procedures.list();
const next = await client.procedures.list({ cursor: page.pageInfo.next });
```

## Webhook verification

Construct the client with your `webhookSigningKey`, then verify and parse
incoming requests. Pass the **raw** request body — the signature is computed over
the exact bytes received.

```ts
import { GradientLabs, InvalidWebhookSignatureError } from "@gradientlabs/client";

const client = new GradientLabs({
  apiKey: process.env.GRADIENT_LABS_API_KEY!,
  webhookSigningKey: process.env.GL_WEBHOOK_SIGNING_KEY!,
});

// Express example (use express.raw() so req.body is the raw payload):
app.post("/webhooks", express.raw({ type: "*/*" }), (req, res) => {
  try {
    const { event, token } = client.webhooks.parse({
      body: req.body, // Buffer
      headers: req.headers,
    });

    switch (event.type) {
      case "agent.message":
        console.log(event.data.body);
        break;
      case "conversation.hand_off":
        console.log(event.data.reason_code);
        break;
      // ...other event types
    }

    res.sendStatus(200);
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      res.sendStatus(401);
    } else {
      res.sendStatus(500);
    }
  }
});
```

`event` is a discriminated union on `event.type`, so narrowing gives you a
fully-typed `event.data`. The optional `X-GradientLabs-Token` header is returned
as `token`.

Supported event types: `agent.message`, `conversation.hand_off`,
`conversation.finished`, `action.execute`, `resource.pull`,
`back-office-task.complete`, `back-office-task.hand-off`, `back-office-task.fail`.

## Examples

See the [`examples/`](./examples) directory for runnable examples covering
conversations, tools, articles, procedures, resources, back-office tasks, and a
webhook server.

## Releasing

Releases are published to [npm](https://www.npmjs.com/package/@gradientlabs/client) automatically when a version tag is pushed to `main`.

**One-time setup** (if not already done):

1. On npmjs.com, go to the `@gradientlabs/client` package → **Settings** → **Trusted Publishers** → **Add trusted publisher**.
2. Select **GitHub Actions** and fill in owner `gradientlabs-ai`, repository `gradientlabs-nodejs`, workflow `publish.yml`.

**To publish a new version:**

1. Merge all changes into `main`.
2. Update the version in `package.json`, merge that to `main`, and pull locally.
3. Push a version tag matching the `package.json` version:
   ```sh
   git tag v1.2.3
   git push origin v1.2.3
   ```
4. The [publish workflow](.github/workflows/publish.yml) runs automatically: it verifies the tag matches the `package.json` version, builds the library, and publishes it to npm.

## Development

```bash
npm install
npm run build       # dual ESM/CJS + type declarations
npm test            # vitest (no network required)
npm run lint
npm run typecheck
npm run format
```

## License

[MIT](./LICENSE)
