/** Candidates FAQ (Figma 5543:1072). One source for the accordion and its `FAQPage` JSON-LD
 * (seo.md S-08): on Webflow the same pairs go into the page's `jsonLdSchema` setting. Answers after
 * the first are placeholder copy the client replaces (D-38); keep the schema in step when they do. */
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
      "We partner with healthcare facilities in 23 states across the country. During your interviews you can discuss locations and choose the facility that fits you best.",
  },
  {
    question: "How long is the commitment?",
    answer:
      "Most placements ask for a 3-5 year commitment while your Green Card processes, giving you stable employment throughout the process.",
  },
  {
    question: "What if I am on a temporary or pending status?",
    answer:
      "Flint is designed for healthcare professionals on temporary status. We help you move from temporary or pending status to permanent residency through employer sponsorship.",
  },
  {
    question: "What if I do not have work authorization?",
    answer:
      "Reach out to us anyway — our team can review your situation and let you know what pathways may be available to you.",
  },
  {
    question: "Do you help with relocation and housing?",
    answer:
      "Yes. We provide relocation assistance and a moving bonus, and our team can help you get settled in your new city.",
  },
  {
    question: "What about my family?",
    answer:
      "Your spouse and children can be included in your Green Card application, so your family can build a permanent future with you.",
  },
  {
    question: "Is this real? Is Flint a scam?",
    answer:
      "Flint is a real program working with licensed immigration attorneys and accredited healthcare facilities. We’re happy to connect you with candidates we’ve already placed.",
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
