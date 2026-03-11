# Backlog Station

複数のBacklogスペースの情報を横断的に管理できるCLIツール。  
AIエージェント（Claude Code / OpenAI Codex / Gemini CLI）がBash経由で呼び出すことも可能なようにしています。

## 動作環境

- **macOS専用**（APIキー管理にmacOS Keychainを使用）
- windowsOS版も予定
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
myspace の部分は任意のスペース名、myspace.backlog.com の部分は利用しているbacklogのURLからhttps:// を除いた情報を入力してください。

APIキーの発行はBacklog公式ページのAPIの設定を読み、発行してください。  
https://support-ja.backlog.com/hc/ja/articles/360035641754-API%E3%81%AE%E8%A8%AD%E5%AE%9A

## 使い方（コマンド一覧）

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
