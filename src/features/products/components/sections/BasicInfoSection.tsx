import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import SectionCard from "@/shared/components/admin/SectionCard";

import type { ProductSchema } from "../../schemas/product.schema";

interface Props {
  form: UseFormReturn<ProductSchema>;
}

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function BasicInfoSection({ form }: Props) {
  const { register, watch, setValue } = form;

  const name = watch("name");

  useEffect(() => {
    setValue("slug", generateSlug(name || ""));
  }, [name, setValue]);

  return (
    <SectionCard
      title="Basic Information"
      description="Enter product name, descriptions and SEO-friendly slug."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>

          <Input
            id="name"
            placeholder="Premium Anti Tarnish Ring"
            {...register("name")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>

          <Input
            id="slug"
            placeholder="premium-anti-tarnish-ring"
            {...register("slug")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="short_description">
            Short Description
          </Label>

          <Textarea
            id="short_description"
            rows={3}
            placeholder="A short summary of the product..."
            {...register("short_description")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description
          </Label>

          <Textarea
            id="description"
            rows={6}
            placeholder="Write a detailed product description..."
            {...register("description")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="care_instructions">
            Care Instructions
          </Label>

          <Textarea
            id="care_instructions"
            rows={3}
            placeholder="Avoid perfume, water and chemicals..."
            {...register("care_instructions")}
          />
        </div>
      </div>
    </SectionCard>
  );
}