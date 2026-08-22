import { useEffect, useState } from "react";
import BlogNewsletter from "./BlogNewsletter";
import type { ArticleBlock, TocItem } from "./featuredArticle";

type ArticleContentProps = {
  article: ArticleBlock[];
  toc: TocItem[];
};

export default function ArticleContent({ article, toc }: ArticleContentProps) {
  const [activeId, setActiveId] = useState(toc[0]?.id ?? "");

  useEffect(() => {
    if (toc.length === 0) return;

    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  const activeIndex = Math.max(
    0,
    toc.findIndex((item) => item.id === activeId),
  );

  return (
    <section className="relative mx-auto w-full max-w-[1440px] px-5 pt-10 pb-12 md:px-10 md:pt-16 md:pb-16 lg:px-20 lg:pb-20">
      {toc.length > 0 ? (
        <aside className="absolute top-8 left-20 hidden w-[200px] xl:block">
          <nav className="sticky top-8 flex flex-col gap-4" aria-label="On this page">
            <p className="text-[12px] font-medium leading-4 text-subtle">On this page</p>
            <div className="flex w-full items-start gap-3">
              <div className="relative w-0.5 self-stretch overflow-clip rounded-full bg-stone-50">
                <div
                  className="absolute top-0 left-0 h-[40px] w-0.5 rounded-full bg-brand transition-transform duration-300 ease-out"
                  style={{ transform: `translateY(${activeIndex * 50}px)` }}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                {toc.map((item) => {
                  const active = item.id === activeId;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`flex min-h-10 items-start text-[14px] font-medium leading-5 transition-colors ${
                        active ? "text-ink" : "text-subtle hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>
      ) : null}

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-16">
        {article.map((block, i) => (
          <ArticleBlockView key={i} block={block} />
        ))}
      </div>
    </section>
  );
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "quick-answer":
      return (
        <div className="flex w-full flex-col gap-1 rounded-2xl bg-tertiary p-4 text-[16px] leading-6">
          <p className="text-ink">{block.title}</p>
          <p className="text-subtle">{block.body}</p>
        </div>
      );
    case "paragraphs":
      return <Paragraphs text={block.text} />;
    case "section":
      return (
        <section className="flex w-full flex-col gap-4">
          <h2
            id={block.id}
            className="scroll-mt-8 font-serif text-[24px] leading-7 tracking-[-0.48px] text-ink"
          >
            {block.heading}
          </h2>
          <Paragraphs text={block.paragraphs} />
          {block.intro ? (
            <p className="text-[16px] leading-7 text-subtle">{block.intro}</p>
          ) : null}
          {block.items ? <BulletList items={block.items} /> : null}
        </section>
      );
    case "figure":
      return (
        <figure className="flex w-full flex-col gap-2">
          <div className="relative h-[220px] w-full overflow-clip rounded-2xl md:h-[405px]">
            <img src={block.src} alt="" className="absolute inset-0 size-full object-cover" />
          </div>
          <figcaption className="text-[16px] leading-7 text-subtle">{block.caption}</figcaption>
        </figure>
      );
    case "quote":
      return (
        <blockquote className="flex w-full flex-col gap-6 rounded-r-[12px] border-l-2 border-brand bg-tertiary py-4 pr-4 pl-6">
          <p className="font-serif text-[20px] leading-7 tracking-[-0.4px] text-ink">
            “{block.text}”
          </p>
          <footer className="flex items-center gap-1.5 text-[16px] leading-6">
            <cite className="font-medium not-italic text-ink">{block.author}</cite>
            <span className="text-subtle">{block.role}</span>
          </footer>
        </blockquote>
      );
    case "newsletter":
      return <BlogNewsletter layout="stack" />;
  }
}

function Paragraphs({ text }: { text: string[] }) {
  return (
    <div className="flex w-full flex-col gap-7 text-[16px] leading-7 text-subtle">
      {text.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex w-full flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <img src="/assets/blog/bullet.svg" alt="" className="size-[6px] shrink-0" />
          <span className="text-[16px] leading-6 text-subtle">{item}</span>
        </li>
      ))}
    </ul>
  );
}
