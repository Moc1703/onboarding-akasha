import { getInternById, toPublic, interns as hardcodedInterns } from "@/data/interns";
import type { InternProfile, InternPublic } from "@/data/interns";
import { fetchInternsFromSheet, getInternFromSheet } from "./google-sheet";

const useSheet = () => !!process.env.GOOGLE_SHEET_ID;

/** Get full intern profile (server-only, includes secrets) */
export async function getIntern(id: string): Promise<InternProfile | undefined> {
  if (useSheet()) {
    const fromSheet = await getInternFromSheet(id);
    if (fromSheet) return fromSheet;
  }
  return getInternById(id);
}

/** Get public intern data (safe for browser) */
export async function getPublicIntern(id: string): Promise<InternPublic | undefined> {
  const intern = await getIntern(id);
  if (!intern) return undefined;
  return toPublic(intern);
}

/** Get all intern IDs for static generation */
export async function getAllInternIds(): Promise<string[]> {
  if (useSheet()) {
    const sheetInterns = await fetchInternsFromSheet();
    if (sheetInterns.length > 0) {
      return sheetInterns.map((i) => i.id);
    }
  }
  return hardcodedInterns.map((i) => i.id);
}
