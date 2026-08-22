import { Link } from "react-router-dom";
import SiteNav from "../../components/SiteNav";
import type { BlogPost } from "./posts";

type ArticleHeroProps = {
  post: BlogPost;
};

export default function ArticleHero({ post }: ArticleHeroProps) {
  const displayName = post.authorFullName ?? post.author;

  return (
    <section className="w-full px-4 pt-4">
      <div className="flex w-full flex-col gap-10 overflow-clip rounded-[24px] bg-brand-light p-4 md:gap-16">
        <SiteNav active="Blog" />

        <div className="flex w-full flex-col items-center pb-8 md:pb-16">
          <div className="flex w-full max-w-[1200px] flex-col items-center gap-8 md:gap-12">
            <div className="flex w-full max-w-[600px] flex-col items-center gap-8 px-2">
              <div className="flex w-full flex-col items-center gap-6">
                <p className="flex items-start gap-0.5 text-[14px] leading-5 text-subtle md:text-[16px] md:leading-6">
                  <Link to="/blog" className="transition-colors hover:text-ink">
                    Blog
                  </Link>
                  <span aria-hidden>/</span>
                  <span>{post.category}</span>
                </p>
                <div className="flex w-full flex-col items-center gap-4">
                  <p className="text-[14px] leading-5 text-brand">
                    {post.date} · {post.readTime}
                  </p>
                  <h1 className="w-full text-center font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[40px] md:leading-[48px] md:tracking-[-1px]">
                    {post.titleLines ? (
                      post.titleLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))
                    ) : (
                      post.title
                    )}
                  </h1>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <span className="size-11 shrink-0 overflow-clip rounded-full bg-stone-100">
                  <img
                    src="/assets/blog/author.png"
                    alt=""
                    className="size-full object-cover"
                  />
                </span>
                <div className="flex flex-col items-center">
                  <p className="text-[16px] font-medium leading-6 text-ink">{displayName}</p>
                  {post.authorRole ? (
                    <p className="text-[14px] leading-5 text-subtle">{post.authorRole}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="relative h-[200px] w-full max-w-[552px] overflow-clip rounded-[20px] sm:h-[260px] md:h-[311px]">
              <img
                src={post.image}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
