import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Go to Dashboard", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-56 cursor-pointer overflow-hidden rounded-full border bg-background p-2 text-center font-semibold",
        className
      )}
      {...props}
    >
      {/* Blue dot that expands rightward on hover */}
      <div
        className="absolute z-0 left-[15%] top-[50%] h-1 w-1 rounded-full bg-primary 
        transition-all duration-300 
        group-hover:left-0 group-hover:top-0 
        group-hover:h-full group-hover:w-full group-hover:scale-150 group-hover:rounded-full"
      />

      {/* Text and hover content */}
      <div className="relative z-10">
        {/* Default text */}
        <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {text}
        </span>

        {/* Slide-in content */}
        <div className="absolute top-0 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
          <span>{text}</span>
          <ArrowRight />
        </div>
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
