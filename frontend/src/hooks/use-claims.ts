'use client'

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient, { handleApiError } from '@/lib/api/api-client'
import type {
  ClaimSubmissionRequest,
  ClaimsQueryParams,
  VoteSubmissionRequest
} from '@/types'

// Hook for fetching a single claim
export function useClaimQuery(claimId: number) {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => apiClient.getClaim(claimId),
    enabled: !!claimId && claimId > 0,
  })
}

// Hook for fetching claims list with infinite scroll
export function useInfiniteClaimsQuery(filters: ClaimsQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: ['claims', filters],
    queryFn: ({ pageParam = 0 }) => 
      apiClient.getClaims({ 
        ...filters, 
        offset: pageParam,
        limit: filters.limit || 10 
      }),
    getNextPageParam: (lastPage, pages) => {
      const nextOffset = pages.length * (filters.limit || 10)
      return lastPage.has_more ? nextOffset : undefined
    },
    initialPageParam: 0,
  })
}

// Hook for fetching claims list (regular pagination)
export function useClaimsQuery(params: ClaimsQueryParams = {}) {
  return useQuery({
    queryKey: ['claims', params],
    queryFn: () => apiClient.getClaims(params),
  })
}

// Hook for submitting a new claim
export function useSubmitClaim() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: ClaimSubmissionRequest) => apiClient.submitClaim(data),
    onSuccess: (data) => {
      // Invalidate claims list to show new claim
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      toast.success(`Claim submitted successfully! ID: ${data.claim_id}`)
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast.error(message)
    }
  })
}

// Hook for submitting a vote
export function useSubmitVote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: VoteSubmissionRequest) => apiClient.submitVote(data),
    onSuccess: (data, variables) => {
      // Invalidate claim to refresh vote counts
      queryClient.invalidateQueries({ queryKey: ['claim', variables.claim_id] })
      queryClient.invalidateQueries({ queryKey: ['validations', 'pending'] })
      
      toast.success('Vote submitted successfully!')
      
      if (data.new_balance !== undefined) {
        // Update user balance in any relevant queries
        queryClient.setQueryData(['user', 'balance'], data.new_balance)
      }
    },
    onError: (error) => {
      const message = handleApiError(error)
      toast.error(message)
    }
  })
}

// Hook for fetching pending validations
export function usePendingValidations() {
  return useQuery({
    queryKey: ['validations', 'pending'],
    queryFn: () => apiClient.getPendingValidations(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook for searching claims
export function useSearchClaims(query: string, enabled = true) {
  return useQuery({
    queryKey: ['claims', 'search', query],
    queryFn: () => apiClient.searchClaims(query),
    enabled: enabled && query.length > 2,
  })
}

// Hook for user profile
export function useUserProfile(address: string) {
  return useQuery({
    queryKey: ['user', 'profile', address],
    queryFn: () => apiClient.getUserProfile(address),
    enabled: !!address,
  })
}