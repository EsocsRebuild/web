import { streamText } from "ai";

import { getContent } from "@/data/content";
import { createAssistantLanguageModel } from "@/features/assistant/brain";
import { buildSearchIndex } from "@/features/search/index-builder";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    prompt?: string;
    messages?: Array<{
      role?: string;
      content?: string;
      text?: string;
      parts?: Array<{ type: string; text: string }>;
    }>;
  };

  let query = body.prompt || "";
  if (!query && Array.isArray(body.messages)) {
    const userMessages = body.messages.filter((m) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1];
    if (lastUserMessage) {
      if (typeof lastUserMessage.content === "string") {
        query = lastUserMessage.content;
      } else if (typeof lastUserMessage.text === "string") {
        query = lastUserMessage.text;
      } else if (Array.isArray(lastUserMessage.parts)) {
        query = lastUserMessage.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join(" ");
      }
    }
  }

  // Build grounded search entries from content
  const searchEntries = buildSearchIndex(getContent());

  const model = createAssistantLanguageModel(query, searchEntries);

  const result = streamText({
    model,
    prompt: query,
  });

  return result.toTextStreamResponse();
}
