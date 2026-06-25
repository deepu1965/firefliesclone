import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Topic } from "@/types/summary";

export function useTopics(meetingId: string) {
  return useQuery<Topic[]>({
    queryKey: ["topics", meetingId],
    queryFn: async () => {
      const { data } = await apiClient.get<Topic[]>(`/meetings/${meetingId}/topics`);
      return data;
    },
    enabled: !!meetingId,
    staleTime: 60_000,
  });
}
