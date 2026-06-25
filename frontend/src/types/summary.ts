export interface SummaryResponse {
  id: number;
  meeting_id: number;
  overview: string | null;
  key_points: string[];
  next_steps: string[];
  generated_by: "seeded" | "llm" | "manual";
  generated_at: string | null;
}

export interface ActionItem {
  external_id: string;
  meeting_id: number;
  assignee_name: string | null;
  description: string;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface ActionItemCreatePayload {
  description: string;
  assignee_name?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
}

export interface ActionItemUpdatePayload {
  description?: string;
  status?: "pending" | "in_progress" | "completed";
  assignee_name?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
}

export interface Topic {
  id: number;
  title: string;
  start_time_ms: number | null;
  end_time_ms: number | null;
  sequence_index: number;
}
