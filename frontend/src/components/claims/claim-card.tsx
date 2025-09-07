'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, ThumbsUp, ThumbsDown, Share2, Bookmark, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ClaimListItem, ClaimStatus } from "@/types"

interface ClaimCardProps {
  claim: ClaimListItem
  className?: string
}

export function ClaimCard({ claim, className }: ClaimCardProps) {
  const statusConfig: Record<ClaimStatus, { color: string; label: string }> = {
    VERIFIED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Verified' },
    FALSE: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'False' },
    DISPUTED: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Disputed' },
    UNVERIFIED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Unverified' }
  }

  const categoryColors: Record<string, string> = {
    news: 'bg-red-500/10 text-red-600 dark:text-red-400',
    science: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    politics: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    health: 'bg-green-500/10 text-green-600 dark:text-green-400',
    technology: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  }

  const totalVotes = claim.yes_votes + claim.no_votes
  const yesPercentage = totalVotes > 0 ? (claim.yes_votes / totalVotes) * 100 : 50

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 cursor-pointer group",
      "bg-card hover:bg-accent/5",
      className
    )}>
      <Link href={`/claims/${claim.claim_id}`}>
        {/* Image if available */}
        {claim.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg mt-[-22px]">
            <img 
              src={claim.imageUrl} 
              alt={claim.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        
        <CardHeader className={cn("pb-3", claim.imageUrl ? "pt-4" : "")}>
          <div className="flex items-center justify-between mb-2 gap-2">
            <Badge 
              variant="secondary" 
              className={cn("text-xs", categoryColors[claim.category] || '')}
            >
              {claim.category}
            </Badge>
            <Badge 
              variant="secondary"
              className={cn("text-xs", statusConfig[claim.status].color)}
            >
              {statusConfig[claim.status].label}
            </Badge>
          </div>
          
          <CardTitle className="line-clamp-2 text-lg md:text-xl">
            {claim.title}
          </CardTitle>
          
          {claim.preview && (
            <CardDescription className="line-clamp-3 text-sm mt-2">
              {claim.preview}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pb-3">
          {/* Vote visualization bar */}
          {totalVotes > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {claim.yes_votes} ({Math.round(yesPercentage)}%)
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3" />
                  {claim.no_votes} ({Math.round(100 - yesPercentage)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                {formatDistanceToNow(new Date(claim.submitted_at), { addSuffix: true })}
              </span>
            </div>
            
            {claim.vote_count && claim.vote_count > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">{claim.vote_count} votes</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {claim.author && (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {claim.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{claim.author}</span>
              </>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // TODO: Implement share
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // TODO: Implement bookmark
              }}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}