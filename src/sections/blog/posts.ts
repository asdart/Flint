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

const POST_SEED: Omit<BlogPost, "image">[] = [
  {
    date: "July 17, 2026",
    category: "Institutional",
    title: "How hospitals sponsor nurses for green cards",
    excerpt:
      "Learn how hospitals sponsor nurses for green cards through EB-3, Schedule A, licensing, and workforce planning.",
    author: "Jonathan",
    readTime: "3 min read",
  },
  {
    date: "July 14, 2026",
    category: "Careers",
    title: "Top 5 states hiring international nurses in 2026",
    excerpt:
      "Discover which U.S. states have the highest demand for internationally educated nurses and what to expect.",
    author: "Sarah",
    readTime: "5 min read",
  },
  {
    date: "July 9, 2026",
    category: "Licensing",
    title: "NCLEX prep guide for foreign-trained nurses",
    excerpt:
      "A step-by-step breakdown of how to prepare for the NCLEX exam, from study resources to test-day tips.",
    author: "Michael",
    readTime: "7 min read",
  },
  {
    date: "July 2, 2026",
    category: "Immigration",
    title: "Understanding visa retrogression and priority dates",
    excerpt:
      "What visa retrogression means for healthcare workers and how to navigate long wait times effectively.",
    author: "Priya",
    readTime: "4 min read",
  },
  {
    date: "June 26, 2026",
    category: "Careers",
    title: "Building your nursing career after immigration",
    excerpt:
      "Practical advice on career advancement, continuing education, and professional networking for immigrant nurses.",
    author: "David",
    readTime: "6 min read",
  },
  {
    date: "June 19, 2026",
    category: "Licensing",
    title: "Credential evaluation: what nurses need to know",
    excerpt:
      "How to get your international nursing credentials evaluated and recognized for U.S. licensure requirements.",
    author: "Emily",
    readTime: "4 min read",
  },
  {
    date: "June 12, 2026",
    category: "Immigration",
    title: "What is Schedule A and who qualifies?",
    excerpt:
      "Schedule A can skip labor certification for nurses. Here’s who qualifies and how sponsorship usually works.",
    author: "Jonathan",
    readTime: "4 min read",
  },
  {
    date: "June 5, 2026",
    category: "Careers",
    title: "Choosing the right hospital for your career",
    excerpt:
      "How to evaluate facility partners by specialty, location, support, and long-term growth — not just salary.",
    author: "Sarah",
    readTime: "5 min read",
  },
  {
    date: "May 29, 2026",
    category: "Licensing",
    title: "CGFNS and credential evaluation explained",
    excerpt:
      "A clear guide to credential evaluation for internationally educated nurses, including common delays to avoid.",
    author: "Michael",
    readTime: "4 min read",
  },
  {
    date: "May 22, 2026",
    category: "Relocation",
    title: "First 90 days in the US as a nurse",
    excerpt:
      "Practical tips for settling in — banking, housing, commuting, and building community after you arrive.",
    author: "Priya",
    readTime: "5 min read",
  },
  {
    date: "May 15, 2026",
    category: "Institutional",
    title: "How Flint matches nurses with facilities",
    excerpt:
      "Inside our matching process: licensing readiness, specialty fit, location preferences, and facility needs.",
    author: "David",
    readTime: "3 min read",
  },
  {
    date: "May 8, 2026",
    category: "Immigration",
    title: "PERM, I-140, and adjustment of status",
    excerpt:
      "A plain-language walkthrough of the main immigration stages in employer-sponsored green card cases.",
    author: "Emily",
    readTime: "6 min read",
  },
  {
    date: "May 1, 2026",
    category: "Careers",
    title: "Med-Surg, ICU, or L&D: finding your specialty",
    excerpt:
      "How specialty choice affects placement options, sponsorship demand, and your day-to-day work life.",
    author: "Jonathan",
    readTime: "4 min read",
  },
  {
    date: "April 24, 2026",
    category: "Licensing",
    title: "English proficiency tests for nurse licensing",
    excerpt:
      "TOEFL, IELTS, and OET — which tests states accept, score targets, and how to prepare efficiently.",
    author: "Sarah",
    readTime: "4 min read",
  },
  {
    date: "April 17, 2026",
    category: "Relocation",
    title: "Family sponsorship and dependent visas",
    excerpt:
      "What to know if your spouse or children will join you, including timing, documents, and school planning.",
    author: "Michael",
    readTime: "5 min read",
  },
  {
    date: "April 10, 2026",
    category: "Institutional",
    title: "Questions to ask before signing an offer",
    excerpt:
      "Compensation, shift schedules, housing support, and immigration timelines — the checklist before you accept.",
    author: "Priya",
    readTime: "3 min read",
  },
  {
    date: "April 3, 2026",
    category: "Immigration",
    title: "Priority dates and visa bulletin basics",
    excerpt:
      "How the visa bulletin works for EB-3 nurses and what a current or retrogressed priority date means.",
    author: "David",
    readTime: "5 min read",
  },
  {
    date: "March 27, 2026",
    category: "Careers",
    title: "Building a strong nursing resume for the US",
    excerpt:
      "Highlight clinical experience, licenses, and credentials in a way US hiring managers expect to see.",
    author: "Emily",
    readTime: "3 min read",
  },
  {
    date: "March 20, 2026",
    category: "Licensing",
    title: "State board of nursing: what varies by state",
    excerpt:
      "Licensure isn’t one-size-fits-all. Key differences across compact and non-compact states for new arrivals.",
    author: "Jonathan",
    readTime: "4 min read",
  },
  {
    date: "March 13, 2026",
    category: "Relocation",
    title: "Housing options for relocating nurses",
    excerpt:
      "Temporary housing, roommate setups, and long-term leases — what facilities often help with first.",
    author: "Sarah",
    readTime: "3 min read",
  },
  {
    date: "March 6, 2026",
    category: "Institutional",
    title: "What facilities look for in sponsored hires",
    excerpt:
      "Clinical readiness, communication, retention signals, and how to stand out in a competitive pool.",
    author: "Michael",
    readTime: "4 min read",
  },
  {
    date: "February 27, 2026",
    category: "Immigration",
    title: "Avoiding common green card application mistakes",
    excerpt:
      "Document gaps, inconsistent dates, and incomplete forms — the issues that slow cases down most often.",
    author: "Priya",
    readTime: "5 min read",
  },
  {
    date: "February 20, 2026",
    category: "Careers",
    title: "Night shifts, weekends, and US nurse schedules",
    excerpt:
      "How US hospital scheduling typically works and how to set expectations before your first placement.",
    author: "David",
    readTime: "3 min read",
  },
  {
    date: "February 13, 2026",
    category: "Relocation",
    title: "Taxes, SSN, and banking after you arrive",
    excerpt:
      "A practical starter guide to getting set up financially once you begin working in the United States.",
    author: "Emily",
    readTime: "4 min read",
  },
];

export const ALL_POSTS: BlogPost[] = POST_SEED.map((post, i) => ({
  ...post,
  image: IMAGES[i % IMAGES.length],
}));

export const POSTS_PER_PAGE = 6;
