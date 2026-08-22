import ApplyButton from "../../components/ApplyButton";

type BlogNewsletterProps = {
  layout?: "row" | "stack";
};

function SubscribeForm() {
  return (
    <form
      className="flex w-[400px] max-w-full shrink-0 items-center gap-2 rounded-full border border-stone-100 bg-white py-0.5 pl-5 pr-0.5 transition-[border-color,box-shadow] focus-within:field-active"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Email address"
        aria-label="Email address"
        className="min-w-0 flex-1 bg-transparent py-2 text-[16px] leading-6 text-ink outline-none placeholder:text-[#8c929b]"
      />
      <ApplyButton type="submit" reveal={false}>
        Subscribe
      </ApplyButton>
    </form>
  );
}

export default function BlogNewsletter({ layout = "row" }: BlogNewsletterProps) {
  if (layout === "stack") {
    return (
      <div className="flex h-[140px] w-full flex-col items-center justify-center overflow-clip rounded-[24px] bg-brand-light p-4">
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <p className="text-center text-[16px] leading-6 tracking-[-0.11px] text-ink">
            Subscribe to our newsletter for blog updates and original content
          </p>
          <SubscribeForm />
        </div>
      </div>
    );
  }

  return (
    <section className="w-full px-4 pt-4">
      <div className="flex min-h-[124px] w-full items-center justify-center overflow-clip rounded-[24px] bg-brand-light p-4">
        <div className="flex w-full max-w-[1200px] items-center justify-center gap-16">
          <p className="shrink-0 text-[16px] leading-6 tracking-[-0.11px] text-ink">
            Subscribe to our newsletter for blog updates and original content
          </p>
          <SubscribeForm />
        </div>
      </div>
    </section>
  );
}
