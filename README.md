# Akasha Yoga Academy — Intern Onboarding Dashboard

A secure, one-page onboarding dashboard for Akasha Yoga Academy interns. Built with Next.js 16, Tailwind CSS 4, and deployed on Vercel.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Onboarding Flow (Intern Perspective)](#onboarding-flow-intern-perspective)
  - [Data Flow (Technical)](#data-flow-technical)
- [Environment Variables](#environment-variables)
- [Data Sources](#data-sources)
  - [Option A: Google Sheets (Recommended)](#option-a-google-sheets-recommended)
  - [Option B: Hardcoded Data (Fallback)](#option-b-hardcoded-data-fallback)
- [Department Configuration](#department-configuration)
- [Security Model](#security-model)
- [Local Development](#local-development)
- [Deployment (Vercel)](#deployment-vercel)
- [Common Tasks](#common-tasks)
  - [Add a New Intern](#add-a-new-intern)
  - [Add a New Department](#add-a-new-department)
  - [Change 1Password Credentials](#change-1password-credentials)
  - [Change the Quiz URL](#change-the-quiz-url)
  - [Change SOP Documents](#change-sop-documents)
  - [Extend an Intern's Access](#extend-an-interns-access)
- [Troubleshooting](#troubleshooting)

---

## Overview

Each intern receives a unique URL (e.g. `yoursite.com/ayu`) and an access key from HR. The dashboard guides them through 6 onboarding steps:

| Step | Section | Description |
|------|---------|-------------|
| 1 | Pre-reading | Company profile link (akashayogaacademy.com/about) |
| 2 | Department SOP | Read the full SOP document inline (must scroll 95%+ to proceed) |
| 3 | Schedule | 2-week orientation & practice schedule |
| 4 | Credentials | 1Password credentials (behind confidentiality warning) |
| 5 | Checklist | Interactive first-day checklist with progress bar |
| 6 | Quiz | Tally.so quiz (unlocks only after SOP is fully read) |

Access expires at a configurable date/time per intern. A countdown timer is always visible.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.1 | App framework (App Router, Server Components, API Routes) |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4.2.2 | Styling |
| Lucide React | 0.577.0 | Icons |
| Mammoth.js | 1.12.0 | Render `.docx` SOP files as HTML in the browser |
| TypeScript | 5.9.3 | Type safety |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Inter font, global styles)
│   ├── page.tsx                # Landing page (instructions for interns)
│   ├── globals.css             # Tailwind config, custom theme, SOP styles
│   ├── [internId]/
│   │   └── page.tsx            # Dynamic route per intern (server component)
│   └── api/
│       └── verify/
│           └── route.ts        # POST endpoint: validates access key, returns credentials
├── components/
│   ├── onboarding-dashboard.tsx  # Main dashboard UI (client component)
│   ├── access-gate.tsx           # Access key input form
│   ├── sop-reader.tsx            # SOP document viewer with scroll tracking
│   ├── countdown-timer.tsx       # Expiration countdown
│   └── expired-page.tsx          # Shown when access has expired
├── data/
│   ├── interns.ts              # Hardcoded intern data (fallback)
│   └── department-config.ts    # Maps department → quizUrl + sopFile
├── lib/
│   ├── get-interns.ts          # Unified data layer (Sheet or fallback)
│   └── google-sheet.ts         # Google Sheets CSV fetcher + parser
public/
└── docs/
    ├── PA-Department-Intern-SOP.docx
    ├── Sales-Department-Intern-SOP.docx
    ├── Marketing-Department-Intern-SOP.docx
    └── Support-Department-Intern-SOP.docx
```

---

## How It Works

### Onboarding Flow (Intern Perspective)

```
Intern receives URL + access key from HR
         │
         ▼
   ┌─────────────┐
   │ Access Gate  │  ← Enter access key
   └──────┬──────┘
          │ valid key
          ▼
   ┌─────────────────────────┐
   │    Dashboard (6 steps)  │
   │                         │
   │  1. Read Company Profile│ → links to akashayogaacademy.com/about
   │  2. Read Department SOP │ → must scroll 95%+ to unlock quiz
   │  3. View Schedule       │ → 2-week orientation plan
   │  4. View Credentials    │ → must accept confidentiality notice first
   │  5. Complete Checklist  │ → interactive checkboxes
   │  6. Take Quiz           │ → Tally.so embed (locked until SOP is read)
   │                         │
   └─────────────────────────┘
          │
          │ access expires
          ▼
   ┌─────────────┐
   │ Expired Page│
   └─────────────┘
```

### Data Flow (Technical)

```
Browser                          Server
──────                          ──────

GET /ayu
  ──────────────────────────►  [internId]/page.tsx (Server Component)
                                  │
                                  ├── getPublicIntern("ayu")
                                  │     └── Google Sheet? → fetch CSV
                                  │     └── fallback → interns.ts
                                  │
                                  ├── strips sensitive data (accessKey, credentials)
  ◄──────────────────────────    └── returns InternPublic to client

POST /api/verify
  { internId, accessKey }
  ──────────────────────────►  api/verify/route.ts
                                  │
                                  ├── getIntern("ayu")  ← full profile
                                  ├── validate accessKey
                                  ├── check expiration
                                  ├── get credentials from env vars
  ◄──────────────────────────    └── returns { credentials }
```

---

## Environment Variables

| Variable | Required | Where | Description |
|---|---|---|---|
| `ONBOARD_1P_ACCOUNT` | Yes | `.env.local` + Vercel | 1Password account email |
| `ONBOARD_1P_PASSWORD` | Yes | `.env.local` + Vercel | 1Password master password |
| `ONBOARD_1P_SECRET_KEY` | Yes | `.env.local` + Vercel | 1Password secret key |
| `GOOGLE_SHEET_CSV_URL` | No* | `.env.local` + Vercel | Published CSV URL from "Publish to web" (preferred) |
| `GOOGLE_SHEET_ID` | No* | `.env.local` + Vercel | Legacy: spreadsheet ID (needs sheet shared publicly; may 401 if only published) |
| `LOGIN_LOG_WEBHOOK_URL` | No | `.env.local` + Vercel | Google Apps Script Web App URL for login IP logging (see [Login IP Logging](#login-ip-logging)) |

\*Use **`GOOGLE_SHEET_CSV_URL`** with the URL Google gives after **File → Publish to web → CSV**. If Step 4 shows “Credentials unavailable”, check that all three **`ONBOARD_1P_*`** variables are set in **Vercel → Settings → Environment Variables** for **Production** (and redeploy).

**Important:** These are stored in `.env.local` (gitignored, never pushed) and in Vercel environment variables. Never put credentials in source code.

---

## Data Sources

The system supports two data sources. If `GOOGLE_SHEET_CSV_URL` or `GOOGLE_SHEET_ID` is set, Google Sheets is used. Otherwise, it falls back to hardcoded data.

### Option A: Google Sheets (Recommended)

Best for managing interns without touching code.

**Setup:**

1. Create a Google Sheet with a tab named **`interns`** (lowercase)
2. Add these columns in the first row:

| id | name | department | startDate | accessExpires | accessKey |
|---|---|---|---|---|---|
| ayu | Ayu Pratiwi | PA Department | 30 March 2026 | 2026-04-06T23:59:59+07:00 | AYA-AYU-2026 |

Column details:
- **id** — URL slug, must be unique (e.g. `ayu` → `yoursite.com/ayu`)
- **name** — Full display name
- **department** — Must match a key in `department-config.ts` (e.g. `PA Department`)
- **startDate** — Display text (free format)
- **accessExpires** — ISO 8601 datetime with timezone (e.g. `2026-04-06T23:59:59+07:00`)
- **accessKey** — Unique key given to the intern by HR

3. **Publish the sheet:**
   - File → Share → Publish to web
   - Select **Entire document** → **CSV**
   - Click Publish

4. **Copy the published link** Google shows (it looks like `.../spreadsheets/d/e/2PACX-.../pub?...`).

5. Add to `.env.local` (use the full published URL; `output=csv` is added automatically if missing):
   ```
   GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
   ```

   Alternatively you can paste the URL with `gid=` from the browser — the app normalizes it.

**Note:** `quizUrl` and `sopFile` are NOT in the sheet — they're auto-derived from the `department` field via `department-config.ts`.

### Option B: Hardcoded Data (Fallback)

Edit `src/data/interns.ts` directly. Useful for testing or if you don't need Google Sheets.

```typescript
export const interns: InternProfile[] = [
  {
    id: "ayu",
    name: "Ayu Pratiwi",
    department: "PA Department",
    startDate: "30 March 2026",
    accessExpires: "2026-04-06T23:59:59+07:00",
    accessKey: "AYA-AYU-2026",
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/PA-Department-Intern-SOP.docx",
    credentials: [],
  },
];
```

---

## Department Configuration

File: `src/data/department-config.ts`

This maps each department name to its quiz URL and SOP document path. When an intern's department is `"PA Department"`, the system automatically assigns the correct quiz and SOP.

```typescript
const config: Record<string, DepartmentConfig> = {
  "PA Department": {
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/PA-Department-Intern-SOP.docx",
  },
  "Sales Department": {
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/Sales-Department-Intern-SOP.docx",
  },
  // ... add more as needed
};
```

SOP `.docx` files are stored in `public/docs/`.

---

## Security Model

| Concern | How It's Handled |
|---|---|
| Access keys | Stored server-side only. Never sent to the browser until verified via API. |
| 1Password credentials | Stored in environment variables. Served only after successful access key verification via `POST /api/verify`. |
| Client-side data | Only `InternPublic` (name, department, dates) is sent to the browser. No secrets in HTML/JS bundle. |
| Confidentiality warning | Intern must explicitly accept a privacy notice before credentials are revealed. |
| Brute force | 5 max failed attempts before lockout. |
| Expiration | Each intern has an `accessExpires` datetime. Expired access is rejected both client-side (countdown) and server-side (API check). |
| GitHub repo | No passwords or secrets in source code. All sensitive data lives in `.env.local` (gitignored) and Vercel env vars. |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with credentials
#    (see .env.example for template)

# 3. Start dev server
npm run dev

# 4. Open http://localhost:3000/ayu
#    Access key for Ayu: AYA-AYU-2026
```

Test access keys for hardcoded interns:

| Intern | URL | Access Key |
|---|---|---|
| Ayu Pratiwi | `/ayu` | `AYA-AYU-2026` |
| Rina Maharani | `/rina` | `AYA-RINA-2026` |
| Budi Santoso | `/budi` | `AYA-BUDI-2026` |

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import the repo in Vercel
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variables in **Settings → Environment Variables**:

   ```
   ONBOARD_1P_ACCOUNT=rise@akashayogaacademy.com
   ONBOARD_1P_PASSWORD=your_password_here
   ONBOARD_1P_SECRET_KEY=your_secret_key_here
   GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?output=csv   # optional
   ```

5. Deploy. Each push to `main` triggers auto-deploy.

---

## Common Tasks

### Add a New Intern

**Via Google Sheet (recommended):**
Add a new row to the `interns` tab:

| id | name | department | startDate | accessExpires | accessKey |
|---|---|---|---|---|---|
| dewi | Dewi Lestari | PA Department | 15 April 2026 | 2026-04-22T23:59:59+07:00 | AYA-DEWI-2026 |

The dashboard at `/dewi` will be available within ~1 minute (cache TTL).

**Via code:**
Add to the `interns` array in `src/data/interns.ts`, then push to GitHub.

### Add a New Department

1. Edit `src/data/department-config.ts`:
   ```typescript
   "Finance Department": {
     quizUrl: "https://tally.so/r/YOUR_QUIZ_ID",
     sopFile: "/docs/Finance-Department-Intern-SOP.docx",
   },
   ```

2. Place the SOP `.docx` file in `public/docs/`

3. Push to GitHub. New interns with `department: "Finance Department"` will auto-pick these settings.

### Change 1Password Credentials

Update the environment variables:
- **Local:** Edit `.env.local`
- **Production:** Update in Vercel → Settings → Environment Variables → Redeploy

No code changes needed.

### Change the Quiz URL

Edit `src/data/department-config.ts` → update the `quizUrl` for the relevant department → push.

### Change SOP Documents

1. Replace the `.docx` file in `public/docs/` (keep the same filename, or update `department-config.ts` with the new filename)
2. Push to GitHub

### Extend an Intern's Access

**Via Google Sheet:** Update the `accessExpires` column for that intern.

**Via code:** Update `accessExpires` in `src/data/interns.ts`.

Format: ISO 8601 with timezone, e.g. `2026-05-01T23:59:59+07:00`

---

## Login IP Logging

Every login attempt (successful or not) is logged with the intern's IP address, user agent, status, and timestamp. This is useful for security auditing.

**Without any setup**, all login events are logged to the server console (visible in **Vercel → Deployments → Functions → Logs**).

**For persistent logging to Google Sheets**, set up a Google Apps Script webhook:

1. Open your Google Sheet → **Extensions → Apps Script**
2. Replace the default code with:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Login Logs");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Login Logs");
    sheet.appendRow(["Timestamp", "Intern ID", "Name", "IP Address", "User Agent", "Status"]);
    sheet.getRange("1:1").setFontWeight("bold");
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp,
    data.internId,
    data.internName,
    data.ip,
    data.userAgent,
    data.status
  ]);
  return ContentService.createTextOutput("OK");
}
```

3. Click **Deploy → New deployment**
4. Type: **Web app**
5. Execute as: **Me**
6. Who has access: **Anyone**
7. Click **Deploy** → copy the URL
8. Add to `.env.local` and Vercel:

```
LOGIN_LOG_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Logged statuses:

| Status | Meaning |
|---|---|
| `success` | Valid access key, credentials served |
| `failed_key` | Wrong access key entered |
| `expired` | Access period has ended |
| `not_found` | Intern ID doesn't exist |

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Step 4 “Credentials unavailable” / empty | `ONBOARD_1P_*` missing on **Vercel Production** (or wrong environment selected) | Add all three vars in Vercel → Environment Variables → **Production** → Redeploy. Passwords with `*` may need careful paste. |
| Same issue locally | `.env.local` missing or dev server not restarted | Add `ONBOARD_1P_*` to `.env.local`, restart `npm run dev` |
| Intern page shows 404 | `id` doesn't match any intern | Check Google Sheet or `interns.ts` for the correct `id` |
| Quiz is locked | SOP hasn't been fully read | Scroll the SOP in Step 2 to 95%+ and click "Confirm & Unlock Quiz" |
| Google Sheet changes not showing | 1-minute cache | Wait ~1 minute, or restart dev server locally |
| "Access expired" on verify | `accessExpires` datetime has passed | Update the `accessExpires` value to a future date |
| Build fails on Vercel | Framework not detected | Ensure `vercel.json` has `{"framework": "nextjs"}` |

---

## Session Storage Keys

The dashboard uses `sessionStorage` to persist state within a browser session:

| Key | Purpose |
|---|---|
| `onboard_{id}` | Whether the access gate has been unlocked |
| `creds_{id}` | Cached credentials (after successful verification) |
| `creds_revealed_{id}` | Whether the confidentiality notice was accepted |
| `sop_read_{id}` | Whether the SOP was fully read and confirmed |
| `checklist_{id}` | Checklist completion state (array of booleans) |

These are cleared when the browser tab/session ends. Intern must re-enter access key in a new session.
