import { Card, CardContent } from "../ui/card";

export function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Hero Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="h-9 w-3/4 mb-2 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Key Metrics Grid Skeleton */}
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                        <div>
                          <div className="h-4 w-16 mb-1 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex gap-3 pt-4">
                    <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-48 bg-gray-200 rounded"></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                      <div className="h-5 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-6 w-16 bg-gray-200 rounded-full"
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="h-5 w-24 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Instructions Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-40 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Company Info Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-5 w-32 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips Skeleton */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 bg-orange-200 rounded-full"></div>
                  <div className="h-5 w-36 bg-orange-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-orange-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-orange-200 rounded"></div>
                  <div className="h-4 w-4/5 bg-orange-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer Skeleton */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
