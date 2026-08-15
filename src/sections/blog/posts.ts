export type BlogPost = {
  image: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
};

export const FEATURED_POST: BlogPost = {
  image: "/assets/blog/featured.png",
  date: "July 17, 2026",
  category: "Institutional",
  title: "Is Flint legit? What nurses should know",
  excerpt:
    "Learn if Flint is legit, how Flint helps healthcare workers find green card sponsorship, and what nurses should check before applying.",
  author: "Jonathan",
  readTime: "3 min read",
};

const IMAGES = [
  "/assets/blog/post-01.jpg",
  "/assets/blog/post-02.jpg",
  "/assets/blog/post-03.jpg",
  "/assets/blog/post-04.jpg",
  "/assets/blog/post-05.jpg",
  "/assets/blog/post-06.jpg",
] as const;

const AUTHORS = ["Jonathan", "Sarah", "Michael", "Priya", "David", "Emily"] as const;

// Sourced from withflint.com/blog (titles, dates, excerpts, and read times).
const POST_SEED: Omit<BlogPost, "image" | "author">[] = [
  {
    date: "August 7, 2026",
    category: "Immigration",
    title: "5 Practical Paths to Green Card Sponsorship for Nurses",
    excerpt:
      "Explore five practical ways to find healthcare employers offering permanent jobs and Green Card sponsorship.",
    readTime: "4 min read",
  },
  {
    date: "August 6, 2026",
    category: "Immigration",
    title: "Is EB-3 the Best Green Card Path for Healthcare Workers in 2026?",
    excerpt:
      "Explore how the EB-3 green card may help CNAs, LPNs, LVNs, and RNs pursue permanent residence through employer-sponsored healthcare roles.",
    readTime: "6 min read",
  },
  {
    date: "August 6, 2026",
    category: "Immigration",
    title: "How to Get Green Card Sponsorship in 2026",
    excerpt:
      "Learn how to get Green Card sponsorship in 2026, how to find employers that sponsor permanent residency, and what the process may involve.",
    readTime: "5 min read",
  },
  {
    date: "July 17, 2026",
    category: "Institutional",
    title: "How Hospitals Sponsor Nurses for Green Cards",
    excerpt:
      "Learn how hospitals sponsor nurses for green cards through EB-3, Schedule A, licensing, and workforce planning.",
    readTime: "3 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "EB-3 Visa Bulletin — July 2026 Update",
    excerpt:
      "Review the July 2026 Visa Bulletin for EB-3 healthcare workers, including key dates, backlogs, and sponsorship timing.",
    readTime: "3 min read",
  },
  {
    date: "July 17, 2026",
    category: "Licensing",
    title: "NCLEX for Foreign-Educated Nurses: What You Need to Know",
    excerpt:
      "Learn how foreign-educated nurses can take the NCLEX, meet state requirements, and prepare for U.S. nursing sponsorship.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "What Happens to Your EB-3 Green Card If You Get Laid Off",
    excerpt:
      "Learn what happens if you get laid off during your EB-3 process, including I-140, I-485, portability, and next steps.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "Can I Change Job During the EB-3 Green Card Process",
    excerpt:
      "Learn when changing jobs during the EB-3 green card process may be possible and what healthcare workers should know before moving.",
    readTime: "3 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "EB-3 Visa for Nurses from India",
    excerpt:
      "Learn how EB-3 visa sponsorship works for Indian nurses, including eligibility, the India backlog, and Flint's U.S.-based process.",
    readTime: "5 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "EB-3 Visa for Nurses from the Philippines",
    excerpt:
      "Learn how EB-3 visa sponsorship works for Filipino nurses, including eligibility, licensing, timelines, and Flint's U.S.-based process.",
    readTime: "5 min read",
  },
  {
    date: "July 17, 2026",
    category: "Careers",
    title: "Nursing Agency for EB-3 Visa: What Nurses Should Know",
    excerpt:
      "Compare nursing agencies that offer sponsorship in 2026, how EB-3 support works, and what nurses should check before choosing a path.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Careers",
    title: "RN and CNA Agencies in the USA",
    excerpt:
      "Compare RN and CNA job placement agencies in 2026, including contract roles, direct hire options, and sponsorship support.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Careers",
    title: "Nurse Agencies vs Staffing Companies",
    excerpt:
      "A simple comparison of nurse agencies vs. staffing companies, and how Flint offers a more structured path to stable, long-term roles.",
    readTime: "3 min read",
  },
  {
    date: "July 17, 2026",
    category: "Careers",
    title: "Nursing Agencies That Offer Sponsorship in the USA",
    excerpt:
      "An overview of U.S. nursing agencies that offer sponsorship, and why direct hire opportunities with Flint may be a better fit.",
    readTime: "5 min read",
  },
  {
    date: "July 17, 2026",
    category: "Careers",
    title: "Direct Hire Nursing Jobs in the USA for Foreign Nurses",
    excerpt:
      "Find direct hire nursing jobs in the USA in 2026, including employer-sponsored roles, no-fee support, and relocation help.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Careers",
    title: "US Nursing Jobs for Foreign Nurses: Direct Hire Opportunities",
    excerpt:
      "Find U.S. nursing jobs for foreign nurses in 2026, including where to apply, employer-sponsored options, and how to check your fit.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "How to Apply for Nurse Green Card Sponsorship (EB-3)",
    excerpt:
      "Learn how to apply for nurse green card sponsorship in 2026, from eligibility and employer matching to EB-3 support and next steps.",
    readTime: "3 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "EB-3 Visa Timeline for Nurses (2026)",
    excerpt:
      "Learn the EB-3 timeline for nurses in 2026, including Schedule A steps, processing delays, and work authorization.",
    readTime: "5 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "Can Healthcare Workers on TPS, DACA, or Asylum Get EB-3 Sponsorship?",
    excerpt:
      "Learn how EB-3 sponsorship may work for TPS, DACA, or asylum healthcare workers in the U.S., including risks and next steps.",
    readTime: "5 min read",
  },
  {
    date: "July 17, 2026",
    category: "Relocation",
    title: "Relocation for Nurse Green Card Sponsorship: $3,000 Support",
    excerpt:
      "Learn how nurse green card sponsorship relocation works in 2026, including EB-3 job moves, $3,000 support, and costs.",
    readTime: "2 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "How Green Card Sponsorship for Nurses Actually Works",
    excerpt:
      "Learn how green card sponsorship for nurses works in 2026, including EB-3 jobs, no-cost support, and relocation help.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "Nurse Green Card: Do You Qualify If You're Already Working in the U.S.?",
    excerpt:
      "Already working in the U.S. as a nurse? Learn who may qualify for green card sponsorship and how EB-3 works.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "Why EB-3 Is One of the Best Green Card Pathways for Nurses",
    excerpt:
      "Learn why EB-3 for nurses is a reliable green card pathway in 2026, including I-140 approval data and Schedule A benefits.",
    readTime: "1 min read",
  },
  {
    date: "July 17, 2026",
    category: "Institutional",
    title: "Flint's Free Nurse Green Card Sponsorship Program Explained",
    excerpt:
      "Learn how nurse green card sponsorship works in 2026, including EB-3 steps, free support, and relocation help.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "Do You Qualify for Nurse Green Card Sponsorship in 2026?",
    excerpt:
      "See if nurse green card sponsorship is right for you in 2026, including eligibility, EB-3 safety, and work authorization.",
    readTime: "2 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "Green Card for Nurses: Step-by-Step Process in 2026",
    excerpt:
      "Learn how to get a green card for nurses in 2026, from eligibility and job sponsorship to EB-3 steps and relocation.",
    readTime: "3 min read",
  },
  {
    date: "July 17, 2026",
    category: "Institutional",
    title: "Hospitals That Sponsor Green Card for Nurses in 2026",
    excerpt: "Hospitals and jobs from Flint that offer green card sponsorships.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "What Is the EB-3 Visa for Nurses?",
    excerpt:
      "Learn how the EB-3 visa for nurses works in 2026, including timelines, sponsorship steps, and safety concerns.",
    readTime: "4 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "Complete Guide to Nurse Green Card Sponsorship via EB-3",
    excerpt:
      "Learn how EB-3 nurse sponsorship works, who qualifies, and how to secure long-term residency through employer-based opportunities.",
    readTime: "5 min read",
  },
  {
    date: "July 17, 2026",
    category: "Immigration",
    title: "USCIS EB-3 Processing Times for Healthcare Workers",
    excerpt: "What to know and what to expect based on your role.",
    readTime: "10 min read",
  },
  {
    date: "July 17, 2026",
    category: "Institutional",
    title: "How Finding Visa Sponsorship with Flint Works",
    excerpt: "Unsure about what Flint does or who it's for? This in-depth guide is for you.",
    readTime: "5 min read",
  },
  {
    date: "May 26, 2026",
    category: "Immigration",
    title: "Green Card Sponsorship for Healthcare Workers: How It Works",
    excerpt: "A clear, updated guide about how nurse sponsorship in the USA works.",
    readTime: "10 min read",
  },
];

export const ALL_POSTS: BlogPost[] = POST_SEED.map((post, i) => ({
  ...post,
  // Rotate the image order per page so pages don't render the same
  // thumbnail-to-position mapping (POSTS_PER_PAGE === IMAGES.length).
  image: IMAGES[(i + Math.floor(i / IMAGES.length)) % IMAGES.length],
  author: AUTHORS[i % AUTHORS.length],
}));

export const POSTS_PER_PAGE = 6;
