export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      {/* TODO: Add Admin PasscodeGuard wrapper here */}
      <header className="bg-red-900 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">SeedFit Admin Console</h1>
        <span className="text-xs bg-red-800 px-2 py-1 rounded text-red-200">RESTRICTED ACCESS</span>
      </header>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
