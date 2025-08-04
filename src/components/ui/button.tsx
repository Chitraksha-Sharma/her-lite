import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center relative overflow-hidden transition-all font-semibold z-10 whitespace-nowrap rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-input bg-background hover:bg-background/50 hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // Animated variant (converted from button2)
        animated: `
          px-6 py-3 text-white text-[14px] rounded-md bg-[#236B7D]
          border border-gray-300 shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#ffffff]
          hover:border-[#009087] transition-all duration-300
          before:content-[''] before:absolute before:left-1/2 before:top-full before:w-[140%] before:h-[180%]
          before:rounded-full before:bg-[rgba(0,0,0,0.05)] before:transform before:-translate-x-1/2
          before:scale-x-[1.25] before:scale-y-[1] before:z-[-1] before:transition-all before:duration-500 before:delay-100
          after:content-[''] after:absolute after:left-[55%] after:top-[180%] after:w-[160%] after:h-[190%]
          after:rounded-full after:bg-[#009087] after:transform after:-translate-x-1/2
          after:scale-x-[1.45] after:scale-y-[1] after:z-[-1] after:transition-all after:duration-500 after:delay-100
          hover:before:top-[-35%] hover:before:bg-[#009087] hover:before:scale-x-[0.8] hover:before:scale-y-[1.3]
          hover:after:top-[-45%] hover:after:bg-[#009087] hover:after:scale-x-[0.8] hover:after:scale-y-[1.3]
        `,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
