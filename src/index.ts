// Public entry point for @gradientlabs/client.

export { GradientLabs, type GradientLabsConfig } from "./client.js";
export { type RequestConfig } from "./request-config.js";

// Errors
export { GradientLabsError, ConfigurationError, ApiError, ErrorCode } from "./errors.js";

// HTTP injection point
export { type FetchLike } from "./internal/http.js";

// Pagination
export { type Page, type PageInfo } from "./internal/pagination.js";

// Webhooks
export {
  WebhookVerifier,
  InvalidWebhookSignatureError,
  UnknownWebhookTypeError,
  type WebhookVerifierConfig,
  type HeadersLike,
  type WebhookBody,
} from "./webhooks/verifier.js";
export {
  WebhookType,
  type WebhookEvent,
  type ParsedWebhook,
  type WebhookConversation,
  type ActionWebhookConversation,
  type ActionWebhookBackOfficeTask,
  type AgentMessageEvent,
  type ConversationHandOffEvent,
  type ConversationFinishedEvent,
  type ActionExecuteEvent,
  type ResourcePullEvent,
  type BackOfficeTaskCompleteEvent,
  type BackOfficeTaskHandOffEvent,
  type BackOfficeTaskFailEvent,
} from "./webhooks/events.js";

// Resource classes (for typing/advanced usage)
export { Conversations } from "./resources/conversations.js";
export { OutboundConversations } from "./resources/outbound-conversations.js";
export { BackOfficeTasks } from "./resources/back-office-tasks.js";
export { Voice } from "./resources/voice.js";
export { Tools } from "./resources/tools.js";
export { Articles } from "./resources/articles.js";
export { Topics } from "./resources/topics.js";
export { Procedures } from "./resources/procedures.js";
export { HandOffTargets } from "./resources/hand-off-targets.js";
export { ResourceSources } from "./resources/resource-sources.js";
export { ResourceTypes } from "./resources/resource-types.js";
export { Secrets } from "./resources/secrets.js";
export { Notes } from "./resources/notes.js";
export { TerminologySubstitutions } from "./resources/terminology-substitutions.js";
export { TrafficGroups } from "./resources/traffic-groups.js";
export { IpAddressesResource, type IpAddresses } from "./resources/ip-addresses.js";

// Enums
export * from "./models/enums.js";

// Models
export * from "./models/common.js";
export * from "./models/conversations.js";
export * from "./models/back-office-tasks.js";
export * from "./models/voice.js";
export * from "./models/tools.js";
export * from "./models/articles.js";
export * from "./models/procedures.js";
export * from "./models/hand-off-targets.js";
export * from "./models/resources.js";
export * from "./models/secrets.js";
export * from "./models/notes.js";
export * from "./models/terminology.js";
export * from "./models/traffic-groups.js";
