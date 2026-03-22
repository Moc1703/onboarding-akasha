export interface InternCredential {
  tool: string;
  username: string;
  password: string;
}

export interface InternProfile {
  id: string;
  name: string;
  department: string;
  startDate: string;
  accessExpires: string;
  /** SERVER-ONLY: never send to client */
  accessKey: string;
  quizUrl: string;
  sopFile: string;
  /** SERVER-ONLY: never send to client directly */
  credentials: InternCredential[];
}

/** Safe subset that can be sent to the browser */
export interface InternPublic {
  id: string;
  name: string;
  department: string;
  startDate: string;
  accessExpires: string;
  quizUrl: string;
  sopFile: string;
}

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
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/PA-Department-Intern-SOP.docx",
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
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/PA-Department-Intern-SOP.docx",
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

/** Strip secrets — only return data safe for the browser */
export function toPublic(intern: InternProfile): InternPublic {
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
