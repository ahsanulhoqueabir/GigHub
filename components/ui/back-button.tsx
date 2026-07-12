"use client";

import { Button, ButtonSize, ButtonVariant } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function BackButton({
  href,
  onClick,
  variant = "default",
  size = "lg",
  className,
}: BackButtonProps) {
  if (href) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href={href}>
          <IconArrowLeft className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
    >
      <IconArrowLeft className="size-4" />
    </Button>
  );
}
