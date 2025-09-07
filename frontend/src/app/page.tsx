'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { AppShell } from '@/components/layout/app-shell'
import { ClaimCard } from '@/components/claims/claim-card'
import { ClaimCardSkeleton } from '@/components/claims/claim-card-skeleton'
import { useInfiniteClaimsQuery } from '@/hooks/use-claims'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppConfig, Category, ClaimStatus } from '@/config/app.config'
import { AlertCircle, TrendingUp, Clock, Award } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | undefined>()
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_votes'>('newest')
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteClaimsQuery({
    category: selectedCategory,
    status: selectedStatus,
    sort: sortBy,
    limit: 10
  })
  
  // Infinite scroll trigger
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  })
  
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])
  
  // Get current hour for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }
  
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {getGreeting()}, Truth Seeker
          </h1>
          <p className="text-muted-foreground">
            Discover and validate claims from around the world. Your voice matters in the fight against misinformation.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-background/60 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>Active Claims</span>
              </div>
              <p className="text-xl font-semibold">{data?.pages[0]?.total || 0}</p>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span>Pending</span>
              </div>
              <p className="text-xl font-semibold">12</p>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Award className="h-4 w-4" />
                <span>Verified</span>
              </div>
              <p className="text-xl font-semibold">89%</p>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <AlertCircle className="h-4 w-4" />
                <span>Disputed</span>
              </div>
              <p className="text-xl font-semibold">7</p>
            </div>
          </div>
        </div>
        
        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
            <TabsTrigger value="all">All Claims</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-6">
            {/* Filters - All in one row on desktop */}
            <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 md:min-w-0 md:flex-1">
                <Badge
                  variant={!selectedCategory ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  All Categories
                </Badge>
                {AppConfig.CATEGORIES.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat.value as Category)}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
              
              {/* Status Filter */}
              <div className="flex flex-wrap gap-2 md:min-w-0 md:flex-1">
                <Badge
                  variant={!selectedStatus ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedStatus(undefined)}
                >
                  All Status
                </Badge>
                {(['VERIFIED', 'UNVERIFIED', 'DISPUTED', 'FALSE'] as ClaimStatus[]).map((status) => (
                  <Badge
                    key={status}
                    variant={selectedStatus === status ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
              
              {/* Sort Options */}
              <div className="flex gap-2 md:shrink-0">
                <Button
                  variant={sortBy === 'newest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('newest')}
                >
                  Newest
                </Button>
                <Button
                  variant={sortBy === 'oldest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('oldest')}
                >
                  Oldest
                </Button>
                <Button
                  variant={sortBy === 'most_votes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('most_votes')}
                >
                  Most Votes
                </Button>
              </div>
            </div>
            
            {/* Claims Grid */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load claims. Please try again later.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <ClaimCardSkeleton key={i} />
                ))
              ) : (
                // Actual claims
                data?.pages.map((page) =>
                  page.claims.map((claim) => (
                    <ClaimCard key={claim.claim_id} claim={claim} />
                  ))
                )
              )}
            </div>
            
            {/* Load more trigger */}
            {hasNextPage && (
              <div ref={ref} className="flex justify-center py-4">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Loading more...</span>
                  </div>
                )}
              </div>
            )}
            
            {!hasNextPage && data?.pages[0]?.claims.length ? (
              <p className="text-center text-muted-foreground py-8">
                No more claims to load
              </p>
            ) : null}
            
            {!isLoading && data?.pages[0]?.claims.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No claims found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later for new claims.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trending" className="mt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trending Claims</h3>
              <p className="text-muted-foreground">
                Claims with the most activity in the last 24 hours will appear here.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-6">
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Recent Claims</h3>
              <p className="text-muted-foreground">
                The most recently submitted claims will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}