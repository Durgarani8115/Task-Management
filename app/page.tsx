import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
          Task Management
        </p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Organize work without the clutter.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          A simple workspace for planning tasks, tracking progress, and keeping
          your team focused.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/sign-in"
            className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
