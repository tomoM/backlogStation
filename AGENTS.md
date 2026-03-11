# Backlog Station

`backlog` CLIでBacklogの課題・プロジェクト情報を取得できる。ユーザーの質問に応じて使用すること。

## コマンド
- `backlog issues --mine [--space <name>] [--status open|inProgress|closed]` 自分の課題一覧
- `backlog issue <KEY>` 課題詳細
- `backlog comments <KEY>` コメント取得
- `backlog projects [--space <name>]` プロジェクト一覧
- `backlog me [--space <name>]` ユーザー情報
- `backlog space list` 登録スペース一覧

## エージェント向けルール
- 常に `--compact` を付けてトークンを節約すること
- JSON出力を受け取り、ユーザーには要約して伝える
- ユーザーに呼びかける際は `backlog me` で取得した name をフルネームで使うこと（苗字だけで呼ばない）
- `--space` 省略時は全スペース横断検索
- テーブル表示を求められた場合のみ `--format table` を使い、以下の手順で実行：
  1. `mkdir -p agents/tmp && backlog <cmd> --format table > agents/tmp/backlog-result.txt`
  2. Readツールで読み取り、コードブロックでテキスト応答に貼る
  3. `rm -rf agents/tmp` で削除
