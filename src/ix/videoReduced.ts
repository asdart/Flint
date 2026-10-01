/*
 * x-video-reduced (proposed exception, interactions.md): with `prefers-reduced-motion: reduce` a background
 * video (`[data-x-video="reduced"]`) is paused on its poster and doesn't autoplay; when the preference is off
 * it plays again. Webflow's native Background Video has no reduced-motion handling of its own.
 */
type Cleanup = () => void;

export function videoReduced(): Cleanup {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-x-video="reduced"]'));
  if (videos.length === 0) return () => {};

  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => {
    videos.forEach((video) => {
      if (query.matches) video.pause();
      else void video.play().catch(() => {});
    });
  };

  apply();
  query.addEventListener("change", apply);
  return () => query.removeEventListener("change", apply);
}
