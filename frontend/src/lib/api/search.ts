import { apiClient } from "./client";

export interface GlobalSearchResult {
  result_type: "meeting" | "segment";
  meeting_id: number;
  meeting_external_id: string;
  meeting_title: string;
  segment_id: number | null;
  speaker_name: string | null;
  start_time_ms: number | null;
  text: string;
  score: number;
}

export interface GlobalSearchResponse {
  query: string;
  results: GlobalSearchResult[];
}

export async function globalSearch(q: string, limit = 30): Promise<GlobalSearchResponse> {
  const { data } = await apiClient.get<GlobalSearchResponse>("/search", {
    params: { q, limit },
  });
  return data;
}
