export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div className="space-y-2">
            <div className="h-7 md:h-8 bg-gray-200/80 rounded-full w-48 animate-pulse" />
            <div className="h-4 bg-gray-200/50 rounded-full w-32 md:hidden animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200/80 rounded-lg w-full md:w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/50 p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow h-36 animate-pulse"
            >
              <div className="space-y-3">
                <div className="h-5 bg-gray-200/80 rounded-full w-3/4" />
                <div className="h-4 bg-gray-200/50 rounded-full w-1/2" />
                <div className="flex gap-3 mt-4">
                  <div className="h-3 w-16 bg-gray-200/50 rounded-full" />
                  <div className="h-3 w-16 bg-gray-200/50 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}