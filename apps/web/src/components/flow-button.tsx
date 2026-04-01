"use client";
import { ArrowRight } from "lucide-react";

export function FlowButton({ text = "Modern Button" }: { text?: string }) {
  return (
    <button className="group relative flex w-full cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-full border-[1.5px] border-primary/40 bg-transparent px-8 py-3.5 text-sm font-semibold text-primary shadow-[0_0_24px_rgba(132,94,247,0.1)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-lg hover:border-transparent hover:text-white hover:shadow-[0_0_32px_rgba(132,94,247,0.3)] active:scale-[0.97] sm:w-auto">
      {/* Left arrow (arr-2) */}
      <ArrowRight className="absolute left-[-25%] z-10 h-4 w-4 fill-none stroke-primary transition-all duration-500 ease-out group-hover:left-4 group-hover:stroke-white" />

      {/* Text */}
      <span className="relative z-10 -translate-x-3 transition-all duration-500 ease-out group-hover:translate-x-3">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute left-1/2 top-1/2 z-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-all duration-500 ease-out group-hover:h-62.5 group-hover:w-62.5 group-hover:opacity-100" />

      {/* Right arrow (arr-1) */}
      <ArrowRight className="absolute right-4 z-10 h-4 w-4 fill-none stroke-primary transition-all duration-500 ease-out group-hover:right-[-25%] group-hover:stroke-white" />
    </button>
  );
}
