export type BlogPost = {
  image: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
};

const AUTHOR = "Jonathan";
const READ = "3 min read";
const EXCERPT =
  "Learn how hospitals sponsor nurses for green cards through EB-3, Schedule A, licensing, and workforce planning.";

export const FEATURED_POST: BlogPost = {
  image: "/assets/blog/featured.png",
  date: "July 17, 2026",
  category: "Institutional",
  title: "Is Flint legit? What nurses should know",
  excerpt:
    "Learn if Flint is legit, how Flint helps healthcare workers find green card sponsorship, and what nurses should check before applying.",
  author: AUTHOR,
  readTime: READ,
};

export const ALL_POSTS: BlogPost[] = [
  {
    image: "/assets/blog/post-01.png",
    date: "July 17, 2026",
    category: "Institutional",
    title: "How hospitals sponsor nurses for green cards",
    excerpt: EXCERPT,
    author: AUTHOR,
    readTime: READ,
  },
  {
    image: "/assets/blog/post-02.png",
    date: "July 14, 2026",
    category: "Immigration",
    title: "EB-3 vs Schedule A: which visa path fits you",
    excerpt:
      "Compare the EB-3 and Schedule A green card routes for nurses, including timelines, requirements, and how to choose.",
    author: AUTHOR,
    readTime: "4 min read",
  },
  {
    image: "/assets/blog/post-03.png",
    date: "July 9, 2026",
    category: "Licensing",
    title: "What to expect during NCLEX and licensing",
    excerpt:
      "A step-by-step look at the NCLEX exam, state licensing, and credential evaluation for internationally educated nurses.",
    author: AUTHOR,
    readTime: "5 min read",
  },
  {
    image: "/assets/blog/post-04.png",
    date: "July 2, 2026",
    category: "Relocation",
    title: "Relocating to the US: a nurse's checklist",
    excerpt:
      "Everything you need to plan your move, from housing and licensing to what Flint covers during relocation.",
    author: AUTHOR,
    readTime: "3 min read",
  },
  {
    image: "/assets/blog/post-05.png",
    date: "June 26, 2026",
    category: "Immigration",
    title: "Understanding your green card timeline",
    excerpt:
      "How long does green card sponsorship really take? We break down each stage of the process for healthcare workers.",
    author: AUTHOR,
    readTime: "6 min read",
  },
  {
    image: "/assets/blog/post-06.png",
    date: "June 19, 2026",
    category: "Careers",
    title: "Interview tips for facility placements",
    excerpt:
      "Prepare for interviews with sponsoring facilities and learn what hiring managers look for in candidates.",
    author: AUTHOR,
    readTime: "3 min read",
  },
];
