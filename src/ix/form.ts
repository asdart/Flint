/*
 * Preview stand-in for Webflow's Form Block behavior (not a registered interaction: on the
 * published site webflow.js does this). A valid submit of a `.w-form form` hides the form and shows
 * `.w-form-done`; nothing is sent (submissions: roadmap P-05).
 */

type Cleanup = () => void;

export function form(): Cleanup {
  const onSubmit = (event: SubmitEvent) => {
    const target = event.target as HTMLFormElement;
    const block = target.closest<HTMLElement>(".w-form");
    if (!block) return;
    event.preventDefault();
    target.style.display = "none";
    const done = block.querySelector<HTMLElement>(".w-form-done");
    if (done) done.style.display = "block";
  };

  document.addEventListener("submit", onSubmit);
  return () => document.removeEventListener("submit", onSubmit);
}
