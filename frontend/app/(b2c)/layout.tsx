import { DataDisclosureNotice } from "@/components/domain/DataDisclosureNotice";

export default function B2CLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        {children}
      </main>
      <footer className="w-full bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <DataDisclosureNotice />
        </div>
      </footer>
    </div>
  )
}
