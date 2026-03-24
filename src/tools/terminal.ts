import { execSync } from "node:child_process";

const BLOCKED_PREFIXES = [
  "rm -rf /",
  "rm -rf ~",
  "sudo rm",
  "mkfs",
  "dd if=",
  ":(){:|:&};:",
];

export function runCommand(command: string, cwd?: string): string {
  for (const prefix of BLOCKED_PREFIXES) {
    if (command.startsWith(prefix)) {
      return "Blocked: that command is not permitted.";
    }
  }

  try {
    return execSync(command, {
      cwd,
      timeout: 15000,
      encoding: "utf8",
    });
  } catch (e: unknown) {
    const err = e as { stderr?: { toString(): string }; message?: string };
    return "Error: " + (err.stderr?.toString() ?? err.message ?? "Unknown error");
  }
}
