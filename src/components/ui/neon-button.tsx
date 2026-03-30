import React from 'react'
import { cn } from '@/lib/utils'
import { VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
    "relative group border mx-auto text-center rounded-full overflow-hidden",
    {
        variants: {
            variant: {
                default: "border-transparent",
                solid: "border-transparent",
                ghost: "border-transparent bg-transparent",
            },
            size: {
                default: "",
                sm: "px-4 py-0.5",
                lg: "px-10 py-2.5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface NeonButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { neon?: boolean }

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
    ({ className, neon = true, size, variant, children, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            >
                <span className={cn("absolute h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 inset-y-0 bg-linear-to-r w-3/4 mx-auto from-transparent via-blue-600 to-transparent hidden", neon && "block")} />
                {children}
                <span className={cn("absolute group-hover:opacity-75 transition-all duration-500 ease-in-out inset-x-0 h-[2px] -bottom-px bg-linear-to-r w-3/4 mx-auto from-transparent via-blue-400 to-transparent hidden", neon && "block")} />
            </button>
        );
    }
)

NeonButton.displayName = 'NeonButton';

export { NeonButton, buttonVariants };
