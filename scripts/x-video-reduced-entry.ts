import { videoReduced } from "../src/ix/videoReduced";

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => videoReduced());
else videoReduced();
