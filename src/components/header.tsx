"use client";
import Link from "next/link";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [{ href: "/sheet", label: "Sheet" }, { href: "/compare", label: "Compare" }, { href: "/contests", label: "Contests" }];
export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-white/7 bg-[#07090d]/80 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold tracking-tight"><span className="grid size-8 place-items-center rounded-lg bg-[#b7f34a] text-black"><Activity size={17} strokeWidth={2.6} /></span>CPulse</Link><nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">{links.map((link) => <Link key={link.href} className="transition hover:text-white" href={link.href}>{link.label}</Link>)}<Link href="/#analyze" className="rounded-lg bg-white px-4 py-2 font-medium text-black transition hover:bg-[#b7f34a]">Analyze handle</Link></nav><button aria-label="Toggle menu" className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>{open && <nav className="flex flex-col gap-4 border-t border-white/7 px-5 py-5 text-zinc-300 md:hidden">{links.map((link) => <Link onClick={() => setOpen(false)} key={link.href} href={link.href}>{link.label}</Link>)}</nav>}</header>;
}
