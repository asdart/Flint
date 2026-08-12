import { Link } from "react-router-dom";

const LINK_GROUPS = [
  {
    title: "Institutional",
    links: [
      { label: "For nurses", to: "/" },
      { label: "For facilities", to: "/candidates" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Webinars", to: "/" },
      { label: "About us", to: "/" },
      { label: "Brand", to: "/" },
      { label: "Careers", to: "/" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", to: "/" },
      { label: "LinkeDin", to: "/" },
      { label: "TikTok", to: "/" },
      { label: "Facebook", to: "/" },
      { label: "X", to: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/" },
      { label: "Terms", to: "/" },
      { label: "Cookie settings", to: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full p-4">
      <div className="flex w-full flex-col gap-16 rounded-[24px] bg-brand p-20">
        <div className="flex w-full items-end justify-between">
          <div className="flex w-[700px] flex-col gap-4">
            <p data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-white">
              It&rsquo;s time to find your
              <br />
              green card sponsor.
            </p>
            <p data-reveal className="text-[18px] leading-7 text-white/80">
              Apply now, it is free.
            </p>
          </div>
          <span data-reveal className="inline-flex">
            <button
              type="button"
              className="relative flex items-center justify-center rounded-[24px] border border-stone-50 bg-white px-5 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.028px] text-[#0a0a0a] shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-[background-color,transform] duration-300 ease-in-out hover:bg-[#f5f5f5] active:scale-[0.98]"
            >
              Apply now
            </button>
          </span>
        </div>

        <hr className="w-full border-t border-white/20" />

        <div className="flex w-full gap-10 text-[14px] leading-5">
          {LINK_GROUPS.map((group) => (
            <div key={group.title} className="flex min-w-0 flex-1 flex-col gap-5">
              <p data-reveal className="font-medium text-white">{group.title}</p>
              <div className="flex flex-col gap-3 text-stone-100">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    data-reveal
                    to={link.to}
                    className="whitespace-nowrap transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="w-full border-t border-white/20" />

        <div className="flex w-full items-center justify-between">
          <Link to="/">
            <img src="/assets/wordmark-white.svg" alt="Flint" className="h-6 w-[49px]" />
          </Link>
          <p data-reveal className="text-[16px] leading-6 text-white/80">
            &copy; 2026 Flint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
