import Image from "next/image";
import { avatarColor, initials } from "@/lib/format";

/**
 * A trader's face.
 *
 * When there is no picture the fallback is a flat colour keyed off the handle
 * with the trader's initials on it — the same trader is always the same
 * colour, which is what makes a list of forty avatars scannable rather than
 * forty grey circles. The colour is picked at the source, not randomised on
 * render, so the server and client agree.
 */
export function Avatar({
  src,
  name,
  size,
  className = "",
  sizes,
}: {
  src: string | null | undefined;
  name: string;
  size: number;
  className?: string;
  sizes?: string;
}) {
  const [bg, fg] = avatarColor(name);

  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold tracking-[-0.02em] ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        background: bg,
        color: fg,
        fontSize: Math.max(10, Math.round(size * 0.34)),
      }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          sizes={sizes}
          className="h-full w-full object-cover"
          unoptimized={src.startsWith("data:")}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

/** The same face inside the glass ring the market cards use. */
export function RingedAvatar({
  src,
  name,
  size,
  ring = 2,
}: {
  src: string | null | undefined;
  name: string;
  size: number;
  ring?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 rounded-full border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
      style={{ width: size + ring * 2, height: size + ring * 2, borderWidth: ring }}
    >
      <Avatar src={src} name={name} size={size} />
    </span>
  );
}
