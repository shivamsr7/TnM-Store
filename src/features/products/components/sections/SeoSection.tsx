import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import SectionCard from "@/shared/components/admin/SectionCard";

import type { ProductSchema } from "../../schemas/product.schema";

interface Props {
  form: UseFormReturn<ProductSchema>;
}

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

export default function SeoSection({ form }: Props) {
  const { register, watch } = form;

  const productName = watch("name") || "Product Name";
  const slug = watch("slug") || "product-slug";

  const seoTitle =
    watch("seo_title") || productName;

  const seoDescription =
    watch("seo_description") ||
    watch("short_description") ||
    "Write a compelling description that encourages customers to click.";



  return (
    <SectionCard
      title="Search Engine Optimization"
      description="Optimize how this product appears on Google and other search engines."
    >
      <div className="space-y-6">

        <div className="space-y-2">
          <Label htmlFor="seo_title">
            SEO Title
          </Label>

          <Input
            id="seo_title"
            maxLength={TITLE_LIMIT}
            placeholder="Premium Anti Tarnish Ring"
            {...register("seo_title")}
          />

          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {seoTitle.length}/{TITLE_LIMIT}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_description">
            Meta Description
          </Label>

          <Textarea
            id="seo_description"
            rows={4}
            maxLength={DESCRIPTION_LIMIT}
            placeholder="Write a concise description for search engines..."
            {...register("seo_description")}
          />

          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {seoDescription.length}/{DESCRIPTION_LIMIT}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta_keywords">
            Meta Keywords
          </Label>

          <Input
            id="meta_keywords"
            placeholder="ring, anti tarnish, jewellery, adjustable ring"
            {...register("meta_keywords")}
          />

          <p className="text-xs text-muted-foreground">
            Separate keywords with commas.
          </p>
        </div>

        <div className="rounded-xl border bg-muted/30 p-5">
          <p className="mb-3 text-sm font-semibold">
            Google Search Preview
          </p>

          <div className="space-y-1">
            <h3 className="line-clamp-2 text-lg font-medium text-blue-600">
              {seoTitle}
            </h3>

            <p className="text-sm text-green-700 break-all">
              https://tnmjewels.com/products/{slug}
            </p>

            <p className="line-clamp-3 text-sm text-muted-foreground">
              {seoDescription}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="font-medium">
            SEO Tips
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Keep the title under 60 characters.</li>
            <li>Keep the description under 160 characters.</li>
            <li>Include important keywords naturally.</li>
            <li>Avoid repeating the same keyword excessively.</li>
            <li>Write titles that encourage clicks.</li>
          </ul>
        </div>

      </div>
    </SectionCard>
  );
}