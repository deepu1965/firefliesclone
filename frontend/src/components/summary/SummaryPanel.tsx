"use client";

import { useState } from "react";
import { useSummary } from "@/hooks/useSummary";
import { useTopics } from "@/hooks/useTopics";
import { OverviewTab } from "./OverviewTab";
import { ActionItemList } from "./ActionItemList";
import { TopicList } from "./TopicList";

type TabId = "overview" | "action-items" | "topics";

const TABS: { id: TabId; label: string; count?: number }[] = [
  { id: "overview", label: "Summary" },
  { id: "action-items", label: "Action Items" },
  { id: "topics", label: "Topics" },
];

interface SummaryPanelProps {
  meetingId: string;
}

export function SummaryPanel({ meetingId }: SummaryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { query: summaryQuery, generateMutation } = useSummary(meetingId);
  const { data: topics, isLoading: topicsLoading } = useTopics(meetingId);

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-ff-border shrink-0 bg-ff-bg-base px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2.5 text-[13px] transition-colors border-b-2 relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-ff-accent-light border-ff-accent font-medium"
                : "text-ff-text-dim hover:text-ff-text-body border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <OverviewTab
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
            onGenerate={() => generateMutation.mutate()}
            isGenerating={generateMutation.isLoading}
          />
        )}

        {activeTab === "action-items" && (
          <ActionItemList meetingId={meetingId} />
        )}

        {activeTab === "topics" && (
          <TopicList topics={topics} isLoading={topicsLoading} />
        )}
      </div>
    </div>
  );
}
