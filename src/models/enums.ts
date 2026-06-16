// Open string enums. Each is modelled as a `const` object of known values plus
// an open union type (`| (string & {})`) so that a future server-side value
// never breaks a consumer at compile time while retaining autocomplete.
//
// Values are sourced verbatim from the wearegradient Go source.

export const ArticleStatus = {
  Draft: "draft",
  Published: "published",
  Deleted: "deleted",
  Excluded: "excluded",
  Unknown: "unknown",
} as const;
export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus] | (string & {});

export const ArticleUsageStatus = {
  On: "on",
  Off: "off",
} as const;
export type ArticleUsageStatus =
  | (typeof ArticleUsageStatus)[keyof typeof ArticleUsageStatus]
  | (string & {});

export const ArticleVisibility = {
  Public: "public",
  Users: "users",
  Internal: "internal",
  Unknown: "unknown",
} as const;
export type ArticleVisibility =
  | (typeof ArticleVisibility)[keyof typeof ArticleVisibility]
  | (string & {});

export const AttachmentType = {
  Image: "image",
  File: "file",
} as const;
export type AttachmentType = (typeof AttachmentType)[keyof typeof AttachmentType] | (string & {});

export const Channel = {
  Web: "web",
  Email: "email",
  Voice: "voice",
  Unmapped: "unmapped",
} as const;
export type Channel = (typeof Channel)[keyof typeof Channel] | (string & {});

export const CustomerSource = {
  Dixa: "dixa",
  Intercom: "intercom",
  Freshchat: "freshchat",
  Freshdesk: "freshdesk",
  PublicApi: "public-api",
  ChatSdk: "chat-sdk",
  Salesforce: "salesforce",
  Zendesk: "zendesk",
  Livekit: "livekit",
  Twilio: "twilio",
  Talkdesk: "talkdesk",
  IntercomVoice: "intercom-voice",
  Livechat: "livechat",
  WebApp: "web-app",
  Gmail: "gmail",
  File: "file",
} as const;
export type CustomerSource = (typeof CustomerSource)[keyof typeof CustomerSource] | (string & {});

export const ParticipantType = {
  Customer: "Customer",
  Agent: "Agent",
  AIAgent: "AI Agent",
  Bot: "Bot",
} as const;
export type ParticipantType =
  | (typeof ParticipantType)[keyof typeof ParticipantType]
  | (string & {});

export const ConversationEventType = {
  Assigned: "assigned",
  Cancelled: "cancelled",
  Finished: "finished",
  Resumed: "resumed",
  InternalNote: "internal-note",
  Message: "message",
  Delivered: "delivered",
  Read: "read",
  Rated: "rated",
  Started: "started",
  Typing: "typing",
  AsyncToolResult: "async-tool-result",
} as const;
export type ConversationEventType =
  | (typeof ConversationEventType)[keyof typeof ConversationEventType]
  | (string & {});

export const ProcedureStatus = {
  Unsaved: "unsaved",
  Draft: "draft",
  Live: "live",
  Archived: "archived",
} as const;
export type ProcedureStatus =
  | (typeof ProcedureStatus)[keyof typeof ProcedureStatus]
  | (string & {});

export const NoteStatus = {
  Draft: "draft",
  Live: "live",
  Deleted: "deleted",
} as const;
export type NoteStatus = (typeof NoteStatus)[keyof typeof NoteStatus] | (string & {});

export const BackOfficeTaskStatus = {
  Pending: "pending",
  InProgress: "in-progress",
  Completed: "completed",
  Failed: "failed",
  HandedOff: "handed-off",
} as const;
export type BackOfficeTaskStatus =
  | (typeof BackOfficeTaskStatus)[keyof typeof BackOfficeTaskStatus]
  | (string & {});

export const BackOfficeTaskResultType = {
  Custom: "custom",
} as const;
export type BackOfficeTaskResultType =
  | (typeof BackOfficeTaskResultType)[keyof typeof BackOfficeTaskResultType]
  | (string & {});

export const AttributeCardinality = {
  One: "one",
  Many: "many",
} as const;
export type AttributeCardinality =
  | (typeof AttributeCardinality)[keyof typeof AttributeCardinality]
  | (string & {});

export const AttributeType = {
  String: "string",
  Date: "date",
  Timestamp: "timestamp",
  Boolean: "boolean",
  Number: "number",
  Array: "array",
  Complex: "complex",
} as const;
export type AttributeType = (typeof AttributeType)[keyof typeof AttributeType] | (string & {});

export const ResourceSourceRefreshStrategy = {
  Dynamic: "dynamic",
  Static: "static",
} as const;
export type ResourceSourceRefreshStrategy =
  | (typeof ResourceSourceRefreshStrategy)[keyof typeof ResourceSourceRefreshStrategy]
  | (string & {});

export const ResourceSourceScope = {
  Global: "global",
  Local: "local",
} as const;
export type ResourceSourceScope =
  | (typeof ResourceSourceScope)[keyof typeof ResourceSourceScope]
  | (string & {});

export const ResourceSourceType = {
  Http: "http",
  Internal: "internal",
  Webhook: "webhook",
} as const;
export type ResourceSourceType =
  | (typeof ResourceSourceType)[keyof typeof ResourceSourceType]
  | (string & {});

export const SchemaUpdateStrategy = {
  Replace: "replace",
  Merge: "merge",
} as const;
export type SchemaUpdateStrategy =
  | (typeof SchemaUpdateStrategy)[keyof typeof SchemaUpdateStrategy]
  | (string & {});

export const ResourceTypeRefreshStrategy = {
  Dynamic: "dynamic",
  Static: "static",
} as const;
export type ResourceTypeRefreshStrategy =
  | (typeof ResourceTypeRefreshStrategy)[keyof typeof ResourceTypeRefreshStrategy]
  | (string & {});

export const ResourceTypeScope = {
  Global: "global",
  Local: "local",
} as const;
export type ResourceTypeScope =
  | (typeof ResourceTypeScope)[keyof typeof ResourceTypeScope]
  | (string & {});

export const SupportPlatform = {
  Dixa: "dixa",
  Freshchat: "freshchat",
  Freshdesk: "freshdesk",
  Gmail: "gmail",
  Intercom: "intercom",
  Livechat: "livechat",
  PublicApi: "public-api",
  ChatSdk: "chat-sdk",
  Salesforce: "salesforce",
  Zendesk: "zendesk",
  Livekit: "livekit",
  Twilio: "twilio",
  Talkdesk: "talkdesk",
  IntercomVoice: "intercom-voice",
  ConversationSynthesizor: "conversation-synthesizor",
  WebApp: "web-app",
} as const;
export type SupportPlatform =
  | (typeof SupportPlatform)[keyof typeof SupportPlatform]
  | (string & {});

export const BodyEncoding = {
  Json: "application/json",
  Form: "application/x-www-form-urlencoded",
} as const;
export type BodyEncoding = (typeof BodyEncoding)[keyof typeof BodyEncoding] | (string & {});

export const ParameterSource = {
  Llm: "llm",
  Literal: "literal",
  Resource: "resource",
} as const;
export type ParameterSource =
  | (typeof ParameterSource)[keyof typeof ParameterSource]
  | (string & {});

export const ParameterType = {
  String: "string",
  StringArray: "string_array",
  Integer: "integer",
  Float: "float",
  Boolean: "boolean",
  Date: "date",
  Timestamp: "timestamp",
  Duration: "duration",
} as const;
export type ParameterType = (typeof ParameterType)[keyof typeof ParameterType] | (string & {});
