import FacilityCardGrid, { type FacilityCard } from "./FacilityCardGrid";

const CARDS: FacilityCard[] = [
  {
    icon: "/assets/facility/icon-retention.svg",
    title: "Guaranteed retention",
    body: "Every hire sourced by Flint is guaranteed to stay 3+ years. If they don't, we find you another at no extra charge.",
  },
  {
    icon: "/assets/facility/icon-costs.svg",
    title: "Reduced staffing costs",
    body: "Facilities that replace agency staff with Flint hires save an average of $60,000 per RN and $42,000 per CNA every year.",
  },
  {
    icon: "/assets/facility/icon-team.svg",
    title: "A Stable team of familiar faces",
    body: "No more onboarding new staff every 90 days. Flint placements become familiar faces for your residents — not strangers filling a shift.",
  },
];

export default function WhyFacilities() {
  return (
    <FacilityCardGrid
      background="bg-brand-light"
      title={
        <>
          Why facilities
          <br />
          trust Flint
        </>
      }
      subtitle="Experience a partnership that prioritizes quality, reliability, and human support."
      cards={CARDS}
    />
  );
}
