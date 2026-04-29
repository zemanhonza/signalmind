export type Topic =
  | "AI obecne"
  | "Medicina"
  | "Vzdelavani"
  | "Vyzkum"
  | "Nastroje"
  | "Regulace"
  | "Bezpecnost";

export type SourceTier = "primary" | "research" | "expert" | "sector" | "tools";

export type SourceStatus = "active" | "review" | "paused";

export type NewsStatus = "new" | "summarized" | "archived" | "hidden";

export type Source = {
  id: string;
  name: string;
  url: string;
  tier: SourceTier;
  topic: Topic;
  cadence: string;
  trustScore: number;
  status: SourceStatus;
};

export type NewsItem = {
  id: string;
  title: string;
  url?: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  topic: Topic;
  score: number;
  summary: string;
  whyItMatters: string;
  tags: string[];
  readTime: string;
  status?: NewsStatus;
};

export type ToolItem = {
  id: string;
  name: string;
  url: string;
  category: string;
  pricing: "Free" | "Freemium" | "Paid" | "Research" | "Unknown";
  summary: string;
  useCase: string;
  signal: number;
};

export type Digest = {
  id: string;
  date: string;
  title: string;
  focus: string;
  items: string[];
};
