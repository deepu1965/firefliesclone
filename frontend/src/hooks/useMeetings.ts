import { useQuery } from "@tanstack/react-query";
import { fetchMeetings, MeetingListParams } from "@/lib/api/meetings";
import { PaginatedResponse } from "@/types/api";
import { MeetingListItem } from "@/types/meeting";

export function useMeetings(params: MeetingListParams = {}) {
  return useQuery<PaginatedResponse<MeetingListItem>>({
    queryKey: ["meetings", params],
    queryFn: () => fetchMeetings(params),
    keepPreviousData: true,
  });
}
