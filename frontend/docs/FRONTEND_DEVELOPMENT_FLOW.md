# Frontend Development Flow - Your Step-by-Step Guide

## 🔴 CRITICAL: Build Everything with Mock Data NOW

**DO NOT WAIT FOR THE BACKEND - BUILD THE COMPLETE FRONTEND NOW**

Everything should be fully functional using mock data. When the backend is ready, you will only change ONE line of code:

```typescript
// src/config/app.config.ts
export const AppConfig = {
  USE_REAL_API: false,  // 🚨 CHANGE TO true WHEN BACKEND IS READY - THAT'S IT!
}
```

**Your API client will handle the switch automatically:**
```typescript
// lib/api/api-client.ts
class APIClient {
  async getClaims(params) {
    if (AppConfig.USE_REAL_API) {
      return this.fetchFromRealAPI('/claims', params);
    } else {
      return this.fetchFromMockAPI('claims', params);
    }
  }
}
```

## 📚 Your Development Sequence

### Phase 1: Setup & Understanding (Day 1 Morning)

#### 1. Read Documentation First
```bash
# Read these files in order:
1. FRONTEND_API_DOCUMENTATION.md     # Understand what backend provides
2. FRONTEND_SETUP_SHADCN.md          # Setup your environment
3. FRONTEND_DETAILED_TODO.md         # Your feature roadmap
```

#### 2. Setup Project
```bash
# Follow FRONTEND_SETUP_SHADCN.md exactly
npx create-next-app@latest defacto-frontend --typescript --tailwind --app
cd defacto-frontend
npx shadcn-ui@latest init
# Install all components listed in the setup guide
```

#### 3. Test API Connection
```typescript
// Create test-api.ts to verify backend is working
import axios from 'axios';

async function testAPI() {
  try {
    // Test health endpoint
    const health = await axios.get('http://localhost:8000/health');
    console.log('✅ API is running:', health.data);
    
    // Test getting claims (might be empty)
    const claims = await axios.get('http://localhost:8000/claims');
    console.log('✅ Claims endpoint works:', claims.data);
  } catch (error) {
    console.error('❌ API not responding:', error);
    console.log('Make sure backend is running on port 8000');
  }
}

testAPI();
```

---

### Phase 2: Build Foundation (Day 1 Afternoon)

#### 4. Create Base Layout
```tsx
// Start with mobile layout first!
// src/app/layout.tsx
- Add ThemeProvider for dark mode
- Add MobileNav component
- Setup responsive container
```

#### 5. Build Your First Component
```tsx
// src/components/claims/ClaimCard.tsx
- Copy from FRONTEND_SETUP_SHADCN.md example
- Test with mock data first
- Make it perfect on mobile (375px)
- Then adapt for desktop
```

---

### Phase 3: Core Pages (Day 2)

#### 6. Home Page (Most Important!)
```tsx
// src/app/page.tsx
Priority order:
1. Display list of claim cards
2. Add category filter chips
3. Implement infinite scroll
4. Add loading skeletons
5. Test with mock data first
6. Then connect to real API
```

#### 7. Claim Detail Page
```tsx
// src/app/claims/[id]/page.tsx
Build in this order:
1. Display full claim content
2. Show status badge prominently
3. Add vote count visualization
4. Implement voting buttons (disabled if no wallet)
5. Add share functionality
```

---

### Phase 4: User Input (Day 3)

#### 8. Submit Claim Form
```tsx
// src/app/submit/page.tsx
Build step by step:
1. Create multi-step form UI
2. Add validation for each field
3. Save progress to localStorage
4. Test submission with mock first
5. Connect to real API
6. Handle success/error states
```

---

### Phase 5: API Integration (Day 4)

#### 9. Connect Everything
```typescript
// Follow FRONTEND_API_DOCUMENTATION.md
1. Setup React Query provider
2. Create custom hooks for each endpoint
3. Replace mock data with real API calls
4. Add error boundaries
5. Implement retry logic
```

---

## 🎯 Development Checkpoints

### After Each Component
```bash
# Ask yourself:
✓ Does it work on mobile (375px)?
✓ Does it work on desktop (1024px)?
✓ Does it handle loading state?
✓ Does it handle error state?
✓ Does it handle empty state?
✓ Is it accessible (keyboard navigation)?
✓ Does dark mode work?
```

### Testing Checklist
```bash
# Test on these exact screen sizes:
- iPhone SE: 375px
- iPhone 12: 390px
- iPad: 768px
- Desktop: 1024px
- Wide: 1440px

# Test these interactions:
- Click/tap all buttons
- Submit forms with invalid data
- Disconnect internet and try again
- Toggle dark mode
- Use keyboard only (no mouse)
```

---

## 💡 Pro Tips for Faster Development

### 1. Use Mock Data First
```typescript
// src/lib/mock-data.ts
export const mockClaims = [
  {
    id: 1,
    title: "Test Claim 1",
    content: "This is test content...",
    category: "technology",
    status: "UNVERIFIED",
    yes_votes: 10,
    no_votes: 5,
    submitted_at: new Date().toISOString()
  },
  // Add 10 more for testing pagination
];

// Use this until API is ready
```

### 2. Component Development Order
```
1. Static version with mock data
2. Add interactivity (clicks, hovers)
3. Connect to API
4. Add loading/error states
5. Polish with animations
```

### 3. Mobile-First CSS
```tsx
// Always write mobile styles first
<div className="
  p-4           // Mobile padding
  md:p-6        // Tablet padding  
  lg:p-8        // Desktop padding
">
```

### 4. Use shadcn Components
```tsx
// Don't reinvent the wheel
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// These handle all edge cases for you
```

---

## 🚨 Common Pitfalls to Avoid

### 1. DON'T Start with Desktop
- Mobile-first means MOBILE FIRST
- Test everything on 375px width first

### 2. DON'T Skip Loading States
```tsx
// Bad
{data && <ClaimList claims={data} />}

// Good
{isLoading ? <Skeleton /> : 
 error ? <ErrorMessage /> :
 !data?.length ? <EmptyState /> :
 <ClaimList claims={data} />}
```

### 3. DON'T Forget Error Boundaries
```tsx
// Wrap pages in error boundaries
<ErrorBoundary fallback={<ErrorPage />}>
  <ClaimDetail />
</ErrorBoundary>
```

### 4. DON'T Hardcode API URLs
```typescript
// Bad
fetch('http://localhost:8000/claims')

// Good
fetch(`${process.env.NEXT_PUBLIC_API_URL}/claims`)
```

---

## 📱 Mobile-First Development Flow

### Your Daily Workflow
```
Morning:
1. Open browser at 375px width
2. Build feature for mobile
3. Test all interactions
4. Make it perfect

Afternoon:
5. Expand browser to 1024px
6. Adjust layout for desktop
7. Ensure nothing breaks
8. Add desktop enhancements

Evening:
9. Test all breakpoints
10. Fix any issues
11. Commit working code
```

---

## ✅ Definition of Done

### A feature is complete when:
- [ ] Works on all screen sizes (375px to 1440px)
- [ ] Handles loading, error, and empty states
- [ ] Dark mode works perfectly
- [ ] No console errors
- [ ] Keyboard accessible
- [ ] API integrated (or mocked properly)
- [ ] Matches design mockups
- [ ] Code is clean and commented

---

## 🔄 Integration with Backend

### Mock Data Implementation Strategy

```typescript
// src/lib/api/mock-data.ts
export const mockClaims = [
  // Create 20+ realistic mock claims
  {
    claim_id: 1,
    title: "Major Tech Company Announces AI Breakthrough",
    content: "Full realistic content here...",
    category: "technology",
    status: "UNVERIFIED",
    yes_votes: 245,
    no_votes: 89,
    submitted_at: "2024-01-15T10:30:00Z",
    evidence_urls: ["https://example.com/evidence1"],
  },
  // ... more mock data covering ALL scenarios
];

// Mock API handler with realistic behavior
export const mockAPI = {
  getClaims: async (params) => {
    await simulateDelay(400); // Simulate network latency
    // Filter, sort, paginate mock data based on params
    return { claims: mockClaims, total: 20, has_more: true };
  },
  submitVote: async (data) => {
    await simulateDelay(600);
    if (Math.random() > 0.9) {
      throw new Error('Insufficient balance'); // Simulate errors
    }
    return { status: 'success', tx_id: 'mock_tx_123' };
  }
};
```

### When Backend is Ready
1. **ONLY CHANGE NEEDED:** Set `USE_REAL_API: true` in config
2. Everything automatically switches to real API
3. No code changes needed anywhere else
4. Test to ensure data formats match

---

## 📊 Progress Tracking

### Daily Checklist
- [ ] Morning: Review yesterday's work on mobile
- [ ] Pick next task from TODO
- [ ] Build mobile version first
- [ ] Test thoroughly
- [ ] Adapt for desktop
- [ ] Test again
- [ ] Commit with clear message
- [ ] Update team on progress

---

## 🎨 Quick Design Reference

From your mockups:
- **Dark background**: #0F0F0F
- **Card background**: #1A1A1A (dark) / #FFFFFF (light)
- **Primary text**: #FFFFFF (dark) / #1A1A1A (light)
- **Secondary text**: #A0A0A0 (dark) / #6B7280 (light)
- **Accent (News)**: #FF4B4B
- **Border radius**: 8px (0.5rem)
- **Card shadow**: 0 1px 3px rgba(0,0,0,0.12)
- **Font**: System font stack

Remember: The goal is a clean, minimalist news app aesthetic with DeFacto's verification features seamlessly integrated!