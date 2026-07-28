interface ProductStatusBadgeProps {
  status:
    | "active"
    | "draft"
    | "hidden"
    | "archived"
    | "out_of_stock";
}

const statusStyles = {
  active:
    "bg-green-100 text-green-700 border border-green-200",

  draft:
    "bg-yellow-100 text-yellow-700 border border-yellow-200",

  hidden:
    "bg-gray-100 text-gray-700 border border-gray-200",

  archived:
    "bg-red-100 text-red-700 border border-red-200",

  out_of_stock:
    "bg-orange-100 text-orange-700 border border-orange-200",
} satisfies Record<ProductStatusBadgeProps["status"], string>;

const statusLabels = {
  active: "Active",

  draft: "Draft",

  hidden: "Hidden",

  archived: "Archived",

  out_of_stock: "Out of Stock",
} satisfies Record<ProductStatusBadgeProps["status"], string>;

export default function ProductStatusBadge({
  status,
}: ProductStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}