"use client";
import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, Toast, ToastType } from "@/stores/toastStore";

const CONFIG: Record<ToastType, { icon: any; bg: string; border: string; icon_color: string; title_color: string }> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-white",
    border: "border-green-200",
    icon_color: "text-green-500",
    title_color: "text-[#222222]",
  },
  error: {
    icon: XCircle,
    bg: "bg-white",
    border: "border-red-200",
    icon_color: "text-red-500",
    title_color: "text-[#222222]",
  },
  info: {
    icon: Info,
    bg: "bg-white",
    border: "border-blue-200",
    icon_color: "text-blue-500",
    title_color: "text-[#222222]",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-white",
    border: "border-amber-200",
    icon_color: "text-amber-500",
    title_color: "text-[#222222]",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const cfg = CONFIG[toast.type];
  const Icon = cfg.icon;

  return (
    <div
      className={`flex items-start gap-3 ${cfg.bg} border ${cfg.border} rounded-2xl shadow-lg px-4 py-3.5 w-80 animate-in slide-in-from-right-5 fade-in duration-300`}
    >
      <Icon size={18} className={`${cfg.icon_color} mt-0.5 shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${cfg.title_color} leading-tight`}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[#717171] mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="text-[#AAAAAA] hover:text-[#717171] transition-colors shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
