import { NextRequest } from "next/server";

export interface LoginLogEntry {
  internId: string;
  internName: string;
  ip: string;
  userAgent: string;
  status: "success" | "failed_key" | "expired" | "not_found" | "error";
  timestamp: string;
}

/**
 * Extract the client IP address from the request.
 * On Vercel, the IP is in the `x-forwarded-for` header.
 * Falls back to `x-real-ip`, then to "unknown".
 */
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    return xff.split(",")[0].trim();
  }

  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();

  return "unknown";
}

/**
 * Log a login attempt. Sends data to a Google Apps Script webhook
 * if LOGIN_LOG_WEBHOOK_URL is set, otherwise logs to console.
 *
 * This function is fire-and-forget — it does NOT block the response.
 */
export function logLogin(entry: LoginLogEntry): void {
  const webhookUrl = process.env.LOGIN_LOG_WEBHOOK_URL;

  // Always log to console (appears in Vercel function logs)
  console.log("[LOGIN LOG]", JSON.stringify(entry));

  // If webhook is configured, send it asynchronously
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch((err) => {
      console.error("[LOGIN LOG] Webhook error:", err);
    });
  }
}
