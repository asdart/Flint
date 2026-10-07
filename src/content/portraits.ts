/**
 * The ten candidate portraits shared by the Home hero arc and the Candidates CTA arc (`ArcStage`) and the Candidates
 * hero ring (`CandidatesHero`). Each slot shows only a window of a portrait, so each consumer has its own pre-cropped file
 * (D-56): `arc` is the 200x240 card (`fk-hero-card-image`, 400x480 file, rotation baked in where the old crop had it) and
 * `ring` the 80x80 round avatar (`fk-orbit-image`, 184x184 file, 2x the hover-scaled 92px). `size` is the largest displayed
 * size, aspect-correct to the file (contract 1.12, rule 15). The uncropped `/assets/home/candidate-NN.webp` are no longer used.
 */
export const CANDIDATES = [
  { arc: "/assets/candidates/arc/candidate-01.webp", ring: "/assets/candidates/ring/candidate-01.webp", name: "Maria", flag: "/assets/flags/ph.svg" },
  { arc: "/assets/candidates/arc/candidate-02.webp", ring: "/assets/candidates/ring/candidate-02.webp", name: "Chrismene", flag: "/assets/flags/ht.svg" },
  { arc: "/assets/candidates/arc/candidate-03.webp", ring: "/assets/candidates/ring/candidate-03.webp", name: "Wanjiru", flag: "/assets/flags/ke.svg" },
  { arc: "/assets/candidates/arc/candidate-04.webp", ring: "/assets/candidates/ring/candidate-04.webp", name: "Kwame", flag: "/assets/flags/gh.svg" },
  { arc: "/assets/candidates/arc/candidate-05.webp", ring: "/assets/candidates/ring/candidate-05.webp", name: "Emeka", flag: "/assets/flags/ng.svg" },
  { arc: "/assets/candidates/arc/candidate-06.webp", ring: "/assets/candidates/ring/candidate-06.webp", name: "Ama", flag: "/assets/flags/gh.svg" },
  { arc: "/assets/candidates/arc/candidate-07.webp", ring: "/assets/candidates/ring/candidate-07.webp", name: "Daniel", flag: "/assets/flags/ke.svg" },
  { arc: "/assets/candidates/arc/candidate-08.webp", ring: "/assets/candidates/ring/candidate-08.webp", name: "Ngozi", flag: "/assets/flags/ng.svg" },
  { arc: "/assets/candidates/arc/candidate-09.webp", ring: "/assets/candidates/ring/candidate-09.webp", name: "Linh", flag: "/assets/flags/vn.svg" },
  { arc: "/assets/candidates/arc/candidate-10.webp", ring: "/assets/candidates/ring/candidate-10.webp", name: "Samuel", flag: "/assets/flags/et.svg" },
] as const;

/** Largest displayed sizes (CSS px) of the cropped files. */
export const ARC_IMAGE_SIZE = [200, 240] as const;
export const RING_IMAGE_SIZE = [80, 80] as const;
