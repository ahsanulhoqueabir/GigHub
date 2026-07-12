import { getDisplayFilename } from "@/lib/shared/regex.utils";
import { IconLink } from "@tabler/icons-react";
import { type AnchorHTMLAttributes, forwardRef } from "react";

interface AttachmentChipProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children"
> {
  url: string;
  fallbackIndex: number;
}

/**
 * A reusable chip that displays a file attachment link.
 *
 * - Extracts a human-readable filename from the URL via `getDisplayFilename`.
 * - Renders as an `<a>` tag opening in a new tab.
 * - All extra anchor props (className, style, etc.) are forwarded.
 */
export const AttachmentChip = forwardRef<
  HTMLAnchorElement,
  AttachmentChipProps
>(({ url, fallbackIndex, className = "", ...props }, ref) => {
  const displayName = getDisplayFilename(url, fallbackIndex);

  return (
    <a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border hover:border-primary/40 group ${className}`}
      {...props}
    >
      <IconLink className="size-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="line-clamp-1 max-w-50">{displayName}</span>
    </a>
  );
});

AttachmentChip.displayName = "AttachmentChip";
