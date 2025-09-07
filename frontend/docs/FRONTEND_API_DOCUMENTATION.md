# Frontend API Documentation

## ⚠️ IMPORTANT: Mock-First Development Strategy

**ALL API CALLS SHOULD BE FULLY IMPLEMENTED NOW WITH MOCK DATA**

The frontend should be 100% functional without the backend by using mock data, but ready for the real API. When the backend is ready, you will only need to change ONE configuration flag:

```typescript
// src/config/app.config.ts
export const AppConfig = {
  USE_REAL_API: false,  // 🚨 CHANGE TO true WHEN BACKEND IS READY
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
}
```

**Implementation Requirements:**
1. Create a complete mock API layer that returns realistic data
2. Mock API should simulate delays (300-500ms) to mimic network latency
3. Mock API should handle all error cases (404, 400, 500, etc.)
4. Use the same types/interfaces for both mock and real API
5. API client should automatically switch between mock and real based on config

## Base Configuration

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ALGO_NETWORK=localnet
```

## API Client Setup

```typescript
// lib/api/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Endpoint Documentation

### 1. Submit Claim

**Endpoint:** `POST /claims/submit`

```typescript
// Types
interface ClaimSubmissionRequest {
  title: string;          // Min: 10, Max: 200 characters
  content: string;        // Min: 50, Max: 5000 characters
  category: 'news' | 'science' | 'politics' | 'health' | 'technology';
  evidence_urls?: string[];  // Optional, max 10 URLs
}

interface ClaimSubmissionResponse {
  claim_id: number;
  ipfs_hash: string;
  tx_id: string;
  status: 'UNVERIFIED';
  submitted_at: string;   // ISO 8601
}

// Usage Example
async function submitClaim(data: ClaimSubmissionRequest): Promise<ClaimSubmissionResponse> {
  try {
    const response = await apiClient.post('/claims/submit', data);
    return response.data;
  } catch (error) {
    // Handle errors
    if (error.response?.status === 400) {
      throw new Error('Invalid claim data');
    }
    throw error;
  }
}

// React Hook Usage
const useSubmitClaim = () => {
  return useMutation({
    mutationFn: submitClaim,
    onSuccess: (data) => {
      toast.success(`Claim submitted! ID: ${data.claim_id}`);
      router.push(`/claims/${data.claim_id}`);
    },
    onError: (error) => {
      toast.error('Failed to submit claim');
    }
  });
};
```

---

### 2. Get Single Claim

**Endpoint:** `GET /claims/{claim_id}`

```typescript
// Types
interface ClaimDetailResponse {
  claim_id: number;
  title: string;
  content: string;
  category: string;
  status: 'UNVERIFIED' | 'VERIFIED' | 'FALSE' | 'DISPUTED';
  ipfs_hash: string;
  evidence_urls: string[];
  yes_votes: number;
  no_votes: number;
  submitted_at: string;
}

// Usage Example
async function getClaim(claimId: number): Promise<ClaimDetailResponse> {
  const response = await apiClient.get(`/claims/${claimId}`);
  return response.data;
}

// React Hook Usage
const useClaimQuery = (claimId: number) => {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => getClaim(claimId),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!claimId,
  });
};

// Component Usage
function ClaimDetailPage({ params }: { params: { id: string } }) {
  const { data: claim, isLoading, error } = useClaimQuery(Number(params.id));
  
  if (isLoading) return <ClaimSkeleton />;
  if (error) return <ErrorMessage />;
  if (!claim) return <NotFound />;
  
  return <ClaimDetail claim={claim} />;
}
```

---

### 3. List Claims

**Endpoint:** `GET /claims`

```typescript
// Types
interface ClaimsQueryParams {
  limit?: number;      // Default: 10, Max: 100
  offset?: number;     // Default: 0
  category?: string;   // Filter by category
  status?: string;     // Filter by status
  sort?: 'newest' | 'oldest' | 'most_votes';
}

interface ClaimListItem {
  claim_id: number;
  title: string;
  category: string;
  status: string;
  submitted_at: string;
  preview?: string;    // First 200 chars of content
  vote_count?: number;
}

interface ClaimsListResponse {
  claims: ClaimListItem[];
  total: number;
  has_more: boolean;
}

// Usage Example
async function getClaims(params: ClaimsQueryParams = {}): Promise<ClaimsListResponse> {
  const response = await apiClient.get('/claims', { params });
  return response.data;
}

// React Hook with Infinite Query
const useInfiniteClaimsQuery = (filters: ClaimsQueryParams) => {
  return useInfiniteQuery({
    queryKey: ['claims', filters],
    queryFn: ({ pageParam = 0 }) => getClaims({ 
      ...filters, 
      offset: pageParam,
      limit: filters.limit || 10 
    }),
    getNextPageParam: (lastPage, pages) => {
      const nextOffset = pages.length * (filters.limit || 10);
      return lastPage.has_more ? nextOffset : undefined;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

// Component Usage with Infinite Scroll
function ClaimsList() {
  const [filters, setFilters] = useState<ClaimsQueryParams>({
    category: undefined,
    status: undefined,
    sort: 'newest'
  });
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteClaimsQuery(filters);
  
  // Infinite scroll trigger
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });
  
  return (
    <div>
      {data?.pages.map((page) =>
        page.claims.map((claim) => (
          <ClaimCard key={claim.claim_id} claim={claim} />
        ))
      )}
      <div ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
}
```

---

### 4. Submit Vote

**Endpoint:** `POST /validations/vote`

```typescript
// Types
interface VoteSubmissionRequest {
  claim_id: number;
  vote: boolean;         // true = valid, false = invalid
  stake_amount: number;  // Min: 10, Max: 100
}

interface VoteSubmissionResponse {
  status: 'vote_submitted';
  tx_id: string;
  new_balance?: number;  // Updated reputation balance
}

// Usage Example
async function submitVote(data: VoteSubmissionRequest): Promise<VoteSubmissionResponse> {
  const response = await apiClient.post('/validations/vote', data);
  return response.data;
}

// React Hook Usage
const useSubmitVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitVote,
    onSuccess: (data, variables) => {
      // Invalidate claim query to refresh vote counts
      queryClient.invalidateQueries(['claim', variables.claim_id]);
      queryClient.invalidateQueries(['validations', 'pending']);
      toast.success('Vote submitted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to submit vote';
      toast.error(message);
    }
  });
};

// Component Usage
function VotingPanel({ claimId }: { claimId: number }) {
  const [stakeAmount, setStakeAmount] = useState(10);
  const { mutate: submitVote, isLoading } = useSubmitVote();
  
  const handleVote = (vote: boolean) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    submitVote({
      claim_id: claimId,
      vote,
      stake_amount: stakeAmount
    });
  };
  
  return (
    <div className="voting-panel">
      <StakeSelector value={stakeAmount} onChange={setStakeAmount} />
      <button 
        onClick={() => handleVote(true)}
        disabled={isLoading}
      >
        Verify ✓
      </button>
      <button 
        onClick={() => handleVote(false)}
        disabled={isLoading}
      >
        Dispute ✗
      </button>
    </div>
  );
}
```

---

### 5. Get Pending Validations

**Endpoint:** `GET /validations/pending`

```typescript
// Types
interface PendingValidation {
  claim_id: number;
  title: string;
  category: string;
  time_remaining: number;  // Seconds until voting closes
  current_votes: {
    yes: number;
    no: number;
    total_stake: number;
  };
  user_can_vote: boolean;
}

interface PendingValidationsResponse {
  validations: PendingValidation[];
  user_balance?: number;  // Current reputation balance
}

// Usage Example
async function getPendingValidations(): Promise<PendingValidationsResponse> {
  const response = await apiClient.get('/validations/pending');
  return response.data;
}

// React Hook Usage
const usePendingValidations = () => {
  return useQuery({
    queryKey: ['validations', 'pending'],
    queryFn: getPendingValidations,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  });
};
```

---

## Error Handling

```typescript
// Common Error Response Format
interface ErrorResponse {
  detail: string;
  code?: string;
  field_errors?: Record<string, string[]>;
}

// Error Handler Utility
export function handleApiError(error: any): string {
  if (error.response) {
    const data = error.response.data as ErrorResponse;
    
    // Field-specific errors
    if (data.field_errors) {
      const errors = Object.entries(data.field_errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n');
      return errors;
    }
    
    // General error message
    return data.detail || 'An error occurred';
  }
  
  if (error.request) {
    return 'Network error - please check your connection';
  }
  
  return error.message || 'An unexpected error occurred';
}
```

---

## Request Optimizations

```typescript
// Request Deduplication
const requestCache = new Map();

export async function deduplicatedRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }
  
  const promise = requestFn()
    .finally(() => {
      setTimeout(() => requestCache.delete(key), 100);
    });
  
  requestCache.set(key, promise);
  return promise;
}

// Retry Logic
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}
```

---

## WebSocket Connection (Optional - for real-time updates)

```typescript
// lib/api/websocket.ts
class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  
  connect() {
    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') + '/ws';
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.reconnect();
    };
  }
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }
  
  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  private reconnect() {
    setTimeout(() => this.connect(), 5000);
  }
}

// Usage in components
const ws = new WebSocketClient();
ws.connect();

// Listen for new claims
ws.on('new_claim', (claim) => {
  queryClient.invalidateQueries(['claims']);
  toast.info('New claim submitted!');
});

// Listen for vote updates
ws.on('vote_update', (data) => {
  queryClient.setQueryData(['claim', data.claim_id], (old) => ({
    ...old,
    yes_votes: data.yes_votes,
    no_votes: data.no_votes
  }));
});
```

---

## Testing API Calls

```typescript
// __tests__/api/claims.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClaimQuery } from '@/hooks/useClaimQuery';

describe('API Integration Tests', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  test('should fetch claim successfully', async () => {
    const { result } = renderHook(
      () => useClaimQuery(1),
      { wrapper }
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toHaveProperty('claim_id', 1);
    expect(result.current.data).toHaveProperty('title');
    expect(result.current.data).toHaveProperty('status');
  });
});
```

---

## Environment-Specific Configurations

```typescript
// lib/api/config.ts
const API_CONFIGS = {
  development: {
    baseURL: 'http://localhost:8000',
    timeout: 10000,
  },
  staging: {
    baseURL: 'https://staging-api.defacto.com',
    timeout: 15000,
  },
  production: {
    baseURL: 'https://api.defacto.com',
    timeout: 10000,
  },
};

export const getApiConfig = () => {
  const env = process.env.NEXT_PUBLIC_ENV || 'development';
  return API_CONFIGS[env];
};
```

This documentation provides everything the backend developer needs to understand what the frontend expects, and everything you need to implement the API integration correctly!