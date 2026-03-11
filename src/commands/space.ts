import { Command } from "commander";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { addSpace, loadSpaces, removeSpace } from "../lib/spaces.js";
import { saveApiKey, deleteApiKey } from "../lib/keychain.js";
import { formatOutput } from "../lib/formatter.js";
import type { OutputFormat } from "../types.js";

const SPACE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const HOST_PATTERN = /^[a-zA-Z0-9.-]+\.backlog\.(jp|com)$/;

function validateSpaceName(name: string): void {
  if (!SPACE_NAME_PATTERN.test(name)) {
    console.error("スペース名は英数字・ハイフン・アンダースコアのみ使用できます。");
    process.exit(1);
  }
}

function validateHost(host: string): void {
  if (!HOST_PATTERN.test(host)) {
    console.error("ホスト名は xxx.backlog.jp または xxx.backlog.com の形式で指定してください。");
    process.exit(1);
  }
}

export function createSpaceCommand(): Command {
  const space = new Command("space").description("スペース管理");

  space
    .command("add")
    .description("Backlogスペースを追加")
    .requiredOption("--name <name>", "スペース名（識別用）")
    .requiredOption("--host <host>", "ホスト名（例: example.backlog.com）")
    .action(async (opts) => {
      validateSpaceName(opts.name);
      validateHost(opts.host);
      const rl = readline.createInterface({ input: stdin, output: stdout });
      try {
        const apiKey = await rl.question("APIキーを入力してください: ");
        if (!apiKey.trim()) {
          console.error("APIキーが空です。");
          process.exit(1);
        }
        await saveApiKey(opts.name, apiKey.trim());
        await addSpace({ name: opts.name, host: opts.host });
        console.log(`スペース「${opts.name}」を追加しました。`);
      } finally {
        rl.close();
      }
    });

  space
    .command("list")
    .description("登録スペース一覧")
    .option("--format <format>", "出力形式 (json|table)", "json")
    .option("--compact", "JSON出力を1行にする（トークン節約）")
    .action(async (opts) => {
      const spaces = await loadSpaces();
      if (spaces.length === 0) {
        console.log("登録されたスペースはありません。");
        return;
      }
      const format = opts.format as OutputFormat;
      console.log(
        formatOutput(
          spaces.map((s) => ({ name: s.name, host: s.host })),
          format,
          [
            { key: "name", label: "スペース名" },
            { key: "host", label: "ホスト" },
          ],
          opts.compact
        )
      );
    });

  space
    .command("remove")
    .description("スペースを削除")
    .argument("<name>", "削除するスペース名")
    .action(async (name: string) => {
      const removed = await removeSpace(name);
      if (!removed) {
        console.error(`スペース「${name}」が見つかりません。`);
        process.exit(1);
      }
      try {
        await deleteApiKey(name);
      } catch {
        console.error(`警告: Keychainからの削除に失敗しました。手動で確認してください: security delete-generic-password -s backlog-station -a ${name}`);
      }
      console.log(`スペース「${name}」を削除しました。`);
    });

  return space;
}
