const GRADIENT =
  "linear-gradient(100deg, rgb(92, 119, 224) -45%, rgb(68, 55, 109) 30%, rgb(68, 55, 109) 60%, rgb(189, 83, 93) 140%)";

const FIELD =
  "w-full rounded-[12px] border border-stone-100 bg-white px-[14px] py-2 text-[16px] leading-6 text-ink outline-none transition-colors placeholder:text-[#8c929b] focus:border-brand";
const LABEL = "text-[14px] leading-5 text-ink";

export default function FacilityApply() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="relative flex w-full flex-col items-center overflow-clip rounded-[24px] bg-tertiary py-24">
        <div className="pointer-events-none absolute top-1/2 -left-[300px] size-[920px] -translate-y-1/2 rounded-full border-[80px] border-brand/15" />
        <div className="pointer-events-none absolute top-1/2 -right-[300px] size-[920px] -translate-y-1/2 rounded-full border-[80px] border-brand/15" />

        <form
          className="relative z-10 flex w-[710px] max-w-full flex-col gap-8 rounded-[24px] bg-white p-10"
          onSubmit={(e) => e.preventDefault()}
        >
          <header className="flex flex-col gap-4 text-center">
            <h2 className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink">
              See if your facility qualifies
            </h2>
            <p className="text-[18px] leading-7 text-subtle opacity-80">
              Fill out the form below and a member of our team will reach out within one business
              day.
            </p>
          </header>

          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Your title</span>
              <input type="text" className={FIELD} placeholder="Director of nursing" />
            </label>

            <div className="flex gap-5">
              <label className="flex flex-1 flex-col gap-1">
                <span className={LABEL}>First name</span>
                <input type="text" className={FIELD} placeholder="Maria" />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className={LABEL}>Last name</span>
                <input type="text" className={FIELD} placeholder="Xavier" />
              </label>
            </div>

            <div className="flex gap-5">
              <label className="flex flex-1 flex-col gap-1">
                <span className={LABEL}>Email address</span>
                <input type="email" className={FIELD} placeholder="maria@facility.com" />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className={LABEL}>Phone number</span>
                <div className="flex items-center rounded-[12px] border border-stone-100 bg-white pl-[14px]">
                  <span className="border-r border-stone-100 py-2 pr-2 text-[16px] leading-6 text-subtle">
                    +1
                  </span>
                  <input
                    type="tel"
                    className="w-full rounded-r-[12px] bg-transparent px-[14px] py-2 text-[16px] leading-6 text-ink outline-none placeholder:text-[#8c929b]"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className={LABEL}>Facility name</span>
              <input type="text" className={FIELD} placeholder="Sunrise Care Center" />
            </label>

            <label className="flex flex-col gap-1">
              <span className={LABEL}>Facility type</span>
              <input type="text" className={FIELD} placeholder="Skilled nursing" />
            </label>

            <label className="flex flex-col gap-1">
              <span className={LABEL}>What type of roles are you looking to fill?</span>
              <select className={`${FIELD} appearance-none bg-[url('/assets/how-it-works/arrow-down.svg')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat text-[#8c929b]`} defaultValue="">
                <option value="" disabled>
                  Select all that apply
                </option>
                <option value="rn">Registered Nurses (RN)</option>
                <option value="cna">Certified Nursing Assistants (CNA)</option>
                <option value="lpn">Licensed Practical Nurses (LPN)</option>
                <option value="allied">Allied Health</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className={LABEL}>Anything else we should know?</span>
              <textarea
                rows={4}
                className={`${FIELD} resize-none`}
                placeholder="Share staff goals, timeline, shift coverage needs, or anything helpful..."
              />
            </label>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-[999px] px-8 py-3.5 text-[16px] font-semibold leading-6 tracking-[-0.032px] text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
            style={{ backgroundImage: GRADIENT }}
          >
            Submit form
          </button>
        </form>
      </div>
    </section>
  );
}
