import { getApiKey } from "./keychain.js";
import { loadSpaces, getSpace } from "./spaces.js";
import type {
  SpaceConfig,
  BacklogProject,
  BacklogIssue,
  BacklogComment,
  BacklogUser,
} from "../types.js";

const ISSUE_KEY_PATTERN = /^[A-Z0-9_]+-\d+$/;

function validateIssueKey(issueKey: string): void {
  if (!ISSUE_KEY_PATTERN.test(issueKey)) {
    throw new Error(`無効な課題キーです: ${issueKey}（例: PROJ-123）`);
  }
}

export class BacklogClient {
  private host: string;
  private apiKey: string;

  constructor(host: string, apiKey: string) {
    this.host = host;
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, params?: Record<string, string | string[]>): Promise<T> {
    const url = new URL(`https://${this.host}/api/v2${path}`);
    url.searchParams.set("apiKey", this.apiKey);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(key, v);
          }
        } else {
          url.searchParams.set(key, value);
        }
      }
    }
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Backlog API error (${res.status})`);
    }
    return res.json() as Promise<T>;
  }

  async getMyself(): Promise<BacklogUser> {
    return this.request<BacklogUser>("/users/myself");
  }

  async getProjects(): Promise<BacklogProject[]> {
    return this.request<BacklogProject[]>("/projects");
  }

  async getIssues(params?: Record<string, string | string[]>): Promise<BacklogIssue[]> {
    return this.request<BacklogIssue[]>("/issues", {
      count: "100",
      ...params,
    });
  }

  async getIssue(issueKey: string): Promise<BacklogIssue> {
    validateIssueKey(issueKey);
    return this.request<BacklogIssue>(`/issues/${issueKey}`);
  }

  async getComments(issueKey: string): Promise<BacklogComment[]> {
    validateIssueKey(issueKey);
    return this.request<BacklogComment[]>(`/issues/${issueKey}/comments`);
  }
}

export async function createClient(spaceName: string): Promise<BacklogClient> {
  const space = await getSpace(spaceName);
  if (!space) {
    throw new Error(`スペース「${spaceName}」が見つかりません。backlog space list で確認してください。`);
  }
  const apiKey = await getApiKey(spaceName);
  return new BacklogClient(space.host, apiKey);
}

export async function createAllClients(): Promise<
  { space: SpaceConfig; client: BacklogClient }[]
> {
  const spaces = await loadSpaces();
  if (spaces.length === 0) {
    throw new Error(
      "スペースが登録されていません。backlog space add で追加してください。"
    );
  }
  const results: { space: SpaceConfig; client: BacklogClient }[] = [];
  for (const space of spaces) {
    const apiKey = await getApiKey(space.name);
    results.push({ space, client: new BacklogClient(space.host, apiKey) });
  }
  return results;
}

export async function getClientsForOption(
  spaceName?: string
): Promise<{ space: SpaceConfig; client: BacklogClient }[]> {
  if (spaceName) {
    const space = await getSpace(spaceName);
    if (!space) {
      throw new Error(`スペース「${spaceName}」が見つかりません。`);
    }
    const apiKey = await getApiKey(spaceName);
    return [{ space, client: new BacklogClient(space.host, apiKey) }];
  }
  return createAllClients();
}
