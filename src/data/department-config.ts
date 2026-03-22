interface DepartmentConfig {
  quizUrl: string;
  sopFile: string;
}

const config: Record<string, DepartmentConfig> = {
  "PA Department": {
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/PA-Department-Intern-SOP.docx",
  },
  "Sales Department": {
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/Sales-Department-Intern-SOP.docx",
  },
  "Marketing Department": {
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/Marketing-Department-Intern-SOP.docx",
  },
  "Support Department": {
    quizUrl: "https://tally.so/r/Ek0vA4",
    sopFile: "/docs/Support-Department-Intern-SOP.docx",
  },
};

const fallback: DepartmentConfig = {
  quizUrl: "https://tally.so/r/Ek0vA4",
  sopFile: "/docs/PA-Department-Intern-SOP.docx",
};

export function getDepartmentConfig(department: string): DepartmentConfig {
  return config[department] || fallback;
}
