import { Command } from "commander";
import { getClientsForOption } from "../lib/backlog-client.js";
import { formatOutput, formatSingle, formatDate } from "../lib/formatter.js";
import type { OutputFormat, BacklogIssue } from "../types.js";

function issueToRow(issue: BacklogIssue, spaceName?: string) {
  const row: Record<string, unknown> = {
    issueKey: issue.issueKey,
    summary: issue.summary,
    status: issue.status.name,
    priority: issue.priority.name,
    assignee: issue.assignee?.name ?? "",
    dueDate: formatDate(issue.dueDate),
    updated: formatDate(issue.updated),
  };
  if (spaceName) row.space = spaceName;
  return row;
}

function issueToDetail(issue: BacklogIssue) {
  return {
    issueKey: issue.issueKey,
    summary: issue.summary,
    description: issue.description,
    status: issue.status.name,
    priority: issue.priority.name,
    issueType: issue.issueType.name,
    assignee: issue.assignee?.name ?? "",
    category: issue.category.map((c) => c.name).join(", "),
    milestone: issue.milestone.map((m) => m.name).join(", "),
    startDate: formatDate(issue.startDate),
    dueDate: formatDate(issue.dueDate),
    estimatedHours: issue.estimatedHours ?? "",
    actualHours: issue.actualHours ?? "",
    createdUser: issue.createdUser.name,
    created: formatDate(issue.created),
    updated: formatDate(issue.updated),
  };
}

export function createIssuesCommand(): Command {
  const issues = new Command("issues")
    .description("課題一覧を取得")
    .option("--mine", "自分の課題のみ")
    .option("--space <name>", "スペース名を指定")
    .option("--status <status>", "ステータスでフィルタ (open|closed|inProgress)")
    .option("--format <format>", "出力形式 (json|table)", "json")
    .option("--compact", "JSON出力を1行にする（トークン節約）")
    .action(async (opts) => {
      const format = opts.format as OutputFormat;
      const clients = await getClientsForOption(opts.space);
      const allIssues: Record<string, unknown>[] = [];

      for (const { space, client } of clients) {
        const params: Record<string, string | string[]> = {};

        if (opts.mine) {
          const myself = await client.getMyself();
          params["assigneeId[]"] = [String(myself.id)];
        }

        if (opts.status) {
          const statusMap: Record<string, string[]> = {
            open: ["1"],        // 未対応
            inProgress: ["2"],  // 処理中
            closed: ["4"],      // 完了
          };
          const ids = statusMap[opts.status];
          if (ids) {
            params["statusId[]"] = ids;
          }
        }

        const issues = await client.getIssues(params);
        for (const issue of issues) {
          allIssues.push(issueToRow(issue, clients.length > 1 ? space.name : undefined));
        }
      }

      const columns = [
        ...(clients.length > 1 ? [{ key: "space", label: "スペース" }] : []),
        { key: "issueKey", label: "キー" },
        { key: "summary", label: "件名" },
        { key: "status", label: "状態" },
        { key: "priority", label: "優先度" },
        { key: "assignee", label: "担当者" },
        { key: "dueDate", label: "期限" },
      ];

      console.log(formatOutput(allIssues, format, columns, opts.compact));
    });

  return issues;
}

export function createIssueCommand(): Command {
  const issue = new Command("issue")
    .description("課題詳細を取得")
    .argument("<issueKey>", "課題キー（例: PROJ-123）")
    .option("--space <name>", "スペース名を指定")
    .option("--format <format>", "出力形式 (json|table)", "json")
    .option("--compact", "JSON出力を1行にする（トークン節約）")
    .action(async (issueKey: string, opts) => {
      const format = opts.format as OutputFormat;
      const clients = await getClientsForOption(opts.space);

      let found = false;
      for (const { client } of clients) {
        try {
          const issueData = await client.getIssue(issueKey);
          const detail = issueToDetail(issueData);
          console.log(
            formatSingle(detail, format, [
              { key: "issueKey", label: "キー" },
              { key: "summary", label: "件名" },
              { key: "description", label: "説明" },
              { key: "status", label: "状態" },
              { key: "priority", label: "優先度" },
              { key: "issueType", label: "種別" },
              { key: "assignee", label: "担当者" },
              { key: "category", label: "カテゴリ" },
              { key: "milestone", label: "マイルストーン" },
              { key: "startDate", label: "開始日" },
              { key: "dueDate", label: "期限" },
              { key: "estimatedHours", label: "予定時間" },
              { key: "actualHours", label: "実績時間" },
              { key: "createdUser", label: "登録者" },
              { key: "created", label: "登録日" },
              { key: "updated", label: "更新日" },
            ], opts.compact)
          );
          found = true;
          break;
        } catch (err) {
          if (err instanceof Error && err.message.startsWith("無効な課題キー")) {
            console.error(err.message);
            process.exit(1);
          }
          // Try next space
        }
      }

      if (!found) {
        console.error(`課題「${issueKey}」が見つかりません。`);
        process.exit(1);
      }
    });

  return issue;
}
