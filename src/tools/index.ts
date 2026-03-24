import type { Tool } from "@anthropic-ai/sdk/resources/messages.js";
import { webSearch } from "./webSearch.js";
import { runCommand } from "./terminal.js";

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
  {
    name: "run_terminal_command",
    description:
      "Run a terminal command on the user's machine and return the output. Use for file operations, git commands, running scripts, checking system state, or anything that requires shell access.",
    input_schema: {
      type: "object" as const,
      properties: {
        command: { type: "string" as const, description: "The shell command to execute" },
        cwd: { type: "string" as const, description: "Working directory for the command" },
      },
      required: ["command"],
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
  if (name === "run_terminal_command") {
    return runCommand(
      input["command"] as string,
      input["cwd"] as string | undefined
    );
  }
  return `Unknown tool: ${name}`;
}
