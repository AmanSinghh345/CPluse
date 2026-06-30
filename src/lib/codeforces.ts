import type { CFContest, CFSubmission, CFUser, RatingChange } from "@/types/codeforces";

const CF_API = "https://codeforces.com/api";

interface CFResponse<T> { status: "OK" | "FAILED"; result?: T; comment?: string }

export class CodeforcesError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}

async function request<T>(method: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams(params);
  const response = await fetch(`${CF_API}/${method}?${query}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new CodeforcesError(response.status === 429 ? "Codeforces rate limit reached. Try again shortly." : "Codeforces is unavailable right now.", response.status);
  const payload = (await response.json()) as CFResponse<T>;
  if (payload.status !== "OK" || payload.result === undefined) {
    const notFound = payload.comment?.toLowerCase().includes("not found") || payload.comment?.includes("handles:");
    throw new CodeforcesError(notFound ? "That Codeforces handle does not exist." : payload.comment ?? "Codeforces returned an error.", notFound ? 404 : 502);
  }
  return payload.result;
}

export async function getProfile(handle: string) { return (await request<CFUser[]>("user.info", { handles: handle, checkHistoricHandles: "false" }))[0]; }
export async function getRatings(handle: string) { return request<RatingChange[]>("user.rating", { handle }); }
export async function getSubmissions(handle: string) { return request<CFSubmission[]>("user.status", { handle, from: "1", count: "10000" }); }
export async function getContests() { return request<CFContest[]>("contest.list", { gym: "false" }); }

export function cleanHandle(value: string) {
  const handle = value.trim();
  if (!/^[a-zA-Z0-9_.-]{1,24}$/.test(handle)) throw new CodeforcesError("Enter a valid Codeforces handle.", 400);
  return handle;
}
