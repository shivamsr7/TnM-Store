import type { UseFormReturn } from "react-hook-form";

import SectionCard from "@/shared/components/admin/SectionCard";
import MultiSelect from "@/shared/components/select/MultiSelect";
import SearchableSelect from "@/shared/components/select/SearchableSelect";
import ToggleCard from "@/shared/components/select/ToggleCard";

import type { ProductSchema } from "../../schemas/product.schema";

interface Option {
  id: string;
  name: string;
}

interface Props {
  form: UseFormReturn<ProductSchema>;

  categories: Option[];
  subcategories: Option[];

  brands: Option[];
  collections: Option[];
  tags: Option[];
}

export default function OrganizationSection({
  form,
  categories,
  subcategories,
  brands,
  collections,
  tags,
}: Props) {
  const { watch, setValue } = form;

  return (
    <SectionCard
      title="Organization"
      description="Assign categories, subcategories, brands, collections, tags and product visibility."
    >
      <div className="space-y-6">

        {/* Category / Subcategory */}

        <div className="grid gap-5 md:grid-cols-2">

          <SearchableSelect
            label="Category"
            value={watch("category_id")}
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            onChange={(value) => {
              setValue("category_id", value, {
                shouldDirty: true,
              });

              setValue("subcategory_id", "", {
                shouldDirty: true,
              });
            }}
          />

          <SearchableSelect
            label="Subcategory"
            value={watch("subcategory_id") ?? ""}
            disabled={!watch("category_id")}
            options={subcategories.map((subcategory) => ({
              value: subcategory.id,
              label: subcategory.name,
            }))}
            onChange={(value) =>
              setValue("subcategory_id", value, {
                shouldDirty: true,
              })
            }
          />

        </div>

        {/* Brand */}

        <div className="grid gap-5 md:grid-cols-2">

          <SearchableSelect
            label="Brand"
            value={watch("brand_id") ?? ""}
            options={brands.map((brand) => ({
              value: brand.id,
              label: brand.name,
            }))}
            onChange={(value) =>
              setValue("brand_id", value, {
                shouldDirty: true,
              })
            }
          />

          <div />

        </div>

        {/* Collections / Tags */}

        <div className="grid gap-5 md:grid-cols-2">

          <MultiSelect
            label="Collections"
            value={watch("collection_ids") ?? []}
            options={collections.map((collection) => ({
              value: collection.id,
              label: collection.name,
            }))}
            onChange={(value) =>
              setValue("collection_ids", value, {
                shouldDirty: true,
              })
            }
          />

          <MultiSelect
            label="Tags"
            value={watch("tag_ids") ?? []}
            options={tags.map((tag) => ({
              value: tag.id,
              label: tag.name,
            }))}
            onChange={(value) =>
              setValue("tag_ids", value, {
                shouldDirty: true,
              })
            }
          />

        </div>

        {/* Product Flags */}

        <div className="space-y-4">

          <ToggleCard
            title="Featured Product"
            description="Display this product in featured sections across the website."
            checked={watch("featured")}
            onChange={(checked) =>
              setValue("featured", checked, {
                shouldDirty: true,
              })
            }
          />

          <ToggleCard
            title="New Arrival"
            description="Highlight this product in the New Arrivals collection."
            checked={watch("new_arrival")}
            onChange={(checked) =>
              setValue("new_arrival", checked, {
                shouldDirty: true,
              })
            }
          />

          <ToggleCard
            title="Best Seller"
            description="Show this product in the Best Sellers section."
            checked={watch("best_seller")}
            onChange={(checked) =>
              setValue("best_seller", checked, {
                shouldDirty: true,
              })
            }
          />

        </div>

      </div>
    </SectionCard>
  );
}