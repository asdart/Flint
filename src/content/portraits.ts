/** The ten candidate portraits of the Home hero arc (`ArcStage`); the Candidates hero ring reuses them. `size` is the card's largest displayed size (the `fk-hero-card-image` in `ArcStage`) and `orbitSize` the Candidates ring's (`fk-orbit-image`), both aspect-correct to the file (contract 1.12). */
export const CANDIDATES = [
  { image: "/assets/home/candidate-01.webp", size: [539, 539], orbitSize: [200, 200], name: "Maria", flag: "/assets/flags/ph.svg" },
  { image: "/assets/home/candidate-02.webp", size: [309, 386], orbitSize: [161, 201], name: "Chrismene", flag: "/assets/flags/ht.svg" },
  { image: "/assets/home/candidate-03.webp", size: [309, 402], orbitSize: [154, 200], name: "Wanjiru", flag: "/assets/flags/ke.svg" },
  { image: "/assets/home/candidate-04.webp", size: [372, 372], orbitSize: [200, 200], name: "Kwame", flag: "/assets/flags/gh.svg" },
  { image: "/assets/home/candidate-05.webp", size: [376, 470], orbitSize: [161, 201], name: "Emeka", flag: "/assets/flags/ng.svg" },
  { image: "/assets/home/candidate-06.webp", size: [376, 470], orbitSize: [161, 201], name: "Ama", flag: "/assets/flags/gh.svg" },
  { image: "/assets/home/candidate-07.webp", size: [309, 412], orbitSize: [150, 200], name: "Daniel", flag: "/assets/flags/ke.svg" },
  { image: "/assets/home/candidate-08.webp", size: [540, 540], orbitSize: [200, 200], name: "Ngozi", flag: "/assets/flags/ng.svg" },
  { image: "/assets/home/candidate-09.webp", size: [427, 569], orbitSize: [150, 200], name: "Linh", flag: "/assets/flags/vn.svg" },
  { image: "/assets/home/candidate-10.webp", size: [606, 606], orbitSize: [200, 200], name: "Samuel", flag: "/assets/flags/et.svg" },
] as const;
