import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CPulse — Know your next move", template: "%s · CPulse" },
  description: "Codeforces performance analytics, weakness discovery, contest tracking, and smarter upsolving.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header />{children}<footer className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/8 px-5 py-8 text-xs text-zinc-500"><span>CPulse · Built for deliberate practice.</span><a href="https://codeforces.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300">Data by Codeforces ↗</a></footer></body></html>;
}
