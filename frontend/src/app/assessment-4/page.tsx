import type { Metadata } from "next";
import { getAssessment } from "@/lib/assessments";
import AssessmentOverview from "@/components/AssessmentOverview";

const assessment = getAssessment("assessment-4")!;

export const metadata: Metadata = {
  title: `Assessment ${assessment.number}`,
  description: assessment.summary,
};

export default function Assessment4Page() {
  return <AssessmentOverview assessment={assessment} />;
}
