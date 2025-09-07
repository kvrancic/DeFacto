import { 
  mockClaims, 
  mockClaimsList, 
  mockPendingValidations,
  simulateDelay,
  filterClaims 
} from './mock-data'
import { AppConfig } from '@/config/app.config'
import type {
  ClaimSubmissionRequest,
  ClaimSubmissionResponse,
  ClaimDetailResponse,
  ClaimsListResponse,
  ClaimsQueryParams,
  VoteSubmissionRequest,
  VoteSubmissionResponse,
  PendingValidationsResponse,
  UserProfile
} from '@/types'

// Store for dynamic data
let nextClaimId = 21
const userVotes = new Map<number, boolean>()
const userBalance = 1000

// Mock API implementation
export const mockAPI = {
  // Submit a new claim
  async submitClaim(data: ClaimSubmissionRequest): Promise<ClaimSubmissionResponse> {
    await simulateDelay(AppConfig.MOCK_DELAY)
    
    // Simulate validation errors randomly (10% chance)
    if (Math.random() < 0.1) {
      throw {
        response: {
          status: 400,
          data: {
            detail: 'Validation error',
            field_errors: {
              title: ['Title must be unique'],
            }
          }
        }
      }
    }
    
    const response: ClaimSubmissionResponse = {
      claim_id: nextClaimId++,
      ipfs_hash: `Qm${Math.random().toString(36).substring(2, 15)}`,
      tx_id: `0x${Math.random().toString(16).substring(2, 18)}`,
      status: 'UNVERIFIED',
      submitted_at: new Date().toISOString()
    }
    
    // Add the new claim to our mock data
    const newClaim: ClaimDetailResponse = {
      ...response,
      title: data.title,
      content: data.content,
      category: data.category,
      evidence_urls: data.evidence_urls || [],
      yes_votes: 0,
      no_votes: 0,
      author: 'Current User'
    }
    
    mockClaims.push(newClaim)
    mockClaimsList.push({
      claim_id: newClaim.claim_id,
      title: newClaim.title,
      category: newClaim.category,
      status: newClaim.status,
      submitted_at: newClaim.submitted_at,
      preview: newClaim.content.substring(0, 200) + '...',
      vote_count: 0,
      yes_votes: 0,
      no_votes: 0,
      author: newClaim.author
    })
    
    return response
  },
  
  // Get single claim
  async getClaim(claimId: number): Promise<ClaimDetailResponse> {
    await simulateDelay(AppConfig.MOCK_DELAY)
    
    const claim = mockClaims.find(c => c.claim_id === claimId)
    
    if (!claim) {
      throw {
        response: {
          status: 404,
          data: {
            detail: `Claim with id ${claimId} not found`
          }
        }
      }
    }
    
    return { ...claim }
  },
  
  // Get list of claims
  async getClaims(params: ClaimsQueryParams = {}): Promise<ClaimsListResponse> {
    await simulateDelay(AppConfig.MOCK_DELAY)
    
    const {
      limit = AppConfig.DEFAULT_PAGE_SIZE,
      offset = 0,
      category,
      status,
      sort = 'newest'
    } = params
    
    // Filter claims
    let filtered = filterClaims(mockClaimsList, { category, status, sort })
    
    // Paginate
    const paginated = filtered.slice(offset, offset + limit)
    
    return {
      claims: paginated,
      total: filtered.length,
      has_more: offset + limit < filtered.length
    }
  },
  
  // Submit vote
  async submitVote(data: VoteSubmissionRequest): Promise<VoteSubmissionResponse> {
    await simulateDelay(AppConfig.MOCK_DELAY * 1.5) // Voting takes longer
    
    // Check if user already voted
    if (userVotes.has(data.claim_id)) {
      throw {
        response: {
          status: 400,
          data: {
            detail: 'You have already voted on this claim'
          }
        }
      }
    }
    
    // Check balance
    if (data.stake_amount > userBalance) {
      throw {
        response: {
          status: 400,
          data: {
            detail: 'Insufficient balance for stake amount'
          }
        }
      }
    }
    
    // Simulate random transaction failures (5% chance)
    if (Math.random() < 0.05) {
      throw {
        response: {
          status: 500,
          data: {
            detail: 'Transaction failed. Please try again.'
          }
        }
      }
    }
    
    // Update vote counts in mock data
    const claim = mockClaims.find(c => c.claim_id === data.claim_id)
    if (claim) {
      if (data.vote) {
        claim.yes_votes += 1
      } else {
        claim.no_votes += 1
      }
    }
    
    // Record user vote
    userVotes.set(data.claim_id, data.vote)
    
    return {
      status: 'vote_submitted',
      tx_id: `0x${Math.random().toString(16).substring(2, 18)}`,
      new_balance: userBalance - data.stake_amount
    }
  },
  
  // Get pending validations
  async getPendingValidations(): Promise<PendingValidationsResponse> {
    await simulateDelay(AppConfig.MOCK_DELAY)
    
    // Filter out claims user has already voted on
    const available = mockPendingValidations.map(v => ({
      ...v,
      user_can_vote: !userVotes.has(v.claim_id),
      // Decrease time remaining to simulate countdown
      time_remaining: Math.max(0, v.time_remaining - Math.floor(Math.random() * 60))
    }))
    
    return {
      validations: available,
      user_balance: userBalance
    }
  },
  
  // Get user profile
  async getUserProfile(address: string): Promise<UserProfile> {
    await simulateDelay(AppConfig.MOCK_DELAY)
    
    return {
      address,
      reputation_score: 850,
      claims_submitted: 12,
      validations_participated: 45,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
    }
  },
  
  // Search claims
  async searchClaims(query: string): Promise<ClaimsListResponse> {
    await simulateDelay(AppConfig.MOCK_DELAY)
    
    const searchLower = query.toLowerCase()
    const results = mockClaimsList.filter(claim => 
      claim.title.toLowerCase().includes(searchLower) ||
      claim.preview?.toLowerCase().includes(searchLower) ||
      claim.category.toLowerCase().includes(searchLower)
    )
    
    return {
      claims: results.slice(0, 20),
      total: results.length,
      has_more: results.length > 20
    }
  }
}

// Helper to simulate WebSocket updates
export const mockWebSocketUpdates = {
  subscribeToClaimUpdates(claimId: number, callback: (update: any) => void) {
    const interval = setInterval(() => {
      const claim = mockClaims.find(c => c.claim_id === claimId)
      if (claim && Math.random() < 0.3) { // 30% chance of update
        // Simulate vote changes
        if (Math.random() < 0.5) {
          claim.yes_votes += Math.floor(Math.random() * 5)
        } else {
          claim.no_votes += Math.floor(Math.random() * 5)
        }
        
        callback({
          type: 'vote_update',
          claim_id: claimId,
          yes_votes: claim.yes_votes,
          no_votes: claim.no_votes
        })
      }
    }, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  },
  
  subscribeToNewClaims(callback: (claim: any) => void) {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of new claim
        const randomClaim = mockClaimsList[Math.floor(Math.random() * mockClaimsList.length)]
        callback({
          type: 'new_claim',
          claim: {
            ...randomClaim,
            claim_id: nextClaimId++,
            submitted_at: new Date().toISOString()
          }
        })
      }
    }, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }
}