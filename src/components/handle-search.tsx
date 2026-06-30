"use client";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

export function HandleSearch({ compact = false, initial = "" }: { compact?: boolean; initial?: string }) {
  const router = useRouter(); const [handle, setHandle] = useState(initial); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); const value = handle.trim();
    if (!/^[a-zA-Z0-9_.-]{1,24}$/.test(value)) { setError("Enter a valid Codeforces handle."); return; }
    setLoading(true); setError("");
    try { const response = await fetch(`/api/codeforces/profile?handle=${encodeURIComponent(value)}`); const data = await response.json(); if (!response.ok) throw new Error(data.error); router.push(`/dashboard/${encodeURIComponent(data.handle)}`); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not find that handle."); setLoading(false); }
  }
  return <div className={cn("w-full", compact ? "max-w-md" : "max-w-xl")}><form onSubmit={submit} className={cn("flex items-center rounded-xl border border-white/12 bg-[#11141a] p-1.5 shadow-2xl shadow-black/30 focus-within:border-[#b7f34a]/60", compact && "rounded-lg")}><Search className="ml-3 text-zinc-500" size={18}/><input aria-label="Codeforces handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Enter Codeforces handle" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-zinc-600"/><button disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#b7f34a] px-4 py-2.5 text-sm font-semibold text-[#0b0d0e] transition hover:bg-[#c5ff5a] disabled:opacity-70">{loading ? <LoaderCircle className="animate-spin" size={16}/> : <>Analyze <ArrowRight size={15}/></>}</button></form>{error && <p className="mt-2 text-left text-xs text-red-400">{error}</p>}</div>;
}
