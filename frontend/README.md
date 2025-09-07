# DeFacto Frontend - Decentralized Truth Protocol

A modern, responsive web application for the DeFacto decentralized truth validation protocol built on Algorand. This frontend provides a complete user interface for submitting, browsing, and validating claims through community consensus.

## Features

### Implemented Features ✅

- **Home Page with Infinite Scroll**: Browse all claims with category and status filters
- **Claim Detail Pages**: View full claim content, evidence, and voting statistics
- **Multi-Step Claim Submission**: Submit new claims with validation and auto-save
- **Voting Interface**: Participate in claim validation with stake-based voting
- **Responsive Design**: Mobile-first approach that works on all screen sizes
- **Dark Mode**: Full dark mode support with theme toggle
- **Mock Data Layer**: Fully functional with mock data, ready for backend integration
- **Real-time Updates**: Simulated real-time voting updates (ready for WebSocket)

### Pages

- `/` - Home page with claim feed and filters
- `/claims/[id]` - Individual claim detail with voting
- `/submit` - Multi-step form for submitting new claims
- `/validations` - View pending validations
- `/discover` - Search and explore claims (placeholder)
- `/profile` - User profile and statistics (placeholder)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Configuration

### Switching Between Mock and Real API

The frontend is configured to use mock data by default. To switch to the real backend API:

1. Open `src/config/app.config.ts`
2. Change the configuration:

```typescript
export const AppConfig = {
  USE_REAL_API: true,  // Change from false to true
  API_BASE_URL: 'http://localhost:8000', // Update if backend is on different URL
  // ... rest of config
}
```

That's it! The entire application will automatically use the real API.

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ALGO_NETWORK=localnet
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── claims/[id]/       # Claim detail page
│   ├── submit/            # Submit claim page
│   ├── validations/       # Validations page
│   ├── discover/          # Discover page
│   ├── profile/           # Profile page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── claims/           # Claim-related components
│   ├── layout/           # Layout components (nav, shell)
│   └── ui/               # shadcn/ui components
├── config/               # App configuration
│   └── app.config.ts     # Main config file
├── hooks/                # Custom React hooks
│   └── use-claims.ts     # Data fetching hooks
├── lib/                  # Utilities and libraries
│   ├── api/              # API client
│   ├── mock/             # Mock data and API
│   └── providers.tsx     # React providers
└── types/                # TypeScript type definitions
```

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Mock Data

The application includes comprehensive mock data covering:
- 20+ diverse claims across all categories
- Various claim statuses (Verified, Unverified, Disputed, False)
- Realistic voting distributions
- Simulated network delays
- Error scenarios

Mock data is located in `src/lib/mock/`

### Testing Features

1. **Browse Claims**: Visit homepage to see paginated claims with filters
2. **View Details**: Click any claim card to see full details
3. **Submit Claim**: Click "Submit" in navigation to test multi-step form
4. **Vote on Claims**: On unverified claims, adjust stake and vote
5. **Dark Mode**: Toggle theme using sun/moon icon in header
6. **Mobile View**: Resize browser to test responsive design

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality UI components
- **React Query**: Data fetching and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Framer Motion**: Animations
- **Axios**: HTTP client
- **date-fns**: Date formatting

## API Integration

The frontend expects the following API endpoints:

- `POST /claims/submit` - Submit new claim
- `GET /claims/{id}` - Get single claim
- `GET /claims` - List claims with filters
- `POST /validations/vote` - Submit vote
- `GET /validations/pending` - Get pending validations

See `src/lib/api/api-client.ts` for complete API integration.

## Design Decisions

1. **Mock-First Development**: Built entirely with mock data to enable parallel development
2. **Mobile-First**: Designed for mobile screens first, then enhanced for desktop
3. **Single Config Switch**: One boolean flag switches between mock and real API
4. **Optimistic Updates**: UI updates immediately while API calls process
5. **Progressive Enhancement**: Core features work without JavaScript
6. **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

## Performance

- Lazy loading with Next.js dynamic imports
- Image optimization with Next.js Image component
- Infinite scroll for large lists
- React Query caching and deduplication
- Bundle size optimization with tree shaking

## Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**TypeScript errors**
```bash
# Run type checking
npx tsc --noEmit
```

## Future Enhancements

- [ ] Wallet connection with Pera Wallet
- [ ] Real-time WebSocket updates
- [ ] Advanced search with filters
- [ ] User authentication
- [ ] Claim bookmarking
- [ ] Share functionality
- [ ] PWA support
- [ ] Internationalization
- [ ] Analytics integration
- [ ] E2E testing with Playwright

## Contributing

1. Create a feature branch
2. Make your changes
3. Run type checking and linting
4. Submit a pull request

## License

[License Type] - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for the DeFacto Protocol