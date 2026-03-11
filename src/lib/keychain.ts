import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SERVICE_NAME = "backlog-station";

export async function saveApiKey(
  spaceName: string,
  apiKey: string
): Promise<void> {
  // Delete existing entry first (ignore errors if it doesn't exist)
  try {
    await execFileAsync("security", [
      "delete-generic-password",
      "-s",
      SERVICE_NAME,
      "-a",
      spaceName,
    ]);
  } catch {
    // Ignore - entry may not exist
  }

  await execFileAsync("security", [
    "add-generic-password",
    "-s",
    SERVICE_NAME,
    "-a",
    spaceName,
    "-w",
    apiKey,
  ]);
}

export async function getApiKey(spaceName: string): Promise<string> {
  const { stdout } = await execFileAsync("security", [
    "find-generic-password",
    "-s",
    SERVICE_NAME,
    "-a",
    spaceName,
    "-w",
  ]);
  return stdout.trim();
}

export async function deleteApiKey(spaceName: string): Promise<void> {
  await execFileAsync("security", [
    "delete-generic-password",
    "-s",
    SERVICE_NAME,
    "-a",
    spaceName,
  ]);
}
