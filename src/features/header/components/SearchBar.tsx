import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Search,
  Mic,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useVoiceSearch,
} from "@/shared/hooks/useVoiceSearch";

import {
  productService,
} from "@/features/products/services/product.service";

import SearchDropdown, {
  type SearchProduct,
} from "@/features/search/components/SearchDropdown";


/*
 * =========================================================
 * TYPES
 * =========================================================
 */

interface SearchBarProps {

  value?: string;

  onChange?: (
    value: string
  ) => void;

  onSearch?: () => void;

  placeholder?: string;

}


/*
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const RECENT_SEARCHES_KEY =
  "tnm_recent_searches";

const MAX_RECENT_SEARCHES = 6;

const MAX_SEARCH_RESULTS = 6;


/*
 * =========================================================
 * SEARCH NORMALIZATION
 * =========================================================
 *
 * Makes:
 *
 * "Anti-Tarnish"
 * "anti tarnish"
 * "ANTI_TARNISH"
 *
 * behave similarly.
 * =========================================================
 */

const normalizeSearchText = (
  value: unknown
): string => {

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

};


/*
 * =========================================================
 * TOKENIZE SEARCH
 * =========================================================
 */

const getSearchTokens = (
  value: string
): string[] => {

  return normalizeSearchText(
    value
  )
    .split(" ")
    .filter(Boolean);

};


/*
 * =========================================================
 * WORD MATCH
 * =========================================================
 *
 * Prevents weak substring matches from dominating.
 *
 * Example:
 *
 * "ring" matches:
 * "ring"
 * "rings"
 *
 * but gives better relevance to actual word matches.
 * =========================================================
 */

const containsWord = (
  text: string,
  word: string
): boolean => {

  if (!text || !word) {
    return false;
  }

  const escaped =
    word.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  return new RegExp(
    `(?:^|\\s)${escaped}(?:s)?(?:\\s|$)`,
    "i"
  ).test(text);

};


/*
 * =========================================================
 * TOKEN COVERAGE
 * =========================================================
 *
 * Returns how many search words are actually present.
 *
 * Example:
 *
 * "gold anti tarnish ring"
 *
 * against:
 *
 * "Gold Anti Tarnish Ring"
 *
 * = 4/4
 * =========================================================
 */

const getTokenCoverage = (
  text: string,
  tokens: string[]
): number => {

  if (
    !text ||
    tokens.length === 0
  ) {

    return 0;

  }

  let matched = 0;

  tokens.forEach(
    (token) => {

      if (
        containsWord(
          text,
          token
        ) ||
        text.includes(token)
      ) {

        matched += 1;

      }

    }
  );

  return matched;

};


/*
 * =========================================================
 * PRODUCT SEARCH SCORE
 * =========================================================
 *
 * IMPORTANT:
 *
 * Product name is heavily prioritized.
 *
 * Description is deliberately very weak.
 *
 * This prevents:
 *
 * "Charm" search
 *
 * from showing watches merely because
 * "charm" appears somewhere in a description.
 * =========================================================
 */

const scoreProduct = (
  product: SearchProduct,
  searchTerm: string
): number => {

  const normalizedTerm =
    normalizeSearchText(
      searchTerm
    );

  const tokens =
    getSearchTokens(
      searchTerm
    );


  if (
    !normalizedTerm ||
    tokens.length === 0
  ) {

    return 0;

  }


  const name =
    normalizeSearchText(
      product.name
    );

  const sku =
    normalizeSearchText(
      product.sku
    );

  const slug =
    normalizeSearchText(
      product.slug
    );

  const shortDescription =
    normalizeSearchText(
      product.short_description
    );

  const description =
    normalizeSearchText(
      product.description
    );


  let score = 0;


  /*
   * =======================================================
   * PRODUCT NAME
   * =======================================================
   */

  if (
    name === normalizedTerm
  ) {

    score += 2000;

  }


  /*
   * Name starts with complete search
   *
   * "Charm Pendant"
   * for "Charm"
   */

  if (
    name.startsWith(
      normalizedTerm
    )
  ) {

    score += 1400;

  }


  /*
   * Name contains complete phrase
   */

  if (
    name.includes(
      normalizedTerm
    )
  ) {

    score += 1000;

  }


  /*
   * Individual name tokens
   */

  const nameTokenCoverage =
    getTokenCoverage(
      name,
      tokens
    );


  if (
    nameTokenCoverage > 0
  ) {

    score +=
      nameTokenCoverage * 300;

  }


  /*
   * Exact word matches in name
   */

  tokens.forEach(
    (token) => {

      if (
        containsWord(
          name,
          token
        )
      ) {

        score += 180;

      }

    }
  );


  /*
   * =======================================================
   * SKU
   * =======================================================
   */

  if (
    sku === normalizedTerm
  ) {

    score += 900;

  }

  else if (
    sku.includes(
      normalizedTerm
    )
  ) {

    score += 500;

  }


  /*
   * =======================================================
   * SLUG
   * =======================================================
   */

  if (
    slug === normalizedTerm
  ) {

    score += 700;

  }

  else if (
    slug.includes(
      normalizedTerm
    )
  ) {

    score += 350;

  }


  /*
   * =======================================================
   * SHORT DESCRIPTION
   *
   * Useful, but intentionally much weaker.
   * =======================================================
   */

  const shortDescriptionCoverage =
    getTokenCoverage(
      shortDescription,
      tokens
    );


  if (
    shortDescriptionCoverage > 0
  ) {

    score +=
      shortDescriptionCoverage * 45;

  }


  /*
   * =======================================================
   * FULL DESCRIPTION
   *
   * VERY LOW WEIGHT.
   *
   * This is the important fix for your "Charm" issue.
   * =======================================================
   */

  const descriptionCoverage =
    getTokenCoverage(
      description,
      tokens
    );


  if (
    descriptionCoverage > 0
  ) {

    score +=
      descriptionCoverage * 10;

  }


  return score;

};


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function SearchBar({

  value = "",

  onChange,

  onSearch,

  placeholder =
    "Search rings, earrings, watches...",

}: SearchBarProps) {


  /*
   * =======================================================
   * NAVIGATION
   * =======================================================
   */

  const navigate =
    useNavigate();


  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [
    allProducts,
    setAllProducts,
  ] = useState<SearchProduct[]>(
    []
  );


  const [
    results,
    setResults,
  ] = useState<SearchProduct[]>(
    []
  );


  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  const [
    isDropdownOpen,
    setDropdownOpen,
  ] = useState(false);


  const [
    recentSearches,
    setRecentSearches,
  ] = useState<string[]>(
    []
  );


  /*
   * =======================================================
   * REFS
   * =======================================================
   */

  const searchRef =
    useRef<HTMLDivElement>(
      null
    );


  const productsLoadedRef =
    useRef(false);


  const loadingProductsRef =
    useRef(false);


  const debounceRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);


  /*
   * =======================================================
   * VOICE SEARCH
   * =======================================================
   */

  const {
    isSupported,
    isListening,
    startListening,
  } = useVoiceSearch({

    onResult: (
      text
    ) => {

      onChange?.(
        text
      );


      setDropdownOpen(
        true
      );

    },

  });


  /*
   * =======================================================
   * LOAD PRODUCTS
   * =======================================================
   */

  const loadProducts =
    async (): Promise<SearchProduct[]> => {

      /*
       * Already loaded
       */

      if (
        productsLoadedRef.current
      ) {

        return allProducts;

      }


      /*
       * Prevent duplicate requests
       */

      if (
        loadingProductsRef.current
      ) {

        return [];

      }


      try {

        loadingProductsRef.current =
          true;

        setIsLoading(
          true
        );


        const products =
          await productService.getAll();


        const activeProducts =
          (
            products ?? []
          ).filter(
            (
              product: any
            ) =>
              product.status ===
              "active"
          );


        const formattedProducts =
          activeProducts as SearchProduct[];


        setAllProducts(
          formattedProducts
        );


        productsLoadedRef.current =
          true;


        return formattedProducts;

      }

      catch (
        error
      ) {

        console.error(
          "Search products fetch error:",
          error
        );


        setAllProducts(
          []
        );


        return [];

      }

      finally {

        loadingProductsRef.current =
          false;

        setIsLoading(
          false
        );

      }

    };


  /*
   * =======================================================
   * LOAD RECENT SEARCHES
   * =======================================================
   */

  useEffect(() => {

    try {

      const stored =
        localStorage.getItem(
          RECENT_SEARCHES_KEY
        );


      if (!stored) {

        return;

      }


      const parsed =
        JSON.parse(
          stored
        );


      if (
        Array.isArray(
          parsed
        )
      ) {

        setRecentSearches(
          parsed.filter(
            (
              item
            ): item is string =>
              typeof item ===
              "string"
          )
        );

      }

    }

    catch (
      error
    ) {

      console.error(
        "Failed to load recent searches:",
        error
      );

    }

  }, []);


  /*
   * =======================================================
   * SAVE RECENT SEARCH
   * =======================================================
   */

  const saveRecentSearch = (
    searchTerm: string
  ) => {

    const term =
      searchTerm.trim();


    if (!term) {

      return;

    }


    setRecentSearches(
      (
        previous
      ) => {

        const updated = [

          term,

          ...previous.filter(
            (
              item
            ) =>
              item.toLowerCase() !==
              term.toLowerCase()
          ),

        ].slice(
          0,
          MAX_RECENT_SEARCHES
        );


        try {

          localStorage.setItem(

            RECENT_SEARCHES_KEY,

            JSON.stringify(
              updated
            )

          );

        }

        catch (
          error
        ) {

          console.error(
            "Failed to save recent search:",
            error
          );

        }


        return updated;

      }
    );

  };


  /*
   * =======================================================
   * SMART SEARCH PRODUCTS
   * =======================================================
   */

  const searchProducts = (
    products: SearchProduct[],
    searchTerm: string
  ): SearchProduct[] => {

    const normalizedTerm =
      normalizeSearchText(
        searchTerm
      );


    if (!normalizedTerm) {

      return [];

    }


    /*
     * -------------------------------------------------------
     * SCORE EVERY PRODUCT
     * -------------------------------------------------------
     */

    const scoredProducts =
      products
        .map(
          (
            product,
            index
          ) => ({

            product,

            score:
              scoreProduct(
                product,
                normalizedTerm
              ),

            originalIndex:
              index,

          })
        )
        .filter(
          (
            item
          ) =>
            item.score > 0
        );


    /*
     * -------------------------------------------------------
     * IMPORTANT RELEVANCE RULE
     *
     * If we have strong matches in the product name,
     * don't allow weak description-only matches to
     * occupy the top results.
     *
     * This specifically fixes:
     *
     * Search: "Charm"
     *
     * Actual Charm products should win over watches
     * whose description happens to contain "charm".
     * -------------------------------------------------------
     */

    const strongNameMatches =
      scoredProducts.filter(
        (
          item
        ) => {

          const name =
            normalizeSearchText(
              item.product.name
            );

          return (

            name ===
              normalizedTerm ||

            name.includes(
              normalizedTerm
            ) ||

            getTokenCoverage(
              name,
              getSearchTokens(
                normalizedTerm
              )
            ) > 0

          );

        }
      );


    let finalProducts;


    if (
      strongNameMatches.length > 0
    ) {

      /*
       * Strong name matches exist.
       *
       * Prioritize those first and don't flood
       * the dropdown with weak description matches.
       */

      finalProducts =
        strongNameMatches;

    }

    else {

      /*
       * No product-name match.
       *
       * Allow SKU, slug, short description and
       * description to help.
       */

      finalProducts =
        scoredProducts;

    }


    /*
     * -------------------------------------------------------
     * SORT BY RELEVANCE
     *
     * Higher score first.
     *
     * Original index is used only as a stable
     * tie-breaker.
     * -------------------------------------------------------
     */

    finalProducts.sort(
      (
        a,
        b
      ) => {

        if (
          b.score !==
          a.score
        ) {

          return (
            b.score -
            a.score
          );

        }


        return (
          a.originalIndex -
          b.originalIndex
        );

      }
    );


    /*
     * -------------------------------------------------------
     * RETURN TOP RESULTS
     * -------------------------------------------------------
     */

    return finalProducts
      .slice(
        0,
        MAX_SEARCH_RESULTS
      )
      .map(
        (
          item
        ) =>
          item.product
      );

  };


  /*
   * =======================================================
   * LIVE SEARCH
   * =======================================================
   */

  useEffect(() => {

    if (
      debounceRef.current
    ) {

      clearTimeout(
        debounceRef.current
      );

    }


    const term =
      value.trim();


    if (!term) {

      setResults([]);

      setIsLoading(
        false
      );

      return;

    }


    debounceRef.current =
      setTimeout(
        async () => {

          let products =
            allProducts;


          if (
            !productsLoadedRef.current
          ) {

            products =
              await loadProducts();

          }


          const matchedProducts =
            searchProducts(
              products,
              term
            );


          setResults(
            matchedProducts
          );

        },
        250
      );


    return () => {

      if (
        debounceRef.current
      ) {

        clearTimeout(
          debounceRef.current
        );

      }

    };

  }, [
    value,
    allProducts,
  ]);


  /*
   * =======================================================
   * CLOSE DROPDOWN ON OUTSIDE CLICK
   * =======================================================
   */

  useEffect(() => {

    const handleClickOutside = (
      event: MouseEvent
    ) => {

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {

        setDropdownOpen(
          false
        );

      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  /*
   * =======================================================
   * SELECT RECENT / TRENDING
   * =======================================================
   */

  const handleSelectSearch = (
    searchTerm: string
  ) => {

    onChange?.(
      searchTerm
    );


    setDropdownOpen(
      true
    );

  };


  /*
   * =======================================================
   * REMOVE RECENT SEARCH
   * =======================================================
   */

  const handleRemoveRecent = (
    searchTerm: string
  ) => {

    setRecentSearches(
      (
        previous
      ) => {

        const updated =
          previous.filter(
            (
              item
            ) =>
              item.toLowerCase() !==
              searchTerm.toLowerCase()
          );


        try {

          localStorage.setItem(

            RECENT_SEARCHES_KEY,

            JSON.stringify(
              updated
            )

          );

        }

        catch (
          error
        ) {

          console.error(
            "Failed to update recent searches:",
            error
          );

        }


        return updated;

      }
    );

  };


  /*
   * =======================================================
   * CLEAR RECENT SEARCHES
   * =======================================================
   */

  const handleClearRecent =
    () => {

      setRecentSearches(
        []
      );


      try {

        localStorage.removeItem(
          RECENT_SEARCHES_KEY
        );

      }

      catch (
        error
      ) {

        console.error(
          "Failed to clear recent searches:",
          error
        );

      }

    };


  /*
   * =======================================================
   * PRODUCT CLICK
   * =======================================================
   */

  const handleProductClick = (
    product: SearchProduct
  ) => {

    saveRecentSearch(
      value
    );


    setDropdownOpen(
      false
    );


    navigate(
      `/product/${product.slug}`
    );

  };


  /*
   * =======================================================
   * SEARCH / VIEW ALL
   * =======================================================
   */

  const handleSearch = () => {

    const term =
      value.trim();


    if (!term) {

      return;

    }


    saveRecentSearch(
      term
    );


    setDropdownOpen(
      false
    );


    navigate(
      `/shop?search=${encodeURIComponent(
        term
      )}`
    );


    onSearch?.();

  };


  /*
   * =======================================================
   * CLEAR SEARCH
   * =======================================================
   */

  const handleClear = () => {

    onChange?.(
      ""
    );


    setResults([]);

    setDropdownOpen(
      true
    );

  };


  /*
   * =======================================================
   * KEYBOARD
   * =======================================================
   */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      handleSearch();

      return;

    }


    if (
      event.key ===
      "Escape"
    ) {

      setDropdownOpen(
        false
      );

    }

  };


  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (

    <div

      ref={
        searchRef
      }

      className="

        relative

        w-full

        max-w-[620px]

      "

    >

      {/* =====================================================
          SEARCH INPUT
      ====================================================== */}

      <div

        className="

          group

          flex

          h-14

          items-center

          rounded-full

          border

          border-transparent

          bg-[#F8F6F1]

          px-5

          transition-all

          duration-300

          hover:shadow-md

          focus-within:border-[#C8A44D]

          focus-within:bg-white

          focus-within:shadow-lg

        "

      >

        <input

          type="text"

          value={
            value
          }

          onFocus={() => {

            setDropdownOpen(
              true
            );

          }}

          onChange={(
            event
          ) => {

            onChange?.(
              event.target.value
            );


            setDropdownOpen(
              true
            );

          }}

          onKeyDown={
            handleKeyDown
          }

          placeholder={
            placeholder
          }

          autoComplete="off"

          className="

            min-w-0

            flex-1

            bg-transparent

            text-[15px]

            text-neutral-900

            placeholder:text-neutral-500

            focus:outline-none

          "

        />


        {/* =================================================
            CLEAR
        ================================================== */}

        {value.trim() && (

          <button

            type="button"

            onClick={
              handleClear
            }

            aria-label="Clear search"

            className="

              mr-1

              flex

              h-9
              w-9

              shrink-0

              items-center
              justify-center

              rounded-full

              text-neutral-500

              transition

              hover:bg-neutral-100

              hover:text-black

            "

          >

            <X
              size={17}
            />

          </button>

        )}


        {/* =================================================
            VOICE SEARCH
        ================================================== */}

        {isSupported && (

          <button

            type="button"

            onClick={
              startListening
            }

            aria-label="Voice Search"

            className="

              ml-1

              flex

              h-10
              w-10

              shrink-0

              items-center
              justify-center

              rounded-full

              transition

              hover:bg-white

              hover:text-[#C8A44D]

            "

          >

            <Mic

              className={`

                h-5
                w-5

                ${
                  isListening
                    ? "animate-pulse text-red-500"
                    : "text-neutral-700"
                }

              `}

            />

          </button>

        )}


        {/* =================================================
            SEARCH BUTTON
        ================================================== */}

        <button

          type="button"

          onClick={
            handleSearch
          }

          aria-label="Search"

          className="

            ml-1

            flex

            h-10
            w-10

            shrink-0

            items-center
            justify-center

            rounded-full

            transition

            hover:bg-white

            hover:text-[#C8A44D]

          "

        >

          <Search

            className="

              h-5
              w-5

              text-neutral-700

            "

          />

        </button>

      </div>


      {/* =====================================================
          SEARCH DROPDOWN
      ====================================================== */}

      <SearchDropdown

        open={
          isDropdownOpen
        }

        query={
          value
        }

        recentSearches={
          recentSearches
        }

        results={
          results
        }

        isLoading={
          isLoading
        }

        onSelectRecent={
          handleSelectSearch
        }

        onRemoveRecent={
          handleRemoveRecent
        }

        onClearRecent={
          handleClearRecent
        }

        onSelectProduct={
          handleProductClick
        }

        onViewAll={
          handleSearch
        }

      />

    </div>

  );

}