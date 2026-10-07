/** Candidates FAQ (Figma 5543:1072). One source for the accordion and its `FAQPage` JSON-LD
 * (seo.md S-08): on Webflow the same pairs go into the page's `jsonLdSchema` setting. The answers are
 * the final client copy (2026-10-07, D-38); keep the schema in step whenever they change. */
export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: "What costs does Flint cover?",
    answer:
      "Flint covers immigration filing fees, lawyer fees, licensing support, and relocation assistance. You’re responsible only for normal living expenses once working.",
  },
  {
    question: "Where are the job locations?",
    answer:
      "Most openings are in smaller or rural areas, since those facilities sponsor green cards. You review available roles and only move forward if you choose one.",
  },
  {
    question: "How long is the commitment?",
    answer:
      "The commitment term aligns with the government’s green card processing time (about 3 years for RNs). While you’re working, your green card is processing.",
  },
  {
    question: "Do I need U.S. work authorization?",
    answer:
      "Yes — you must be authorized to work in the U.S. in order to be eligible for the Flint program.",
  },
  {
    question: "Do you help with relocation and housing?",
    answer:
      "Yes — Flint provides relocation assistance and works with facilities to help identify housing options. In many locations, you will need a car.",
  },
  {
    question: "What about my family?",
    answer:
      "Spouses and children are included in the green card sponsorship and would get the green card at the same time as you.",
  },
  {
    question: "Is this real? Is Flint a scam?",
    answer:
      "The Flint Program is completely real and free for candidates. Flint partners with licensed healthcare organizations across the U.S. to make green card sponsorship possible.",
  },
];

/** The `FAQPage` JSON-LD (schema.org) for a list of questions. */
export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
