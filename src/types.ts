export interface SpaceConfig {
  name: string;
  host: string;
}

export interface SpacesFile {
  spaces: SpaceConfig[];
}

export interface BacklogProject {
  id: number;
  projectKey: string;
  name: string;
  chartEnabled: boolean;
  subtaskingEnabled: boolean;
  projectLeaderCanEditProjectLeader: boolean;
  textFormattingRule: string;
  archived: boolean;
}

export interface BacklogStatus {
  id: number;
  projectId?: number;
  name: string;
  color?: string;
  displayOrder?: number;
}

export interface BacklogPriority {
  id: number;
  name: string;
}

export interface BacklogUser {
  id: number;
  userId: string;
  name: string;
  roleType: number;
  lang: string | null;
  mailAddress: string;
  nulabAccount?: {
    nulabId: string;
    name: string;
    uniqueId: string;
  };
  keyword?: string;
  lastLoginTime?: string;
}

export interface BacklogIssue {
  id: number;
  projectId: number;
  issueKey: string;
  keyId: number;
  issueType: {
    id: number;
    projectId: number;
    name: string;
    color: string;
    displayOrder: number;
  };
  summary: string;
  description: string;
  resolution: { id: number; name: string } | null;
  priority: BacklogPriority;
  status: BacklogStatus;
  assignee: BacklogUser | null;
  category: { id: number; name: string }[];
  versions: { id: number; name: string }[];
  milestone: { id: number; name: string }[];
  startDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  parentIssueId: number | null;
  createdUser: BacklogUser;
  created: string;
  updatedUser: BacklogUser;
  updated: string;
}

export interface BacklogComment {
  id: number;
  content: string;
  changeLog: {
    field: string;
    newValue: string;
    originalValue: string;
  }[] | null;
  createdUser: BacklogUser;
  created: string;
  updated: string;
}

export type OutputFormat = "json" | "table";
