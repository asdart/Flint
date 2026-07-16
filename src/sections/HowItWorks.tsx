function ApplicationCard() {
  return (
    <div className="relative flex h-[464px] w-[360px] shrink-0 flex-col justify-end overflow-clip rounded-[32px] p-8">
      <img
        src="/assets/home/how-bg-purple.png"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="relative mb-4 flex flex-col">
        {[0.4, 0.6, 0.8, 1].map((opacity, i) => (
          <div
            key={opacity}
            className="relative flex items-center gap-3 rounded-[24px] border border-white/20 px-4 py-3.5"
            style={{
              marginTop: i === 0 ? 0 : -52,
              opacity,
              zIndex: i + 1,
              background:
                i === 3 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.16)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="size-10 overflow-clip rounded-full bg-[#fee0db]">
              <img
                src="/assets/home/how-avatar.png"
                alt=""
                className="size-full object-cover object-bottom"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-[14px] leading-5 ${i === 3 ? "text-ink" : "text-white"}`}
              >
                Jonathan Johnson
              </p>
              <p
                className={`truncate text-[14px] leading-5 opacity-60 ${i === 3 ? "text-ink" : "text-white"}`}
              >
                Applications sent
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex flex-col gap-2 text-white">
        <p className="text-[20px] font-medium leading-7 tracking-[-0.04px]">Send application</p>
        <p className="text-[20px] leading-7 tracking-[-0.04px] opacity-60">
          We will make sure we can help you with your immigration case.
        </p>
      </div>
    </div>
  );
}

function InterviewCard() {
  return (
    <div className="relative h-[512px] w-[398px] shrink-0 overflow-clip rounded-[32px]">
      <img
        src="/assets/home/how-interview-bg.jpg"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute left-8 top-8 h-[328px] w-[334px] overflow-clip rounded-2xl border border-black/10 bg-white/80 shadow-2xl backdrop-blur-[20px]">
        <img
          src="/assets/home/how-interview-main.jpg"
          alt=""
          className="absolute left-1.5 top-1.5 h-[280px] w-[322px] rounded-xl object-cover"
        />
        <img
          src="/assets/home/how-interview-pip.jpg"
          alt=""
          className="absolute right-3 bottom-10 size-[114px] rounded-xl border-4 border-white object-cover"
        />
        <span className="absolute bottom-12 left-4 rounded-full bg-black/20 px-2.5 py-1 text-[10px] leading-3 text-white">
          Cristine
        </span>
      </div>
      <div className="absolute right-8 bottom-8 left-8 flex flex-col gap-2 text-white">
        <p className="text-[20px] font-medium leading-7 tracking-[-0.04px]">Interview and offer</p>
        <p className="text-[20px] leading-7 tracking-[-0.04px] opacity-60">
          Apply to any facility; if successful, you&rsquo;ll get an offer.
        </p>
      </div>
    </div>
  );
}

function RelocateCard() {
  return (
    <div className="relative flex h-[464px] w-[361px] shrink-0 flex-col justify-end gap-2 overflow-clip rounded-[32px] bg-tertiary p-8">
      <div
        className="pointer-events-none absolute left-[104px] top-[-264px] size-[505px] overflow-hidden"
        style={{
          WebkitMaskImage: "url(/assets/home/flower-mask.svg)",
          maskImage: "url(/assets/home/flower-mask.svg)",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <img src="/assets/home/how-bg-purple.png" alt="" className="size-full object-cover" />
      </div>
      <div className="relative mb-2 flex h-[280px] w-[296px] flex-col justify-between rounded-[24px] bg-white px-7 py-7 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[24px] font-medium leading-8 text-ink">SAN</p>
            <p className="text-[12px] font-medium leading-4 text-subtle">San Diego</p>
          </div>
          <img src="/assets/home/plane.svg" alt="" className="mt-2 size-[18px] rotate-90" />
          <div className="text-right">
            <p className="text-[24px] font-medium leading-8 text-ink">MSP</p>
            <p className="text-[12px] font-medium leading-4 text-subtle">Minnesota</p>
          </div>
        </div>
        <div className="border-t border-dashed border-stone-100" />
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium leading-4 text-subtle">Passenger</p>
            <p className="text-[24px] font-medium leading-8 text-ink">Chrismene</p>
          </div>
          <img src="/assets/home/flag-ng.svg" alt="" className="size-6" />
        </div>
        <img src="/assets/home/how-barcode.svg" alt="" className="mx-auto h-12 w-[206px]" />
      </div>
      <p className="relative text-[20px] font-medium leading-7 tracking-[-0.04px] text-ink">
        Relocate
      </p>
      <p className="relative text-[20px] leading-7 tracking-[-0.04px] text-ink opacity-60">
        We help with your relocation and license transfer.
      </p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="flex w-full flex-col items-center bg-white p-4">
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-12 py-24">
        <header className="flex w-[480px] flex-col gap-4 text-center">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            How Flint works
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
            Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
            Cards.
          </p>
        </header>

        <div data-reveal className="flex w-full items-center justify-center gap-8 overflow-x-auto pb-2">
          <ApplicationCard />
          <InterviewCard />
          <RelocateCard />
        </div>

        <div className="flex items-center gap-2" aria-hidden>
          <span className="size-3 rounded-full bg-stone-100" />
          <span className="relative h-3 w-[52px] rounded-full bg-stone-100">
            <span className="absolute left-0 top-0 h-3 w-4 rounded-full bg-[#373839]" />
          </span>
          <span className="size-3 rounded-full bg-stone-100" />
        </div>
      </div>
    </section>
  );
}
