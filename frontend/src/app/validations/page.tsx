'use client'

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileCheck, Clock } from 'lucide-react'
import { usePendingValidations } from '@/hooks/use-claims'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ValidationsPage() {
  const { data, isLoading } = usePendingValidations()
  
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6" />
            Pending Validations
          </h1>
          <p className="text-muted-foreground mt-2">
            Help validate claims and earn rewards for accurate assessments
          </p>
        </div>
        
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            </CardContent>
          </Card>
        ) : data?.validations.length ? (
          <div className="space-y-4">
            {data.validations.map((validation) => {
              const totalVotes = validation.current_votes.yes + validation.current_votes.no
              const yesPercentage = totalVotes > 0 
                ? (validation.current_votes.yes / totalVotes) * 100 
                : 50
              
              return (
                <Card key={validation.claim_id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{validation.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{validation.category}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {Math.floor(validation.time_remaining / 60)} minutes remaining
                          </div>
                        </div>
                      </div>
                      {validation.user_can_vote ? (
                        <Link href={`/claims/${validation.claim_id}`}>
                          <Button size="sm">Vote Now</Button>
                        </Link>
                      ) : (
                        <Badge variant="outline">Already Voted</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Yes: {validation.current_votes.yes}</span>
                        <span>No: {validation.current_votes.no}</span>
                      </div>
                      <Progress value={yesPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Total stake: {validation.current_votes.total_stake} tokens
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {data.user_balance !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.user_balance} tokens</p>
                  <p className="text-sm text-muted-foreground">
                    Available for staking on validations
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Validations</h3>
              <p className="text-muted-foreground">
                Check back later for new claims that need validation
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}