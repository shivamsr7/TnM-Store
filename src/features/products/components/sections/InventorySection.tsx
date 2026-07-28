import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import SectionCard from "@/shared/components/admin/SectionCard";

import type { ProductSchema } from "../../schemas/product.schema";

interface Props {
  form: UseFormReturn<ProductSchema>;
}

export default function InventorySection({ form }: Props) {
  const { register, watch, setValue } = form;

  const quantity = Number(watch("stock")) || 0;
  const threshold = Number(watch("low_stock_threshold")) || 0;

  const trackInventory = watch("track_inventory");
  const continueSelling = watch("allow_backorders");

  const stockStatus =
    quantity <= 0
      ? "Out of Stock"
      : quantity <= threshold
      ? "Low Stock"
      : "In Stock";

  const statusColor =
    quantity <= 0
      ? "bg-red-100 text-red-700"
      : quantity <= threshold
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <SectionCard
      title="Inventory"
      description="Manage stock levels, SKU and inventory behaviour."
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
  <Label htmlFor="sku">SKU</Label>

  <Input
    id="sku"
    value="Auto Generated"
    disabled
    className="bg-muted text-muted-foreground cursor-not-allowed"
  />

  <p className="text-xs text-muted-foreground">
    SKU will be generated automatically when you save the product.
  </p>
</div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity">
              Stock Quantity
            </Label>

            <Input
              id="stock_quantity"
              type="number"
              disabled={!trackInventory}
              {...register("stock", {
                valueAsNumber: true,
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="low_stock_threshold">
              Low Stock Threshold
            </Label>

            <Input
              id="low_stock_threshold"
              type="number"
              disabled={!trackInventory}
              {...register("low_stock_threshold", {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-medium">
                Track Inventory
              </h3>

              <p className="text-sm text-muted-foreground">
                Automatically deduct stock when an order is placed.
              </p>
            </div>

            <Switch
              checked={trackInventory}
              onCheckedChange={(checked) =>
                setValue("track_inventory", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-medium">
                Continue selling when out of stock
              </h3>

              <p className="text-sm text-muted-foreground">
                Customers can continue purchasing even if inventory reaches zero.
              </p>
            </div>

            <Switch
              checked={continueSelling}
              onCheckedChange={(checked) =>
                setValue("allow_backorders", checked)
              }
            />
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Current Stock Status
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}
            >
              {stockStatus}
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}