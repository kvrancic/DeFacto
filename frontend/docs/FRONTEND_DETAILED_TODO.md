# Frontend Developer - Detailed Implementation TODO

## ⚠️ IMPORTANT: Mock Data Implementation Strategy

**IMPLEMENT EVERYTHING FULLY NOW WITH MOCK DATA**
- Write ALL components, pages, and features completely
- Use mock data that closely resembles real API responses which will be provided by the backend developer
- Create a SINGLE configuration flag: `USE_REAL_API: false` in a main config file
- When backend is ready, just change this ONE flag to `true`
- No need to rewrite any code - everything switches automatically and works with real data 

```typescript
// src/config/app.config.ts
export const AppConfig = {
  USE_REAL_API: false,  // 🚨 CHANGE THIS TO true WHEN BACKEND IS READY
  // ... other config
}
```

## Design Philosophy
Based on the provided mockups, we're building a **minimalist news/content platform** with:
- Clean, card-based layouts
- Dark mode support (as seen in the first mockup)
- Mobile-first responsive design
- Focus on readability and content hierarchy
- Smooth transitions and micro-interactions

---

## 🎨 Design System Setup

### Step 1: Color Palette & Theme
```scss
// colors.scss
:root {
  // Light Theme
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --bg-card: #FFFFFF;
  --text-primary: #1A1A1A;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --accent: #FF4B4B; // Red accent from mockups
  --accent-secondary: #FFC107; // Yellow accent
  --border: #E5E7EB;
  --shadow: rgba(0, 0, 0, 0.05);
  
  // Dark Theme
  --dark-bg-primary: #0F0F0F;
  --dark-bg-secondary: #1A1A1A;
  --dark-bg-card: #252525;
  --dark-text-primary: #FFFFFF;
  --dark-text-secondary: #A0A0A0;
  --dark-border: #333333;
}

// Status Colors (for claim verification)
--status-verified: #10B981;
--status-false: #EF4444;
--status-disputed: #F59E0B;
--status-unverified: #6B7280;
```

### Step 2: Typography System
```scss
// typography.scss
// Using system fonts for performance
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;

// Type Scale
--text-xs: 0.75rem;    // 12px
--text-sm: 0.875rem;   // 14px
--text-base: 1rem;     // 16px
--text-lg: 1.125rem;   // 18px
--text-xl: 1.25rem;    // 20px
--text-2xl: 1.5rem;    // 24px
--text-3xl: 1.875rem;  // 30px
--text-4xl: 2.25rem;   // 36px
```

### Step 3: Spacing & Layout Grid
```scss
// spacing.scss
--space-1: 0.25rem;  // 4px
--space-2: 0.5rem;   // 8px
--space-3: 0.75rem;  // 12px
--space-4: 1rem;     // 16px
--space-5: 1.25rem;  // 20px
--space-6: 1.5rem;   // 24px
--space-8: 2rem;     // 32px
--space-10: 2.5rem;  // 40px
--space-12: 3rem;    // 48px

// Breakpoints
--mobile: 375px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

---

## 📱 Component Development TODO

### Phase 1: Core Layout Components

#### TODO 1.1: Create App Shell
**File:** `components/layout/AppShell.tsx`
```typescript
Features to implement:
- [ ] Mobile-first responsive container
- [ ] Bottom navigation for mobile (like mockup #3)
- [ ] Side navigation for desktop
- [ ] Dark mode toggle in header
- [ ] Search overlay component
- [ ] Notification badge system

Test after completion:
- Navigate between all routes
- Toggle dark mode
- Test on mobile (375px), tablet (768px), desktop (1024px)
```

#### TODO 1.2: Navigation Components
**File:** `components/navigation/BottomNav.tsx` (Mobile)
```typescript
Features:
- [ ] Home, Discover, Save, Profile icons
- [ ] Active state indicator
- [ ] Smooth transitions between states
- [ ] Badge for notifications

Visual: Similar to mockup #3 bottom navigation
```

**File:** `components/navigation/TopNav.tsx`
```typescript
Features:
- [ ] Logo/Brand on left
- [ ] Search icon (opens overlay)
- [ ] User avatar with dropdown
- [ ] Notification bell with count
```

#### TODO 1.3: Card Components
**File:** `components/cards/ClaimCard.tsx`
```typescript
Props needed:
- title: string
- content: string (preview)
- category: string
- status: 'VERIFIED' | 'FALSE' | 'DISPUTED' | 'UNVERIFIED'
- imageUrl?: string
- author?: string
- timestamp: string
- votes: { yes: number, no: number }

Features:
- [ ] Image thumbnail (if available)
- [ ] Category chip with color coding
- [ ] Status indicator (colored dot or badge)
- [ ] Vote count display
- [ ] Time ago display (e.g., "3 hours ago")
- [ ] Hover state with subtle shadow
- [ ] Click to navigate to detail
```

---

### Phase 2: Page Implementation

#### TODO 2.1: Home/Feed Page
**File:** `app/page.tsx`
```typescript
Sections to implement:
- [ ] Hero welcome section (like mockup #1 - personalized greeting)
- [ ] Category filter chips (Yesterday, VOX, Tech, Politics)
- [ ] Tab switcher (Top News | Originals | My Feed)
- [ ] Claim cards grid/list
- [ ] Infinite scroll or pagination
- [ ] Pull-to-refresh on mobile

Layout:
- Mobile: Single column with cards
- Tablet: 2-column grid
- Desktop: 3-column grid with sidebar
```

#### TODO 2.2: Claim Detail Page
**File:** `app/claims/[id]/page.tsx`
```typescript
Features:
- [ ] Full claim title (large typography)
- [ ] Author/source information
- [ ] Submission timestamp
- [ ] Full content with rich text support
- [ ] Evidence links section
- [ ] Status badge (prominent display)
- [ ] Voting interface (if eligible)
- [ ] Vote distribution visualization
- [ ] Share buttons
- [ ] Report/flag option

Mobile specific:
- [ ] Sticky header with back button
- [ ] Bottom voting bar (fixed position)
```

#### TODO 2.3: Submit Claim Page
**File:** `app/submit/page.tsx`
```typescript
Multi-step form:
- [ ] Step indicator (progress bar or dots)
- [ ] Step 1: Title & Content
  - Title input with character count
  - Rich text editor for content
  - Auto-save to localStorage
- [ ] Step 2: Category Selection
  - Radio buttons with icons
  - Category descriptions
- [ ] Step 3: Evidence (optional)
  - URL input fields
  - Add/remove evidence links
  - URL validation
- [ ] Step 4: Review & Submit
  - Preview card showing how it will look
  - Edit buttons for each section
  - Submit button with loading state

Features:
- [ ] Form validation with error messages
- [ ] Progress saved in localStorage
- [ ] Loading states during submission
- [ ] Success animation/redirect
```

#### TODO 2.4: Discover/Browse Page
**File:** `app/discover/page.tsx`
```typescript
Features:
- [ ] Search bar (prominent)
- [ ] Trending claims section
- [ ] Category grid (visual cards)
- [ ] Filter sidebar (desktop) / modal (mobile)
  - Category filter
  - Status filter
  - Date range
  - Sort options
- [ ] Results grid with lazy loading
```

#### TODO 2.5: Profile/Dashboard Page
**File:** `app/profile/page.tsx`
```typescript
Sections:
- [ ] User stats card
  - Reputation score
  - Claims submitted
  - Validations participated
- [ ] My Claims tab
- [ ] My Validations tab
- [ ] Saved Claims tab
- [ ] Settings/preferences
```

---

### Phase 3: Interactive Features

#### TODO 3.1: Wallet Integration
**File:** `components/wallet/WalletConnect.tsx`
```typescript
Features:
- [ ] Connect button with wallet options
- [ ] Connection status indicator
- [ ] Address display (truncated)
- [ ] Balance display
- [ ] Disconnect option
- [ ] Auto-reconnect on refresh
```

#### TODO 3.2: Voting Interface
**File:** `components/voting/VotePanel.tsx`
```typescript
Features:
- [ ] Vote buttons (Verify/Dispute)
- [ ] Stake amount selector (slider or input)
- [ ] Current vote distribution bar
- [ ] Time remaining countdown
- [ ] Confirmation modal
- [ ] Transaction status feedback
```

#### TODO 3.3: Search Functionality
**File:** `components/search/SearchOverlay.tsx`
```typescript
Features:
- [ ] Full-screen overlay (mobile)
- [ ] Instant search results
- [ ] Search history
- [ ] Popular searches
- [ ] Category filters in search
- [ ] Clear search button
```

---

### Phase 4: State Management & API Integration

#### TODO 4.1: API Client Setup
**File:** `lib/api/client.ts`
```typescript
class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  // Implement these methods:
  - [ ] submitClaim(data: ClaimSubmission): Promise<ClaimResponse>
  - [ ] getClaim(id: number): Promise<ClaimDetail>
  - [ ] getClaims(params: QueryParams): Promise<ClaimList>
  - [ ] submitVote(data: VoteSubmission): Promise<VoteResponse>
  - [ ] getPendingValidations(): Promise<ValidationList>
  
  // Add interceptors for:
  - [ ] Auth token injection
  - [ ] Error handling
  - [ ] Loading states
  - [ ] Retry logic
}
```

#### TODO 4.2: React Query Setup
**File:** `lib/hooks/useClaimsQuery.ts`
```typescript
Hooks to implement:
- [ ] useClaimsQuery (list with filters)
- [ ] useClaimQuery (single claim)
- [ ] useSubmitClaim (mutation)
- [ ] useVoteMutation
- [ ] useUserProfile
```

#### TODO 4.3: Global State (Zustand)
**File:** `lib/store/appStore.ts`
```typescript
State slices:
- [ ] User state (wallet, profile, preferences)
- [ ] UI state (theme, modals, notifications)
- [ ] Filter state (categories, sorting)
- [ ] Form state (multi-step form progress)
```

---

### Phase 5: Polish & Optimizations

#### TODO 5.1: Loading States
```typescript
Components needed:
- [ ] Skeleton loaders for cards
- [ ] Shimmer effects
- [ ] Progress indicators
- [ ] Spinner variations
```

#### TODO 5.2: Error Boundaries
```typescript
- [ ] Global error boundary
- [ ] Page-level error boundaries
- [ ] Friendly error messages
- [ ] Retry buttons
```

#### TODO 5.3: Animations
```typescript
Using Framer Motion:
- [ ] Page transitions
- [ ] Card hover effects
- [ ] Modal animations
- [ ] Success/error feedback
- [ ] Scroll-triggered animations
```

#### TODO 5.4: Performance
```typescript
- [ ] Image optimization with next/image
- [ ] Code splitting
- [ ] Bundle size optimization
- [ ] Lighthouse score > 90
- [ ] First contentful paint < 1.5s
```

---

## 🧪 Testing Checklist

### After Each Component:
```bash
# Component tests
npm run test:component [component-name]

# Visual regression
npm run test:visual

# Accessibility
npm run test:a11y
```

### Integration Tests:
```typescript
// Test these user flows:
- [ ] Complete claim submission flow
- [ ] Browse and filter claims
- [ ] Vote on a claim
- [ ] Connect wallet
- [ ] Search for claims
- [ ] Dark mode toggle
```

### Responsive Testing:
```
Breakpoints to test:
- [ ] 375px (iPhone SE)
- [ ] 390px (iPhone 12)
- [ ] 768px (iPad)
- [ ] 1024px (Desktop)
- [ ] 1440px (Large desktop)
```

---

## 📋 Mobile-First Implementation Order

1. **Week 1: Foundation**
   - [ ] Set up Next.js with TypeScript
   - [ ] Configure Tailwind with custom theme
   - [ ] Create design system components
   - [ ] Implement responsive layout shell
   - [ ] Set up routing

2. **Week 2: Core Features**
   - [ ] Home page with claim cards
   - [ ] Claim detail page
   - [ ] Submit claim form
   - [ ] API integration

3. **Week 3: Interactive Features**
   - [ ] Wallet connection
   - [ ] Voting interface
   - [ ] Search functionality
   - [ ] User profile

4. **Week 4: Polish**
   - [ ] Loading states
   - [ ] Error handling
   - [ ] Animations
   - [ ] Performance optimization
   - [ ] Final testing

---

## 🎯 Success Metrics

Your frontend is complete when:
- [ ] All pages render correctly on mobile and desktop
- [ ] API integration works for all endpoints
- [ ] Wallet connection functional
- [ ] Forms validate and submit correctly
- [ ] Search returns results
- [ ] Dark mode works throughout
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Accessible (WCAG 2.1 AA compliant)
- [ ] Works offline (PWA features)

---

## 💡 Design Notes from Mockups

Based on your inspiration:
1. **Clean cards** with subtle shadows
2. **Category chips** with colored backgrounds
3. **Time-based organization** (Yesterday, Today, etc.)
4. **User personalization** (Welcome back, Sebastian)
5. **Visual hierarchy** with typography
6. **Bottom navigation** for mobile
7. **Dark mode** as primary theme option
8. **Image-forward** content presentation

Remember: Start with mobile, enhance for desktop. Every feature should work perfectly on a phone first!