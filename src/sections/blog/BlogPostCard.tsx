import type { BlogPost } from "./posts";

type BlogPostCardProps = {
  post: BlogPost;
};

export default function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article
      data-reveal
      className="group flex h-[432px] cursor-pointer flex-col overflow-clip rounded-[16px] bg-white"
    >
      <div className="relative h-[260px] w-full shrink-0 overflow-clip">
        <img
          src={post.image}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 pt-1 text-[20px] leading-7 tracking-[-0.11px] text-ink">
          {post.title}
        </h3>
        <p className="truncate pt-2 text-[16px] leading-6 tracking-[-0.23px] text-[rgba(38,37,30,0.6)]">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <span className="size-6 shrink-0 overflow-clip rounded-full bg-[#e6e5e0]">
            <img src="/assets/blog/author.png" alt="" className="size-full object-cover" />
          </span>
          <span className="text-[16px] leading-6 tracking-[-0.23px] text-[rgba(38,37,30,0.5)]">
            {post.author} · {post.readTime}
          </span>
        </div>
      </div>
    </article>
  );
}
