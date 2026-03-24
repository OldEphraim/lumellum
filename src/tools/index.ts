import type { Tool } from "@anthropic-ai/sdk/resources/messages.js";
import { webSearch } from "./webSearch.js";

export const TOOLS: Tool[] = [
  {
    name: "web_search",
    description:
      "Search the web for current information. Use when the user asks about recent events, facts you're unsure of, or anything that might have changed since your training.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string" as const, description: "The search query" },
      },
      required: ["query"],
    },
  },
];

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  if (name === "web_search") {
    return webSearch(input["query"] as string);
  }
  return `Unknown tool: ${name}`;
}
