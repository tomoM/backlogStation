import Table from "cli-table3";
import type { OutputFormat } from "../types.js";

interface ColumnDef {
  key: string;
  label: string;
}

export function formatOutput(
  data: Record<string, unknown>[],
  format: OutputFormat,
  columns: ColumnDef[],
  compact = false
): string {
  if (format === "json") {
    return compact ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  }

  const table = new Table({
    head: columns.map((c) => c.label),
    style: { head: [], border: [] },
  });

  for (const row of data) {
    table.push(columns.map((c) => String(row[c.key] ?? "")));
  }

  return table.toString();
}

export function formatSingle(
  data: Record<string, unknown>,
  format: OutputFormat,
  columns: ColumnDef[],
  compact = false
): string {
  if (format === "json") {
    return compact ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  }

  const table = new Table({
    style: { head: [], border: [] },
  });

  for (const col of columns) {
    table.push({ [col.label]: String(data[col.key] ?? "") });
  }

  return table.toString();
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
