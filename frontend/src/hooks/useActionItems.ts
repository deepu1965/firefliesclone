import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
} from "@/lib/api/actionItems";
import { ActionItem, ActionItemCreatePayload, ActionItemUpdatePayload } from "@/types/summary";
import { useUiStore } from "@/stores/uiStore";

export function useActionItems(meetingId: string) {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const queryKey = ["action-items", meetingId];

  const query = useQuery<ActionItem[]>({
    queryKey,
    queryFn: () => fetchActionItems(meetingId),
    enabled: !!meetingId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: ActionItemCreatePayload) => createActionItem(meetingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      addToast("Action item added", "success");
    },
    onError: () => addToast("Failed to create action item", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: ActionItemUpdatePayload }) =>
      updateActionItem(itemId, payload),
    onMutate: async ({ itemId, payload }) => {
      await queryClient.cancelQueries(queryKey);
      const prev = queryClient.getQueryData<ActionItem[]>(queryKey);
      queryClient.setQueryData<ActionItem[]>(queryKey, (old) =>
        (old ?? []).map((item) =>
          item.external_id === itemId ? { ...item, ...payload } : item
        )
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
      addToast("Failed to update action item", "error");
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteActionItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries(queryKey);
      const prev = queryClient.getQueryData<ActionItem[]>(queryKey);
      queryClient.setQueryData<ActionItem[]>(queryKey, (old) =>
        (old ?? []).filter((item) => item.external_id !== itemId)
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
      addToast("Failed to delete action item", "error");
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
    onSuccess: () => addToast("Action item deleted", "success"),
  });

  return { query, createMutation, updateMutation, deleteMutation };
}
