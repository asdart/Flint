import { useState } from "react";

const FAQS = [
  {
    question: "What costs does Flint cover?",
    answer:
      "Flint covers immigration filing fees, lawyer fees, licensing support, and relocation assistance. You\u2019re responsible only for normal living expenses once working.",
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
      "Reach out to us anyway \u2014 our team can review your situation and let you know what pathways may be available to you.",
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
      "Flint is a real program working with licensed immigration attorneys and accredited healthcare facilities. We\u2019re happy to connect you with candidates we\u2019ve already placed.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full flex-col items-center gap-16 overflow-clip rounded-[24px] bg-brand-light px-20 py-24">
        <header className="flex max-w-[480px] flex-col items-center gap-4 text-center">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            Frequently asked questions
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-subtle">
            Get answers to common questions about our Green Card pathway, candidate vetting, and healthcare placement
            process.
          </p>
        </header>
        <div className="flex w-full max-w-[800px] flex-col gap-4">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question} data-reveal className="flex w-full flex-col rounded-[24px] bg-white p-6">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`min-w-0 flex-1 text-[20px] font-medium leading-7 ${
                      isOpen ? "text-subtle" : "text-ink"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-[16px] transition-colors ${
                      isOpen ? "bg-brand" : "border border-stone-100"
                    }`}
                  >
                    <img src={isOpen ? "/assets/minus.svg" : "/assets/plus.svg"} alt="" className="size-3.5" />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pt-4 text-[16px] leading-6 text-ink">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
