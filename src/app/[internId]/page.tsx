import { notFound } from "next/navigation";
import { interns, getInternById } from "@/data/interns";
import OnboardingDashboard from "@/components/onboarding-dashboard";

interface Props {
  params: Promise<{ internId: string }>;
}

export function generateStaticParams() {
  return interns.map((i) => ({ internId: i.id }));
}

export async function generateMetadata({ params }: Props) {
  const { internId } = await params;
  const intern = getInternById(internId);
  if (!intern) return { title: "Not Found" };
  return {
    title: `Onboarding — ${intern.name} | Akasha Yoga Academy`,
    description: `Welcome aboard, ${intern.name}! Your personal onboarding dashboard.`,
  };
}

export default async function InternPage({ params }: Props) {
  const { internId } = await params;
  const intern = getInternById(internId);
  if (!intern) notFound();

  return <OnboardingDashboard intern={intern} />;
}
