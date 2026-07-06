import { useState, useCallback } from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionConfig } from "./types";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";

interface ActionButtonsProps<T> {
  item: T;
  actions?: ActionConfig<T>;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
}

export function ActionButtons<T extends { id: string }>({
  item,
  actions,
  onEdit,
  onDelete,
}: ActionButtonsProps<T>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const defaultActions = actions?.default || [];
  const additionalActions = actions?.additional || [];

  // Filter visible additional actions
  const visibleAdditionalActions = additionalActions.filter(
    (action) => !action.hidden || !action.hidden(item),
  );

  // Check if edit/delete is allowed via custom callbacks
  const canEdit = actions?.canEdit ? actions.canEdit(item) : true;
  const canDelete = actions?.canDelete ? actions.canDelete(item) : true;

  const handleDeleteClick = useCallback(() => {
    setPendingDeleteId(item.id);
    setDeleteDialogOpen(true);
  }, [item.id]);

  const handleDeleteConfirm = useCallback(async () => {
    if (pendingDeleteId && onDelete) {
      await onDelete(pendingDeleteId);
    }
    setDeleteDialogOpen(false);
    setPendingDeleteId(null);
  }, [pendingDeleteId, onDelete]);

  // Collect all visible actions into a single list
  const allActions: {
    label: string;
    icon?: React.ElementType;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    variant?: "default" | "destructive";
  }[] = [];

  // Edit action
  if (defaultActions.includes("edit") && onEdit && canEdit) {
    allActions.push({
      label: "Edit",
      icon: undefined,
      onClick: () => onEdit(item),
    });
  }

  // Delete action
  if (defaultActions.includes("delete") && onDelete && canDelete) {
    allActions.push({
      label: "Delete",
      icon: undefined,
      onClick: handleDeleteClick,
      className: "text-destructive",
    });
  }

  // Additional actions
  for (const action of visibleAdditionalActions) {
    allActions.push({
      label: action.label,
      icon: action.icon,
      onClick: () => action.onClick(item),
      disabled: action.disabled ? action.disabled(item) : false,
      className: action.className,
    });
  }

  // Don't render anything if there are no actions
  if (allActions.length === 0) return null;

  const itemName = String(item["name" as keyof T] || item.id);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={4} className="w-40 p-1 gap-0">
          {allActions.map((action, index) => (
            <button
              key={index}
              type="button"
              disabled={action.disabled}
              onClick={action.onClick}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors
                ${
                  action.disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-muted"
                }
                ${action.className || ""}`}
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={itemName}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
