export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Candidates", to: "/candidates" },
  { label: "Facility partners", to: "/facility-partners" },
  { label: "About", to: "/" },
  { label: "Blog", to: "/blog" },
] as const;

export type NavLabel = (typeof NAV_LINKS)[number]["label"];
