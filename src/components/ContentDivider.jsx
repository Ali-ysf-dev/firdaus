/**
 * Decorative calligraphy band (`public/calligraphy-divider.avif`).
 * @param {"left"|"right"} edgeAlign — `left`: span from viewport-left edge to inner column (use when the text column sits on the left). `right`: span from inner column to viewport-right edge (column on the right).
 */
export default function ContentDivider({ className = "", flip = false, edgeAlign = "left" }) {
  const bleed =
    edgeAlign === "right"
      ? "ml-0 w-full max-w-none self-stretch rounded-xl sm:ml-4 sm:w-[calc(100%-theme(spacing.4))] sm:rounded-r-none"
      : "mr-0 w-full max-w-none self-stretch rounded-xl sm:mr-4 sm:w-[calc(100%-theme(spacing.4))] sm:rounded-l-none"

  return (
    <div
      className={`pointer-events-none select-none overflow-hidden rounded-xl sm:rounded-2xl ${bleed} ${flip ? "scale-x-[-1]" : ""} ${className}`.trim()}
      aria-hidden
    >
      <img
        src="/calligraphy-divider.avif"
        alt=""
        className="h-auto w-full max-h-12 object-cover object-center opacity-95 sm:max-h-14 lg:max-h-[4.25rem]"
        decoding="async"
        loading="lazy"
      />
    </div>
  );
}
