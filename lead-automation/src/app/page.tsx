import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            Real Estate Lead Qualification + Speed-to-Lead (MVP)
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Next.js + Supabase Auth + Prisma (Postgres). This is the scaffold for the SMS-first automation workflow.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              href="/login"
            >
              Sign in
            </Link>
            <Link className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50" href="/signup">
              Create account
            </Link>
          </div>

          <p className="mt-8 text-sm text-zinc-500">
            Hosted form route <span className="font-mono">/f/:tenantSlug</span> will be added next.
          </p>
        </div>
      </main>
    </div>
  );
}
