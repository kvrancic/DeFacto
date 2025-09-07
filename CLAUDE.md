# CLAUDE.md - Essential Project Guidelines

## Project: DeFacto - Decentralized Truth Protocol on Algorand

### Core Tech Stack
- **Blockchain**: Algorand (using AlgoKit 3.0+)
- **Smart Contracts**: Python with Algorand Python (puya)
- **Backend API**: Python FastAPI
- **Frontend**: Next.js 14+ with TypeScript
- **Storage**: IPFS for content, Algorand for hashes
- **ML Service**: Python with Hugging Face Transformers
- **Development**: Docker, AlgoKit LocalNet

### Critical Commands to Run
```bash
# Always run these after making changes:
npm run lint          # Frontend linting
npm run typecheck     # TypeScript checking
ruff check .          # Python linting
pytest                # Python tests
algokit compile      # Compile smart contracts
```

### Project Structure (Monorepo)
```
defacto-protocol/
├── contracts/           # Algorand smart contracts (Python)
├── api/                # FastAPI backend service
├── frontend/           # Next.js web application
├── ml-service/         # ML propaganda detection service
├── shared/             # Shared types and utilities
├── scripts/            # Deployment and utility scripts
└── docs/               # All documentation
```

### Key Design Principles
1. **Separation of Concerns**: Each service is independent and communicates via APIs
2. **No Direct Blockchain Access from Frontend**: All blockchain operations go through the API
3. **Immutable Claims, Mutable Verification**: Content can't be deleted, but can be marked as false
4. **Privacy First**: No personal data on-chain, only cryptographic proofs
5. **Incentivized Truth**: Validators earn more for accurate fact-checking than for posting

### Anti-Propaganda Mechanisms
1. **Multi-Validator System**: Multiple independent validation groups
2. **Stake-Based Voting**: Validators must stake reputation tokens
3. **AI Pre-Screening**: ML service flags potential propaganda for human review
4. **Cross-Reference Verification**: Integration with multiple fact-checking sources
5. **Time-Delayed Visibility**: New claims undergo review period before wide distribution

### Algorand-Specific Guidelines
- Use Algorand Python (puya) for smart contracts, NOT PyTeal or Beaker
- Always use AlgoKit for project initialization and testing
- Test on LocalNet first, then TestNet, then MainNet
- Transaction fees are paid by our service accounts (users don't need ALGO)
- Use Application Storage for complex state, Box Storage for large data

### Development Workflow
1. Always pull latest changes before starting work
2. Create feature branches from `develop`
3. Test locally with AlgoKit LocalNet
4. Ensure all linting/tests pass before committing
5. Create PR to `develop` for review

### Environment Variables Required
```
ALGORAND_NODE_URL=http://localhost:4001      # LocalNet by default
ALGORAND_INDEXER_URL=http://localhost:8980
IPFS_API_URL=http://localhost:5001
OPENAI_API_KEY=<for ML service>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Common Issues & Solutions
- **"Transaction pool overflow"**: Restart AlgoKit LocalNet
- **"Contract size too large"**: Split into multiple contracts
- **"IPFS timeout"**: Check Docker container is running
- **"Type errors in frontend"**: Run `npm run generate-types` after API changes

### Team Communication
- Use GitHub Issues for bug tracking
- Document all major decisions in `/docs/decisions/`
- Update this file when adding new dependencies or changing architecture
- Ask for help early - we're all learning together!

### Remember
- We're building a truth engine, not just a publishing platform
- Every line of code should consider: "How could this be exploited for propaganda?"
- Test edge cases thoroughly - malicious actors will try everything
- Keep it simple for MVP - we can add complexity later