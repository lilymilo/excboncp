export default function Loading() {
  return (
    <main className="xb-botanical min-h-screen bg-[#EEF5EC] px-4 py-5 sm:px-6 lg:px-8" aria-busy="true">
      <span className="sr-only">Memuat halaman</span>
      <div className="mx-auto max-w-[1440px] space-y-4">
        {/* Top header skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="xb-skeleton h-9 w-44 rounded-[10px]" />
          <div className="xb-skeleton h-9 w-28 rounded-full" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Left sidebar skeleton */}
          <div className="xb-card hidden h-[calc(100vh-7rem)] rounded-[16px] border border-[var(--line-subtle)] bg-[var(--surface)] p-4 shadow-xs lg:block">
            <div className="xb-skeleton h-8 w-32 rounded-[8px]" />
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="xb-skeleton h-9 w-full rounded-[10px]" />
              ))}
            </div>
          </div>

          {/* Main workspace skeleton */}
          <div className="space-y-4">
            {/* Header banner / control card */}
            <div className="xb-card rounded-[16px] border border-[var(--line-subtle)] bg-[var(--surface)] p-5 shadow-xs">
              <div className="xb-skeleton h-7 w-64 max-w-full rounded-[8px]" />
              <div className="xb-skeleton mt-3 h-4 w-[28rem] max-w-full rounded-[6px]" />
            </div>

            {/* 6 KPI Cards strip */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="xb-card flex flex-col justify-between h-[112px] rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface)] p-4 shadow-xs"
                >
                  <div className="xb-skeleton h-3.5 w-16 rounded-[4px]" />
                  <div className="xb-skeleton h-6 w-24 rounded-[6px]" />
                  <div className="xb-skeleton h-3 w-14 rounded-[4px]" />
                </div>
              ))}
            </div>

            {/* Chart & Side Cards */}
            <div className="grid gap-4 xl:grid-cols-12">
              <div className="xb-card xl:col-span-7 h-[260px] rounded-[16px] border border-[var(--line-subtle)] bg-[var(--surface)] p-5 shadow-xs flex flex-col justify-between">
                <div className="xb-skeleton h-5 w-48 rounded-[6px]" />
                <div className="xb-skeleton h-36 w-full rounded-[10px]" />
                <div className="xb-skeleton h-4 w-3/4 rounded-[4px]" />
              </div>
              <div className="xb-card xl:col-span-5 h-[260px] rounded-[16px] border border-[var(--line-subtle)] bg-[var(--surface)] p-5 shadow-xs flex flex-col justify-between">
                <div className="xb-skeleton h-5 w-40 rounded-[6px]" />
                <div className="space-y-2.5 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="xb-skeleton h-12 w-full rounded-[10px]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
