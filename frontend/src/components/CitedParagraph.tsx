import type { ReactNode } from "react";
import type { Citation } from "@/lib/posts";

/**
 * Renders one body paragraph, turning any citation's exact text into a real
 * hyperlink. Plain substring matching (not regex) — citation text is always a
 * literal URL fragment, so no escaping is needed.
 */
export default function CitedParagraph({
  text,
  citations,
}: {
  text: string;
  citations?: Citation[];
}) {
  const matches = (citations ?? [])
    .map((citation) => ({ citation, index: text.indexOf(citation.text) }))
    .filter((match) => match.index !== -1)
    .sort((a, b) => a.index - b.index);

  if (matches.length === 0) {
    return <p>{text}</p>;
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  matches.forEach(({ citation, index }, i) => {
    parts.push(text.slice(cursor, index));
    parts.push(
      <a key={i} href={citation.href} target="_blank" rel="noopener noreferrer">
        {citation.text}
      </a>,
    );
    cursor = index + citation.text.length;
  });
  parts.push(text.slice(cursor));

  return <p>{parts}</p>;
}
