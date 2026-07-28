import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import SectionCard from "@/shared/components/admin/SectionCard";

import type { ProductSchema } from "../../schemas/product.schema";

interface Props {
  form: UseFormReturn<ProductSchema>;
}

export default function PricingSection({ form }: Props) {
  const { register, watch } = form;

  const costPrice = Number(watch("cost_price")) || 0;
  const sellingPrice = Number(watch("price")) || 0;
  const comparePrice = Number(watch("compare_price")) || 0;

  const profit = useMemo(() => {
    return sellingPrice - costPrice;
  }, [sellingPrice, costPrice]);

  const margin = useMemo(() => {
    if (!costPrice) return 0;

    return Number(((profit / costPrice) * 100).toFixed(1));
  }, [profit, costPrice]);

  const discount = useMemo(() => {
    if (!comparePrice || comparePrice <= sellingPrice) return 0;

    return Number(
      (
        ((comparePrice - sellingPrice) / comparePrice) *
        100
      ).toFixed(0)
    );
  }, [comparePrice, sellingPrice]);

  return (
    <SectionCard
      title="Pricing"
      description="Configure pricing, profit margin and discounts."
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cost_price">
              Cost Price (₹)
            </Label>

            <Input
              id="cost_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("cost_price", {
                valueAsNumber: true,
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              Selling Price (₹)
            </Label>

            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("price", {
                valueAsNumber: true,
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compare_price">
              Compare At Price (₹)
            </Label>

            <Input
              id="compare_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("compare_price", {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Profit
            </p>

            <p className="mt-1 text-2xl font-bold">
              ₹ {profit.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Profit Margin
            </p>

            <p className="mt-1 text-2xl font-bold">
              {margin}%
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Customer Discount
            </p>

            <p className="mt-1 text-2xl font-bold">
              {discount}%
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}