"use client";

import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconTrash } from "@tabler/icons-react";

interface DeleteState {
  open: boolean;
  itemName: string;
  resolve: ((value: boolean) => void) | null;
}

/**
 * A reusable hook that provides a confirm-before-delete dialog.
 *
 * Usage in list pages:
 *   const { confirmDelete } = useDeleteConfirm();
 *   onDelete: async (id: string) => {
 *     const confirmed = await confirmDelete("Category X");
 *     if (!confirmed) return;
 *     await deleteCategory(id);
 *   }
 *
 * Usage in detail pages:
 *   const { confirmDelete, deleteDialog } = useDeleteConfirm();
 *   const handleDelete = async () => {
 *     const confirmed = await confirmDelete(itemName);
 *     if (!confirmed) return;
 *     await deleteItem(id);
 *   };
 *   return <>... {deleteDialog}</>;
 */
export function useDeleteConfirm() {
  const [state, setState] = useState<DeleteState>({
    open: false,
    itemName: "",
    resolve: null,
  });

  const confirmDelete = useCallback(
    (itemName: string = "this item"): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({ open: true, itemName, resolve });
      });
    },
    [],
  );

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  };

  const deleteDialog = (
    <AlertDialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) {
          state.resolve?.(false);
          setState((prev) => ({ ...prev, open: false, resolve: null }));
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <IconTrash className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete {state.itemName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <strong>{state.itemName}</strong> and remove all associated data
            from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirmDelete, deleteDialog };
}

/**
 * A standalone delete confirmation dialog component.
 * Use this when you want to control open/close externally
 * (e.g., from FloatingBulkActionBar or custom flows).
 */
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName = "this item",
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <IconTrash className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title || `Delete ${itemName}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || (
              <>
                This action cannot be undone. This will permanently delete{" "}
                <strong>{itemName}</strong> and remove all associated data from
                the system.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
