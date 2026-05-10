import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    no_show: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    maintenance: "bg-orange-100 text-orange-800",
    done: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
    normal: "bg-gray-100 text-gray-800",
    low: "bg-slate-100 text-slate-600",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

export function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    manual: "Manuel",
    airbnb: "Airbnb",
    booking: "Booking",
    abritel: "Abritel",
    direct: "Direct",
    ical: "iCal",
  };
  return map[source] || source;
}

export function propertyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    apartment: "Appartement",
    house: "Maison",
    villa: "Villa",
    studio: "Studio",
    other: "Autre",
  };
  return map[type] || type;
}
