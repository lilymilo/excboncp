export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--color-page)] px-4 py-5 sm:px-6 lg:px-8" aria-busy="true">
      <span className="sr-only">Memuat halaman</span>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="xb-skeleton h-10 w-40 rounded-xl" />
          <div className="xb-skeleton h-10 w-24 rounded-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="xb-card hidden h-[calc(100vh-7rem)] p-4 lg:block">
            <div className="xb-skeleton h-8 w-32" />
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="xb-skeleton h-10 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="xb-card p-5">
              <div className="xb-skeleton h-7 w-64 max-w-full" />
              <div className="xb-skeleton mt-3 h-4 w-[32rem] max-w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="xb-card p-5">
                  <div className="xb-skeleton h-4 w-24" />
                  <div className="xb-skeleton mt-3 h-8 w-32" />
                </div>
              ))}
            </div>
            <div className="xb-card p-5">
              <div className="xb-skeleton h-5 w-44" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="xb-skeleton h-24 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
