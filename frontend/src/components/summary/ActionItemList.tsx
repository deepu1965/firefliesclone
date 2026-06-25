"use client";

import { ActionItem, ActionItemCreatePayload } from "@/types/summary";
import { ActionItemCard } from "./ActionItemCard";
import { ActionItemForm } from "./ActionItemForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActionItems } from "@/hooks/useActionItems";

interface ActionItemListProps {
  meetingId: string;
}

function ActionItemsSkeleton() {
  return (
    <div className="p-4 space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 items-start">
          <Skeleton className="w-[15px] h-[15px] rounded-[3px] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 rounded w-4/5" />
            <Skeleton className="h-2.5 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActionItemList({ meetingId }: ActionItemListProps) {
  const { query, createMutation, updateMutation, deleteMutation } = useActionItems(meetingId);
  const { data: items, isLoading } = query;

  const handleToggle = (item: ActionItem) => {
    const nextStatus = item.status === "completed" ? "pending" : "completed";
    updateMutation.mutate({ itemId: item.external_id, payload: { status: nextStatus } });
  };

  const handleDelete = (itemId: string) => {
    deleteMutation.mutate(itemId);
  };

  const handleCreate = (payload: ActionItemCreatePayload) => {
    createMutation.mutate(payload);
  };

  if (isLoading) return <ActionItemsSkeleton />;

  const pending = (items ?? []).filter((i) => i.status !== "completed");
  const completed = (items ?? []).filter((i) => i.status === "completed");
  const updatingId = updateMutation.isLoading ? updateMutation.variables?.itemId : undefined;

  return (
    <div className="p-4 space-y-3">
      {/* Pending items */}
      {pending.length > 0 ? (
        <div className="space-y-2">
          {pending.map((item) => (
            <ActionItemCard
              key={item.external_id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              isUpdating={updatingId === item.external_id}
            />
          ))}
        </div>
      ) : (
        <div className="text-xs text-ff-text-muted text-center py-4">
          No pending action items
        </div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-ff-text-dim uppercase tracking-wider">
            Completed ({completed.length})
          </p>
          {completed.map((item) => (
            <ActionItemCard
              key={item.external_id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              isUpdating={updatingId === item.external_id}
            />
          ))}
        </div>
      )}

      {/* Add form */}
      <ActionItemForm
        onSubmit={handleCreate}
        isSubmitting={createMutation.isLoading}
      />
    </div>
  );
}
