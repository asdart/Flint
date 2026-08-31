import BlurReveal from "./BlurReveal";

const HOVER_EASE = "duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

type ServiceCardProps = {
  icon: string;
  title: string;
  body: string;
  className?: string;
  bodyClass?: string;
  iconClass?: string;
};

export default function ServiceCard({
  icon,
  title,
  body,
  className = "",
  bodyClass = "text-subtle",
  iconClass = "size-8",
}: ServiceCardProps) {
  return (
    <article
      className={`group flex flex-col items-start justify-between overflow-clip rounded-[20px] bg-white p-6 transition-colors ${HOVER_EASE} hover:bg-brand ${className}`}
    >
      <img
        src={icon}
        alt=""
        className={`${iconClass} transition-[filter] ${HOVER_EASE} group-hover:brightness-0 group-hover:invert`}
      />
      <BlurReveal className="flex w-full flex-col gap-2">
        <h3
          className={`text-[16px] font-medium leading-6 text-ink opacity-80 transition-colors ${HOVER_EASE} group-hover:text-white`}
        >
          {title}
        </h3>
        <p
          className={`text-[16px] leading-6 opacity-80 transition-[color,opacity] ${HOVER_EASE} group-hover:text-white group-hover:opacity-60 ${bodyClass}`}
        >
          {body}
        </p>
      </BlurReveal>
    </article>
  );
}
