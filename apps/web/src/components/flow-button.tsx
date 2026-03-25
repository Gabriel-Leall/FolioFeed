"use client";
import { ArrowRight } from "lucide-react";

export function FlowButton({ text = "Modern Button" }: { text?: string }) {
  return (
    <button className="group relative flex items-center justify-center gap-1 w-full sm:w-auto overflow-hidden rounded-full border-[1.5px] border-primary/40 bg-transparent px-8 py-3.5 text-sm font-semibold text-primary cursor-pointer transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-lg active:scale-95 shadow-[0_0_24px_rgba(132,94,247,0.1)] hover:shadow-[0_0_32px_rgba(132,94,247,0.3)]">
      {/* Left arrow (arr-2) */}
      <ArrowRight className="absolute w-4 h-4 left-[-25%] stroke-primary fill-none z-10 group-hover:left-4 group-hover:stroke-white transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />

      {/* Text */}
      <span className="relative z-10 -translate-x-3 group-hover:translate-x-3 transition-all duration-800 ease-out">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:w-62.5 group-hover:h-62.5 group-hover:opacity-100 transition-all duration-800 ease-[cubic-bezier(0.19,1,0.22,1)] z-0"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight className="absolute w-4 h-4 right-4 stroke-primary fill-none z-10 group-hover:right-[-25%] group-hover:stroke-white transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
    </button>
  );
}
