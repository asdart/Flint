import type { PostWithAuthor } from "../../content";
import SmartLink from "../../lib/SmartLink";

type PostCardProps = {
  post: PostWithAuthor;
};

/** UI / Post Card. Every value is bound to a Posts (or referenced Authors) field in Webflow. The image `width` / `height` are the box's largest displayed size (695 × 200 at 767 px; D-51), the same numbers as the Designer Image fields. */
export default function PostCard({ post }: PostCardProps) {
  return (
    <SmartLink href={`/blog/${post.slug}`} className="fk-post-card">
      <div className="fk-post-card-media">
        <img
          className="fk-post-card-image"
          src={post["main-image"].url}
          alt=""
          width={695}
          height={200}
          loading="lazy"
        />
      </div>
      <div className="fk-post-card-body">
        <h3 className="fk-post-card-title">{post.name}</h3>
        <p className="fk-post-card-excerpt">{post.excerpt}</p>
        <div className="fk-post-card-meta">
          <img
            className="fk-avatar"
            src={post.authorItem.avatar.url}
            alt={post.authorItem.avatar.alt}
            width={24}
            height={24}
            loading="lazy"
          />
          <div className="fk-post-card-meta-text">{post.authorItem["short-name"]}</div>
          <div className="fk-post-card-meta-text" aria-hidden>
            ·
          </div>
          <div className="fk-post-card-meta-text">{post["read-time"]} min read</div>
        </div>
      </div>
    </SmartLink>
  );
}
