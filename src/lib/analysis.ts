import type { ActivityDay, CFProblem, CFSubmission, CFUser, RatingBucket, RatingChange, TagStat, UpsolveProblem, UserAnalysis } from "@/types/codeforces";
import { problemKey } from "@/lib/utils";

const DAY = 86_400_000;

export function getUniqueSolvedProblems(submissions: CFSubmission[]) {
  const solved = new Map<string, CFProblem>();
  for (const submission of submissions) if (submission.verdict === "OK") solved.set(problemKey(submission.problem), submission.problem);
  return [...solved.values()];
}

export function getTagStats(submissions: CFSubmission[]): TagStat[] {
  const solvedKeys = new Set<string>();
  const accepted = new Map<string, Set<string>>();
  const wrong = new Map<string, number>();
  for (const submission of submissions) {
    const key = problemKey(submission.problem);
    if (submission.verdict === "OK") {
      if (!solvedKeys.has(key)) for (const tag of submission.problem.tags) {
        if (!accepted.has(tag)) accepted.set(tag, new Set());
        accepted.get(tag)!.add(key);
      }
      solvedKeys.add(key);
    } else if (submission.verdict && submission.verdict !== "COMPILATION_ERROR") {
      for (const tag of submission.problem.tags) wrong.set(tag, (wrong.get(tag) ?? 0) + 1);
    }
  }
  return [...new Set([...accepted.keys(), ...wrong.keys()])].map((tag) => {
    const solved = accepted.get(tag)?.size ?? 0;
    const wrongAttempts = wrong.get(tag) ?? 0;
    return { tag, solved, wrongAttempts, accuracy: Math.round((solved / Math.max(1, solved + wrongAttempts)) * 100), weakness: wrongAttempts / Math.max(1, solved) };
  }).sort((a, b) => b.solved - a.solved);
}

export function getRatingBuckets(problems: CFProblem[]): RatingBucket[] {
  const buckets: RatingBucket[] = [
    { range: "800–999", min: 800, max: 999, count: 0 }, { range: "1000–1199", min: 1000, max: 1199, count: 0 },
    { range: "1200–1399", min: 1200, max: 1399, count: 0 }, { range: "1400–1599", min: 1400, max: 1599, count: 0 },
    { range: "1600–1799", min: 1600, max: 1799, count: 0 }, { range: "1800+", min: 1800, max: Infinity, count: 0 },
  ];
  for (const problem of problems) if (problem.rating) buckets.find((bucket) => problem.rating! >= bucket.min && problem.rating! <= bucket.max)!.count++;
  return buckets;
}

function dateKey(epochSeconds: number) { return new Date(epochSeconds * 1000).toISOString().slice(0, 10); }

export function calculateActivity(submissions: CFSubmission[]) {
  const counts = new Map<string, number>();
  const acceptedKeysByDay = new Map<string, Set<string>>();
  for (const submission of submissions) if (submission.verdict === "OK") {
    const date = dateKey(submission.creationTimeSeconds);
    if (!acceptedKeysByDay.has(date)) acceptedKeysByDay.set(date, new Set());
    acceptedKeysByDay.get(date)!.add(problemKey(submission.problem));
  }
  for (const [date, keys] of acceptedKeysByDay) counts.set(date, keys.size);
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const activity: ActivityDay[] = [];
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today.getTime() - i * DAY).toISOString().slice(0, 10);
    activity.push({ date, count: counts.get(date) ?? 0 });
  }
  const active = new Set([...counts.keys()]);
  let longestStreak = 0, running = 0;
  const allDates = [...active].sort();
  for (let i = 0; i < allDates.length; i++) {
    running = i > 0 && (new Date(allDates[i]).getTime() - new Date(allDates[i - 1]).getTime()) === DAY ? running + 1 : 1;
    longestStreak = Math.max(longestStreak, running);
  }
  let currentStreak = 0;
  for (let i = active.has(today.toISOString().slice(0, 10)) ? 0 : 1; i < 366; i++) {
    const key = new Date(today.getTime() - i * DAY).toISOString().slice(0, 10);
    if (!active.has(key)) break;
    currentStreak++;
  }
  return { activity, currentStreak, longestStreak, activeDays30: activity.slice(-30).filter((d) => d.count > 0).length };
}

export function getUpsolveProblems(submissions: CFSubmission[]): UpsolveProblem[] {
  const solved = new Set(submissions.filter((s) => s.verdict === "OK").map((s) => problemKey(s.problem)));
  const attempts = new Map<string, UpsolveProblem>();
  for (const submission of submissions) if (submission.verdict && submission.verdict !== "OK" && submission.verdict !== "COMPILATION_ERROR" && submission.problem.contestId) {
    const key = problemKey(submission.problem);
    const existing = attempts.get(key);
    attempts.set(key, {
      key, contestId: submission.problem.contestId, index: submission.problem.index, name: submission.problem.name,
      rating: submission.problem.rating, tags: submission.problem.tags, wrongAttempts: (existing?.wrongAttempts ?? 0) + 1,
      lastAttempted: Math.max(existing?.lastAttempted ?? 0, submission.creationTimeSeconds),
      url: `https://codeforces.com/problemset/problem/${submission.problem.contestId}/${submission.problem.index}`,
    });
  }
  return [...attempts.values()].filter((problem) => !solved.has(problem.key)).sort((a, b) => b.lastAttempted - a.lastAttempted);
}

export function buildAnalysis(profile: CFUser, ratings: RatingChange[], submissions: CFSubmission[]): UserAnalysis {
  const solved = getUniqueSolvedProblems(submissions);
  const rated = solved.filter((problem) => problem.rating);
  const averageDifficulty = rated.length ? Math.round(rated.reduce((sum, p) => sum + p.rating!, 0) / rated.length / 100) * 100 : 0;
  const tagStats = getTagStats(submissions);
  const activityStats = calculateActivity(submissions);
  const changes = ratings.map((r) => r.newRating - r.oldRating);
  const practiceBase = Math.max(800, Math.round(((profile.rating ?? averageDifficulty ?? 800) + 100) / 100) * 100);
  const weakest = [...tagStats].filter((tag) => tag.wrongAttempts >= 2).sort((a, b) => b.weakness - a.weakness).slice(0, 2);
  const recommendations = weakest.map((tag) => `Practice ${practiceBase}–${practiceBase + 200} ${tag.tag} problems to turn attempts into solves.`);
  if (ratings.length >= 4 && Math.abs(ratings.at(-1)!.newRating - ratings.at(-4)!.newRating) < 100) recommendations.push("Your recent rating is steady—upsolve two problems after each contest to break the plateau.");
  if (!recommendations.length) recommendations.push(`Build depth with ${practiceBase}–${practiceBase + 200} problems in your less-practiced tags.`);
  return {
    profile, ratings, submissions, solvedCount: solved.length, averageDifficulty,
    highestRated: rated.sort((a, b) => b.rating! - a.rating!)[0], tagStats, ratingBuckets: getRatingBuckets(solved),
    ...activityStats, upsolves: getUpsolveProblems(submissions), recommendations: recommendations.slice(0, 3),
    ratingStats: { biggestGain: Math.max(0, ...changes), biggestLoss: Math.min(0, ...changes), bestRank: ratings.length ? Math.min(...ratings.map((r) => r.rank)) : 0, totalContests: ratings.length },
    practiceRange: [practiceBase, practiceBase + 200],
  };
}
