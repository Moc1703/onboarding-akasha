import type { Metadata } from "next";
import { fetchInternsFromSheet } from "@/lib/google-sheet";
import { interns as hardcodedInterns, toPublic } from "@/data/interns";
import type { InternPublic } from "@/data/interns";
import { fetchLoginLogs } from "@/lib/login-logs";
import type { LoginLogEntry } from "@/lib/login-logs";
import AdminDashboard from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Admin Dashboard | Akasha Yoga Academy",
    description: "Monitor intern onboarding activity and login history.",
};

export default async function AdminPage() {
    // Fetch intern data
    let interns: InternPublic[];
    const useSheet = !!(process.env.GOOGLE_SHEET_CSV_URL || process.env.GOOGLE_SHEET_ID);

    if (useSheet) {
        const sheetInterns = await fetchInternsFromSheet();
        if (sheetInterns.length > 0) {
            interns = sheetInterns.map(toPublic);
        } else {
            interns = hardcodedInterns.map(toPublic);
        }
    } else {
        interns = hardcodedInterns.map(toPublic);
    }

    // Fetch login logs
    const loginLogs: LoginLogEntry[] = await fetchLoginLogs();

    return <AdminDashboard interns={interns} loginLogs={loginLogs} />;
}
