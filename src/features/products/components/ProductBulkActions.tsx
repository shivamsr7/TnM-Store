import { CheckCircle2, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductBulkActionsProps {
  selectedCount: number;

  onPublish: () => void;
  onDraft: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function ProductBulkActions({
  selectedCount,
  onPublish,
  onDraft,
  onDelete,
  onClear,
}: ProductBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />

        <p className="font-medium">
          {selectedCount} product{selectedCount > 1 ? "s" : ""} selected
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onPublish}>
          <Eye className="mr-2 h-4 w-4" />
          Publish
        </Button>

        <Button variant="outline" onClick={onDraft}>
          Draft
        </Button>

        <Button
          variant="destructive"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>

        <Button
          variant="ghost"
          onClick={onClear}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}