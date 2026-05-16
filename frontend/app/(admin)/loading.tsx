export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse w-full max-w-4xl space-y-4">
        <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
        <div className="h-32 bg-neutral-200 rounded w-full"></div>
        <div className="h-32 bg-neutral-200 rounded w-full"></div>
      </div>
    </div>
  )
}
