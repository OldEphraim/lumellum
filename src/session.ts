import type { MessageParam } from "@anthropic-ai/sdk/resources/messages.js";

const sessions = new Map<string, MessageParam[]>();

export function getSession(sessionId: string): MessageParam[] {
  let history = sessions.get(sessionId);
  if (!history) {
    history = [];
    sessions.set(sessionId, history);
  }
  return history;
}

export function resetSession(sessionId: string): void {
  sessions.delete(sessionId);
}
