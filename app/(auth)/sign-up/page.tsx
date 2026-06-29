import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md minimal-card p-8">
        <h1 className="text-2xl font-bold">Create an account</h1>

        <form action="/api/auth/signup" method="post" className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Name</span>
            <input
              name="name"
              type="text"
              required
              className="mt-2 w-full minimal-panel px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Email</span>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full minimal-panel px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Password</span>
            <input
              name="password"
              type="password"
              required
              className="mt-2 w-full minimal-panel px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <button
            type="submit"
            className="w-full minimal-btn-primary py-3 text-sm"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
