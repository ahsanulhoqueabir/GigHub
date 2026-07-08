"use client";

import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

interface BackButtonProps {
  href: string;
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <Button asChild variant="primary" size="lg">
      <Link href={href}>
        <IconArrowLeft className="size-4" />
      </Link>
    </Button>
  );
}
