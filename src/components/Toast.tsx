"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

let toastIdCounter = 0;
const toastListeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function notify() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function showToast(message: string, type: ToastType = "info") {
  const id = `toast-${toastIdCounter++}`;
  toasts = [...toasts, { id, message, type }];
  notify();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 5000);
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    toastListeners.add(listener);
    setCurrentToasts([...toasts]);

    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-green-500/40 bg-green-950/90 text-green-100"
              : toast.type === "error"
                ? "border-red-500/40 bg-red-950/90 text-red-100"
                : "border-sky-500/40 bg-sky-950/90 text-sky-100"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}







