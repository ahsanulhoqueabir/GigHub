import { Button } from "@/components/ui/button";

interface CreatePageHeaderProps {
  title: string;
  description: string;
  onDiscard: () => void;
  onSaveAndReturn: (e: React.FormEvent) => void;
  onSave: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function CreatePageHeader({
  title,
  description,
  onDiscard,
  onSaveAndReturn,
  onSave,
  isSubmitting,
  disabled = false,
}: CreatePageHeaderProps) {
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
          size="lg"
        >
          {isSubmitting ? "Saving..." : "Discard"}
        </Button>

        <div className="flex flex-1 sm:flex-none gap-3">
          <Button
            type="submit"
            variant="saveReturn"
            disabled={isSubmitting || disabled}
            onClick={onSaveAndReturn}
            className="flex-1 sm:flex-none"
            size="lg"
          >
            {isSubmitting ? "Saving..." : "Save & Return"}
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSubmitting || disabled}
            className="flex-1 sm:flex-none"
            size="lg"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
