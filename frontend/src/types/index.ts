import type { Category, ClaimStatus } from '@/config/app.config'

export type { Category, ClaimStatus } from '@/config/app.config'

// Claim types
export interface ClaimSubmissionRequest {
  title: string
  content: string
  category: Category
  evidence_urls?: string[]
}

export interface ClaimSubmissionResponse {
  claim_id: number
  ipfs_hash: string
  tx_id: string
  status: ClaimStatus
  submitted_at: string // ISO 8601
}

export interface ClaimDetailResponse {
  claim_id: number
  title: string
  content: string
  category: Category
  status: ClaimStatus
  ipfs_hash: string
  evidence_urls: string[]
  yes_votes: number
  no_votes: number
  submitted_at: string
  author?: string
  imageUrl?: string
  supportDestination?: string
}

export interface ClaimListItem {
  claim_id: number
  title: string
  category: Category
  status: ClaimStatus
  submitted_at: string
  preview?: string
  vote_count?: number
  yes_votes: number
  no_votes: number
  author?: string
  imageUrl?: string
}

export interface ClaimsListResponse {
  claims: ClaimListItem[]
  total: number
  has_more: boolean
}

export interface ClaimsQueryParams {
  limit?: number
  offset?: number
  category?: Category
  status?: ClaimStatus
  sort?: 'newest' | 'oldest' | 'most_votes'
}

// Voting types
export interface VoteSubmissionRequest {
  claim_id: number
  vote: boolean // true = valid, false = invalid
  stake_amount: number
}

export interface VoteSubmissionResponse {
  status: 'vote_submitted'
  tx_id: string
  new_balance?: number
}

export interface PendingValidation {
  claim_id: number
  title: string
  category: Category
  time_remaining: number // Seconds
  current_votes: {
    yes: number
    no: number
    total_stake: number
  }
  user_can_vote: boolean
}

export interface PendingValidationsResponse {
  validations: PendingValidation[]
  user_balance?: number
}

// User types
export interface UserProfile {
  address: string
  reputation_score: number
  claims_submitted: number
  validations_participated: number
  created_at: string
}

// Error types
export interface ErrorResponse {
  detail: string
  code?: string
  field_errors?: Record<string, string[]>
}