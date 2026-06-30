import { cleanHandle, CodeforcesError, getSubmissions } from "@/lib/codeforces";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) { try { return NextResponse.json(await getSubmissions(cleanHandle(request.nextUrl.searchParams.get("handle") ?? ""))); } catch (error) { const e = error instanceof CodeforcesError ? error : new CodeforcesError("Unable to load submissions."); return NextResponse.json({ error: e.message }, { status: e.status }); } }
