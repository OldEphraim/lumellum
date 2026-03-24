import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  Tool,
  ContentBlockParam,
  ToolResultBlockParam,
} from "@anthropic-ai/sdk/resources/messages.js";
import { executeTool } from "./tools/index.js";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const client = new Anthropic();

const MAX_ITERATIONS = 5;

export async function* streamAgent(
  messages: MessageParam[],
  tools: Tool[]
): AsyncGenerator<string, MessageParam[], unknown> {
  let iterations = 0;
  const workingMessages = [...messages];
  let fullText = "";

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      tools,
      messages: workingMessages,
    });

    let currentText = "";
    const toolUseBlocks: Array<{
      id: string;
      name: string;
      input: Record<string, unknown>;
    }> = [];
    let currentToolId = "";
    let currentToolName = "";
    let currentToolInput = "";
    let hasToolUse = false;

    for await (const event of stream) {
      if (
        event.type === "content_block_start" &&
        event.content_block.type === "tool_use"
      ) {
        hasToolUse = true;
        currentToolId = event.content_block.id;
        currentToolName = event.content_block.name;
        currentToolInput = "";
      } else if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        currentText += event.delta.text;
        fullText += event.delta.text;
        yield event.delta.text;
      } else if (
        event.type === "content_block_delta" &&
        event.delta.type === "input_json_delta"
      ) {
        currentToolInput += event.delta.partial_json;
      } else if (event.type === "content_block_stop" && currentToolId) {
        toolUseBlocks.push({
          id: currentToolId,
          name: currentToolName,
          input: currentToolInput
            ? (JSON.parse(currentToolInput) as Record<string, unknown>)
            : {},
        });
        currentToolId = "";
        currentToolName = "";
        currentToolInput = "";
      }
    }

    if (!hasToolUse) {
      const assistantMessage: MessageParam = {
        role: "assistant",
        content: currentText,
      };
      return [assistantMessage];
    }

    yield "\n\n⚔ consulting the archives...\n\n";

    const assistantContent: ContentBlockParam[] = [];
    if (currentText) {
      assistantContent.push({ type: "text", text: currentText });
    }
    for (const tool of toolUseBlocks) {
      assistantContent.push({
        type: "tool_use",
        id: tool.id,
        name: tool.name,
        input: tool.input,
      });
    }

    workingMessages.push({ role: "assistant", content: assistantContent });

    const toolResults: ToolResultBlockParam[] = [];
    for (const tool of toolUseBlocks) {
      const result = await executeTool(tool.name, tool.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: tool.id,
        content: result,
      });
    }

    workingMessages.push({ role: "user", content: toolResults });
  }

  const limitMsg = "\n\n⚠️ Reached tool call limit.";
  fullText += limitMsg;
  yield limitMsg;

  const assistantMessage: MessageParam = {
    role: "assistant",
    content: fullText,
  };
  return [assistantMessage];
}
