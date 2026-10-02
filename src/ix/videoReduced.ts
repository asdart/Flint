/*
 * x-video-reduced (approved exception D-43, interactions.md): with `prefers-reduced-motion: reduce` a background
 * video (`[data-x-video="reduced"]`) is paused on its poster and doesn't autoplay; when the preference is off
 * it plays again. Webflow's native Background Video has no reduced-motion handling of its own, and puts the attribute on its
 * wrapper div, so `[data-x-video="reduced"] video` is matched too.
 */
type Cleanup = () => void;

export function videoReduced(): Cleanup {
  // The repo keeps the attribute on the <video>; Webflow's Background Video puts custom attributes on the
  // `.w-background-video` wrapper div, so match the video itself and a video inside the marked element.
  const videos = Array.from(
    new Set(
      document.querySelectorAll<HTMLVideoElement>('video[data-x-video="reduced"], [data-x-video="reduced"] video'),
    ),
  );
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
