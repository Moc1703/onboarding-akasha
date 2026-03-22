export interface InternProfile {
  id: string;
  name: string;
  department: string;
  startDate: string;
  /** ISO date-time — after this, the page is locked */
  accessExpires: string;
  /** Unique key each intern must enter to unlock their dashboard */
  accessKey: string;
  credentials: { tool: string; username: string; password: string }[];
}

/**
 * Add / remove interns here.
 * Each intern gets a unique URL: /<id>
 * They must enter their `accessKey` to unlock the page.
 * `accessExpires` controls when their onboarding page becomes inaccessible.
 */
export const interns: InternProfile[] = [
  {
    id: "ayu",
    name: "Ayu Pratiwi",
    department: "PA Department",
    startDate: "30 March 2026",
    accessExpires: "2026-04-06T23:59:59+07:00",
    accessKey: "AYA-AYU-2026",
    credentials: [
      { tool: "Google Workspace", username: "ayu@akashayoga.com", password: "Temp@1234" },
      { tool: "Notion", username: "ayu@akashayoga.com", password: "Temp@1234" },
      { tool: "Slack", username: "ayu@akashayoga.com", password: "Temp@1234" },
      { tool: "Trello", username: "ayu@akashayoga.com", password: "Temp@1234" },
    ],
  },
  {
    id: "rina",
    name: "Rina Maharani",
    department: "PA Department",
    startDate: "30 March 2026",
    accessExpires: "2026-04-06T23:59:59+07:00",
    accessKey: "AYA-RINA-2026",
    credentials: [
      { tool: "Google Workspace", username: "rina@akashayoga.com", password: "Temp@5678" },
      { tool: "Notion", username: "rina@akashayoga.com", password: "Temp@5678" },
      { tool: "Slack", username: "rina@akashayoga.com", password: "Temp@5678" },
      { tool: "Trello", username: "rina@akashayoga.com", password: "Temp@5678" },
    ],
  },
  {
    id: "budi",
    name: "Budi Santoso",
    department: "PA Department",
    startDate: "30 March 2026",
    accessExpires: "2026-04-06T23:59:59+07:00",
    accessKey: "AYA-BUDI-2026",
    credentials: [
      { tool: "Google Workspace", username: "budi@akashayoga.com", password: "Temp@9012" },
      { tool: "Notion", username: "budi@akashayoga.com", password: "Temp@9012" },
      { tool: "Slack", username: "budi@akashayoga.com", password: "Temp@9012" },
      { tool: "Trello", username: "budi@akashayoga.com", password: "Temp@9012" },
    ],
  },
];

export function getInternById(id: string): InternProfile | undefined {
  return interns.find((i) => i.id === id);
}
