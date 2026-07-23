export default function BlogNewsletter() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="relative flex min-h-[108px] w-full items-center justify-center overflow-clip rounded-[24px] p-4">
        <img
          src="/assets/blog/newsletter-bg.png"
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <div className="relative flex w-full max-w-[1200px] flex-col items-center justify-center gap-6 md:flex-row md:gap-16">
          <p className="text-center text-[16px] leading-6 tracking-[-0.11px] text-white">
            Subscribe to our newsletter for blog updates and original content
          </p>
          <form
            className="flex w-[400px] max-w-full items-center gap-2 rounded-[20px] border border-[#d3d7de] bg-white py-0.5 pl-3.5 pr-0.5"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 bg-transparent py-2 text-[16px] leading-6 text-ink outline-none placeholder:text-[#8c929b]"
            />
            <button
              type="submit"
              className="relative flex shrink-0 items-center justify-center rounded-[24px] border border-stone-50 bg-white px-4 py-2 text-[14px] font-medium leading-5 tracking-[-0.028px] text-ink shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
