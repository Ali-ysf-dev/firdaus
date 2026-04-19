export default function SceneLoadFallback({ label = "Loading 3D…", className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex h-full min-h-[8rem] w-full flex-col items-center justify-center gap-3 bg-zinc-950/85 text-zinc-400 ${className}`}
    >
      <span
        className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-200"
        aria-hidden
      />
      <span className="text-xs font-medium tracking-wide text-zinc-500">{label}</span>
    </div>
  );
}
