import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, variant = "default") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set({ toasts: [...get().toasts, { id, message, variant }] });
    setTimeout(() => get().dismiss(id), 3000);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  show: (message: string) => useToastStore.getState().show(message, "default"),
  success: (message: string) => useToastStore.getState().show(message, "success"),
  error: (message: string) => useToastStore.getState().show(message, "error"),
};
