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
 * Used for the assignment lines — short, single-shot completions.
 *
 * Note on max_tokens: on Opus-class models thinking is ON by default and its
 * tokens come out of the same max_tokens budget as the reply. A budget sized
 * for the visible answer alone gets spent entirely on thinking and the
 * response comes back with no text block at all. Keep the ceiling generous and
 * control cost with `effort` instead — the output here is only a line or two.
 */
export async function generateText(opts: {
  model: string;
  prompt: string;
  maxTokens?: number;
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
}): Promise<string> {
  const message = await getClient().messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 4096,
    output_config: { effort: opts.effort ?? "medium" },
    messages: [{ role: "user", content: opts.prompt }],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) {
    throw new Error(
      `Model returned no text (stop_reason: ${message.stop_reason}, ` +
        `output tokens: ${message.usage.output_tokens}). If stop_reason is ` +
        `"max_tokens", thinking consumed the whole budget — raise maxTokens ` +
        `or lower effort.`,
    );
  }
  return text;
}
