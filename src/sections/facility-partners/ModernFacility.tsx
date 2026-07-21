import FacilityCardGrid, { type FacilityCard } from "./FacilityCardGrid";

const CARDS: FacilityCard[] = [
  {
    icon: "/assets/facility/icon-verified.svg",
    title: "Verified Talent",
    body: "Every clinician on our platform undergoes a rigorous 5-step credentialing and background check process.",
  },
  {
    icon: "/assets/facility/icon-flexible.svg",
    title: "Flexible Staffing",
    body: "From per-diem shifts to long-term travel contracts and permanent placements, manage it all in one place.",
  },
  {
    icon: "/assets/facility/icon-support.svg",
    title: "Dedicated Support",
    body: "Your facility is assigned a dedicated account manager to assist with technical support and staffing strategy.",
  },
];

export default function ModernFacility() {
  return (
    <FacilityCardGrid
      background="bg-tertiary"
      title={
        <>
          Built for the
          <br />
          modern facility
        </>
      }
      subtitle="Experience a partnership that prioritizes quality, reliability, and human support."
      cards={CARDS}
    />
  );
}
