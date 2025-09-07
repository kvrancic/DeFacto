'use client'

import { use } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { useClaimQuery, useSubmitVote } from '@/hooks/use-claims'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Heart,
  TrendingUp,
  Coins
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { AppConfig } from '@/config/app.config'
import { toast } from 'sonner'
import type { ClaimStatus } from '@/types'

export default function ClaimDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const claimId = parseInt(params.id)
  
  const { data: claim, isLoading, error } = useClaimQuery(claimId)
  const { mutate: submitVote, isPending: isVoting } = useSubmitVote()
  
  const [stakeAmount, setStakeAmount] = useState(AppConfig.DEFAULT_STAKE_AMOUNT)
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null)
  const [supportAmount, setSupportAmount] = useState(10)
  const [predictionAmount, setPredictionAmount] = useState(50)
  const [predictionChoice, setPredictionChoice] = useState<'true' | 'false' | null>(null)
  
  if (isLoading) {
    return (
      <AppShell>
        <ClaimDetailSkeleton />
      </AppShell>
    )
  }
  
  if (error || !claim) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load claim. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </AppShell>
    )
  }
  
  const totalVotes = claim.yes_votes + claim.no_votes
  const yesPercentage = totalVotes > 0 ? (claim.yes_votes / totalVotes) * 100 : 50
  
  const statusConfig: Record<ClaimStatus, { icon: any; color: string; label: string }> = {
    VERIFIED: { 
      icon: CheckCircle, 
      color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30', 
      label: 'Verified' 
    },
    FALSE: { 
      icon: XCircle, 
      color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30', 
      label: 'False' 
    },
    DISPUTED: { 
      icon: AlertTriangle, 
      color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30', 
      label: 'Disputed' 
    },
    UNVERIFIED: { 
      icon: AlertCircle, 
      color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30', 
      label: 'Unverified' 
    }
  }
  
  const StatusIcon = statusConfig[claim.status].icon
  
  const handleVote = (vote: boolean) => {
    if (!stakeAmount || stakeAmount < AppConfig.MIN_STAKE_AMOUNT) {
      toast.error(`Minimum stake amount is ${AppConfig.MIN_STAKE_AMOUNT}`)
      return
    }
    
    setSelectedVote(vote)
    submitVote(
      {
        claim_id: claimId,
        vote,
        stake_amount: stakeAmount
      },
      {
        onSuccess: () => {
          toast.success('Vote submitted successfully!')
          setSelectedVote(null)
        },
        onError: () => {
          setSelectedVote(null)
        }
      }
    )
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: claim.title,
        text: claim.content.substring(0, 200),
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }
  
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to claims
          </Button>
        </Link>
        
        {/* Main content card */}
        <Card>
          {claim.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img 
                src={claim.imageUrl} 
                alt={claim.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            {/* Status and category badges */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{claim.category}</Badge>
                <Badge className={cn("gap-1", statusConfig[claim.status].color)}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig[claim.status].label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardTitle className="text-2xl md:text-3xl">{claim.title}</CardTitle>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              {claim.author && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{claim.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(claim.submitted_at), { addSuffix: true })}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{claim.content}</p>
            </div>
            
            {/* Evidence links */}
            {claim.evidence_urls && claim.evidence_urls.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Evidence</h3>
                <div className="space-y-2">
                  {claim.evidence_urls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* IPFS Hash */}
            <div className="text-xs text-muted-foreground">
              IPFS Hash: <code className="bg-muted px-1 py-0.5 rounded">{claim.ipfs_hash}</code>
            </div>
          </CardContent>
        </Card>
        
        {/* Support Writer Card */}
        {claim.author && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Support the Writer
              </CardTitle>
              <CardDescription>
                {claim.author} has chosen to direct support to: <span className="font-semibold text-foreground">{claim.supportDestination || 'Direct to Writer'}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Support Amount (ALGO)</label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[supportAmount]}
                    onValueChange={(value: number[]) => setSupportAmount(value[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{supportAmount}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((amount) => (
                  <Button
                    key={amount}
                    variant={supportAmount === amount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSupportAmount(amount)}
                  >
                    {amount} ALGO
                  </Button>
                ))}
              </div>
              
              <Button className="w-full gap-2" size="lg">
                <Heart className="h-4 w-4" />
                Send {supportAmount} ALGO to {claim.supportDestination || 'Writer'}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                100% of your support goes directly to the chosen cause. Transaction is recorded on-chain for full transparency.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Prediction Market Card */}
        {claim.status === 'UNVERIFIED' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Prediction Market
              </CardTitle>
              <CardDescription>
                Bet on whether this claim will be verified as true or false
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Current Odds */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Will be TRUE</p>
                  <p className="text-2xl font-bold">1.85x</p>
                  <p className="text-xs text-muted-foreground">65% probability</p>
                </div>
                <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Will be FALSE</p>
                  <p className="text-2xl font-bold">2.45x</p>
                  <p className="text-xs text-muted-foreground">35% probability</p>
                </div>
              </div>
              
              {/* Betting Interface */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Prediction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={predictionChoice === 'true' ? 'default' : 'outline'}
                      className="gap-2"
                      onClick={() => setPredictionChoice('true')}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      TRUE
                    </Button>
                    <Button
                      variant={predictionChoice === 'false' ? 'default' : 'outline'}
                      className="gap-2"
                      onClick={() => setPredictionChoice('false')}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      FALSE
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bet Amount (ALGO)</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[predictionAmount]}
                      onValueChange={(value: number[]) => setPredictionAmount(value[0])}
                      min={10}
                      max={500}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-16">{predictionAmount}</span>
                  </div>
                </div>
                
                {predictionChoice && (
                  <Alert>
                    <Coins className="h-4 w-4" />
                    <AlertDescription>
                      Potential payout: <span className="font-bold">{
                        predictionChoice === 'true' 
                          ? (predictionAmount * 1.85).toFixed(0)
                          : (predictionAmount * 2.45).toFixed(0)
                      } ALGO</span> if claim is verified as {predictionChoice === 'true' ? 'TRUE' : 'FALSE'}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  disabled={!predictionChoice}
                >
                  <Coins className="h-4 w-4" />
                  Place Bet: {predictionAmount} ALGO on {predictionChoice === 'true' ? 'TRUE' : 'FALSE'}
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Total Pool:</strong> 12,450 ALGO • <strong>Bets:</strong> 234 • <strong>Closes in:</strong> 23h 45m
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Voting card */}
        <Card>
          <CardHeader>
            <CardTitle>Community Validation</CardTitle>
            <CardDescription>
              Help validate this claim by voting on its accuracy
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Vote distribution */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Valid: {claim.yes_votes} ({Math.round(yesPercentage)}%)
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  Invalid: {claim.no_votes} ({Math.round(100 - yesPercentage)}%)
                </span>
              </div>
              <Progress value={yesPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                Total votes: {totalVotes}
              </p>
            </div>
            
            {/* Voting interface */}
            {claim.status === 'UNVERIFIED' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stake Amount</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[stakeAmount]}
                      onValueChange={(value: number[]) => setStakeAmount(value[0])}
                      min={AppConfig.MIN_STAKE_AMOUNT}
                      max={AppConfig.MAX_STAKE_AMOUNT}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{stakeAmount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Higher stakes earn more rewards if your vote aligns with the consensus
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => handleVote(true)}
                    disabled={isVoting}
                  >
                    {isVoting && selectedVote === true ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <ThumbsUp className="h-4 w-4" />
                    )}
                    Verify as Valid
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleVote(false)}
                    disabled={isVoting}
                  >
                    {isVoting && selectedVote === false ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <ThumbsDown className="h-4 w-4" />
                    )}
                    Mark as Invalid
                  </Button>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connect your wallet to participate in validation and earn rewards
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {claim.status !== 'UNVERIFIED' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This claim has already been validated. The voting period is closed.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function ClaimDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-10 w-32" />
      
      <Card>
        <Skeleton className="aspect-video w-full rounded-t-lg" />
        
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          
          <div className="flex items-center gap-4 mt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}