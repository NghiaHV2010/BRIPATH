import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        gold: "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-white shadow-yellow-500/25 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 hover:shadow-yellow-500/40",
        silver:
          "bg-gradient-to-r from-slate-500 via-gray-500 to-slate-600 text-white shadow-slate-500/25 hover:from-slate-600 hover:via-gray-600 hover:to-slate-700 hover:shadow-slate-500/40",
        bronze:
          "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/25 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 hover:shadow-amber-500/40",
        emerald:
          "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
        google:
          "border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 focus-visible:ring-blue-500 gap-3",
      },
      size: {
        default: "py-3 px-4 text-base",
        lg: "py-4 px-6 text-lg",
        sm: "h-8 px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
