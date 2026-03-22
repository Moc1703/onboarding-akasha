import { notFound } from "next/navigation";
import { getPublicIntern, getAllInternIds } from "@/lib/get-interns";
import OnboardingDashboard from "@/components/onboarding-dashboard";

interface Props {
  params: Promise<{ internId: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { internId } = await params;
  const intern = await getPublicIntern(internId);
  if (!intern) return { title: "Not Found" };
  return {
    title: `Onboarding — ${intern.name} | Akasha Yoga Academy`,
    description: `Welcome aboard, ${intern.name}! Your personal onboarding dashboard.`,
  };
}

export default async function InternPage({ params }: Props) {
  const { internId } = await params;
  const intern = await getPublicIntern(internId);
  if (!intern) notFound();

  return <OnboardingDashboard intern={intern} />;
}
