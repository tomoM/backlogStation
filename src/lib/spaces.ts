import { readFile, writeFile, mkdir, chmod } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type { SpaceConfig, SpacesFile } from "../types.js";

const CONFIG_DIR = join(homedir(), ".config", "backlog-station");
const SPACES_FILE = join(CONFIG_DIR, "spaces.json");

async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
}

export async function loadSpaces(): Promise<SpaceConfig[]> {
  try {
    const data = await readFile(SPACES_FILE, "utf-8");
    const parsed: SpacesFile = JSON.parse(data);
    return parsed.spaces;
  } catch {
    return [];
  }
}

export async function saveSpaces(spaces: SpaceConfig[]): Promise<void> {
  await ensureConfigDir();
  const data: SpacesFile = { spaces };
  await writeFile(SPACES_FILE, JSON.stringify(data, null, 2), { encoding: "utf-8", mode: 0o600 });
}

export async function addSpace(config: SpaceConfig): Promise<void> {
  const spaces = await loadSpaces();
  const existing = spaces.findIndex((s) => s.name === config.name);
  if (existing >= 0) {
    spaces[existing] = config;
  } else {
    spaces.push(config);
  }
  await saveSpaces(spaces);
}

export async function removeSpace(name: string): Promise<boolean> {
  const spaces = await loadSpaces();
  const filtered = spaces.filter((s) => s.name !== name);
  if (filtered.length === spaces.length) return false;
  await saveSpaces(filtered);
  return true;
}

export async function getSpace(name: string): Promise<SpaceConfig | undefined> {
  const spaces = await loadSpaces();
  return spaces.find((s) => s.name === name);
}
