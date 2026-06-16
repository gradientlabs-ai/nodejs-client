# Examples

Runnable smoke tests against the real Gradient Labs API. Each example reads your
API key from the `GRADIENT_LABS_API_KEY` environment variable.

> These examples import the client from `../../src` so they run straight from a
> checkout. In your own project, install the package and import from
> `@gradientlabs/client` instead.

## Prerequisites

```bash
npm install
export GRADIENT_LABS_API_KEY="sk_live_..."
```

Some examples need a **Management** API key (tools, articles, procedures,
resources); the conversation, back-office-task, and voice examples need an
**Integration** key.

## Running

Use [`tsx`](https://github.com/privatenumber/tsx) to run the TypeScript directly:

```bash
npx tsx examples/conversations/index.ts
npx tsx examples/tools/index.ts
npx tsx examples/articles/index.ts
npx tsx examples/procedures/index.ts
npx tsx examples/resources/index.ts
npx tsx examples/back-office-tasks/index.ts
```

### Webhooks

The webhooks example starts a local HTTP server that verifies and dispatches
incoming webhooks:

```bash
export GL_WEBHOOK_SIGNING_KEY="whsec_..."
npx tsx examples/webhooks/index.ts
# then point your workspace's webhook URL at http://localhost:3000/
```
