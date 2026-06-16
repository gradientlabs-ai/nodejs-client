# Gradient Labs Node.js / TypeScript Client — Implementation Plan

> Status: **ready for engineering review**. No client code has been written yet.
> Once approved, this file is committed to the new `gradientlabs-ai/nodejs-client` repo and
> `/wearegradient-dev:gl-implement-api-client` builds the client from it.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Package name | `@gradientlabs/client` (npm) |
| Registry | npm (public) |
| Repo name | `gradientlabs-ai/nodejs-client` |
| Language / build | TypeScript → compiled JS, ships `.d.ts`, **dual ESM + CommonJS** |
| Minimum runtime | Node.js 20 LTS |
| Concurrency model | Promise-based `async`/`await`; cancellation via `AbortSignal` |
| DI / framework package | **Deferred** to a follow-up — core client only for now |
| HTTP layer | Built-in global `fetch` (stable since Node 18, no dependency) |
| Webhook crypto | Built-in `node:crypto` (`createHmac`, `timingSafeEqual`) |
| Runtime dependencies | **Zero** |

---

## 1. Goal

Provide an idiomatic, dependency-free TypeScript client for the **public** Gradient Labs API
(`https://api.gradient-labs.ai`) that mirrors the design of the canonical Go client: a single
configurable `GradientLabs` client exposing resource-namespaced methods (`client.conversations.start(...)`,
`client.tools.list(...)`), strongly-typed request/response models, a typed error hierarchy, cursor
pagination helpers, and a webhook verifier. It targets Node 20+, ships full type declarations and both
ESM and CommonJS builds, and exposes **only** the public API surface defined in
`platform/openapi/spec.json` (the `publicapi` Integration role and the `publicmanagementapi` Management
role) — no internal services, Encore package prefixes, or implementation detail leak into the public types.

---

## 2. API surface

The client is organised into **resource namespaces** hung off the root client (idiomatic for TS SDKs,
cf. Stripe/Octokit), e.g. `client.conversations.start(params)`. Method names are `camelCase`. Each
namespace is tagged with the API key role it requires: **Integration** (conversation/runtime endpoints,
`publicapi`) or **Management** (configuration endpoints, `publicmanagementapi`). A single API key carries
a role; calling a Management method with an Integration key yields `permission_denied`.

> The flat reference Go method name is shown in parentheses so reviewers can cross-check against
> `go-client`.

### `client.conversations` — Integration
| Method | HTTP | Notes |
|--------|------|-------|
| `start(params)` | `POST /conversations` | returns `Conversation` |
| `get(id)` | `GET /conversations/{id}/read` | canonical read (`ConversationRead`) |
| `addMessage(id, params)` | `POST /conversations/{id}/messages` | |
| `addEvent(id, params)` | `POST /conversations/{id}/events` | typing / delivered / read etc. (`ConversationEventType`) |
| `assign(id, params)` | `PUT /conversations/{id}/assignee` | |
| `rate(id, params)` | `PUT /conversations/{id}/rate` | |
| `cancel(id)` | `PUT /conversations/{id}/cancel` | |
| `finish(id)` | `PUT /conversations/{id}/finish` | |
| `resume(id, params)` | `PUT /conversations/{id}/resume` | |
| `returnAsyncToolResult(id, params)` | `PUT /conversations/{id}/return-async-tool-result` | for async tools |

> `GET /conversations/{id}` (`ConversationReadDeprecated`) is **deprecated** — not exposed; `get()` uses
> the `/read` variant.

### `client.outboundConversations` — Integration
| Method | HTTP |
|--------|------|
| `start(params)` | `POST /outbound/conversations` |

### `client.backOfficeTasks` — Integration
| Method | HTTP |
|--------|------|
| `create(params)` | `POST /back-office-tasks` |
| `get(id)` | `GET /back-office-tasks/{id}/read` |

### `client.voice` — Integration
| Method | HTTP |
|--------|------|
| `getLatestCallContext(phoneNumber)` | `GET /voice/latest-call-context/{phoneNumber}` |

### `client.tools` — Management
| Method | HTTP |
|--------|------|
| `list()` | `GET /tools` |
| `create(params)` | `POST /tools` |
| `get(id)` | `GET /tools/{id}` |
| `update(id, params)` | `PUT /tools/{id}` |
| `delete(id)` | `DELETE /tools/{id}` |
| `execute(id, params)` | `POST /tools/{toolID}/execute` |

### `client.articles` — Management
| Method | HTTP |
|--------|------|
| `upsert(params)` | `POST /articles` |
| `setUsageStatus(id, params)` | `POST /articles/{articleID}/usage-status` |
| `delete(id)` | `DELETE /articles/{id}` |

### `client.topics` — Management
| Method | HTTP |
|--------|------|
| `list(params?)` | `GET /topics` |
| `upsert(params)` | `POST /topics` (`ArticleTopicUpsert`) |
| `get(id)` | `GET /topic/{id}` |

### `client.procedures` — Management
| Method | HTTP |
|--------|------|
| `list(params?)` | `GET /procedures` |
| `get(id)` | `GET /procedure/{procedureID}` |
| `setLimit(id, params)` | `POST /procedure/{procedureID}/limit` |
| `listVersions(id, params?)` | `GET /procedures/{procedureID}/versions` |
| `setLiveVersion(id, version)` | `POST /procedures/{procedureID}/versions/{version}/set-live` |
| `unsetLiveVersion(id, version)` | `POST /procedures/{procedureID}/versions/{version}/unset-live` |
| `setGatedVersion(id, version, params)` | `POST /procedures/{procedureID}/versions/{version}/set-gated` |
| `unsetGatedVersion(id, version)` | `POST /procedures/{procedureID}/versions/{version}/unset-gated` |

### `client.handOffTargets` — Management
| Method | HTTP |
|--------|------|
| `list()` | `GET /hand-off-targets` |
| `upsert(params)` | `POST /hand-off-targets` |
| `delete(params)` | `DELETE /hand-off-targets` |
| `getDefault()` | `GET /hand-off-targets/default` |
| `setDefault(params)` | `PUT /hand-off-targets/default` |

### `client.resourceSources` — Management
| Method | HTTP |
|--------|------|
| `list(params?)` | `GET /resource-sources` |
| `create(params)` | `POST /resource-sources` |
| `get(id)` | `GET /resource-sources/{id}` |
| `update(id, params)` | `PUT /resource-sources/{id}` |
| `delete(id)` | `DELETE /resource-sources/{id}` |
| `updateSchemaByExamples(id, params)` | `POST /resource-sources/{id}/schema-by-examples` |

### `client.resourceTypes` — Management
| Method | HTTP |
|--------|------|
| `list(params?)` | `GET /resource-types` |
| `create(params)` | `POST /resource-types` |
| `get(id)` | `GET /resource-types/{id}` |
| `update(id, params)` | `PUT /resource-types/{id}` |
| `delete(id)` | `DELETE /resource-types/{id}` |

### `client.secrets` — Management
| Method | HTTP |
|--------|------|
| `list()` | `GET /secrets` |
| `write(name, params)` | `PUT /secrets/{name}` |
| `revoke(name)` | `DELETE /secrets/{name}` |

### `client.notes` — Management
| Method | HTTP |
|--------|------|
| `create(params)` | `POST /notes` |
| `update(id, params)` | `POST /notes/{id}` |
| `setStatus(id, params)` | `POST /notes/{noteID}/status` |
| `delete(id)` | `DELETE /notes/{id}` |

### `client.terminologySubstitutions` — Management
| Method | HTTP |
|--------|------|
| `list(params?)` | `GET /terminology-substitutions` |
| `create(params)` | `POST /terminology-substitutions` |
| `get(id)` | `GET /terminology-substitutions/{id}` |
| `update(id, params)` | `PUT /terminology-substitutions/{id}` |
| `delete(id)` | `DELETE /terminology-substitutions/{id}` |

### `client.trafficGroups` — Management
| Method | HTTP |
|--------|------|
| `list()` | `GET /traffic-groups` |
| `create(params)` | `POST /traffic-groups` |
| `update(id, params)` | `PUT /traffic-groups/{id}` |
| `delete(id)` | `DELETE /traffic-groups/{id}` |
| `addTarget(id, params)` | `POST /traffic-groups/{id}/targets` |
| `removeTarget(id, targetId)` | `DELETE /traffic-groups/{id}/targets/{targetId}` |
| `addExclusion(id, params)` | `POST /traffic-groups/{id}/exclusions` |
| `removeExclusion(id, targetId)` | `DELETE /traffic-groups/{id}/exclusions/{targetId}` |

### `client.ipAddresses` — Management
| Method | HTTP |
|--------|------|
| `list()` | `GET /ip-addresses` | egress IPs to allow-list |

> `GET /spec.json` (`Spec`) is a meta endpoint that returns the OpenAPI document. **Not exposed** as a
> client method — consumers fetch the docs directly if needed.

### Enum strategy — open string unions + typed constants

Every named string enum is modelled as an **open** union so a future server-side value never breaks a
consumer at runtime, while still giving autocomplete on known values:

```ts
export const Channel = {
  Web: "web",
  Email: "email",
  Voice: "voice",
} as const;
export type Channel = (typeof Channel)[keyof typeof Channel] | (string & {});
```

The `(string & {})` keeps the type open (accepts any string) without collapsing the literal autocomplete.
Each enum gets one such `const` object + type pair in `src/models/enums.ts`. Values are sourced verbatim
from the Go source (paths below), **not** invented:

| Enum (client name) | Values | Go source |
|--------------------|--------|-----------|
| `ArticleStatus` | `draft`, `published`, `deleted`, `excluded`, `unknown` | `common/article/article.go` |
| `ArticleUsageStatus` | `on`, `off` | `common/article/article.go` |
| `ArticleVisibility` | `public`, `users`, `internal`, `unknown` | `common/article/article.go` |
| `AttachmentType` | `image`, `file` | `common/conversation/attachment_event.go` |
| `Channel` | `web`, `email`, `voice`, `unmapped` | `common/conversation/channel.go` |
| `CustomerSource` | `dixa`, `intercom`, `freshchat`, `freshdesk`, `public-api`, `chat-sdk`, `salesforce`, `zendesk`, `livekit`, `twilio`, `talkdesk`, `intercom-voice`, `livechat`, `web-app`, `gmail`, `file` | `common/conversation/customer_source.go` |
| `ParticipantType` | `Customer`, `Agent`, `AI Agent`, `Bot` | `common/conversation/participant.go` |
| `ConversationEventType` | `assigned`, `cancelled`, `finished`, `resumed`, `internal-note`, `message`, `delivered`, `read`, `rated`, `started`, `typing`, `async-tool-result` | `support-platforms/public-api/events/event.go` |
| `ProcedureStatus` | `unsaved`, `draft`, `live`, `archived` | `common/procedure/procedure.go` |
| `NoteStatus` | `draft`, `live`, `deleted` | `common/note/note.go` |
| `BackOfficeTaskStatus` | `pending`, `in-progress`, `completed`, `failed`, `handed-off` | `back-office/back-office-tasks/types/public-api/task.go` |
| `BackOfficeTaskResultType` | `custom` | `common/back-office/result.go` |
| `AttributeCardinality` | `one`, `many` | `resources/libraries/resource-schema/attribute.go` |
| `AttributeType` | `string`, `date`, `timestamp`, `boolean`, `number`, `array`, `complex` | `resources/libraries/resource-schema/attribute.go` |
| `ResourceSourceRefreshStrategy` | `dynamic`, `static` | `resources/resource-sources/resource-source/source.go` |
| `ResourceSourceScope` | `global`, `local` | `resources/resource-sources/resource-source/source.go` |
| `ResourceSourceType` | `http`, `internal`, `webhook` | `resources/resource-sources/resource-source/source.go` |
| `SchemaUpdateStrategy` | `replace`, `merge` | `resources/resource-sources/update.go` |
| `ResourceTypeRefreshStrategy` | `dynamic`, `static` | `resources/resource-types/resource-type/type.go` |
| `ResourceTypeScope` | `global`, `local` | `resources/resource-types/resource-type/type.go` |
| `SupportPlatform` | `dixa`, `freshchat`, `freshdesk`, `gmail`, `intercom`, `livechat`, `public-api`, `chat-sdk`, `salesforce`, `zendesk`, `livekit`, `twilio`, `talkdesk`, `intercom-voice`, `conversation-synthesizor`, `web-app` | `common/support-platforms/names.go` |
| `BodyEncoding` | `application/json`, `application/x-www-form-urlencoded` | `tools/customer-tools/types/http.go` |
| `ParameterSource` | `llm`, `literal`, `resource` | `tools/tool-registry/types/parameter.go` |
| `ParameterType` | `string`, `string_array`, `integer`, `float`, `boolean`, `date`, `timestamp`, `duration` | `tools/tool-registry/types/parameter.go` |

> Note from the spec: `ToolParameter.type` currently only accepts `string` server-side; the full
> `ParameterType` set is modelled for forward-compatibility, matching the Go source.

---

## 3. Client configuration

Instantiated with a single options object (idiomatic TS; avoids Go's functional-options ceremony):

```ts
import { GradientLabs } from "@gradientlabs/client";

const client = new GradientLabs({
  apiKey: process.env.GRADIENT_LABS_API_KEY!, // required
  // Optional:
  baseUrl: "https://api.gradient-labs.ai",     // default
  webhookSigningKey: process.env.GL_WEBHOOK_KEY,
  webhookLeewayMs: 5 * 60 * 1000,              // default 5 min
  fetch: customFetch,                           // override (tests, proxies, instrumentation)
  timeoutMs: 30_000,                            // optional per-client request timeout
});
```

- **`apiKey`** is required and validated at construction (throws `ConfigurationError` if missing/empty).
- **`baseUrl`** defaults to `https://api.gradient-labs.ai`.
- Auth header `Authorization: Bearer <apiKey>` and `User-Agent:
  Gradient-Labs-Node/<pkg-version> (node/<process.version>)` are set on every request.
- **`fetch`** injection is the equivalent of Go's `WithTransport` — used for tests and instrumentation.
- Every method accepts an optional final `{ signal?: AbortSignal }` argument for cancellation/timeout
  (the Node equivalent of Go's `context.Context`). A per-client `timeoutMs` wires an internal
  `AbortSignal.timeout()` merged with any caller-supplied signal.

---

## 4. Error handling

Single base error class with typed subclasses, all extending the native `Error`:

```
GradientLabsError                 // base — anything thrown by the client
├── ConfigurationError            // bad/missing config (no network)
├── ApiError                      // non-2xx HTTP response
│     .statusCode: number
│     .code: ErrorCode            // parsed from envelope `code`
│     .message: string            // envelope `message`
│     .details: Record<string, unknown>
│     .traceId: string | undefined  // getter over details.trace_id
└── WebhookVerificationError      // signature/leeway failure (respond 401)
```

- Parsed from the API error envelope `{ code, message, details }` (see `components.responses.APIError`).
- `traceId` mirrors the Go `TraceID()` helper (reads `details.trace_id`), surfaced for support tickets.
- **Typed error codes** so callers `switch` instead of string-comparing. Sourced from
  `encore.dev/beta/errs#ErrCode`:

```ts
export const ErrorCode = {
  NotFound: "not_found",
  Unauthenticated: "unauthenticated",
  PermissionDenied: "permission_denied",
  InvalidArgument: "invalid_argument",
  FailedPrecondition: "failed_precondition",
  ResourceExhausted: "resource_exhausted",
  AlreadyExists: "already_exists",
  Unavailable: "unavailable",
  DeadlineExceeded: "deadline_exceeded",
  Internal: "internal",
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode] | (string & {});
```

Network/abort failures from `fetch` are wrapped in `GradientLabsError` (preserving `cause`) so callers
catch one error family.

---

## 5. Webhook support

Mirrors the Go client exactly (HMAC-SHA256 over `<timestamp>.<body>`).

```ts
const result = client.webhooks.parse({
  body: rawBodyString,        // RAW request body string/Buffer — not pre-parsed JSON
  headers: req.headers,        // reads X-GradientLabs-Signature + X-GradientLabs-Token
});
// result: { event: WebhookEvent; token?: string }
```

- **`client.webhooks.verify({ body, signature })`** — lower-level boolean/throw check. Validates the
  `X-GradientLabs-Signature` header (`t=<unix_ts>,v1=<hex>` format), recomputes
  `HMAC_SHA256(signingKey, "<ts>.<body>")`, compares with `crypto.timingSafeEqual`, and enforces the
  configurable leeway (default 5 min). Throws `WebhookVerificationError` on failure.
- **`client.webhooks.parse(...)`** verifies, then decodes `data` into the matching typed event and also
  returns the optional **`X-GradientLabs-Token`** passthrough (the per-conversation sensitive token),
  exactly like the Go client's `(webhook, token, err)` return.
- A **discriminated union** `WebhookEvent` on the `type` field gives exhaustive `switch` narrowing:

```ts
type WebhookEvent =
  | { type: "agent.message"; data: AgentMessageEvent; id: string; sequenceNumber: number; timestamp: string }
  | { type: "conversation.hand_off"; data: ConversationHandOffEvent; /* ... */ }
  | { type: "conversation.finished"; data: ConversationFinishedEvent; /* ... */ }
  | { type: "action.execute"; data: ActionExecuteEvent; /* ... */ }
  | { type: "resource.pull"; data: ResourcePullEvent; /* ... */ };
```

- Currently supported event types: **`agent.message`**, **`conversation.hand_off`**,
  **`conversation.finished`**, **`action.execute`**, **`resource.pull`**. Unknown types throw a typed
  `UnknownWebhookTypeError` (subclass of `GradientLabsError`) so callers can log + return HTTP 200.
- Helper accepts raw body as `string | Buffer | Uint8Array` (Express/Fastify/raw `http`). Docs will note
  the body must be the **raw** payload (signature is computed over bytes, so frameworks must not
  re-serialise).

---

## 6. Pagination

Cursor-based, matching `PaginationInfo` (`next`/`prev` opaque strings; `after`/`before` query params).

- List endpoints that paginate return a typed `Page<T>`:

```ts
interface Page<T> {
  data: T[];
  pageInfo: { next?: string; prev?: string };
}
```

- Cursors are passed via params: `client.tools.list({ after: page.pageInfo.next })`.
- An **async-iterator** convenience auto-follows `next` so callers can `for await`:

```ts
for await (const tool of client.tools.listAll()) { /* ... */ }
```

  `listAll()` is generated only for genuinely paginated list endpoints; small fixed lists (e.g.
  hand-off targets, IP addresses, secrets) return a plain array as the Go client does. The implementer
  will confirm per-endpoint which responses carry `PaginationInfo` from the spec before adding
  `listAll()`.

---

## 7. Repo structure

```
nodejs-client/
├── src/
│   ├── index.ts                 # public barrel: GradientLabs, types, errors, webhooks
│   ├── client.ts                # GradientLabs root client + config + namespace wiring
│   ├── internal/
│   │   ├── http.ts              # fetch wrapper: auth, UA, JSON, error mapping, AbortSignal
│   │   ├── pagination.ts        # Page<T> + async-iterator helper
│   │   └── user-agent.ts        # UA string builder
│   ├── resources/               # one file per namespace
│   │   ├── conversations.ts
│   │   ├── outbound-conversations.ts
│   │   ├── back-office-tasks.ts
│   │   ├── voice.ts
│   │   ├── tools.ts
│   │   ├── articles.ts
│   │   ├── topics.ts
│   │   ├── procedures.ts
│   │   ├── hand-off-targets.ts
│   │   ├── resource-sources.ts
│   │   ├── resource-types.ts
│   │   ├── secrets.ts
│   │   ├── notes.ts
│   │   ├── terminology-substitutions.ts
│   │   ├── traffic-groups.ts
│   │   └── ip-addresses.ts
│   ├── models/                  # response types + enums (one module per domain + enums.ts)
│   ├── requests/                # *Params request types (co-located or per-domain)
│   ├── webhooks/
│   │   ├── verifier.ts          # WebhookVerifier (HMAC, leeway)
│   │   └── events.ts            # WebhookEvent union + event payload types
│   └── errors.ts                # GradientLabsError hierarchy + ErrorCode
├── examples/
│   ├── conversations/
│   ├── tools/
│   ├── articles/
│   ├── webhooks/
│   ├── procedures/
│   ├── resources/
│   └── back-office-tasks/
├── test/
│   ├── webhook.test.ts          # signature verify (valid/expired/tampered) + token passthrough
│   ├── errors.test.ts           # envelope → ApiError mapping, traceId, code constants
│   ├── pagination.test.ts       # cursor following / async iterator
│   ├── client.test.ts           # config, headers (auth + UA), AbortSignal, base URL
│   └── types.test.ts            # round-trip (de)serialization of representative models
├── .github/workflows/
│   ├── ci.yml                   # install → lint → typecheck → test (Node 20 + 22 matrix)
│   └── publish.yml              # build + npm publish on version tag (provenance)
├── tsconfig.json                # base (strict)
├── tsconfig.build.json          # emit config
├── tsup.config.ts               # dual ESM/CJS bundling + .d.ts
├── package.json
├── README.md
├── LICENSE                      # MIT (match go-client)
└── nodejs_CLIENT_PLAN.md        # this file
```

---

## 8. Build and dependency plan

**Runtime dependencies: none.** Node 20's built-in global `fetch`, `AbortSignal`/`AbortSignal.timeout()`,
and `node:crypto` cover HTTP, cancellation, and HMAC — no `axios`/`node-fetch`/`undici` needed.

**Build tooling (devDependencies only):**
- `typescript` — `strict: true`, `target: ES2022`, `moduleResolution: NodeNext`.
- `tsup` (esbuild-based) — emits **ESM (`.mjs`) + CJS (`.cjs`)** bundles and `.d.ts` from one config. Chosen
  over hand-rolled `tsc` dual builds for simplicity and correct `exports` wiring.
- `vitest` — fast TS-native test runner (no separate transpile step).
- `eslint` + `@typescript-eslint` + `prettier` — lint/format.

**`package.json` essentials:**
```jsonc
{
  "name": "@gradientlabs/client",
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=20" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write ."
  },
  "license": "MIT",
  "repository": "github:gradientlabs-ai/nodejs-client"
}
```

The package version feeds the `User-Agent` (imported from a generated `version.ts`, kept in sync with
`package.json` at build time — mirrors Go's `version.go`).

---

## 9. Testing plan

All tests are **offline** (no network); HTTP is exercised by injecting a fake `fetch`.

| Test file | Verifies |
|-----------|----------|
| `webhook.test.ts` | valid signature passes; tampered body fails; expired (outside leeway) fails; multiple `v1=` signatures; `X-GradientLabs-Token` returned; each event type decodes to correct payload; unknown type throws `UnknownWebhookTypeError`. Uses known key + body + precomputed HMAC fixtures. |
| `errors.test.ts` | non-2xx → `ApiError` with `statusCode`/`code`/`message`/`details`; `traceId` extracted from `details.trace_id`; `ErrorCode` constants match spec; malformed error body still yields a usable `ApiError`. |
| `pagination.test.ts` | `Page<T>` shape; `listAll()` async-iterator follows `next` until exhausted; stops when `next` absent. |
| `client.test.ts` | required-`apiKey` throws `ConfigurationError`; `Authorization` + `User-Agent` headers set; `baseUrl` override respected; `AbortSignal` cancels in-flight request; `timeoutMs` aborts. |
| `types.test.ts` | representative models (Conversation, Tool, Procedure, ResourceType, BackOfficeTask) round-trip through (de)serialization; optional/`omitempty` fields handled. |

Run with `npm test` (`vitest run`). Coverage reported via vitest's built-in c8.

---

## 10. CI plan

**`ci.yml`** (push + PR): matrix on Node **20** and **22** → `npm ci` → `npm run lint` →
`npm run typecheck` → `npm run build` → `npm test`. Fails the PR on any step.

**`publish.yml`** (on `v*` tag): checkout → `npm ci` → `npm run build` → `npm publish --access public`
with **npm provenance** (`id-token: write`), authed via `NPM_TOKEN` org secret. A guard step asserts the
git tag matches `package.json` version before publishing.

---

## 11. Implementation order

1. **Infrastructure** — `package.json`, `tsconfig*`, `tsup.config.ts`, eslint/prettier; `errors.ts`;
   `internal/user-agent.ts` + `version.ts`; `internal/http.ts` (fetch wrapper: auth, UA, JSON body,
   error mapping, `AbortSignal`); `client.ts` skeleton with config validation.
2. **One resource group end-to-end** — `conversations` (richest Integration surface): models, request
   types, all methods, an example, and tests. Locks the patterns (path/query/body handling, response
   decoding) before scaling out.
3. **Pagination + webhooks** — `internal/pagination.ts` (`Page<T>` + `listAll()`); `webhooks/verifier.ts`
   + `webhooks/events.ts` with full test suite. These are the highest-risk-to-get-wrong pieces, done
   early.
4. **Remaining Integration namespaces** — `outboundConversations`, `backOfficeTasks`, `voice`.
5. **Management namespaces** — `tools`, `articles`, `topics`, `procedures`, `handOffTargets`,
   `resourceSources`, `resourceTypes`, `secrets`, `notes`, `terminologySubstitutions`, `trafficGroups`,
   `ipAddresses`, plus `models/enums.ts`.
6. **Examples** — one runnable example per group listed in the tree.
7. **Docs + CI** — `README.md` (install, quickstart, auth roles, webhook handling, pagination), wire
   `ci.yml` + `publish.yml`, final lint/typecheck/test green.
```
