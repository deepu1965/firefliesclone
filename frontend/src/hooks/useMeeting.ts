import { useQuery } from "@tanstack/react-query";
import { fetchMeeting } from "@/lib/api/meetings";
import { MeetingDetail } from "@/types/meeting";

export function useMeeting(externalId: string) {
  return useQuery<MeetingDetail>({
    queryKey: ["meeting", externalId],
    queryFn: () => fetchMeeting(externalId),
    enabled: !!externalId,
  });
}
