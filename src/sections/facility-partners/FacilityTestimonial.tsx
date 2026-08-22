export default function FacilityTestimonial() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full items-center justify-center overflow-clip rounded-[24px] bg-brand-light px-4 py-12 md:py-16 lg:py-24">
        <div className="flex h-auto w-full max-w-[1200px] items-start overflow-clip rounded-[24px] bg-white p-2 lg:h-[600px]">
          <div className="relative flex min-h-[420px] w-full flex-1 flex-col items-stretch overflow-clip rounded-[16px] lg:h-full lg:flex-row lg:items-center lg:justify-end lg:p-6">
            <img
              src="/assets/facility/testimonial.png"
              alt="Sarah Jennings"
              className="pointer-events-none absolute inset-0 size-full object-cover"
            />
            <div className="relative z-10 mt-auto flex h-auto w-full flex-col justify-between gap-8 overflow-clip rounded-[16px] bg-tertiary px-6 py-8 sm:px-10 md:px-16 md:py-[46px] lg:mt-0 lg:h-full lg:w-[600px] lg:max-w-full">
              <p
                data-reveal
                className="font-serif text-[22px] leading-8 tracking-[-0.44px] text-ink md:text-[28px] md:leading-10 md:tracking-[-0.56px]"
              >
                &ldquo;We serve both military and civilian patients and previously faced high
                turnover rates, which made maintaining a reliable workforce challenging. Flint
                provided a solution by filling 12 critical roles with committed, full-time
                professionals.&rdquo;
              </p>
              <div data-reveal className="flex flex-col gap-1 text-[16px] leading-6">
                <p className="text-ink">Sarah Jennings</p>
                <p className="text-subtle">Operations Manager, Metro General Hospital</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
