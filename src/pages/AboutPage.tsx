import { Link } from "react-router-dom";
import ApplyButton from "../components/ApplyButton";
import DigitPopIn from "../components/DigitPopIn";
import { useStaggerReveal } from "../hooks/useStaggerReveal";
import { NAV_LINKS } from "../nav";
import Cta from "../sections/Cta";
import Footer from "../sections/Footer";

const STATS = [
  { value: "2024", suffix: "", label: "Founded" },
  { value: "200", suffix: "+", label: "Roles placed" },
  { value: "23", suffix: "", label: "States" },
  { value: "100,000", suffix: "+", label: "Vetted candidates" },
] as const;

const INVESTORS = [
  {
    src: "/assets/about/investor-yc.svg",
    alt: "Y Combinator",
    className: "h-[90px] w-[185px]",
  },
  {
    src: "/assets/about/investor-02.png",
    alt: "Haystack",
    className: "h-[38px] w-[158px] object-contain",
  },
  {
    src: "/assets/about/investor-03.png",
    alt: "Audacious",
    className: "h-[108px] w-[206px] object-contain",
  },
] as const;

const TEAM = [
  {
    src: "/assets/about/team-kenton.png",
    name: "Kenton Jarvie",
    role: "CEO, Co-Founder",
  },
  {
    src: "/assets/about/team-anson.png",
    name: "Anson Kung",
    role: "COO, Co-Founder",
  },
  {
    src: "/assets/about/team-neil.png",
    name: "Neil Prigge",
    role: "VP Operations, Co-Founder",
  },
] as const;

function AboutNav() {
  return (
    <div className="flex w-full shrink-0 items-center justify-between">
      <Link to="/">
        <img src="/assets/wordmark.svg" alt="Flint" className="h-6 w-[49px]" />
      </Link>
      <nav className="flex items-center gap-4 text-[14px] font-medium leading-5 text-subtle">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={`whitespace-nowrap transition-colors hover:text-ink ${
              link.label === "About" ? "text-ink" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <ApplyButton variant="white" reveal={false} />
    </div>
  );
}

function HeroPortrait({
  src,
  className,
  crop,
}: {
  src: string;
  className: string;
  crop?: boolean;
}) {
  return (
    <span
      className={`relative inline-block h-[52px] w-[84px] shrink-0 overflow-clip rounded-[32px] ${className}`}
    >
      <span className="absolute left-[calc(50%-0.5px)] top-[calc(50%+17px)] h-[92px] w-[73px] -translate-x-1/2 -translate-y-1/2">
        {crop ? (
          <span className="absolute inset-0 overflow-hidden">
            <img
              src={src}
              alt=""
              className="absolute h-full max-w-none"
              style={{ left: "-12.39%", top: "3.52%", width: "124.96%" }}
            />
          </span>
        ) : (
          <img
            src={src}
            alt=""
            className="absolute inset-0 size-full max-w-none object-cover"
          />
        )}
      </span>
    </span>
  );
}

function AboutHero() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="flex min-h-[616px] w-full flex-col overflow-clip rounded-[24px] bg-brand-light px-4 pt-4">
        <AboutNav />

        <div className="flex w-full flex-1 flex-col items-center justify-center pb-16">
          <div className="flex flex-col items-center gap-6">
            <p data-reveal className="text-[16px] leading-6 text-subtle">
              About us
            </p>
            <h1
              data-reveal
              className="flex flex-col items-center gap-3 font-serif text-[48px] leading-[52px] tracking-[-1px] text-ink"
            >
              <span className="flex items-center justify-center gap-4 whitespace-nowrap">
                Building
                <HeroPortrait
                  src="/assets/about/hero-pill-01.png"
                  className="bg-brand-foreground"
                  crop
                />
                the path
              </span>
              <span className="flex items-center justify-center gap-4 whitespace-nowrap">
                to permanence for
                <HeroPortrait src="/assets/about/hero-pill-02.png" className="bg-[#fee0db]" />
                the nurses
              </span>
              <span className="flex items-start justify-center gap-4 whitespace-nowrap">
                <HeroPortrait src="/assets/about/hero-pill-03.png" className="bg-[#f1e0d8]" />
                America needs.
              </span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="flex w-full items-center justify-center rounded-[16px] bg-tertiary py-24">
        <div className="flex w-full max-w-[521px] flex-col gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <p data-reveal className="text-[16px] leading-6 text-subtle">
              Mission
            </p>
            <h2
              data-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
            >
              Why we exist
            </h2>
          </div>
          <div data-reveal className="space-y-7 text-[18px] leading-7 text-brand/80">
            <p>
              U.S. hospitals are in crisis. Rural and community facilities in particular
              can&apos;t find, or keep, enough nurses — and the agencies they turn to charge a
              fortune for staff who leave in a year. At the same time, there are millions of
              qualified nurses, CNAs, and medical professionals overseas who would give anything
              for a stable future in the United States. Two enormous problems. One obvious,
              underbuilt solution.
            </p>
            <p>
              Flint connects them directly. We recruit healthcare professionals from around the
              world, prepare them for U.S. licensure and interviews, and place them with hospitals
              and care facilities that don&apos;t just need shift coverage — they&apos;re ready to
              sponsor someone for permanent residency. Every step of that journey — licensing,
              immigration, legal fees, relocation — is covered by Flint. It costs the candidate
              nothing.
            </p>
            <p>
              Most staffing models optimize for the next 13 weeks. We optimize for the next 3 to 5
              years, and for the decades after that. The outcome isn&apos;t a placement. It&apos;s
              a green card, a career, and often a family able to build a permanent life in the U.S.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactStats() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="flex w-full flex-col items-center gap-12 overflow-clip rounded-[24px] bg-brand-light px-[104px] py-24">
        <h2
          data-reveal
          className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink"
        >
          Small team big impact
        </h2>
        <div className="flex h-[120px] w-full max-w-[1200px] items-center justify-between">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="flex items-center justify-center font-serif text-brand">
                <span className="text-[96px] leading-[96px] tracking-[-1.44px]">
                  <DigitPopIn value={stat.value} />
                </span>
                {stat.suffix ? (
                  <span className="text-[32px] leading-10 tracking-[-0.48px]">
                    {stat.suffix}
                  </span>
                ) : null}
              </div>
              <p className="text-[16px] leading-6 text-subtle/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Residency() {
  return (
    <section className="flex w-full items-center justify-center px-[70px] py-32">
      <div className="flex w-full max-w-[1200px] items-start justify-between">
        <div className="flex w-[480px] flex-col gap-6">
          <div className="flex flex-col gap-4">
            <p data-reveal className="text-[16px] leading-6 text-subtle">
              What makes Flint different
            </p>
            <h2
              data-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
            >
              Permanent residency, not another visa
            </h2>
          </div>
          <div data-reveal className="space-y-7 text-[18px] leading-7 text-brand/80">
            <p>
              Most pathways into U.S. healthcare work run through temporary visas — TN status,
              contracts that expire, sponsorships that reset the clock every few years. Flint works
              differently. We match candidates with facilities willing to sponsor a green card
              from day one. Candidates work, earn a full salary, and build their life in the U.S.
              while their permanent residency processes — typically around three years. No temp
              status. No uncertainty about next year. A future they can actually plan around.
            </p>
            <p>
              For facilities, that same commitment solves the problem agency staffing never could:
              retention. A nurse who&apos;s building a life and a green card in your hospital
              isn&apos;t leaving in 13 weeks.
            </p>
          </div>
        </div>
        <div data-reveal className="w-[632px] pt-10">
          <img
            src="/assets/about/hospital.png"
            alt="Hospital facility"
            className="h-[421px] w-full rounded-[16px] object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function Investors() {
  return (
    <section className="flex w-full items-center justify-center px-[70px] py-32">
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-2.5">
        <div className="flex w-[480px] flex-col items-center gap-6 text-center">
          <div className="flex w-full flex-col gap-4">
            <p data-reveal className="text-[16px] leading-6 text-subtle">
              What makes Flint different
            </p>
            <h2
              data-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
            >
              Backed by the best
            </h2>
          </div>
          <p data-reveal className="text-[18px] leading-7 text-brand/80">
            Investors who saw the same gap we did: a healthcare system in crisis, and a global
            workforce ready to fill it, if only someone built the bridge.
          </p>
        </div>
        <div className="flex w-full gap-2.5 pt-10">
          {INVESTORS.map((investor) => (
            <div
              key={investor.alt}
              data-reveal
              className="flex h-[191px] flex-1 items-center justify-center rounded-[16px] bg-tertiary"
            >
              <img src={investor.src} alt={investor.alt} className={investor.className} />
            </div>
          ))}
          <img
            data-reveal
            src="/assets/about/investor-04.svg"
            alt="Rhino Ventures"
            className="h-[191px] flex-1"
          />
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="w-full p-4">
      <div className="flex w-full items-center justify-center rounded-[16px] bg-brand-light py-24">
        <div className="flex w-full max-w-[521px] flex-col gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <p data-reveal className="text-[16px] leading-6 text-subtle">
              Our Story
            </p>
            <h2
              data-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
            >
              Why this is personal
            </h2>
          </div>
          <div data-reveal className="space-y-7 text-[18px] leading-7 text-brand/80">
            <p>
              Flint was founded in 2024 by Kenton Jarvie, Anson Kung, and Neil Prigge — but the
              idea didn&apos;t start as a business plan. One founder immigrated to the U.S. from
              South Africa and knows firsthand how opaque and exhausting that process can be.
              Another is married to a nurse. A third watched his mother immigrate from Hong Kong
              and build a 25-year nursing career in America, one that changed the trajectory of
              their entire family.
            </p>
            <p>
              Between them, they saw the same story play out over and over: extraordinary
              healthcare professionals, held back not by skill but by a broken pipeline into the
              country that needed them most. Flint exists to fix that pipeline.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="flex w-full items-center justify-center px-[70px] py-32">
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-16">
        <div className="flex w-[480px] flex-col items-center gap-6 text-center">
          <div className="flex w-full flex-col gap-4">
            <p data-reveal className="text-[16px] leading-6 text-subtle">
              What makes Flint different
            </p>
            <h2
              data-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
            >
              Backed by the best
            </h2>
          </div>
          <p data-reveal className="text-[18px] leading-7 text-brand/80">
            Investors who saw the same gap we did: a healthcare system in crisis, and a global
            workforce ready to fill it, if only someone built the bridge.
          </p>
        </div>
        <div className="grid w-full grid-cols-3 gap-x-4 gap-y-12">
          {TEAM.map((member) => (
            <article key={member.name} data-reveal className="flex flex-col gap-4">
              <div className="size-[389px] overflow-clip rounded-[16px] bg-[#4a4a4a] opacity-80">
                <img
                  src={member.src}
                  alt={member.name}
                  className="size-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col gap-1 text-[18px] leading-7">
                <h3 className="font-medium text-ink/80">{member.name}</h3>
                <p className="text-subtle/80">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const revealRef = useStaggerReveal<HTMLDivElement>();

  return (
    <div ref={revealRef} className="flex w-full flex-col">
      <AboutHero />
      <Mission />
      <ImpactStats />
      <Residency />
      <Investors />
      <Story />
      <Team />
      <Cta />
      <Footer />
    </div>
  );
}
