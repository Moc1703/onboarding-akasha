"use client";

import { useState, useCallback, useEffect, useMemo, type FormEvent } from "react";
import {
    ShieldCheck,
    KeyRound,
    AlertCircle,
    Loader2,
    Users,
    Clock,
    ShieldX,
    Activity,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Globe,
    Monitor,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    LogIn,
} from "lucide-react";
import type { InternPublic } from "@/data/interns";
import type { LoginLogEntry } from "@/lib/login-logs";

/* ───────── Types ───────── */

interface AdminDashboardProps {
    interns: InternPublic[];
    loginLogs: LoginLogEntry[];
}

/* ───────── Helpers ───────── */

function timeLeft(expiresAt: string): { label: string; expired: boolean; urgent: boolean } {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { label: "Expired", expired: true, urgent: false };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return { label: `${days}d ${hours}h`, expired: false, urgent: days < 1 };
    if (hours > 0) return { label: `${hours}h ${minutes}m`, expired: false, urgent: true };
    return { label: `${minutes}m`, expired: false, urgent: true };
}

function formatTimestamp(ts: string): string {
    if (!ts) return "—";
    try {
        const d = new Date(ts);
        return d.toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    } catch {
        return ts;
    }
}

function truncateUA(ua: string, max = 50): string {
    if (!ua || ua === "unknown") return "—";
    return ua.length > max ? ua.slice(0, max) + "…" : ua;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    success: { label: "Success", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    failed_key: { label: "Failed Key", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
    expired: { label: "Expired", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle },
    not_found: { label: "Not Found", color: "text-white/40 bg-white/5 border-white/10", icon: ShieldX },
};

/* ───────── Admin Gate ───────── */

function AdminGate({ onUnlocked }: { onUnlocked: () => void }) {
    const [secret, setSecret] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            if (loading) return;
            setLoading(true);
            setError("");

            try {
                const res = await fetch("/api/admin/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ secret: secret.trim() }),
                });

                if (res.ok) {
                    sessionStorage.setItem("admin_unlocked", "true");
                    onUnlocked();
                } else if (res.status === 503) {
                    setError("ADMIN_SECRET not configured on the server.");
                } else {
                    setError("Invalid admin secret.");
                    setSecret("");
                }
            } catch {
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [secret, loading, onUnlocked]
    );

    return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
            <div className="max-w-sm w-full">
                <div className="text-center mb-10">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-gold" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-white/40 text-sm leading-relaxed">
                        Enter the admin secret to access the monitoring dashboard.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="adminSecret" className="block text-xs text-white/40 uppercase tracking-widest font-medium mb-2">
                            Admin Secret
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                id="adminSecret"
                                type="password"
                                value={secret}
                                onChange={(e) => { setSecret(e.target.value); setError(""); }}
                                disabled={loading}
                                placeholder="Enter admin secret"
                                autoComplete="off"
                                className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-charcoal-light text-white placeholder:text-white/20 text-sm font-mono transition-colors outline-none ${error ? "border-red-500/50 focus:border-red-500" : "border-white/[0.08] focus:border-gold/50"
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {error}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!secret.trim() || loading}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold text-charcoal font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Access Dashboard"
                        )}
                    </button>
                </form>

                <p className="mt-10 text-center text-xs text-white/30">
                    &copy; {new Date().getFullYear()} Akasha Yoga Academy
                </p>
            </div>
        </div>
    );
}

/* ───────── Stat Card ───────── */

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number | string; color: string }) {
    return (
        <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs text-white/40 uppercase tracking-widest font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

/* ───────── Main Dashboard ───────── */

export default function AdminDashboard({ interns, loginLogs }: AdminDashboardProps) {
    const [unlocked, setUnlocked] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deptFilter, setDeptFilter] = useState("all");
    const [logStatusFilter, setLogStatusFilter] = useState("all");
    const [showAllLogs, setShowAllLogs] = useState(false);
    const [activeTab, setActiveTab] = useState<"interns" | "logs">("interns");

    // Hydrate from sessionStorage
    useEffect(() => {
        const stored = sessionStorage.getItem("admin_unlocked");
        if (stored === "true") setUnlocked(true);
        setHydrated(true);
    }, []);

    const handleUnlocked = useCallback(() => setUnlocked(true), []);

    // Computed data
    const departments = useMemo(() => {
        const depts = new Set(interns.map((i) => i.department));
        return Array.from(depts).sort();
    }, [interns]);

    const filteredInterns = useMemo(() => {
        return interns.filter((intern) => {
            const matchesSearch = !searchQuery ||
                intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                intern.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = deptFilter === "all" || intern.department === deptFilter;
            return matchesSearch && matchesDept;
        });
    }, [interns, searchQuery, deptFilter]);

    const filteredLogs = useMemo(() => {
        const logs = logStatusFilter === "all"
            ? loginLogs
            : loginLogs.filter((l) => l.status === logStatusFilter);
        return showAllLogs ? logs : logs.slice(0, 50);
    }, [loginLogs, logStatusFilter, showAllLogs]);

    const stats = useMemo(() => {
        const now = Date.now();
        const activeCount = interns.filter((i) => new Date(i.accessExpires).getTime() > now).length;
        const expiredCount = interns.length - activeCount;
        const today = new Date().toDateString();
        const loginsToday = loginLogs.filter((l) => {
            try { return new Date(l.timestamp).toDateString() === today; } catch { return false; }
        }).length;
        return { total: interns.length, active: activeCount, expired: expiredCount, loginsToday };
    }, [interns, loginLogs]);

    if (!hydrated) {
        return (
            <div className="min-h-screen bg-charcoal flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        );
    }

    if (!unlocked) return <AdminGate onUnlocked={handleUnlocked} />;

    return (
        <div className="min-h-screen bg-charcoal">
            <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

            {/* Header */}
            <header className="border-b border-white/[0.06] bg-charcoal/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gold" />
                            Admin Dashboard
                        </h1>
                        <p className="text-xs text-white/40 mt-1">Akasha Yoga Academy — Intern Monitoring</p>
                    </div>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem("admin_unlocked");
                            setUnlocked(false);
                        }}
                        className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                    >
                        Log out
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Users} label="Total Interns" value={stats.total} color="bg-gold/10 text-gold" />
                    <StatCard icon={CheckCircle2} label="Active" value={stats.active} color="bg-emerald-500/10 text-emerald-400" />
                    <StatCard icon={ShieldX} label="Expired" value={stats.expired} color="bg-red-500/10 text-red-400" />
                    <StatCard icon={LogIn} label="Logins Today" value={stats.loginsToday} color="bg-blue-500/10 text-blue-400" />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-charcoal-light rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab("interns")}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "interns" ? "bg-gold/15 text-gold border border-gold/25" : "text-white/40 hover:text-white/60"
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Interns ({interns.length})
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("logs")}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "logs" ? "bg-gold/15 text-gold border border-gold/25" : "text-white/40 hover:text-white/60"
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Login Logs ({loginLogs.length})
                        </span>
                    </button>
                </div>

                {/* ═══ INTERNS TAB ═══ */}
                {activeTab === "interns" && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-charcoal-light text-white placeholder:text-white/20 text-sm outline-none focus:border-gold/50 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <select
                                    value={deptFilter}
                                    onChange={(e) => setDeptFilter(e.target.value)}
                                    className="pl-11 pr-8 py-2.5 rounded-xl border border-white/[0.08] bg-charcoal-light text-white text-sm outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="all">All Departments</option>
                                    {departments.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                            </div>
                        </div>

                        {/* Intern Table */}
                        <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
                            {/* Desktop Header */}
                            <div className="hidden lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] bg-charcoal-lighter/50">
                                <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Intern</div>
                                <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Department</div>
                                <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Start Date</div>
                                <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Expires</div>
                                <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Status</div>
                            </div>

                            {filteredInterns.length === 0 ? (
                                <div className="px-5 py-12 text-center text-white/30 text-sm">
                                    No interns found matching your filters.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredInterns.map((intern) => {
                                        const tl = timeLeft(intern.accessExpires);
                                        return (
                                            <div
                                                key={intern.id}
                                                className="lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] px-5 py-4 hover:bg-white/[0.015] transition-colors"
                                            >
                                                <div className="mb-2 lg:mb-0">
                                                    <span className="font-medium text-white text-sm">{intern.name}</span>
                                                    <span className="ml-2 text-xs text-white/25 font-mono">/{intern.id}</span>
                                                </div>
                                                <div className="mb-1 lg:mb-0 text-sm text-white/50">{intern.department}</div>
                                                <div className="mb-1 lg:mb-0 text-sm text-white/50">{intern.startDate}</div>
                                                <div className="mb-1 lg:mb-0 text-sm font-mono">
                                                    <span className={tl.urgent ? "text-red-400" : tl.expired ? "text-white/25" : "text-white/50"}>
                                                        {tl.label}
                                                    </span>
                                                </div>
                                                <div>
                                                    {tl.expired ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                            <ShieldX className="w-3 h-3" />
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <Clock className="w-3 h-3" />
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ LOGIN LOGS TAB ═══ */}
                {activeTab === "logs" && (
                    <div className="space-y-4">
                        {/* Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <select
                                    value={logStatusFilter}
                                    onChange={(e) => setLogStatusFilter(e.target.value)}
                                    className="pl-11 pr-8 py-2.5 rounded-xl border border-white/[0.08] bg-charcoal-light text-white text-sm outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="success">Success</option>
                                    <option value="failed_key">Failed Key</option>
                                    <option value="expired">Expired</option>
                                    <option value="not_found">Not Found</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                            </div>
                        </div>

                        {loginLogs.length === 0 ? (
                            <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light px-5 py-16 text-center">
                                <Globe className="w-10 h-10 text-white/10 mx-auto mb-4" />
                                <p className="text-white/40 text-sm font-medium mb-1">No login logs available</p>
                                <p className="text-white/25 text-xs max-w-md mx-auto leading-relaxed">
                                    Login logs will appear here once <code className="text-white/40 bg-white/[0.05] px-1.5 py-0.5 rounded">LOGIN_LOG_CSV_URL</code> is
                                    configured and interns start logging in.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
                                {/* Desktop Header */}
                                <div className="hidden lg:grid lg:grid-cols-[1.2fr_1fr_1fr_1.2fr_0.8fr] bg-charcoal-lighter/50">
                                    <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Timestamp</div>
                                    <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Intern</div>
                                    <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">IP Address</div>
                                    <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">User Agent</div>
                                    <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Status</div>
                                </div>

                                <div className="divide-y divide-white/[0.04]">
                                    {filteredLogs.map((log, i) => {
                                        const cfg = statusConfig[log.status] || statusConfig.not_found;
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <div
                                                key={`${log.timestamp}-${i}`}
                                                className="lg:grid lg:grid-cols-[1.2fr_1fr_1fr_1.2fr_0.8fr] px-5 py-3 hover:bg-white/[0.015] transition-colors"
                                            >
                                                <div className="mb-1 lg:mb-0 text-sm text-white/50 font-mono">{formatTimestamp(log.timestamp)}</div>
                                                <div className="mb-1 lg:mb-0">
                                                    <span className="text-sm text-white">{log.internName || log.internId}</span>
                                                    {log.internName && <span className="ml-1.5 text-xs text-white/25 font-mono">/{log.internId}</span>}
                                                </div>
                                                <div className="mb-1 lg:mb-0 text-sm text-white/60 font-mono flex items-center gap-1.5">
                                                    <Monitor className="w-3 h-3 text-white/20 shrink-0" />
                                                    {log.ip || "—"}
                                                </div>
                                                <div className="mb-1 lg:mb-0 text-xs text-white/30 truncate" title={log.userAgent}>
                                                    {truncateUA(log.userAgent)}
                                                </div>
                                                <div>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${cfg.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Show more */}
                                {!showAllLogs && loginLogs.length > 50 && (
                                    <div className="px-5 py-3 border-t border-white/[0.04] text-center">
                                        <button
                                            onClick={() => setShowAllLogs(true)}
                                            className="text-xs text-gold hover:text-gold-light transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                                        >
                                            <ChevronDown className="w-3 h-3" />
                                            Show all {loginLogs.length} logs
                                        </button>
                                    </div>
                                )}
                                {showAllLogs && loginLogs.length > 50 && (
                                    <div className="px-5 py-3 border-t border-white/[0.04] text-center">
                                        <button
                                            onClick={() => setShowAllLogs(false)}
                                            className="text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                                        >
                                            <ChevronUp className="w-3 h-3" />
                                            Show less
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <footer className="mt-12 text-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent mb-6" />
                    <p className="text-xs text-white/20">
                        &copy; {new Date().getFullYear()} Akasha Yoga Academy. Admin Dashboard v1.0
                    </p>
                </footer>
            </div>
        </div>
    );
}
