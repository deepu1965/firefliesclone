export interface MeetingListItem {
  external_id: string;
  title: string;
  started_at: string | null;
  duration_seconds: number | null;
  status: "scheduled" | "processing" | "processed" | "failed";
  audio_url: string | null;
  participant_count: number;
  participants: ParticipantSummary[];
  summary_preview: string[] | null;
  created_at: string;
}

export interface MeetingDetail extends MeetingListItem {
  host_user_id: number;
  scheduled_at: string | null;
  ended_at: string | null;
  meeting_url: string | null;
  updated_at: string;
}

export interface ParticipantSummary {
  external_id?: string;
  name: string;
  email: string | null;
  role: "host" | "attendee";
  speaker_label: string | null;
}

export interface MeetingCreatePayload {
  title: string;
  started_at?: string;
  duration_seconds?: number;
  participants?: { name: string; email?: string; role?: "host" | "attendee" }[];
  transcript_text?: string;
}

export interface MeetingUpdatePayload {
  title?: string;
  started_at?: string;
  audio_url?: string;
}
