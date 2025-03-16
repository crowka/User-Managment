export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-[800px] space-y-6 px-4 text-center">
        <div className="h-32 w-32 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  )
} 