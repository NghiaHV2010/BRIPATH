import * as React from "react"
import { cn } from "@/lib/utils"

const Popover = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, open, onOpenChange, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <div
      ref={ref}
      className={cn("relative inline-block", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            onOpenChange: handleOpenChange,
          } as any)
        }
        return child
      })}
    </div>
  )
})
Popover.displayName = "Popover"

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, asChild, children, onClick, isOpen, onOpenChange, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenChange?.(!isOpen)
    onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    // Filter out non-DOM props and inject toggle handler
    const { isOpen: _io, onOpenChange: _ooc, ...domProps } = props as any
    return React.cloneElement(children as React.ReactElement<any>, {
      ...domProps,
      onClick: (e: any) => {
        onOpenChange?.(!isOpen)
        // @ts-ignore allow original onClick to run if provided
        children.props?.onClick?.(e)
      },
      ref,
    })
  }

  return (
    <button
      ref={ref}
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    align?: "start" | "center" | "end"
  }
>(({ className, isOpen, onOpenChange, align = "center", children, ...props }, ref) => {
  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-[9999] min-w-[8rem] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        "top-full mt-2",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "end" && "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
