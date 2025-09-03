import React from "react";
import styled from "styled-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; // Utility to merge class names

const animatedButtonVariants = cva("animated-button", {
  variants: {
    variant: {
      default: "", // default styling
      primary: "animated-primary",
      destructive: "animated-destructive",
    },
    size: {
      default: "animated-size-default",
      sm: "animated-size-sm",
      lg: "animated-size-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  text?: string;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ text = "Modern Button", variant, size, className, ...props }, ref) => {
    return (
      <StyledWrapper>
        <button
          ref={ref}
          className={cn(animatedButtonVariants({ variant, size }), className)}
          {...props}
        >
          {/* <svg viewBox="0 0 24 24" className="arr-2">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
          </svg> */}
          <span className="text">{text}</span>
          <span className="circle" />
          {/* <svg viewBox="0 0 24 24" className="arr-1">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
          </svg> */}
        </button>
      </StyledWrapper>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

const StyledWrapper = styled.div`
  .animated-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 36px;
  border: 4px solid;
  border-color: #236B7D;
  font-size: 16px;
  background-color: inherit;
  border-radius: 100px;
  font-weight: 600;
  color: #236B7D;
  box-shadow: #236B7D;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
  .animated-primary {
    border-color: #236b7d;
    color: #236b7d;
  }

  .animated-primary:hover {
    background-color: #236b7d;
    color: white;
  }

  .animated-destructive {
    border-color: #dc2626;
    color: #dc2626;
  }

  .animated-destructive:hover {
    background-color: #dc2626;
    color: white;
  }

  /* Sizes */
  .animated-size-default {
    padding: 16px 36px;
  }

  .animated-size-sm {
    padding: 10px 24px;
  }

  .animated-size-lg {
    height: 48px;
    width: 400px;
    items: center;
    justify-content: center;
  }


.animated-button svg {
  position: absolute;
  width: 24px;
  fill: #236B7D;
  z-index: 9;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .arr-1 {
  right: 16px;
}

.animated-button .arr-2 {
  left: -25%;
}

.animated-button .circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: #236B7D;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .text {
  position: relative;
  z-index: 1;
  transform: translateX(-12px);
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button:hover {
  box-shadow: 0 0 0 12px transparent;
  color: #ffffff;
  border-radius: 12px;
}

.animated-button:hover .arr-1 {
  right: -25%;
}

.animated-button:hover .arr-2 {
  left: 16px;
}

.animated-button:hover .text {
  transform: translateX(12px);
}

.animated-button:hover svg {
  fill: #ffffff;
}

.animated-button:active {
  scale: 0.95;
  box-shadow: #236B7D;
}

.animated-button:hover .circle {
  width: 220px;
  height: 220px;
  opacity: 1;
}`;


export default AnimatedButton;