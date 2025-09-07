import axios, { AxiosInstance } from 'axios'
import { AppConfig } from '@/config/app.config'
import { mockAPI } from '../mock/mock-api'
import type {
  ClaimSubmissionRequest,
  ClaimSubmissionResponse,
  ClaimDetailResponse,
  ClaimsListResponse,
  ClaimsQueryParams,
  VoteSubmissionRequest,
  VoteSubmissionResponse,
  PendingValidationsResponse,
  UserProfile,
  ErrorResponse
} from '@/types'

// Create axios instance for real API
const axiosInstance: AxiosInstance = axios.create({
  baseURL: AppConfig.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor for auth token
axiosInstance.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Error handler utility
export function handleApiError(error: any): string {
  if (error.response) {
    const data = error.response.data as ErrorResponse
    
    // Field-specific errors
    if (data.field_errors) {
      const errors = Object.entries(data.field_errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n')
      return errors
    }
    
    // General error message
    return data.detail || 'An error occurred'
  }
  
  if (error.request) {
    return 'Network error - please check your connection'
  }
  
  return error.message || 'An unexpected error occurred'
}

// Main API client class
class APIClient {
  private useMockAPI(): boolean {
    return !AppConfig.USE_REAL_API
  }
  
  // Submit a new claim
  async submitClaim(data: ClaimSubmissionRequest): Promise<ClaimSubmissionResponse> {
    if (this.useMockAPI()) {
      return mockAPI.submitClaim(data)
    }
    
    const response = await axiosInstance.post('/claims/submit', data)
    return response.data
  }
  
  // Get single claim
  async getClaim(claimId: number): Promise<ClaimDetailResponse> {
    if (this.useMockAPI()) {
      return mockAPI.getClaim(claimId)
    }
    
    const response = await axiosInstance.get(`/claims/${claimId}`)
    return response.data
  }
  
  // Get list of claims
  async getClaims(params: ClaimsQueryParams = {}): Promise<ClaimsListResponse> {
    if (this.useMockAPI()) {
      return mockAPI.getClaims(params)
    }
    
    const response = await axiosInstance.get('/claims', { params })
    return response.data
  }
  
  // Submit vote
  async submitVote(data: VoteSubmissionRequest): Promise<VoteSubmissionResponse> {
    if (this.useMockAPI()) {
      return mockAPI.submitVote(data)
    }
    
    const response = await axiosInstance.post('/validations/vote', data)
    return response.data
  }
  
  // Get pending validations
  async getPendingValidations(): Promise<PendingValidationsResponse> {
    if (this.useMockAPI()) {
      return mockAPI.getPendingValidations()
    }
    
    const response = await axiosInstance.get('/validations/pending')
    return response.data
  }
  
  // Get user profile
  async getUserProfile(address: string): Promise<UserProfile> {
    if (this.useMockAPI()) {
      return mockAPI.getUserProfile(address)
    }
    
    const response = await axiosInstance.get(`/users/${address}`)
    return response.data
  }
  
  // Search claims
  async searchClaims(query: string): Promise<ClaimsListResponse> {
    if (this.useMockAPI()) {
      return mockAPI.searchClaims(query)
    }
    
    const response = await axiosInstance.get('/claims/search', { 
      params: { q: query } 
    })
    return response.data
  }
  
  // Health check
  async healthCheck(): Promise<{ status: string }> {
    if (this.useMockAPI()) {
      return { status: 'ok (mock)' }
    }
    
    const response = await axiosInstance.get('/health')
    return response.data
  }
}

// Export singleton instance
export const apiClient = new APIClient()

// Export for use in React Query
export default apiClient

// Request deduplication for optimization
const requestCache = new Map()

export async function deduplicatedRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  if (requestCache.has(key)) {
    return requestCache.get(key)
  }
  
  const promise = requestFn()
    .finally(() => {
      setTimeout(() => requestCache.delete(key), 100)
    })
  
  requestCache.set(key, promise)
  return promise
}

// Retry logic for failed requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}