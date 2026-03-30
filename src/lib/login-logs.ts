export interface LoginLogEntry {
    timestamp: string;
    internId: string;
    internName: string;
    ip: string;
    userAgent: string;
    status: string;
}

const CACHE_TTL = 30_000; // 30 seconds
let cache: { data: LoginLogEntry[]; ts: number } | null = null;

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

function csvToRows(csv: string): Record<string, string>[] {
    const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
            row[h] = (values[i] || "").trim();
        });
        return row;
    });
}

export async function fetchLoginLogs(): Promise<LoginLogEntry[]> {
    const csvUrl = process.env.LOGIN_LOG_CSV_URL;
    if (!csvUrl) return [];

    if (cache && Date.now() - cache.ts < CACHE_TTL) {
        return cache.data;
    }

    try {
        const url = new URL(csvUrl);
        url.searchParams.set("output", "csv");

        const res = await fetch(url.toString(), {
            next: { revalidate: 30 },
        });

        if (!res.ok) {
            console.error("Failed to fetch login logs:", res.status);
            return [];
        }

        const csv = await res.text();
        const rows = csvToRows(csv);

        const logs: LoginLogEntry[] = rows
            .filter((row) => row.timestamp || row["intern id"])
            .map((row) => ({
                timestamp: row.timestamp || "",
                internId: row["intern id"] || row.internid || "",
                internName: row.name || row["intern name"] || row.internname || "",
                ip: row["ip address"] || row.ip || "",
                userAgent: row["user agent"] || row.useragent || "",
                status: row.status || "",
            }))
            .reverse(); // newest first

        cache = { data: logs, ts: Date.now() };
        return logs;
    } catch (err) {
        console.error("Login logs fetch error:", err);
        return [];
    }
}
