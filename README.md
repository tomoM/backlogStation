# Backlog Station

複数のBacklogスペースの情報を横断的に管理できるCLIツール。
AIエージェント（Claude Code / OpenAI Codex / Gemini CLI）がBash経由で呼び出すことも可能なようにしています。

## 動作環境

- **macOS専用**（APIキー管理にmacOS Keychainを使用）
- Node.js 18以上

## セットアップ

```bash
npm install
npm run build
npm link
```

## スペースの追加

```bash
backlog space add --name myspace --host myspace.backlog.com
# APIキーの入力を求められます
```

## 使い方

```bash
# 自分の課題一覧
backlog issues --mine

# 特定スペースの課題
backlog issues --mine --space myspace

# テーブル形式で表示
backlog issues --mine --format table

# 課題詳細
backlog issue PROJ-123

# コメント取得
backlog comments PROJ-123

# プロジェクト一覧
backlog projects

# ユーザー情報
backlog me
```

## セキュリティ

- APIキーはmacOS Keychainに保存されます
- 設定ファイル（`~/.config/backlog-station/spaces.json`）にはホスト名のみ保存され、APIキーは含まれません
