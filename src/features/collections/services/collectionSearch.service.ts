import { supabase } from "@/shared/lib/supabase";

export interface SearchCollection {
  id: string;
  name: string;
  slug: string;
  productIds: string[];
}

function normalizeCollectionText(
  value: unknown
): string {

  return String(
    value ?? ""
  )
    .toLowerCase()
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[-_/]+/g,
      " "
    )
    .replace(
      /[^\p{L}\p{N}\s]+/gu,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}

function getTokens(
  value: string
): string[] {

  return normalizeCollectionText(
    value
  )
    .split(" ")
    .filter(Boolean);

}

export const collectionSearchService = {

  async findCollection(
    searchTerm: string
  ): Promise<SearchCollection | null> {

    const normalizedQuery =
      normalizeCollectionText(
        searchTerm
      );

    if (!normalizedQuery) {
      return null;
    }

    const {
      data: collections,
      error: collectionsError,
    } = await supabase
      .from("collections")
      .select(
        "id, name, slug"
      );

    if (collectionsError) {
      throw collectionsError;
    }

    const queryTokens =
      getTokens(
        normalizedQuery
      );

    const collection =
      (
        collections ?? []
      )
        .map(
          (
            item
          ) => {

            const name =
              normalizeCollectionText(
                item.name
              );

            const slug =
              normalizeCollectionText(
                item.slug
              );

            const exact =
              name === normalizedQuery ||
              slug === normalizedQuery;

            const searchable =
              `${name} ${slug}`;

            const allTokens =
              queryTokens.length >= 2 &&
              queryTokens.every(
                (
                  token
                ) =>
                  searchable.includes(
                    token
                  )
              );

            return {
              item,
              exact,
              allTokens,
            };

          }
        )
        .filter(
          (
            item
          ) =>
            item.exact ||
            item.allTokens
        )
        .sort(
          (
            a,
            b
          ) =>
            Number(b.exact) -
            Number(a.exact)
        )[0]
        ?.item;

    if (!collection) {
      return null;
    }

    const {
      data: mappings,
      error: mappingsError,
    } = await supabase
      .from("product_collections")
      .select(
        "product_id"
      )
      .eq(
        "collection_id",
        collection.id
      );

    if (mappingsError) {
      throw mappingsError;
    }

    return {
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      productIds:
        (
          mappings ?? []
        )
          .map(
            (
              row
            ) =>
              row.product_id
          )
          .filter(
            Boolean
          ),
    };

  },


  async getAllCollections(): Promise<SearchCollection[]> {

    const {
      data: collections,
      error: collectionsError,
    } = await supabase
      .from("collections")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (collectionsError) {
      throw collectionsError;
    }

    if (!collections || collections.length === 0) {
      return [];
    }

    const collectionIds = collections.map(
      (collection) => collection.id
    );

    const {
      data: mappings,
      error: mappingsError,
    } = await supabase
      .from("product_collections")
      .select("collection_id, product_id")
      .in("collection_id", collectionIds);

    if (mappingsError) {
      throw mappingsError;
    }

    const productIdsByCollection = new Map<
      string,
      string[]
    >();

    for (const mapping of mappings ?? []) {
      const existing =
        productIdsByCollection.get(
          mapping.collection_id
        ) ?? [];

      existing.push(mapping.product_id);

      productIdsByCollection.set(
        mapping.collection_id,
        existing
      );
    }

    return collections.map(
      (collection) => ({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        productIds:
          productIdsByCollection.get(
            collection.id
          ) ?? [],
      })
    );

  },

};
