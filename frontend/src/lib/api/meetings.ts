import { PaginatedResponse } from "@/types/api";
import { MeetingListItem, MeetingDetail, MeetingCreatePayload, MeetingUpdatePayload } from "@/types/meeting";
import { apiClient } from "./client";

export interface MeetingListParams {
  q?: string;
  participant?: string;
  date_from?: string;
  date_to?: string;
  sort?: "recent" | "name";
  page?: number;
  page_size?: number;
}

export async function fetchMeetings(params: MeetingListParams = {}): Promise<PaginatedResponse<MeetingListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<MeetingListItem>>("/meetings", { params });
  return data;
}

export async function fetchMeeting(externalId: string): Promise<MeetingDetail> {
  const { data } = await apiClient.get<MeetingDetail>(`/meetings/${externalId}`);
  return data;
}

export async function createMeeting(payload: MeetingCreatePayload): Promise<MeetingDetail> {
  const { data } = await apiClient.post<MeetingDetail>("/meetings", payload);
  return data;
}

export async function updateMeeting(externalId: string, payload: MeetingUpdatePayload): Promise<MeetingDetail> {
  const { data } = await apiClient.patch<MeetingDetail>(`/meetings/${externalId}`, payload);
  return data;
}

export async function deleteMeeting(externalId: string): Promise<void> {
  await apiClient.delete(`/meetings/${externalId}`);
}
