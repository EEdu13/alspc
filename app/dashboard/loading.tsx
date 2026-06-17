export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-950 items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Carregando dados...</p>
      </div>
    </div>
  )
}
