// Shown while a dashboard page renders on the server — notably the first
// visit after sign-in, which also creates the profile row. Mirrors the page
// rhythm (title, banner, card grid) so nothing jumps when content arrives.
export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12" aria-busy="true">
      <div className="flex flex-col gap-3">
        <div className="h-3 w-32 animate-pulse bg-surface-elevated" />
        <div className="h-10 w-56 animate-pulse bg-surface-elevated" />
      </div>
      <div className="h-14 w-full animate-pulse border border-hairline bg-surface-card/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse border border-hairline bg-surface-card/70" />
        ))}
      </div>
    </main>
  );
}
