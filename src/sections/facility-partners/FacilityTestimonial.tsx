export default function FacilityTestimonial() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full items-center justify-center overflow-clip rounded-[24px] bg-brand-light py-24">
        <div className="flex h-[600px] w-full max-w-[1200px] items-start overflow-clip rounded-[24px] bg-white p-2">
          <div className="relative flex h-full flex-1 items-center justify-end overflow-clip rounded-[16px] p-6">
            <img
              src="/assets/facility/testimonial.png"
              alt="Sarah Jennings"
              className="pointer-events-none absolute inset-0 size-full object-cover"
            />
            <div className="relative z-10 flex h-full w-[600px] max-w-full flex-col justify-between overflow-clip rounded-[16px] bg-tertiary px-16 py-[46px]">
              <p
                data-reveal
                className="font-serif text-[28px] leading-10 tracking-[-0.56px] text-ink"
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
