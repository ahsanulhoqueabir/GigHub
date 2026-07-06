import { Button } from "@/components/ui/button";

interface EditPageHeaderProps {
  title: string;
  description: string;
  onDiscard: () => void;
  onSave: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function EditPageHeader({
  title,
  description,
  onDiscard,
  onSave,
  isSubmitting,
  disabled = false,
}: EditPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-start">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onDiscard}
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          Discard
        </Button>

        <Button
          type="button"
          onClick={onSave}
          disabled={isSubmitting || disabled}
          className="flex-1 sm:flex-none"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
