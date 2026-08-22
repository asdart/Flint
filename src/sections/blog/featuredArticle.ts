export type TocItem = {
  id: string;
  label: string;
};

export type ArticleBlock =
  | { type: "quick-answer"; title: string; body: string }
  | { type: "paragraphs"; text: string[] }
  | { type: "section"; id: string; heading: string; paragraphs: string[]; intro?: string; items?: string[] }
  | { type: "figure"; src: string; caption: string }
  | { type: "quote"; text: string; author: string; role: string }
  | { type: "newsletter" };

export const FEATURED_TOC: TocItem[] = [
  { id: "why-nurses-ask", label: "Why nurses ask if Flint is legit" },
  { id: "what-is-flint", label: "What is Flint?" },
  { id: "nursing-agency", label: "Is Flint a nursing agency?" },
  { id: "sponsor-directly", label: "Does Flint sponsor green cards directly?" },
];

export const FEATURED_ARTICLE: ArticleBlock[] = [
  {
    type: "quick-answer",
    title: "Quick Answer",
    body: "Flint is a healthcare workforce company that helps eligible healthcare workers already in the U.S. connect with healthcare facilities that may offer green card sponsorship. Candidates are hired by the facility, not Flint, and Flint does not charge candidates upfront fees or deduct money from their salary.",
  },
  {
    type: "paragraphs",
    text: [
      "If you are a nurse or healthcare worker looking for green card sponsorship in the U.S., it is completely normal to ask: Is Flint legit? That is a fair question. Immigration, employment, and sponsorship are serious. A green card pathway can affect your job, your family, your money, your immigration future, and where you live. You should not trust any company blindly.",
      "The short answer is that Flint is a healthcare workforce company that helps eligible healthcare workers already in the U.S. connect with healthcare facilities that may offer green card sponsorship. Flint’s model is job-first, which means the healthcare role comes first, and sponsorship is connected to employer fit, role availability, and candidate eligibility.",
      "This guide explains what Flint does, what Flint does not do, why some people ask whether it is legitimate, and what nurses should check before applying.",
    ],
  },
  {
    type: "section",
    id: "why-nurses-ask",
    heading: "Why nurses ask if Flint is legit",
    paragraphs: [
      "Nurses and healthcare workers often ask if Flint is legit because green card sponsorship can sound too good to be true.",
      "Many candidates have seen scams, confusing recruiters, fake job offers, or agencies asking for large upfront payments. Some people have also had bad experiences with employers who promised sponsorship but never followed through. So the skepticism makes sense.",
    ],
    intro: "Common questions include:",
    items: [
      "Is Flint real?",
      "Yes, Flint is a real city in Michigan.",
      "What is the population of Flint?",
      "Flint has a rich history in the automotive industry.",
      "Flint is known for the Flint water crisis.",
      "What attractions are in Flint?",
      "Flint is home to the Flint Institute of Arts.",
      "Can you tell me about the education system in Flint?",
    ],
  },
  {
    type: "section",
    id: "what-is-flint",
    heading: "What is Flint?",
    paragraphs: [
      "Flint is a healthcare workforce company that helps eligible healthcare workers connect with U.S. healthcare facilities that may offer employment-based green card sponsorship.",
      "Flint focuses on healthcare roles where employer sponsorship may be available. This can include roles such as registered nurse, licensed practical nurse, certified nursing assistant, nursing assistant, medical laboratory scientist, dietary cook, and other healthcare roles depending on employer needs.",
      "The exact roles available can change based on facility demand, licensing requirements, location, and candidate eligibility.",
    ],
  },
  {
    type: "section",
    id: "nursing-agency",
    heading: "Is Flint a nursing agency?",
    paragraphs: [
      "Flint is not a traditional travel nursing agency.",
      "In a traditional agency model, the agency may employ the worker and assign them to temporary contracts. Flint’s model is different because candidates are generally hired directly by the healthcare facility. That distinction matters.",
      "With Flint, the facility is the employer. The facility is also the green card sponsor. Flint supports the process by helping connect qualified candidates with facility partners and coordinating parts of the journey.",
    ],
    intro: "In simple terms:",
    items: [
      "Flint helps with matching, coordination, and support.",
      "The healthcare facility hires the candidate.",
      "The healthcare facility is the sponsor.",
      "The candidate works for the facility, not Flint.",
    ],
  },
  {
    type: "figure",
    src: "/assets/blog/post-inline.jpg",
    caption: "Flint headquarter in Downtown Vancouver.",
  },
  {
    type: "section",
    id: "sponsor-directly",
    heading: "Does Flint sponsor green cards directly?",
    paragraphs: [
      "No. Flint is not usually the direct green card sponsor.",
      "The sponsoring employer is the healthcare facility that hires the candidate. Flint helps connect eligible candidates with facilities that may offer sponsorship and helps support the process.",
      "This is important because EB-3 green card sponsorship is employer-based. A real employer needs to offer a real job and support the immigration process.",
      "If a candidate is matched and hired, the sponsorship pathway is connected to that facility and role.",
    ],
  },
  {
    type: "quote",
    text: "The Schedule A fast-track cuts standard green card waiting times significantly, offering a predictable pipeline of talent during critical nursing deficits.",
    author: "Jonathan Johnson",
    role: "Marketing Director @Flint",
  },
  {
    type: "paragraphs",
    text: [
      "By carefully planning the credential review process and coordinating with specialized immigration partners, healthcare organizations can create an exceptionally smooth path to relocation for global nursing talent.",
    ],
  },
  { type: "newsletter" },
];
