import type { InternProfile, InternPublic } from "@/data/interns";
import { getDepartmentConfig } from "@/data/department-config";

const CACHE_TTL = 60_000;

let cache: { data: InternProfile[]; ts: number } | null = null;

function csvToRows(csv: string): Record<string, string>[] {
  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (values[i] || "").trim();
    });
    return row;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Normalize accessExpires to ISO 8601 format.
 * Accepts either full ISO ("2026-04-06T23:59:59+07:00")
 * or a human-readable date ("6 April 2026", "30 March 2026").
 * Human-readable dates are set to end-of-day 23:59:59 WIB (+07:00).
 */
function normalizeExpires(raw: string): string {
  if (!raw) return "";
  if (raw.includes("T")) return raw;

  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}T23:59:59+07:00`;
  }

  return raw;
}

/**
 * Build the CSV URL from the env var.
 * Accepts either:
 *   - A full published URL (starts with http)
 *   - A plain Sheet ID (legacy, uses /gviz/tq endpoint)
 */
function getSheetCsvUrl(): string | null {
  const val = process.env.GOOGLE_SHEET_CSV_URL || process.env.GOOGLE_SHEET_ID;
  if (!val) return null;

  if (val.startsWith("http")) {
    const url = new URL(val);
    url.searchParams.set("output", "csv");
    return url.toString();
  }

  return `https://docs.google.com/spreadsheets/d/${val}/gviz/tq?tqx=out:csv&sheet=interns`;
}

export async function fetchInternsFromSheet(): Promise<InternProfile[]> {
  const csvUrl = getSheetCsvUrl();
  if (!csvUrl) return [];

  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  try {
    const internsRes = await fetch(csvUrl, {
      next: { revalidate: 60 },
    });

    if (!internsRes.ok) {
      console.error("Failed to fetch Google Sheet:", internsRes.status);
      return [];
    }

    const internsCsv = await internsRes.text();
    const internRows = csvToRows(internsCsv);

    const interns: InternProfile[] = internRows
      .filter((row) => row.id)
      .map((row) => {
        const dept = row.department || "";
        const deptConfig = getDepartmentConfig(dept);
        return {
          id: row.id,
          name: row.name || "",
          department: dept,
          startDate: row.startDate || "",
          accessExpires: normalizeExpires(row.accessExpires || ""),
          accessKey: row.accessKey || "",
          quizUrl: deptConfig.quizUrl,
          sopFile: deptConfig.sopFile,
          credentials: [],
        };
      });

    cache = { data: interns, ts: Date.now() };
    return interns;
  } catch (err) {
    console.error("Google Sheet fetch error:", err);
    return [];
  }
}

export async function getInternFromSheet(id: string): Promise<InternProfile | undefined> {
  const all = await fetchInternsFromSheet();
  return all.find((i) => i.id === id);
}

export async function getPublicInternsFromSheet(): Promise<InternPublic[]> {
  const all = await fetchInternsFromSheet();
  return all.map(({ id, name, department, startDate, accessExpires, quizUrl, sopFile }) => ({
    id, name, department, startDate, accessExpires, quizUrl, sopFile,
  }));
}

export async function getPublicInternFromSheet(id: string): Promise<InternPublic | undefined> {
  const all = await fetchInternsFromSheet();
  const intern = all.find((i) => i.id === id);
  if (!intern) return undefined;
  return {
    id: intern.id,
    name: intern.name,
    department: intern.department,
    startDate: intern.startDate,
    accessExpires: intern.accessExpires,
    quizUrl: intern.quizUrl,
    sopFile: intern.sopFile,
  };
}
