import { ActionItem, ActionItemCreatePayload, ActionItemUpdatePayload } from "@/types/summary";
import { apiClient } from "./client";

export async function fetchActionItems(meetingId: string): Promise<ActionItem[]> {
  const { data } = await apiClient.get<ActionItem[]>(`/meetings/${meetingId}/action-items`);
  return data;
}

export async function createActionItem(
  meetingId: string,
  payload: ActionItemCreatePayload
): Promise<ActionItem> {
  const { data } = await apiClient.post<ActionItem>(
    `/meetings/${meetingId}/action-items`,
    payload
  );
  return data;
}

export async function updateActionItem(
  itemId: string,
  payload: ActionItemUpdatePayload
): Promise<ActionItem> {
  const { data } = await apiClient.patch<ActionItem>(`/action-items/${itemId}`, payload);
  return data;
}

export async function deleteActionItem(itemId: string): Promise<void> {
  await apiClient.delete(`/action-items/${itemId}`);
}
