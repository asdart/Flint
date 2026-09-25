import type { AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Renders the same `<a href>` Webflow outputs, using client-side routing for internal paths. */
export default function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
