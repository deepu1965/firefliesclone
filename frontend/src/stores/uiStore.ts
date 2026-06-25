import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UiStore {
  activeTab: "overview" | "action-items";
  transcriptQuery: string;
  toasts: Toast[];

  setActiveTab: (tab: "overview" | "action-items") => void;
  setTranscriptQuery: (q: string) => void;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeTab: "overview",
  transcriptQuery: "",
  toasts: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setTranscriptQuery: (q) => set({ transcriptQuery: q }),

  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
