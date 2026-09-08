/**
 * The icon set, drawn rather than installed.
 *
 * Every glyph here is a 24-unit Lucide outline at the same stroke weight, so
 * they sit together; keeping them as inline SVG rather than a package means
 * the page ships six paths instead of a tree-shaken icon library, and the
 * stroke width stays a prop we can tune per placement (the header wants 1.9,
 * the section badges 2.1).
 */

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

function Line({
  size = 18,
  className = "",
  strokeWidth = 2,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Line strokeWidth={2.2} {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Line>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Line strokeWidth={1.9} {...props}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </Line>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M3 5h.01" />
      <path d="M3 12h.01" />
      <path d="M3 19h.01" />
      <path d="M8 5h13" />
      <path d="M8 12h13" />
      <path d="M8 19h13" />
    </Line>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Line {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </Line>
  );
}

export function StarIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 18}
      height={props.size ?? 18}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={props.strokeWidth ?? 1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={props.className}
    >
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Line strokeWidth={2.2} {...props}>
      <path d="m15 18-6-6 6-6" />
    </Line>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Line strokeWidth={2.2} {...props}>
      <path d="m9 18 6-6-6-6" />
    </Line>
  );
}

export function ChartColumnIcon(props: IconProps) {
  return (
    <Line strokeWidth={2.1} {...props}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </Line>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Line strokeWidth={2.1} {...props}>
      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
    </Line>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Line strokeWidth={2.1} {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </Line>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <Line strokeWidth={1.9} {...props}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </Line>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Line strokeWidth={2.2} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Line>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Line>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Line strokeWidth={1.8} {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </Line>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Line strokeWidth={2.2} {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Line>
  );
}

export function MaximizeIcon(props: IconProps) {
  return (
    <Line strokeWidth={2} {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </Line>
  );
}

/** X, as a filled mark rather than an outline — it is a logo, not an icon. */
export function XIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
