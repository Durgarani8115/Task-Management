import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create an account</h1>

        <form action="/api/auth/signup" method="post" className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700">Name</span>
            <input
              name="name"
              type="text"
              required
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-violet-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
