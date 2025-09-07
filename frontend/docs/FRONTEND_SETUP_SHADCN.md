# Frontend Setup with shadcn/ui

## ⚠️ CRITICAL: Mock-First Implementation

**IMPLEMENT THE ENTIRE FRONTEND WITH MOCK DATA FIRST**

You should build the complete, fully-functional frontend using mock data. The only change needed when the backend is ready will be a single configuration flag:

```typescript
// src/config/app.config.ts
export const AppConfig = {
  USE_REAL_API: false,  // 🚨 ONLY CHANGE NEEDED: Set to true when backend is ready
  API_BASE_URL: 'http://localhost:8000',
  MOCK_DELAY: 500,     // Simulate network delay in mock mode
}
```

**What This Means:**
- Build EVERYTHING now - don't wait for the backend
- Create comprehensive mock data for all scenarios
- Implement all error states with mock errors
- Test all user flows with mock responses
- When backend is ready, just flip the switch!

## Initial Setup (10 minutes)

### Step 1: Create Next.js Project with TypeScript
```bash
npx create-next-app@latest defacto-frontend --typescript --tailwind --app
cd defacto-frontend

# Answer the prompts:
# ✓ Would you like to use ESLint? → Yes
# ✓ Would you like to use `src/` directory? → Yes
# ✓ Would you like to customize the default import alias? → No
```

### Step 2: Install shadcn/ui
```bash
npx shadcn-ui@latest init

# Answer the prompts:
# ✓ Would you like to use TypeScript? → Yes
# ✓ Which style would you like to use? → Default
# ✓ Which color would you like to use as base color? → Slate
# ✓ Where is your global CSS file? → src/app/globals.css
# ✓ Would you like to use CSS variables for colors? → Yes
# ✓ Where is your tailwind.config.js? → tailwind.config.ts
# ✓ Configure the import alias? → src/*
```

### Step 3: Install Essential Components
```bash
# Install all components we'll need
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add scroll-area
```

### Step 4: Install Additional Dependencies
```bash
# React Query for data fetching
npm install @tanstack/react-query @tanstack/react-query-devtools

# Form handling
npm install react-hook-form zod @hookform/resolvers

# Icons
npm install lucide-react

# Wallet connection
npm install @perawallet/connect

# State management
npm install zustand

# Utils
npm install axios date-fns clsx tailwind-merge

# Animation (optional but recommended)
npm install framer-motion
```

---

## Theme Configuration

### Update `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom status colors
        verified: "hsl(142, 76%, 36%)",
        false: "hsl(0, 84%, 60%)",
        disputed: "hsl(38, 92%, 50%)",
        unverified: "hsl(215, 20%, 65%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### Update `src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom utilities */
@layer utilities {
  .status-verified {
    @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
  }
  .status-false {
    @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
  }
  .status-disputed {
    @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
  }
  .status-unverified {
    @apply bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200;
  }
}
```

---

## Example Component: Claim Card with shadcn

```tsx
// src/components/claims/ClaimCard.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, ThumbsUp, ThumbsDown, Share2, Bookmark } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ClaimCardProps {
  claim: {
    id: number
    title: string
    content: string
    category: string
    status: 'VERIFIED' | 'FALSE' | 'DISPUTED' | 'UNVERIFIED'
    author?: string
    imageUrl?: string
    submitted_at: string
    yes_votes: number
    no_votes: number
  }
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const statusColors = {
    VERIFIED: 'status-verified',
    FALSE: 'status-false',
    DISPUTED: 'status-disputed',
    UNVERIFIED: 'status-unverified'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      {claim.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={claim.imageUrl} 
            alt={claim.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{claim.category}</Badge>
          <Badge className={statusColors[claim.status]}>
            {claim.status}
          </Badge>
        </div>
        
        <CardTitle className="line-clamp-2">{claim.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {claim.content}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(claim.submitted_at), { addSuffix: true })}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {claim.yes_votes}
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-3 w-3" />
              {claim.no_votes}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          {claim.author && (
            <>
              <Avatar className="h-6 w-6">
                <AvatarFallback>{claim.author[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{claim.author}</span>
            </>
          )}
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
```

---

## Mobile Navigation with shadcn

```tsx
// src/components/layout/MobileNav.tsx
import { Home, Search, Bookmark, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()
  
  const items = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/discover', icon: Search, label: 'Discover' },
    { href: '/saved', icon: Bookmark, label: 'Saved' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "text-muted-foreground hover:text-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
```

---

## Why This is Better Than Pure Tailwind:

1. **Accessibility built-in** - All components are WCAG compliant
2. **Complex interactions handled** - Modals, dropdowns, forms work perfectly
3. **Dark mode integrated** - Every component supports it automatically
4. **Consistent design** - All components follow the same patterns
5. **Time-saving** - Complex components like multi-step forms are much easier
6. **Customizable** - You still have full control since code is in your project
7. **Type-safe** - Full TypeScript support
8. **Mobile-friendly** - Touch targets and gestures handled properly

The components match your minimalist aesthetic perfectly while giving you production-ready functionality out of the box!