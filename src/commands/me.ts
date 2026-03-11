import { Command } from "commander";
import { getClientsForOption } from "../lib/backlog-client.js";
import { formatOutput, formatSingle } from "../lib/formatter.js";
import type { OutputFormat } from "../types.js";

export function createMeCommand(): Command {
  return new Command("me")
    .description("自分のユーザー情報を取得")
    .option("--space <name>", "スペース名を指定")
    .option("--format <format>", "出力形式 (json|table)", "json")
    .option("--compact", "JSON出力を1行にする（トークン節約）")
    .action(async (opts) => {
      const format = opts.format as OutputFormat;
      const clients = await getClientsForOption(opts.space);

      if (clients.length === 1) {
        const { client } = clients[0];
        const user = await client.getMyself();
        console.log(
          formatSingle(
            {
              id: user.id,
              userId: user.userId,
              name: user.name,
              mailAddress: user.mailAddress,
              roleType: user.roleType,
            },
            format,
            [
              { key: "id", label: "ID" },
              { key: "userId", label: "ユーザーID" },
              { key: "name", label: "名前" },
              { key: "mailAddress", label: "メール" },
              { key: "roleType", label: "権限" },
            ],
            opts.compact
          )
        );
      } else {
        const users: Record<string, unknown>[] = [];
        for (const { space, client } of clients) {
          const user = await client.getMyself();
          users.push({
            space: space.name,
            userId: user.userId,
            name: user.name,
            mailAddress: user.mailAddress,
          });
        }
        console.log(
          formatOutput(users, format, [
            { key: "space", label: "スペース" },
            { key: "userId", label: "ユーザーID" },
            { key: "name", label: "名前" },
            { key: "mailAddress", label: "メール" },
          ], opts.compact)
        );
      }
    });
}
