import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, variant?: ToastVariant, duration?: number) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, variant = "default", duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set({ toasts: [...get().toasts, { id, message, variant, duration }] });
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration);
    }
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  show: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "default", duration),
  success: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "success", duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "error", duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "info", duration),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "warning", duration),
};
