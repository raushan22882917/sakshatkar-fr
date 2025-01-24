import { RecruiterLayout } from "@/components/recruiter/RecruiterLayout";

export default function RecruiterRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecruiterLayout>{children}</RecruiterLayout>;
}
