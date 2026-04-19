import { CARPET_DESIGN_OPTIONS } from "../carpetDesignOptions.js";

/**
 * @param {{ value: string; onChange: (id: string) => void; variant?: "viewer" | "chapter" }} props
 */
export default function CarpetDesignPicker({ value, onChange, variant = "viewer" }) {
  const isChapter = variant === "chapter";
  return (
    <div
      role="radiogroup"
      aria-label="Carpet finish"
      className={
        isChapter
          ? "flex flex-col gap-3"
          : "flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      }
    >
      {isChapter ? <p className="text-sm font-medium text-zinc-300">Carpet finish</p> : null}
      <div className={isChapter ? "flex flex-wrap gap-2" : "contents"}>
        {CARPET_DESIGN_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.id)}
              className={
                selected
                  ? "rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 shadow-sm ring-1 ring-white/20"
                  : "rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-200"
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
