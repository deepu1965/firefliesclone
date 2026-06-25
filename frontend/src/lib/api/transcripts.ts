import { TranscriptResponse, TranscriptSearchResponse } from "@/types/transcript";
import { apiClient } from "./client";

export async function fetchTranscript(meetingId: string): Promise<TranscriptResponse> {
  const { data } = await apiClient.get<TranscriptResponse>(`/meetings/${meetingId}/transcript`);
  return data;
}

export async function searchTranscript(
  meetingId: string,
  query: string,
  limit = 50
): Promise<TranscriptSearchResponse> {
  const { data } = await apiClient.get<TranscriptSearchResponse>(
    `/meetings/${meetingId}/transcript/search`,
    { params: { q: query, limit } }
  );
  return data;
}
