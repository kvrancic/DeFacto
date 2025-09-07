import { 
  ClaimListItem, 
  ClaimDetailResponse, 
  PendingValidation,
  ClaimStatus,
  Category 
} from '@/types'

// Generate realistic timestamps
const generateTimestamp = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

// Mock claims data covering all scenarios
export const mockClaims: ClaimDetailResponse[] = [
  {
    claim_id: 1,
    title: "Major Tech Company Announces Revolutionary AI Breakthrough in Healthcare",
    content: "A leading technology company has announced a groundbreaking artificial intelligence system that can diagnose rare diseases with 99.5% accuracy. The system, trained on millions of medical records and imaging data, represents a significant leap forward in medical diagnostics. Early trials in major hospitals have shown remarkable results, with the AI identifying conditions that human doctors had missed in 15% of cases. The technology uses advanced neural networks and pattern recognition to analyze patient symptoms, medical history, and test results simultaneously. Healthcare professionals are calling this development a game-changer for early disease detection and treatment planning.",
    category: "technology",
    status: "VERIFIED",
    ipfs_hash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://medical-journal.com/ai-breakthrough-2024",
      "https://tech-news.com/healthcare-ai-revolution",
      "https://hospital-trials.org/results/ai-diagnosis"
    ],
    yes_votes: 1245,
    no_votes: 89,
    submitted_at: generateTimestamp(2),
    author: "Dr. Sarah Chen",
    imageUrl: "https://picsum.photos/seed/tech1/800/400",
    supportDestination: "Doctors Without Borders"
  },
  {
    claim_id: 2,
    title: "Climate Scientists Report Unexpected Coral Reef Recovery in Pacific",
    content: "Marine biologists have discovered significant coral reef recovery in previously bleached areas of the Pacific Ocean. The recovery, documented over the past 18 months, shows a 40% increase in coral coverage in areas that were severely damaged during the 2020 bleaching events. Scientists attribute this unexpected recovery to a combination of cooler water temperatures, reduced tourist activity, and successful conservation efforts. The findings provide hope for reef ecosystems worldwide, though researchers caution that continued climate action is essential for long-term survival. Local communities have played a crucial role in protecting these recovering reefs through sustainable fishing practices and pollution reduction.",
    category: "science",
    status: "VERIFIED",
    ipfs_hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    evidence_urls: [
      "https://marine-science.org/pacific-reef-recovery",
      "https://climate-journal.com/coral-restoration-2024"
    ],
    yes_votes: 892,
    no_votes: 45,
    submitted_at: generateTimestamp(1),
    author: "Marine Research Institute",
    imageUrl: "https://picsum.photos/seed/coral1/800/400"
  },
  {
    claim_id: 3,
    title: "New Government Policy to Provide Universal Basic Income Pilot Program",
    content: "The government has announced a controversial pilot program to test universal basic income in select cities. The program will provide $1,000 monthly payments to 10,000 participants over two years. Supporters argue this will help address poverty and job displacement from automation, while critics worry about inflation and reduced work incentives. The pilot will collect extensive data on spending patterns, employment rates, and quality of life metrics. Initial surveys show mixed public opinion, with 52% supporting the trial. Economic experts remain divided on the potential long-term impacts of such policies.",
    category: "politics",
    status: "DISPUTED",
    ipfs_hash: "QmZoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://gov-news.org/ubi-pilot-announcement"
    ],
    yes_votes: 567,
    no_votes: 543,
    submitted_at: generateTimestamp(3),
    author: "Political Weekly",
    imageUrl: "https://picsum.photos/seed/ubi1/800/400"
  },
  {
    claim_id: 4,
    title: "Breakthrough Study Links Coffee Consumption to Increased Longevity",
    content: "A comprehensive 20-year study involving over 500,000 participants has found strong correlations between moderate coffee consumption and increased lifespan. Researchers discovered that people who drink 2-3 cups of coffee daily have a 15% lower risk of premature death from various causes. The study controlled for lifestyle factors including diet, exercise, and smoking. The protective effects appear to be linked to coffee's antioxidant properties and its impact on liver function. However, excessive consumption (more than 5 cups daily) showed diminishing returns. The findings have reignited debate about coffee's role in a healthy diet.",
    category: "health",
    status: "VERIFIED",
    ipfs_hash: "QmPozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://medical-research.org/coffee-longevity-study",
      "https://health-journal.com/coffee-benefits-2024",
      "https://nutrition-science.org/antioxidant-research"
    ],
    yes_votes: 2103,
    no_votes: 234,
    submitted_at: generateTimestamp(5),
    author: "Health Research Foundation",
    imageUrl: "https://picsum.photos/seed/coffee1/800/400"
  },
  {
    claim_id: 5,
    title: "Celebrity Accused of Tax Evasion in Paradise Papers Leak",
    content: "Leaked documents allegedly show a prominent celebrity using offshore accounts to evade millions in taxes. The accusations stem from recently released financial records that detail complex shell company structures. The celebrity's representatives deny any wrongdoing, stating all finances are legally compliant. Tax authorities have announced an investigation into the claims. This revelation is part of a larger leak affecting numerous public figures. Legal experts suggest the case could take years to resolve in court.",
    category: "news",
    status: "UNVERIFIED",
    ipfs_hash: "QmXozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [],
    yes_votes: 156,
    no_votes: 189,
    submitted_at: generateTimestamp(0),
    author: "Anonymous Whistleblower",
    imageUrl: "https://picsum.photos/seed/tax1/800/400"
  },
  {
    claim_id: 6,
    title: "Revolutionary Battery Technology Promises 1000-Mile Electric Vehicle Range",
    content: "Engineers have developed a new solid-state battery that could enable electric vehicles to travel over 1000 miles on a single charge. The breakthrough involves a novel lithium-metal design that increases energy density by 300% compared to current technologies. Manufacturing challenges remain, but the company expects commercial production within 5 years. Auto manufacturers have expressed strong interest, with several signing development partnerships. If successful, this technology could eliminate range anxiety and accelerate EV adoption globally. Environmental groups praise the development as crucial for reducing transportation emissions.",
    category: "technology",
    status: "UNVERIFIED",
    ipfs_hash: "QmYozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://tech-innovation.com/solid-state-battery"
    ],
    yes_votes: 445,
    no_votes: 123,
    submitted_at: generateTimestamp(4),
    author: "TechFuture Magazine",
    imageUrl: "https://picsum.photos/seed/battery1/800/400"
  },
  {
    claim_id: 7,
    title: "Ancient Mayan City Discovered Using Advanced LIDAR Technology",
    content: "Archaeologists have uncovered a massive ancient Mayan city hidden beneath dense jungle canopy in Guatemala. Using cutting-edge LIDAR technology, researchers identified over 60,000 previously unknown structures including pyramids, palaces, and complex irrigation systems. The discovery suggests the Mayan civilization was far more extensive than previously believed, with population estimates revised upward by millions. The site dates back to 600-900 AD and shows evidence of sophisticated urban planning. This finding revolutionizes our understanding of pre-Columbian American civilizations. Excavation teams are preparing for a multi-year exploration project.",
    category: "science",
    status: "VERIFIED",
    ipfs_hash: "QmWozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://archaeology-journal.org/mayan-discovery",
      "https://national-geographic.com/lidar-guatemala",
      "https://science-news.org/ancient-city-found"
    ],
    yes_votes: 3421,
    no_votes: 67,
    submitted_at: generateTimestamp(7),
    author: "Archaeological Institute",
    imageUrl: "https://picsum.photos/seed/mayan1/800/400"
  },
  {
    claim_id: 8,
    title: "Major Data Breach Exposes 100 Million User Records",
    content: "A significant cybersecurity breach at a major social media platform has exposed personal data of over 100 million users. The breach, discovered by security researchers, included names, email addresses, phone numbers, and encrypted passwords. The company has notified affected users and forced password resets. Initial investigations suggest the attack exploited a previously unknown vulnerability. Cybersecurity experts warn users to enable two-factor authentication and monitor for suspicious activity. The incident has prompted calls for stronger data protection regulations. Class-action lawsuits are already being filed against the company.",
    category: "technology",
    status: "FALSE",
    ipfs_hash: "QmVozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://fake-news-site.com/breach-report"
    ],
    yes_votes: 234,
    no_votes: 1567,
    submitted_at: generateTimestamp(1),
    author: "CyberSecurity Watch",
    imageUrl: "https://picsum.photos/seed/breach1/800/400"
  },
  {
    claim_id: 9,
    title: "World Leaders Reach Historic Climate Agreement at Emergency Summit",
    content: "In an unprecedented move, world leaders have signed a binding agreement to achieve net-zero emissions by 2040, a decade earlier than previous commitments. The emergency summit, convened in response to recent extreme weather events, saw participation from all major economies. The agreement includes specific targets for renewable energy adoption, deforestation prevention, and carbon pricing mechanisms. Developing nations will receive $500 billion annually in climate financing. Environmental groups cautiously welcome the agreement while emphasizing the need for immediate action. Critics argue the targets are still insufficient to limit warming to 1.5°C.",
    category: "politics",
    status: "VERIFIED",
    ipfs_hash: "QmUozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://un-climate.org/emergency-summit-agreement",
      "https://environmental-news.com/net-zero-2040",
      "https://global-politics.org/climate-deal"
    ],
    yes_votes: 4567,
    no_votes: 432,
    submitted_at: generateTimestamp(2),
    author: "Environmental Reporter",
    imageUrl: "https://picsum.photos/seed/climate1/800/400"
  },
  {
    claim_id: 10,
    title: "New Drug Shows Promise in Reversing Alzheimer's Symptoms",
    content: "Clinical trials of an experimental drug have shown remarkable success in reversing cognitive decline in Alzheimer's patients. The medication, which targets amyloid plaques and tau proteins simultaneously, improved memory and cognitive function in 68% of participants. Phase 3 trials involved 3,000 patients across 15 countries over 18 months. Side effects were minimal, primarily mild headaches and nausea. The pharmaceutical company plans to seek FDA approval by year's end. If approved, this would be the first treatment to reverse, rather than slow, Alzheimer's progression. Patient advocacy groups are calling for expedited review processes.",
    category: "health",
    status: "DISPUTED",
    ipfs_hash: "QmTozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://pharma-trials.org/alzheimers-breakthrough",
      "https://medical-news.com/cognitive-improvement"
    ],
    yes_votes: 1234,
    no_votes: 987,
    submitted_at: generateTimestamp(6),
    author: "Medical Daily",
    imageUrl: "https://picsum.photos/seed/alzheimers1/800/400"
  },
  {
    claim_id: 11,
    title: "Quantum Computer Solves Previously Impossible Mathematical Problem",
    content: "Researchers have successfully used a quantum computer to solve a mathematical problem that would take classical computers millions of years. The 1000-qubit system calculated complex molecular interactions for drug discovery in just 200 seconds. This achievement marks a significant milestone in quantum supremacy. The implications extend to cryptography, materials science, and artificial intelligence. Tech giants are racing to commercialize quantum computing capabilities. However, experts caution that practical applications remain years away. The breakthrough has renewed discussions about quantum-safe encryption standards.",
    category: "technology",
    status: "VERIFIED",
    ipfs_hash: "QmSozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://quantum-computing.org/breakthrough-2024",
      "https://science-journal.com/quantum-supremacy",
      "https://tech-review.com/1000-qubit-achievement"
    ],
    yes_votes: 2890,
    no_votes: 234,
    submitted_at: generateTimestamp(3),
    author: "Quantum Research Lab",
    imageUrl: "https://picsum.photos/seed/quantum1/800/400"
  },
  {
    claim_id: 12,
    title: "Professional Athletes Form Union to Address Mental Health Crisis",
    content: "Top athletes across major sports leagues have united to form a mental health advocacy union. The organization aims to destigmatize mental health issues and improve support systems for athletes. Recent surveys revealed that 65% of professional athletes experience anxiety or depression. The union will provide confidential counseling services and push for policy changes in sports organizations. Several high-profile athletes have shared their personal struggles to raise awareness. Sports leagues have pledged cooperation but negotiations on specific measures continue. Mental health professionals praise this initiative as long overdue.",
    category: "news",
    status: "VERIFIED",
    ipfs_hash: "QmRozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://sports-news.com/athlete-mental-health",
      "https://health-advocacy.org/sports-union"
    ],
    yes_votes: 1567,
    no_votes: 123,
    submitted_at: generateTimestamp(4),
    author: "Sports Weekly",
    imageUrl: "https://picsum.photos/seed/athletes1/800/400"
  },
  {
    claim_id: 13,
    title: "Controversial Social Media Algorithm Changes Spark Free Speech Debate",
    content: "A major social media platform's new algorithm allegedly suppresses political content, igniting fierce debate about online censorship. Internal documents suggest the changes were made to reduce misinformation but critics claim legitimate political discourse is being silenced. User engagement with political posts has dropped 70% since implementation. Free speech advocates have filed lawsuits challenging the policy. The company maintains the changes are content-neutral and based on user preferences. Politicians from both sides demand transparency in algorithm design. The controversy highlights ongoing tensions between content moderation and free expression online.",
    category: "politics",
    status: "DISPUTED",
    ipfs_hash: "QmQozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://tech-policy.org/algorithm-analysis"
    ],
    yes_votes: 890,
    no_votes: 912,
    submitted_at: generateTimestamp(1),
    author: "Digital Rights Watch",
    imageUrl: "https://picsum.photos/seed/algorithm1/800/400"
  },
  {
    claim_id: 14,
    title: "Scientists Discover Water on Previously Unknown Exoplanet",
    content: "Astronomers have detected water vapor in the atmosphere of an Earth-sized exoplanet located 120 light-years away. The planet, designated K2-18c, orbits within its star's habitable zone where liquid water could exist. Spectroscopic analysis from the James Webb Space Telescope confirmed the presence of water vapor, methane, and possibly oxygen. This discovery marks the closest potentially habitable world found to date. The planet's temperature range suggests conditions suitable for life as we know it. Follow-up observations are planned to search for biosignatures. The finding reinvigorates the search for extraterrestrial life.",
    category: "science",
    status: "VERIFIED",
    ipfs_hash: "QmPozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://nasa.gov/exoplanet-water-discovery",
      "https://astronomy-journal.org/k2-18c-analysis",
      "https://space-science.com/habitable-zone-planet"
    ],
    yes_votes: 3456,
    no_votes: 234,
    submitted_at: generateTimestamp(2),
    author: "Space Observatory",
    imageUrl: "https://picsum.photos/seed/exoplanet1/800/400"
  },
  {
    claim_id: 15,
    title: "Global Food Shortage Predicted Due to Extreme Weather Events",
    content: "Agricultural experts warn of impending global food shortages as extreme weather destroys crops worldwide. Unprecedented droughts, floods, and temperature extremes have reduced global crop yields by 25%. Wheat, rice, and corn production face the most severe impacts. Food prices have already increased 40% in affected regions. International aid organizations are preparing for humanitarian crises. Governments are implementing emergency food security measures. Scientists link the agricultural crisis directly to climate change acceleration. Urgent calls for sustainable farming practices and climate adaptation strategies intensify.",
    category: "news",
    status: "UNVERIFIED",
    ipfs_hash: "QmOozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [],
    yes_votes: 345,
    no_votes: 234,
    submitted_at: generateTimestamp(0),
    author: "Agricultural Weekly",
    imageUrl: "https://picsum.photos/seed/food1/800/400"
  },
  {
    claim_id: 16,
    title: "Breakthrough Gene Therapy Cures Rare Childhood Disease",
    content: "A revolutionary gene therapy has successfully cured 12 children suffering from a rare genetic disorder. The treatment, which replaces defective genes with functional ones, showed 100% success rate in clinical trials. Children who couldn't walk or speak are now developing normally. The one-time treatment costs $2.8 million but eliminates lifetime care expenses. FDA fast-track approval is expected within months. This success paves the way for treating other genetic conditions. Bioethics committees are developing guidelines for gene therapy accessibility. Insurance coverage remains a significant challenge for widespread adoption.",
    category: "health",
    status: "VERIFIED",
    ipfs_hash: "QmNozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://gene-therapy.org/childhood-disease-cure",
      "https://medical-breakthrough.com/clinical-trial-results",
      "https://fda.gov/gene-therapy-review"
    ],
    yes_votes: 4567,
    no_votes: 123,
    submitted_at: generateTimestamp(5),
    author: "Genetic Medicine Institute",
    imageUrl: "https://picsum.photos/seed/gene1/800/400"
  },
  {
    claim_id: 17,
    title: "Artificial Intelligence System Passes Bar Exam with Perfect Score",
    content: "An advanced AI system has achieved a perfect score on the Uniform Bar Examination, outperforming 99.9% of human test-takers. The AI completed the exam in one-tenth the allotted time, demonstrating comprehensive understanding of complex legal principles. Law schools are reconsidering curriculum in response to AI capabilities. Legal professionals debate the implications for the profession's future. The AI developer claims their system could democratize legal services. Bar associations are reviewing policies on AI use in legal practice. Critics worry about job displacement and the need for human judgment in law.",
    category: "technology",
    status: "VERIFIED",
    ipfs_hash: "QmMozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://legal-tech.com/ai-bar-exam",
      "https://law-review.org/perfect-score-analysis"
    ],
    yes_votes: 2345,
    no_votes: 456,
    submitted_at: generateTimestamp(3),
    author: "Legal Technology Review",
    imageUrl: "https://picsum.photos/seed/ailaw1/800/400"
  },
  {
    claim_id: 18,
    title: "Underground Tunnel Network Discovered Beneath Major City",
    content: "Construction workers have accidentally discovered an extensive network of previously unknown tunnels beneath a major metropolitan area. The tunnels, dating back 200 years, span over 50 miles and connect significant historical sites. Historians believe they were used for smuggling during prohibition era. The discovery has halted several construction projects pending archaeological surveys. Urban explorers are petitioning for public access once safety assessments are complete. City officials are evaluating tourism potential while addressing structural concerns. The find has prompted searches for similar networks in other historic cities.",
    category: "news",
    status: "UNVERIFIED",
    ipfs_hash: "QmLozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://city-news.com/tunnel-discovery"
    ],
    yes_votes: 678,
    no_votes: 234,
    submitted_at: generateTimestamp(2),
    author: "Urban Explorer Magazine",
    imageUrl: "https://picsum.photos/seed/tunnels1/800/400"
  },
  {
    claim_id: 19,
    title: "Major Corporation Announces Four-Day Work Week with No Pay Reduction",
    content: "A Fortune 500 company has implemented a permanent four-day work week for all employees without reducing salaries. Initial six-month trials showed 40% productivity increase and 60% improvement in employee satisfaction. The company reports significant reductions in sick days and turnover rates. Other corporations are closely monitoring the experiment's long-term effects. Labor unions praise the move as a model for work-life balance. Economic analysts debate potential impacts on competitiveness and profitability. The decision has sparked renewed interest in alternative work arrangements globally.",
    category: "news",
    status: "VERIFIED",
    ipfs_hash: "QmKozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [
      "https://business-news.com/four-day-week",
      "https://corporate-announcement.com/work-schedule"
    ],
    yes_votes: 3456,
    no_votes: 234,
    submitted_at: generateTimestamp(1),
    author: "Business Daily",
    imageUrl: "https://picsum.photos/seed/workweek1/800/400"
  },
  {
    claim_id: 20,
    title: "Secret Government Documents Reveal UFO Investigation Program",
    content: "Declassified documents allegedly reveal a decades-long government program investigating unidentified aerial phenomena. The program, with a budget of $22 million annually, documented numerous encounters with objects displaying impossible flight characteristics. Military pilots' testimonies describe objects moving at hypersonic speeds without sonic booms. Scientists involved claim some incidents defy known physics. Government officials neither confirm nor deny the program's current status. UFO researchers call for full disclosure of all related documents. Skeptics argue the phenomena have conventional explanations. Public interest in extraterrestrial life reaches record levels.",
    category: "politics",
    status: "FALSE",
    ipfs_hash: "QmJozjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    evidence_urls: [],
    yes_votes: 456,
    no_votes: 2345,
    submitted_at: generateTimestamp(4),
    author: "Conspiracy Watch",
    imageUrl: "https://picsum.photos/seed/ufo1/800/400"
  }
]

// Convert to list items for list view
export const mockClaimsList: ClaimListItem[] = mockClaims.map(claim => ({
  claim_id: claim.claim_id,
  title: claim.title,
  category: claim.category,
  status: claim.status,
  submitted_at: claim.submitted_at,
  preview: claim.content.substring(0, 200) + '...',
  vote_count: claim.yes_votes + claim.no_votes,
  yes_votes: claim.yes_votes,
  no_votes: claim.no_votes,
  author: claim.author,
  imageUrl: claim.imageUrl
}))

// Mock pending validations
export const mockPendingValidations: PendingValidation[] = [
  {
    claim_id: 5,
    title: mockClaims[4].title,
    category: mockClaims[4].category,
    time_remaining: 3600, // 1 hour
    current_votes: {
      yes: 156,
      no: 189,
      total_stake: 3450
    },
    user_can_vote: true
  },
  {
    claim_id: 6,
    title: mockClaims[5].title,
    category: mockClaims[5].category,
    time_remaining: 7200, // 2 hours
    current_votes: {
      yes: 445,
      no: 123,
      total_stake: 5680
    },
    user_can_vote: true
  },
  {
    claim_id: 15,
    title: mockClaims[14].title,
    category: mockClaims[14].category,
    time_remaining: 1800, // 30 minutes
    current_votes: {
      yes: 345,
      no: 234,
      total_stake: 5790
    },
    user_can_vote: false
  }
]

// Helper function to simulate network delay
export const simulateDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper function to get random subset of claims
export const getRandomClaims = (count: number): ClaimListItem[] => {
  const shuffled = [...mockClaimsList].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Helper function to filter claims
export const filterClaims = (
  claims: ClaimListItem[],
  params: {
    category?: Category
    status?: ClaimStatus
    sort?: 'newest' | 'oldest' | 'most_votes'
  }
): ClaimListItem[] => {
  let filtered = [...claims]
  
  if (params.category) {
    filtered = filtered.filter(c => c.category === params.category)
  }
  
  if (params.status) {
    filtered = filtered.filter(c => c.status === params.status)
  }
  
  if (params.sort) {
    switch (params.sort) {
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        )
        break
      case 'oldest':
        filtered.sort((a, b) => 
          new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        )
        break
      case 'most_votes':
        filtered.sort((a, b) => 
          (b.vote_count || 0) - (a.vote_count || 0)
        )
        break
    }
  }
  
  return filtered
}