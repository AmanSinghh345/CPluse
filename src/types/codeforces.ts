export interface CFUser {
  handle: string;
  email?: string;
  vkId?: string;
  openId?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank?: string;
  rating?: number;
  maxRank?: string;
  maxRating?: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  titlePhoto: string;
  avatar: string;
}

export interface RatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export interface CFProblem {
  contestId?: number;
  problemsetName?: string;
  index: string;
  name: string;
  type: string;
  points?: number;
  rating?: number;
  tags: string[];
}

export interface CFSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: CFProblem;
  author: { participantType: string; members: { handle: string }[] };
  programmingLanguage: string;
  verdict?: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

export interface CFContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
}

export interface TagStat { tag: string; solved: number; wrongAttempts: number; accuracy: number; weakness: number }
export interface RatingBucket { range: string; count: number; min: number; max: number }
export interface ActivityDay { date: string; count: number }
export interface UpsolveProblem { key: string; contestId: number; index: string; name: string; rating?: number; tags: string[]; wrongAttempts: number; lastAttempted: number; url: string }

export interface UserAnalysis {
  profile: CFUser;
  ratings: RatingChange[];
  submissions: CFSubmission[];
  solvedCount: number;
  averageDifficulty: number;
  highestRated?: CFProblem;
  tagStats: TagStat[];
  ratingBuckets: RatingBucket[];
  activity: ActivityDay[];
  currentStreak: number;
  longestStreak: number;
  activeDays30: number;
  upsolves: UpsolveProblem[];
  recommendations: string[];
  ratingStats: { biggestGain: number; biggestLoss: number; bestRank: number; totalContests: number };
  practiceRange: [number, number];
}
