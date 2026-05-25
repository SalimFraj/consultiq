export type ChatMode = "assistant" | "workflow";

export type ClientMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

export type ToolEvent = {
  id: string;
  name: string;
  label: string;
  args: Record<string, unknown>;
  result: unknown;
  status: "completed" | "failed";
  durationMs: number;
};

export type AssistantMetadata = {
  model: string;
  latencyMs: number;
  toolsUsed: string[];
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  demoMode: boolean;
  /** Sanitized provider status such as quota_limited or provider_error. */
  providerError?: string;
};

export type ChatApiResponse = {
  message: string;
  toolEvents: ToolEvent[];
  metadata: AssistantMetadata;
  flags: {
    uncertainty: boolean;
    complianceWarning: boolean;
    humanReviewRequired: boolean;
  };
};

export type ComplianceVerdict = "allowed" | "review required" | "not allowed";

export type CapabilityDefinition = {
  name: string;
  tool: string;
  purpose: string;
  productionSignal: string;
};

export type EvalResult = {
  id: string;
  prompt: string;
  expectedTools: string[];
  observedTools: string[];
  passed: boolean;
  expectedBehavior: string;
  notes: string;
  checks?: Array<{ check: string; passed: boolean; detail: string }>;
};

export type EvalSuiteResponse = {
  generatedAt: string;
  passCount: number;
  totalCount: number;
  results: EvalResult[];
};
