import type { InternProfile, InternPublic, InternCredential } from "@/data/interns";

const CACHE_TTL = 60_000; // 1 minute

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

function sheetCsvUrl(sheetId: string, sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

export async function fetchInternsFromSheet(): Promise<InternProfile[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return [];

  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  try {
    const [internsRes, credsRes] = await Promise.all([
      fetch(sheetCsvUrl(sheetId, "interns"), { next: { revalidate: 60 } }),
      fetch(sheetCsvUrl(sheetId, "credentials"), { next: { revalidate: 60 } }),
    ]);

    if (!internsRes.ok || !credsRes.ok) {
      console.error("Failed to fetch Google Sheet:", internsRes.status, credsRes.status);
      return [];
    }

    const internsCsv = await internsRes.text();
    const credsCsv = await credsRes.text();

    const internRows = csvToRows(internsCsv);
    const credRows = csvToRows(credsCsv);

    const credsByIntern = new Map<string, InternCredential[]>();
    for (const row of credRows) {
      const id = row.internId;
      if (!id) continue;
      if (!credsByIntern.has(id)) credsByIntern.set(id, []);
      credsByIntern.get(id)!.push({
        tool: row.tool || "",
        username: row.username || "",
        password: row.password || "",
      });
    }

    const interns: InternProfile[] = internRows
      .filter((row) => row.id)
      .map((row) => ({
        id: row.id,
        name: row.name || "",
        department: row.department || "",
        startDate: row.startDate || "",
        accessExpires: row.accessExpires || "",
        accessKey: row.accessKey || "",
        quizUrl: row.quizUrl || "",
        sopFile: row.sopFile || "",
        credentials: credsByIntern.get(row.id) || [],
      }));

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
