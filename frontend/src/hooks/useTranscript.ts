import { useQuery } from "@tanstack/react-query";
import { fetchTranscript } from "@/lib/api/transcripts";
import { TranscriptResponse } from "@/types/transcript";

export function useTranscript(meetingId: string) {
  return useQuery<TranscriptResponse>({
    queryKey: ["transcript", meetingId],
    queryFn: () => fetchTranscript(meetingId),
    enabled: !!meetingId,
    staleTime: 60_000,
  });
}
