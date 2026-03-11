import { Command } from "commander";
import { getClientsForOption } from "../lib/backlog-client.js";
import { formatOutput, formatDate } from "../lib/formatter.js";
import type { OutputFormat } from "../types.js";

export function createCommentsCommand(): Command {
  return new Command("comments")
    .description("課題コメントを取得")
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
          const comments = await client.getComments(issueKey);
          const rows = comments.map((c) => ({
            id: c.id,
            content: c.content ?? "",
            createdUser: c.createdUser.name,
            created: formatDate(c.created),
          }));

          console.log(
            formatOutput(rows, format, [
              { key: "id", label: "ID" },
              { key: "createdUser", label: "投稿者" },
              { key: "content", label: "内容" },
              { key: "created", label: "日時" },
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
        console.error(`課題「${issueKey}」のコメントが見つかりません。`);
        process.exit(1);
      }
    });
}
