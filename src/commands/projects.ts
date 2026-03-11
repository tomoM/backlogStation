import { Command } from "commander";
import { getClientsForOption } from "../lib/backlog-client.js";
import { formatOutput } from "../lib/formatter.js";
import type { OutputFormat } from "../types.js";

export function createProjectsCommand(): Command {
  return new Command("projects")
    .description("プロジェクト一覧を取得")
    .option("--space <name>", "スペース名を指定")
    .option("--format <format>", "出力形式 (json|table)", "json")
    .option("--compact", "JSON出力を1行にする（トークン節約）")
    .action(async (opts) => {
      const format = opts.format as OutputFormat;
      const clients = await getClientsForOption(opts.space);
      const allProjects: Record<string, unknown>[] = [];

      for (const { space, client } of clients) {
        const projects = await client.getProjects();
        for (const project of projects) {
          const row: Record<string, unknown> = {
            projectKey: project.projectKey,
            name: project.name,
            archived: project.archived ? "はい" : "",
          };
          if (clients.length > 1) row.space = space.name;
          allProjects.push(row);
        }
      }

      const columns = [
        ...(clients.length > 1 ? [{ key: "space", label: "スペース" }] : []),
        { key: "projectKey", label: "キー" },
        { key: "name", label: "プロジェクト名" },
        { key: "archived", label: "アーカイブ" },
      ];

      console.log(formatOutput(allProjects, format, columns, opts.compact));
    });
}
