import { forwardRef } from "react";

const ContentCard = forwardRef(function ContentCard(
  { children, contentOnLeft = true, className = "", style, fullWidth = false },
  ref,
) {
  const orderClass = fullWidth ? "" : contentOnLeft ? "" : "order-1";
  const widthClass = fullWidth ? "w-full" : "w-[50%]";
  const marginClass = fullWidth ? "" : "mx-4";
  return (
    <div
      ref={ref}
      className={`${widthClass} ${marginClass} flex flex-col justify-center space-y-6 rounded-2xl bg-zinc-900/45 p-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.65)] backdrop-blur-md sm:space-y-8 sm:p-8 lg:p-12 xl:p-16 ${orderClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
});

export default ContentCard;
