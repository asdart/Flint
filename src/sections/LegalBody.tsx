import { Fragment } from "react";
import type { LegalInline, LegalPage } from "../content/legal";

function Inline({ part }: { part: LegalInline }) {
  if (typeof part === "string") return <>{part}</>;
  if ("strong" in part) return <strong>{part.strong}</strong>;
  return <a href={`mailto:${part.mail}`}>{part.mail}</a>;
}

function Inlines({ parts }: { parts: LegalInline[] }) {
  return (
    <>
      {parts.map((part, i) => (
        <Inline key={i} part={part} />
      ))}
    </>
  );
}

/**
 * Legal Body. Page markup on Privacy Policy and Terms of Service (D-17): the copy differs per page
 * and the MCP can't fill slots, so each page writes its own. `fk-article` is the blog article grid
 * without the table of contents (the empty first column keeps the 720px `fk-article-content`
 * column centered at 1440, as on a post; one column and centered ≤991) and `fk-article-body` holds plain `h2` / `p` / `ul` / `li` / `strong` / `a` elements, styled by the
 * `x-article-body` exception (installed in each page's head). Not a Rich Text. The intro lines
 * (Company, Address, Contact) are one paragraph with line breaks.
 */
export default function LegalBody({ page }: { page: LegalPage }) {
  return (
    <section className="fk-section">
      <div className="fk-article">
        <div className="fk-article-content">
          <div className="fk-article-body">
            <p>
              {page.intro.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 ? <br /> : null}
                  <Inlines parts={line} />
                </Fragment>
              ))}
            </p>
            {page.blocks.map((block, i) => {
              if (block.type === "h2") return <h2 key={i}>{block.text}</h2>;
              if (block.type === "p") {
                return (
                  <p key={i}>
                    <Inlines parts={block.content} />
                  </p>
                );
              }
              return (
                <ul key={i}>
                  {block.items.map((item, j) => (
                    <li key={j}>
                      <Inlines parts={item} />
                    </li>
                  ))}
                </ul>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
