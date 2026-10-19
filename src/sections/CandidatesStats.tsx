import StatsBand from "./StatsBand";

const STATS = [
  { value: "1000", suffix: "+", label: "People relocated" },
  { value: "28", label: "States with Facility Partners" },
];

/** Section / Candidates / Stats (Webflow component, group Candidates): the Default Stats Band, shared by the
 * Candidates pages so the copy stays consistent. */
export default function CandidatesStats() {
  return (
    <StatsBand
      variant="default"
      title={
        <>
          Thousands of candidates placed.
          <br />
          Millions of lives changed.
        </>
      }
      stats={STATS}
    />
  );
}
