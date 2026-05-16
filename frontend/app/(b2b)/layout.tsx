export default function B2BLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* TODO: Add B2B PasscodeGuard wrapper here */}
      <header className="bg-slate-900 text-white p-4">
        <h1 className="text-xl font-bold">SeedFit B2B Partner Portal</h1>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
