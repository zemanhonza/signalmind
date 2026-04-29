type EmbeddingResponse = {
  data: Array<{
    index: number;
    embedding: number[];
  }>;
};

export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;

function embeddingApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

export function hasEmbeddingApiKey() {
  return Boolean(embeddingApiKey());
}

export function embeddingModel() {
  return process.env.EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
}

function embeddingDimensions() {
  const configured = Number(process.env.EMBEDDING_DIMENSIONS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_EMBEDDING_DIMENSIONS;
}

function embeddingRequestTimeoutMs() {
  const configured = Number(process.env.EMBEDDING_REQUEST_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : 45000;
}

export async function createEmbeddings(inputs: string[]) {
  const apiKey = embeddingApiKey();
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");

  const model = embeddingModel();
  const dimensions = embeddingDimensions();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), embeddingRequestTimeoutMs());
  const body: Record<string, unknown> = {
    input: inputs,
    model,
    encoding_format: "float",
  };

  if (model.startsWith("text-embedding-3")) {
    body.dimensions = dimensions;
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    signal: controller.signal,
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI embeddings ${response.status}: ${text.slice(0, 300)}`);
  }

  const json = (await response.json()) as EmbeddingResponse;
  const embeddings = json.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);

  if (model.startsWith("text-embedding-3")) {
    const invalid = embeddings.find((embedding) => embedding.length !== dimensions);
    if (invalid) {
      throw new Error(
        `Embedding dimension mismatch: expected ${dimensions}, got ${invalid.length}.`,
      );
    }
  }

  return embeddings;
}

export async function createEmbedding(input: string) {
  const [embedding] = await createEmbeddings([input]);
  if (!embedding) throw new Error("OpenAI did not return an embedding.");
  return embedding;
}
