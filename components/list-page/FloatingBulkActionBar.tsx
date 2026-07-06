"use client";

import React, { useState } from "react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BulkAction } from "./types";

interface FloatingBulkActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  bulkActions: BulkAction[];
  position?: "bottom" | "top";
  showClearButton?: boolean;
}

export const FloatingBulkActionBar: React.FC<FloatingBulkActionBarProps> = ({
  selectedCount,
  selectedIds,
  onClearSelection,
  bulkActions,
  position = "bottom",
  showClearButton = true,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: BulkAction | null;
  }>({ open: false, action: null });

  if (selectedCount === 0) return null;

  const handleBulkAction = async (action: BulkAction) => {
    if (action.confirmMessage) {
      setConfirmDialog({ open: true, action });
    } else {
      await action.onClick(selectedIds.map((id) => String(id)));
      onClearSelection();
    }
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action.onClick(selectedIds.map((id) => String(id)));
      onClearSelection();
      setConfirmDialog({ open: false, action: null });
    }
  };

  const positionClasses =
    position === "bottom"
      ? "bottom-0 sm:bottom-6 animate-in slide-in-from-bottom-4"
      : "top-0 sm:top-6 animate-in slide-in-from-top-4";

  return (
    <>
      <div
        className={`fixed left-0 sm:left-1/2 sm:-translate-x-1/2 right-0 z-50 ${positionClasses}`}
      >
        <div className="bg-background border-t sm:border rounded-lg sm:shadow-lg p-3 sm:p-4 sm:min-w-150 mx-0 sm:mx-0">
          {/* Mobile: stacked layout */}
          <div className="flex sm:hidden flex-col gap-2">
            {/* Top row: count + clear */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm px-2.5 py-0.5">
                  {selectedCount}
                </Badge>
                <span className="text-sm font-medium">selected</span>
              </div>
              {showClearButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="h-8 px-2"
                >
                  <IconX className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Bottom row: bulk action buttons */}
            {bulkActions.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                {bulkActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => handleBulkAction(action)}
                    disabled={
                      action.disabled ||
                      (action.requireSelection && selectedCount === 0)
                    }
                    className={
                      action.className ||
                      (action.variant === "destructive"
                        ? "h-9 px-3 text-xs whitespace-nowrap"
                        : "h-9 px-3 text-xs whitespace-nowrap")
                    }
                  >
                    {action.icon && (
                      <action.icon className="h-3.5 w-3.5 mr-1" />
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: horizontal layout */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Selected Count */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {selectedCount}
              </Badge>
              <span className="text-sm font-medium">selected</span>
            </div>

            {bulkActions.length > 0 && (
              <Separator orientation="vertical" className="h-8" />
            )}

            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="default"
                  onClick={() => handleBulkAction(action)}
                  disabled={
                    action.disabled ||
                    (action.requireSelection && selectedCount === 0)
                  }
                  className={
                    action.className ||
                    (action.variant === "destructive"
                      ? "h-10 px-4 "
                      : "h-10 px-4")
                  }
                >
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </Button>
              ))}
            </div>

            {showClearButton && (
              <>
                <Separator orientation="vertical" className="h-8" />

                {/* Clear Selection */}
                <Button
                  variant="ghost"
                  size="default"
                  onClick={onClearSelection}
                  className="h-10 px-4"
                >
                  <IconX className="h-4 w-4" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: confirmDialog.action })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action?.confirmMessage ||
                `This action will affect ${selectedCount} item(s). This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
