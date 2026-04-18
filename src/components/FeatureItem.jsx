function FeatureItem({ title, description }) {
  return (
    <div className="animate-in flex items-start gap-4">
      <div className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" aria-hidden />
      <div>
        <p className="mb-1 font-medium text-zinc-100">{title}</p>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

export default FeatureItem;
