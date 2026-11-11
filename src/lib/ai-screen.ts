import type { Job } from "./types";

export interface ScreeningResult {
  score: number;
  passed: boolean;
  summary: string;
}

export const PASS_MARK = 40;

const STOP = new Set([
  "and", "the", "for", "with", "you", "our", "will", "have",
  "from", "that", "this", "are", "your", "work", "team", "role",
]);

const keywords = (text: string) =>
  Array.from(new Set(text.toLowerCase().match(/[a-z][a-z+#]{2,}/g) ?? [])).filter(
    (w) => !STOP.has(w)
  );

export async function screenApplication(
  experience: string,
  job: Job
): Promise<ScreeningResult> {
  await new Promise((r) => setTimeout(r, 900)); // simulate the AI agent thinking

  const wanted = keywords(`${job.title} ${job.description}`);
  const have = new Set(keywords(experience));
  const matched = wanted.filter((w) => have.has(w));

  const score = wanted.length
    ? Math.min(100, Math.round((matched.length / wanted.length) * 300))
    : 0;

  return {
    score,
    passed: score >= PASS_MARK,
    summary: `Matched ${matched.length} of ${wanted.length} key terms${
      matched.length ? `: ${matched.slice(0, 5).join(", ")}` : ""
    }.`,
  };
}