import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to card-studio/.env.local (see .env.example).",
    );
  }
  if (!client) client = new Anthropic();
  return client;
}

/**
 * Run a text-generation prompt and return the trimmed plain-text result.
 * Used for taglines and assignment lines — short, single-shot completions.
 */
export async function generateText(opts: {
  model: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const message = await getClient().messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 1024,
    messages: [{ role: "user", content: opts.prompt }],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) {
    throw new Error("Model returned no text.");
  }
  return text;
}
