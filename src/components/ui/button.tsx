import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"ghost"|"accent"; size?: "sm"|"md"|"lg" };

export function Button({ className, variant="primary", size="md", ...props }: ButtonProps) {
  return <button className={cn("inline-flex items-center justify-center rounded-[14px] font-semibold tracking-[-.01em] transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--livv-pro-accent)]/35 disabled:pointer-events-none disabled:opacity-40 active:scale-[.985]",
    variant==="primary"&&"bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)] shadow-[0_1px_2px_rgba(0,0,0,.08)] hover:opacity-90",
    variant==="accent"&&"bg-[var(--livv-pro-accent)] text-white shadow-[0_1px_2px_rgba(0,0,0,.08)] hover:opacity-90",
    variant==="secondary"&&"border border-[var(--livv-pro-line)] bg-[var(--livv-pro-surface)] text-[var(--livv-pro-ink)] hover:bg-[var(--livv-pro-surface-2)]",
    variant==="ghost"&&"rounded-[12px] bg-transparent text-[var(--livv-pro-muted)] hover:bg-[var(--livv-pro-surface-2)] hover:text-[var(--livv-pro-ink)]",
    size==="sm"&&"min-h-9 px-3.5 text-xs", size==="md"&&"min-h-11 px-5 text-sm", size==="lg"&&"min-h-12 px-6.5 text-base", className)} {...props}/>;
}
