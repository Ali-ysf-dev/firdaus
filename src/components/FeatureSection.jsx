import ContentCard from "./ContentCard";
import ContentDivider from "./ContentDivider";
import FeatureItem from "./FeatureItem";

function FeatureSection({
  id,
  contentRef,
  sectionRef,
  storySectionMidRef,
  contentOnLeft = true,
  label,
  title,
  description,
  features,
  customContent,
}) {
  const isFirstChapter = id === "surface";
  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative flex min-h-[100dvh] items-center justify-between max-[1024px]:landscape:min-h-[140dvh] md:h-screen md:min-h-0 ${
        isFirstChapter ? "overflow-visible" : "mt-24 max-[1024px]:landscape:mt-56 md:mt-20"
      }`}
    >
      {storySectionMidRef ? (
        <div
          ref={storySectionMidRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-px w-px -translate-x-1/2 -translate-y-1/2 opacity-0"
          aria-hidden
        />
      ) : null}
      {isFirstChapter && (
        <>
          <div
            className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
            aria-hidden
          />
          <div
            className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-800/25 via-transparent to-zinc-600/20 opacity-90 blur-[80px]"
            aria-hidden
          />
        </>
      )}
      <div className="relative z-[32] flex min-h-0 w-full flex-1 flex-col items-stretch justify-center px-3 py-8 sm:px-4 max-md:landscape:px-5 max-md:landscape:py-10 md:flex-row md:items-center md:justify-between md:px-0 md:py-0">
        {contentOnLeft && (
          <div className="hidden w-[50%] md:block" aria-hidden />
        )}
        <div
          ref={contentRef}
          className={`flex w-full max-w-2xl shrink-0 flex-col self-center md:w-1/2 md:max-w-none ${contentOnLeft ? "" : "md:order-1"}`}
        >
          <ContentCard contentOnLeft={contentOnLeft} fullWidth className="mx-0 sm:mx-4">
            <div className="space-y-6">
              <div className="animate-in inline-block">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
              </div>
              <h2 className="animate-in text-3xl font-bold leading-tight tracking-tight text-zinc-50 max-md:landscape:text-2xl sm:text-4xl lg:text-5xl xl:text-6xl">
                {title}
              </h2>
              <p className="animate-in max-w-xl text-base leading-relaxed text-zinc-400 max-md:landscape:text-sm sm:text-lg lg:text-xl">
                {description}
              </p>
            </div>
            {(features?.length > 0 || customContent) && (
              <div className="grid grid-cols-1 gap-4 pt-4">
                {features?.map((item, i) => (
                  <FeatureItem key={i} title={item.title} description={item.description} />
                ))}
                {customContent}
              </div>
            )}
          </ContentCard>
          <ContentDivider
            className="animate-in mt-6"
            flip={!contentOnLeft}
            edgeAlign={contentOnLeft ? "right" : "left"}
          />
        </div>
        {!contentOnLeft && (
          <div className="order-2 hidden w-[50%] md:block" aria-hidden />
        )}
      </div>
    </section>
  );
}

export default FeatureSection;
