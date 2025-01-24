import { RecruiterNavbar } from "./RecruiterNavbar";

export function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <RecruiterNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}