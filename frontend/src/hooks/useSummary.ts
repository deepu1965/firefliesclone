import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSummary, generateSummary } from "@/lib/api/summaries";
import { SummaryResponse } from "@/types/summary";
import { useUiStore } from "@/stores/uiStore";

export function useSummary(meetingId: string) {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const query = useQuery<SummaryResponse>({
    queryKey: ["summary", meetingId],
    queryFn: () => fetchSummary(meetingId),
    enabled: !!meetingId,
    staleTime: 60_000,
  });

  const generateMutation = useMutation({
    mutationFn: () => generateSummary(meetingId),
    onSuccess: (data) => {
      queryClient.setQueryData(["summary", meetingId], data);
      addToast("Summary generated", "success");
    },
    onError: () => {
      addToast("Failed to generate summary — using cached version", "error");
    },
  });

  return { query, generateMutation };
}
