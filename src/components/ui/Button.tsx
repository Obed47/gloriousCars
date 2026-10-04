import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "dark"
  | "outline"
  | "outline-light"
  | "ghost"
  | "whatsapp";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-55 select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-[0_1px_2px_rgba(11,13,15,0.12),0_10px_24px_-12px_rgba(23,105,255,0.65)] hover:bg-accent-strong hover:-translate-y-0.5 active:translate-y-0",
  dark: "bg-ink text-white hover:bg-graphite hover:-translate-y-0.5 active:translate-y-0",
  outline:
    "border border-line-strong bg-surface text-ink hover:border-ink hover:bg-mist active:bg-line/60",
  "outline-light":
    "border border-white/25 bg-white/5 text-white hover:border-white hover:bg-white/10 active:bg-white/15",
  ghost: "text-ink hover:bg-black/[0.05] active:bg-black/[0.08]",
  whatsapp:
    "bg-[#25D366] text-[#053019] hover:bg-[#20bd5a] hover:-translate-y-0.5 active:translate-y-0",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-[3.25rem] px-7 text-[0.9375rem]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof CommonProps | "color"
  > & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
  "aria-label"?: string;
  title?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function Content({
  children,
  withArrow,
}: {
  children: ReactNode;
  withArrow?: boolean;
}) {
  return (
    <>
      {children}
      {withArrow && (
        <ArrowRight
          className="size-4 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          aria-hidden
        />
      )}
    </>
  );
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    withArrow,
    fullWidth,
    className = "",
    children,
  } = props;

  const cls = [
    base,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { external, href } = props;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          aria-label={props["aria-label"]}
          title={props.title}
        >
          <Content withArrow={withArrow}>{children}</Content>
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={cls}
        aria-label={props["aria-label"]}
        title={props.title}
      >
        <Content withArrow={withArrow}>{children}</Content>
      </Link>
    );
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    variant: _variant,
    size: _size,
    withArrow: _withArrow,
    fullWidth: _fullWidth,
    className: _className,
    children: _children,
    ...rest
  } = props;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <button className={cls} {...rest}>
      <Content withArrow={withArrow}>{children}</Content>
    </button>
  );
}
