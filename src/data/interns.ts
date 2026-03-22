export interface InternCredential {
  label: string;
  value: string;
  sensitive?: boolean;
}

export interface InternProfile {
  id: string;
  name: string;
  department: string;
  startDate: string;
  accessExpires: string;
  accessKey: string;
  quizUrl: string;
  sopFile: string;
  credentials: InternCredential[];
}

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
    credentials: [],
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
    credentials: [],
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
    credentials: [],
  },
];

export function getInternById(id: string): InternProfile | undefined {
  return interns.find((i) => i.id === id);
}

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
