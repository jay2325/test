import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/app/leads" className="font-semibold tracking-tight">
            Lead Automation
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="hover:underline" href="/app/leads">
              Leads
            </Link>
            <Link className="hover:underline" href="/app/sources">
              Sources
            </Link>
            <Link className="hover:underline" href="/app/settings">
              Settings
            </Link>
            <form action="/logout" method="post">
              <button className="rounded-md border px-2 py-1 hover:bg-zinc-50" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

