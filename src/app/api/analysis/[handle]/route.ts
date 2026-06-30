import { buildAnalysis } from "@/lib/analysis";
import { cleanHandle, CodeforcesError, getProfile, getRatings, getSubmissions } from "@/lib/codeforces";
import { NextResponse } from "next/server";
export async function GET(_: Request, { params }: { params: Promise<{ handle: string }> }) {
  try { const handle = cleanHandle(decodeURIComponent((await params).handle)); const [profile, ratings, submissions] = await Promise.all([getProfile(handle), getRatings(handle), getSubmissions(handle)]); return NextResponse.json(buildAnalysis(profile, ratings, submissions)); }
  catch (error) { const e = error instanceof CodeforcesError ? error : new CodeforcesError("Unable to analyze this handle."); return NextResponse.json({ error: e.message }, { status: e.status }); }
}
