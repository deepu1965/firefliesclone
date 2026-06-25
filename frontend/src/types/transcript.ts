export interface TranscriptSegment {
  id: number;
  speaker_name: string;
  start_time_ms: number;
  end_time_ms: number;
  text: string;
  sequence_index: number;
  speaker_id: number | null;
}

export interface TranscriptResponse {
  id: number;
  meeting_id: number;
  source: "seeded" | "uploaded" | "generated";
  segments: TranscriptSegment[];
  total_segments: number;
}

export interface TranscriptSearchResult {
  segment_id: number;
  speaker_name: string;
  start_time_ms: number;
  end_time_ms: number;
  highlighted_text: string;
  sequence_index: number;
}

export interface TranscriptSearchResponse {
  query: string;
  total: number;
  results: TranscriptSearchResult[];
}
