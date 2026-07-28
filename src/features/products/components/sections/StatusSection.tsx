import type { UseFormReturn } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SectionCard from "@/shared/components/admin/SectionCard";
import ToggleCard from "@/shared/components/select/ToggleCard";

import type { ProductSchema } from "../../schemas/product.schema";

interface Props {
  form: UseFormReturn<ProductSchema>;
}

export default function StatusSection({ form }: Props) {
  const { watch, setValue } = form;

  const status = watch("status");

  return (
    <SectionCard
      title="Publishing & Visibility"
      description="Control how and where this product appears on your store."
    >
      <div className="space-y-6">

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Product Status
          </label>

          <Select
            value={status}
            onValueChange={(value) =>
              setValue(
                "status",
                value as ProductSchema["status"],
                {
                  shouldDirty: true,
                }
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="draft">
                Draft
              </SelectItem>

              <SelectItem value="active">
                Active
              </SelectItem>

              <SelectItem value="hidden">
                Hidden
              </SelectItem>

              <SelectItem value="archived">
                Archived
              </SelectItem>

              <SelectItem value="out_of_stock">
                Out of Stock
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">

          <ToggleCard
            title="Featured Product"
            description="Display this product in Featured collections."
            checked={watch("featured")}
            onChange={(checked) =>
              setValue("featured", checked, {
                shouldDirty: true,
              })
            }
          />

          <ToggleCard
            title="New Arrival"
            description="Highlight this product in New Arrivals."
            checked={watch("new_arrival")}
            onChange={(checked) =>
              setValue("new_arrival", checked, {
                shouldDirty: true,
              })
            }
          />

          <ToggleCard
            title="Best Seller"
            description="Show this product in Best Sellers."
            checked={watch("best_seller")}
            onChange={(checked) =>
              setValue("best_seller", checked, {
                shouldDirty: true,
              })
            }
          />

          <ToggleCard
            title="Trending Product"
            description="Promote this product in Trending sections."
            checked={watch("trending")}
            onChange={(checked) =>
              setValue("trending", checked, {
                shouldDirty: true,
              })
            }
          />

          <ToggleCard
            title="Editor's Pick"
            description="Mark this product as an Editor's Pick."
            checked={watch("editors_pick")}
            onChange={(checked) =>
              setValue("editors_pick", checked, {
                shouldDirty: true,
              })
            }
          />

        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
          <h4 className="font-medium">
            Current Status
          </h4>

          <p className="mt-2 text-sm text-muted-foreground">
            {status === "draft" &&
              "This product is saved as a draft and is not visible to customers."}

            {status === "active" &&
              "This product is live and available for purchase."}

            {status === "hidden" &&
              "This product exists but is hidden from customers."}

            {status === "archived" &&
              "This product has been archived and is no longer active."}

            {status === "out_of_stock" &&
              "Customers can view the product, but it is currently unavailable."}
          </p>
        </div>

      </div>
    </SectionCard>
  );
}