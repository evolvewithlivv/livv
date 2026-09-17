import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"ghost"|"accent"; size?: "sm"|"md"|"lg" };

export function Button({ className, variant="primary", size="md", ...props }: ButtonProps) {
  return <button className={cn("inline-flex items-center justify-center rounded-full font-medium tracking-[-.01em] transition-[background-color,border-color,color,opacity,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--livv-pro-accent)]/35 disabled:pointer-events-none disabled:opacity-35 active:scale-[.985]",
    variant==="primary"&&"bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)] hover:opacity-90",
    variant==="accent"&&"bg-[var(--livv-pro-accent)] text-white hover:opacity-90",
    variant==="secondary"&&"border border-[var(--livv-pro-line)] bg-[var(--livv-pro-surface)] text-[var(--livv-pro-ink)] hover:bg-[var(--livv-pro-surface-2)]",
    variant==="ghost"&&"bg-transparent text-[var(--livv-pro-muted)] hover:bg-[var(--livv-pro-surface-2)] hover:text-[var(--livv-pro-ink)]",
    size==="sm"&&"h-9 px-4 text-xs", size==="md"&&"h-11 px-5 text-sm", size==="lg"&&"h-12 px-7 text-base", className)} {...props}/>;
}
