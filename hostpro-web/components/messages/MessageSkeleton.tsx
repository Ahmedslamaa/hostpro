'use client';

export function MessageListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors animate-pulse">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
            <div className="flex-shrink-0">
              <div className="h-3 bg-gray-100 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageDetailSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-48" />
          </div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded" />
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Guest message */}
        <div className="flex justify-start">
          <div className="max-w-xs bg-gray-100 rounded-lg p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-40" />
          </div>
        </div>

        {/* Host message */}
        <div className="flex justify-end">
          <div className="max-w-xs bg-blue-100 rounded-lg p-3 space-y-2">
            <div className="h-3 bg-blue-200 rounded w-28" />
            <div className="h-3 bg-blue-200 rounded w-36" />
          </div>
        </div>

        {/* Guest message */}
        <div className="flex justify-start">
          <div className="max-w-xs bg-gray-100 rounded-lg p-3">
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t space-y-2">
        <div className="h-20 bg-gray-100 rounded" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-100 rounded" />
          <div className="w-10 h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function MessageBubbleSkeleton() {
  return (
    <div className="flex gap-3 mb-4 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
        <div className="bg-gray-100 rounded-lg p-3 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-40" />
        </div>
      </div>
    </div>
  );
}
