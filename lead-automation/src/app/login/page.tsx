import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : "";
  const next = typeof searchParams.next === "string" ? searchParams.next : "/app/leads";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Real Estate Lead Automation MVP
          </p>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <form action={login} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block text-sm font-medium">
              Email
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            <button
              className="w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              type="submit"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-600">
            New here?{" "}
            <Link className="font-medium text-black underline" href="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

