import { useQuery } from "@tanstack/react-query";
import { globalSearch, GlobalSearchResponse } from "@/lib/api/search";

export function useSearch(q: string) {
  return useQuery<GlobalSearchResponse>({
    queryKey: ["search", q],
    queryFn: () => globalSearch(q),
    enabled: q.trim().length >= 2,
    staleTime: 30 * 1000,
  });
}
