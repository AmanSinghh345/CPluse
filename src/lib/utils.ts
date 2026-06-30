import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
export function formatRelativeTime(epochSeconds: number) {
  const diff = Date.now() - epochSeconds * 1000;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(epochSeconds * 1000);
}
export function problemKey(problem: { contestId?: number; problemsetName?: string; index: string }) {
  return `${problem.contestId ?? problem.problemsetName ?? "unknown"}-${problem.index}`;
}
export function rankColor(rank?: string) {
  if (!rank) return "text-zinc-400";
  if (rank.includes("legendary")) return "text-red-500";
  if (rank.includes("international")) return "text-red-400";
  if (rank.includes("grandmaster")) return "text-red-400";
  if (rank.includes("master")) return "text-orange-400";
  if (rank.includes("candidate")) return "text-violet-400";
  if (rank.includes("expert")) return "text-blue-400";
  if (rank.includes("specialist")) return "text-cyan-400";
  if (rank.includes("pupil")) return "text-emerald-400";
  return "text-zinc-400";
}
