/** Paragraphs of plain text with even spacing; line breaks inside a paragraph are kept. */
export function Paragraphs({ text, className }: { text: string[]; className?: string }) {
  return (
    <div className={className}>
      {text.map((p, i) => (
        <p key={i} className="whitespace-pre-line [&+&]:mt-3">
          {p}
        </p>
      ))}
    </div>
  );
}
