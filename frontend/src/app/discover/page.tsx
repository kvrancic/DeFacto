'use client'

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'

export default function DiscoverPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Discover Claims
            </CardTitle>
            <CardDescription>
              Search and explore claims across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced search and filtering features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}