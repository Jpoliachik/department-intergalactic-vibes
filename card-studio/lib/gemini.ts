import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to card-studio/.env.local (see .env.example).",
    );
  }
  if (!ai) ai = new GoogleGenAI({ apiKey });
  return ai;
}

/**
 * Generate a card image with Gemini ("Nano Banana", gemini-2.5-flash-image).
 * Returns the raw PNG/JPEG bytes.
 */
export async function generateImage(opts: {
  model: string;
  prompt: string;
}): Promise<Buffer> {
  const response = await getClient().models.generateContent({
    model: opts.model,
    contents: opts.prompt,
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const data = part.inlineData?.data;
    if (data) return Buffer.from(data, "base64");
  }

  // No image came back — surface any text the model returned (often a refusal
  // or safety note) so it's debuggable instead of a silent failure.
  const text = parts
    .map((p) => p.text)
    .filter(Boolean)
    .join(" ")
    .trim();
  throw new Error(
    text ? `No image returned. Model said: ${text}` : "No image returned by the model.",
  );
}
