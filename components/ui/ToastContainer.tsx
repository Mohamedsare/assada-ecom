"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, XCircle, Info, AlertTriangle, ShoppingCart } from "lucide-react";
import { useUIStore, type Toast } from "@/stores/ui";
import { cn } from "@/lib/utils";

const ICONS = {
  success: <CheckCircle size={17} className="text-[#0A2A52] shrink-0" />,
  error:   <XCircle    size={17} className="text-[#EF4444] shrink-0" />,
  info:    <ShoppingCart size={17} className="text-blue-500 shrink-0" />,
  warning: <AlertTriangle size={17} className="text-[#F97316] shrink-0" />,
};

const BARS = {
  success: "bg-[#0A2A52]",
  error:   "bg-[#EF4444]",
  info:    "bg-blue-500",
  warning: "bg-[#F97316]",
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next tick
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div
      className={cn(
        "relative w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300",
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      )}
    >
      {/* Progress bar */}
      <div
        className={cn("absolute top-0 left-0 h-0.5 animate-shrink-x", BARS[toast.type])}
        style={{ animationDuration: `${toast.duration ?? 3500}ms` }}
      />

      <div className="flex items-start gap-3 p-4">
        {ICONS[toast.type]}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0A2A52] leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 -mt-0.5"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="fixed top-20 right-4 z-[200] flex flex-col gap-2 items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
}
