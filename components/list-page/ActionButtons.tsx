import { IconEdit, IconTrash, IconDotsVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionConfig } from "./types";

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
  const defaultActions = actions?.default || [];
  const additionalActions = actions?.additional || [];

  // Filter visible additional actions
  const visibleAdditionalActions = additionalActions.filter(
    (action) => !action.hidden || !action.hidden(item),
  );

  // Check if edit/delete is allowed via custom callbacks
  const canEdit = actions?.canEdit ? actions.canEdit(item) : true;
  const canDelete = actions?.canDelete ? actions.canDelete(item) : true;

  return (
    <div className="flex items-center gap-1">
      {/* Default Actions */}
      {defaultActions.includes("edit") && onEdit && canEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          className="h-8 w-8"
        >
          <IconEdit className="h-4 w-4" />
        </Button>
      )}

      {defaultActions.includes("delete") && onDelete && canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="h-8 w-8 text-destructive hover:bg-destructive hover:text-background"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      )}

      {/* Additional Actions Dropdown */}
      {visibleAdditionalActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {visibleAdditionalActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick(item)}
                disabled={action.disabled ? action.disabled(item) : false}
                className={action.className}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
