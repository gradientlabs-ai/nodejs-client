import type { BackOfficeTaskResultType, BackOfficeTaskStatus } from "./enums.js";

/** An attachment uploaded with a back-office task. URL and base64 are mutually exclusive. */
export interface BackOfficeTaskAttachmentInput {
  file_name: string;
  url?: string;
  base_64_contents?: string;
}

/** An attachment as returned on a back-office task. */
export interface BackOfficeTaskAttachment {
  idempotency_key: string;
  file_name: string;
  external_url?: string;
  raw_contents?: string;
}

/** The result of a back-office task, validated against the procedure's result schema. */
export interface BackOfficeTaskResult {
  result_type: BackOfficeTaskResultType;
  custom?: Record<string, unknown>;
}

/** A back-office (Tier 2) task processed by a configurable agent. */
export interface BackOfficeTask {
  id: string;
  agent_id: string;
  input: Record<string, unknown>;
  created: string;
  updated?: string;
  status?: BackOfficeTaskStatus;
  result?: BackOfficeTaskResult;
  metadata?: Record<string, string>;
  attachments?: BackOfficeTaskAttachment[];
  completed?: string;
  failed?: string;
  failure_reasons?: string[];
  handed_off?: string;
  hand_off_reason?: string;
}

export interface CreateBackOfficeTaskParams {
  /** Unique external identifier for the task. */
  id: string;
  /** Input data for the task; shape depends on the task type. */
  input: Record<string, unknown>;
  /** Identifies the agent (`agent_…`) that owns the procedure to run the task against. Required. */
  agent_id: string;
  /** Identifies the procedure (`proc_…`) within the agent to start the task from. Required. */
  procedure_id: string;
  /** Optional free-format metadata the agent can read. */
  metadata?: Record<string, string>;
  attachments?: BackOfficeTaskAttachmentInput[];
  /** Optional creation timestamp (RFC3339). Defaults to now. */
  created?: string;
}
