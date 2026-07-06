"use client";

import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CardActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDetails?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  detailsLabel?: string;
  className?: string;
}

export function CardActionButtons({
  onEdit,
  onDelete,
  onDetails,
  editLabel = "Edit",
  deleteLabel = "Delete",
  detailsLabel = "Details",
  className,
}: CardActionButtonsProps) {
  const buttons = [];

  if (onDetails) {
    buttons.push(
      <Button
        key="details"
        variant="default"
        size="lg"
        onClick={(e) => {
          e.stopPropagation();
          onDetails();
        }}
        className="w-full justify-center gap-1.5 h-10 text-xs font-semibold"
      >
        <IconEye className="h-4 w-4" />
        <span>{detailsLabel}</span>
      </Button>,
    );
  }

  if (onEdit) {
    buttons.push(
      <Button
        key="edit"
        variant="secondary"
        size="lg"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="w-full justify-center gap-1.5 h-10 text-xs font-semibold"
      >
        <IconEdit className="h-4 w-4" />
        <span>{editLabel}</span>
      </Button>,
    );
  }

  if (onDelete) {
    buttons.push(
      <Button
        key="delete"
        variant="destructive"
        size="lg"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-full justify-center gap-1.5 h-10 text-xs font-semibold"
      >
        <IconTrash className="h-4 w-4" />
        <span>{deleteLabel}</span>
      </Button>,
    );
  }

  if (buttons.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-2 w-full",
        buttons.length === 1
          ? "grid-cols-1"
          : buttons.length === 2
            ? "grid-cols-2"
            : "grid-cols-3",
        className,
      )}
    >
      {buttons}
    </div>
  );
}
