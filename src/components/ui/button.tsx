import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-livv-accent/60 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variant === "primary" &&
          "bg-white text-livv-black hover:bg-neutral-100",
        variant === "accent" &&
          "bg-livv-accent text-white hover:bg-[#ff7a33] shadow-lg shadow-livv-accent/20",
        variant === "secondary" &&
          "bg-livv-surface text-white border border-livv-border hover:bg-livv-border",
        variant === "ghost" &&
          "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-8 text-base",
        className
      )}
      {...props}
    />
  );
}
