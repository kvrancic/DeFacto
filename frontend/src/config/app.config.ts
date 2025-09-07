export const AppConfig = {
  USE_REAL_API: false, // 🚨 CHANGE TO true WHEN BACKEND IS READY - THAT'S IT!
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  MOCK_DELAY: 500, // Simulate network delay in mock mode (ms)
  APP_NAME: 'DeFacto',
  APP_DESCRIPTION: 'Decentralized Truth Protocol on Algorand',
  
  // Algorand configuration
  ALGO_NETWORK: process.env.NEXT_PUBLIC_ALGO_NETWORK || 'localnet',
  
  // Feature flags
  FEATURES: {
    WALLET_CONNECT: true,
    DARK_MODE: true,
    INFINITE_SCROLL: true,
    REAL_TIME_UPDATES: false, // WebSocket support
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Form limits
  CLAIM_TITLE_MIN: 10,
  CLAIM_TITLE_MAX: 200,
  CLAIM_CONTENT_MIN: 50,
  CLAIM_CONTENT_MAX: 5000,
  MAX_EVIDENCE_URLS: 10,
  
  // Voting
  MIN_STAKE_AMOUNT: 10,
  MAX_STAKE_AMOUNT: 100,
  DEFAULT_STAKE_AMOUNT: 10,
  
  // Categories
  CATEGORIES: [
    { value: 'news', label: 'News', color: '#FF4B4B' },
    { value: 'science', label: 'Science', color: '#4B9BFF' },
    { value: 'politics', label: 'Politics', color: '#9B4BFF' },
    { value: 'health', label: 'Health', color: '#4BFF9B' },
    { value: 'technology', label: 'Technology', color: '#FFD54B' },
  ] as const,
}

export type Category = typeof AppConfig.CATEGORIES[number]['value']
export type ClaimStatus = 'UNVERIFIED' | 'VERIFIED' | 'FALSE' | 'DISPUTED'