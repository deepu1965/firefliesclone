import { SummaryResponse } from "@/types/summary";
import { apiClient } from "./client";

export async function fetchSummary(meetingId: string): Promise<SummaryResponse> {
  const { data } = await apiClient.get<SummaryResponse>(`/meetings/${meetingId}/summary`);
  return data;
}

export async function generateSummary(meetingId: string): Promise<SummaryResponse> {
  const { data } = await apiClient.post<SummaryResponse>(`/meetings/${meetingId}/summary/generate`);
  return data;
}
