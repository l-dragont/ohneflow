import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth/options";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";

// Shell for every signed-in page. Navigation links activate as each phase lands.
const live: Record<string, string> = { Dashboard: "/dashboard", Assignments: "/assignments", Subjects: "/subjects", Calendar: "/calendar", Assistant: "/assistant", Grades: "/grades", Analytics: "/analytics", Notes: "/notes", Study: "/study", Settings: "/settings", Integrations: "/integrations" };
const nav = ["Dashboard", "Assignments", "Subjects", "Calendar", "Assistant", "Grades", "Analytics", "Notes", "Study", "Integrations", "Settings"];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-line bg-card p-4 md:min-h-screen md:w-56 md:border-b-0 md:border-r">
        <Link href="/dashboard" className="text-xl font-bold text-brand">ohneflow</Link>
        <nav aria-label="Main" className="mt-4 flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((n) => live[n]
            ? <Link key={n} href={live[n]} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand/10 hover:text-brand">{n}</Link>
            : <span key={n} className="cursor-default whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted">{n}</span>)}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-end gap-3 border-b border-line p-3">
          <span className="text-sm text-muted">{session.user.name}</span>
          <NotificationBell /><ThemeToggle /><SignOutButton />
        </header>
        <main className="fade-in p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
