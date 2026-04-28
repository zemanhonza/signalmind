export function scoreLabel(score: number) {
  if (score >= 90) return "vysoky signal";
  if (score >= 80) return "silny signal";
  if (score >= 70) return "sledovat";
  return "nizsi priorita";
}

export function trustLabel(score: number) {
  if (score >= 95) return "primary";
  if (score >= 88) return "trusted";
  if (score >= 80) return "curated";
  return "review";
}
