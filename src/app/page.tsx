import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          SkillFlow
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-400">
          Visualise how AI development skills connect and compose into
          powerful workflows. Explore the graph, build custom chains, and
          understand how each skill drives the next.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Open Dashboard
          </Link>
          <Link
            href="/dashboard/graph"
            className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
          >
            View Graph <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <p className="mt-6">
          <Link
            href="/guide"
            className="text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            New here? Read the guide &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
