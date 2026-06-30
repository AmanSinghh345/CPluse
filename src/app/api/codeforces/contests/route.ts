import { CodeforcesError, getContests } from "@/lib/codeforces";
import { NextResponse } from "next/server";
export async function GET() { try { const contests = await getContests(); return NextResponse.json(contests.filter((contest) => contest.phase === "BEFORE").sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0))); } catch (error) { const e = error instanceof CodeforcesError ? error : new CodeforcesError("Unable to load contests."); return NextResponse.json({ error: e.message }, { status: e.status }); } }
