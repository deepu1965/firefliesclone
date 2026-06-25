"use client";

import { useState, useRef } from "react";
import { Topbar } from "@/components/layout/Topbar";

const SUGGESTIONS = [
  "Summarize my last 3 meetings",
  "What action items are still pending?",
  "Who spoke the most in Q3 Review?",
  "Find meetings about product roadmap",
  "Extract all decisions from this week",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AskFredPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Fred, your AI meeting assistant. I can search across all your meetings, summarize discussions, find action items, and answer questions about your conversations.\n\nType `/` to see available AI skills.",
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      {
        role: "assistant",
        content: `I've received your question: "${userMsg}"\n\nThis feature is coming soon — AskFred will search across all your meeting transcripts and provide AI-powered answers in real time.`,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7B5DE8] to-[#A855F7] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
              <path d="M6 0l1.12 3.45h3.63L7.8 5.57 8.88 9.03 6 7 3.12 9.03 4.2 5.57 1.25 3.45h3.63L6 0Z" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-ff-text-primary">AskFred</span>
          <span className="text-[10px] font-medium px-2 py-0.5 bg-[#ECFDF5] text-[#059669] rounded-full">AI</span>
        </div>
      </Topbar>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-semibold ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-[#7B5DE8] to-[#A855F7] text-white"
                  : "bg-ff-accent text-white"
              }`}>
                {msg.role === "assistant" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                    <path d="M6 0l1.12 3.45h3.63L7.8 5.57 8.88 9.03 6 7 3.12 9.03 4.2 5.57 1.25 3.45h3.63L6 0Z" />
                  </svg>
                ) : "JD"}
              </div>
              {/* Bubble */}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-[12px] text-[13px] leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-ff-accent text-white rounded-tr-[4px]"
                  : "bg-white border border-[#EBEBEB] text-ff-text-body rounded-tl-[4px]"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions (only shown when no user messages) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-[10px] font-semibold text-ff-text-muted uppercase tracking-widest mb-2">Suggested</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-[11px] px-2.5 py-1.5 bg-white border border-[#EBEBEB] text-ff-text-body rounded-[6px] hover:border-ff-accent hover:text-ff-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 pb-4">
          <div className="relative bg-white border border-[#EBEBEB] rounded-[12px] focus-within:border-ff-accent focus-within:shadow-[0_0_0_3px_rgba(123,93,232,0.08)] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Fred anything about your meetings... (type / for AI skills)"
              rows={2}
              className="w-full bg-transparent px-4 pt-3 pb-1 text-[13px] text-ff-text-primary placeholder:text-ff-text-dim focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between px-4 pb-2">
              <p className="text-[10px] text-ff-text-muted">
                Type <kbd className="bg-[#F5F4F9] border border-[#EBEBEB] rounded px-1 font-mono">/</kbd> to run AI skills · Press Enter to send
              </p>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ff-accent disabled:opacity-40 text-white text-[12px] font-medium rounded-[7px] hover:bg-ff-accent-light transition-colors disabled:cursor-not-allowed"
              >
                Send
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 5.5h9M6 2l4 3.5L6 9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
