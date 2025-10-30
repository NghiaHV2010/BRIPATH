import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
    />
))
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value: string
    }
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("border rounded-lg", className)}
        {...props}
    />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        isOpen?: boolean
    }
>(({ className, children, isOpen, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "flex flex-1 items-center justify-between py-4 px-6 font-medium transition-all hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    >
        {children}
        <ChevronDown
            className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                isOpen && "rotate-180"
            )}
        />
    </button>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        isOpen?: boolean
    }
>(({ className, children, isOpen, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "overflow-y-scroll transition-all duration-200",
            isOpen ? "max-h-screen" : "max-h-0"
        )}
        {...props}
    >
        <div className={cn("px-6 pb-4 pt-0", className)}>
            {children}
        </div>
    </div>
))
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }