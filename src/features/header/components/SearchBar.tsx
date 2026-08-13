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
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const navigate =
    useNavigate();


  /*
   * =========================================================
   * STATE
   * =========================================================
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
   * =========================================================
   * REFS
   * =========================================================
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
   * =========================================================
   * VOICE SEARCH
   * =========================================================
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
   * =========================================================
   * LOAD PRODUCTS
   * =========================================================
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
   * =========================================================
   * LOAD RECENT SEARCHES
   * =========================================================
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
   * =========================================================
   * SAVE RECENT SEARCH
   * =========================================================
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
   * =========================================================
   * SEARCH PRODUCTS
   * =========================================================
   */

  const searchProducts = (
    products: SearchProduct[],
    searchTerm: string
  ): SearchProduct[] => {

    const term =
      searchTerm
        .trim()
        .toLowerCase();


    if (!term) {

      return [];

    }


    const matchedProducts =
      products.filter(
        (
          product
        ) => {

          const name =
            String(
              product.name ?? ""
            ).toLowerCase();


          const sku =
            String(
              product.sku ?? ""
            ).toLowerCase();


          const slug =
            String(
              product.slug ?? ""
            ).toLowerCase();


          const description =
            String(
              product.description ?? ""
            ).toLowerCase();


          const shortDescription =
            String(
              product.short_description ?? ""
            ).toLowerCase();


          return (

            name.includes(
              term
            ) ||

            sku.includes(
              term
            ) ||

            slug.includes(
              term
            ) ||

            description.includes(
              term
            ) ||

            shortDescription.includes(
              term
            )

          );

        }
      );


    return matchedProducts.slice(
      0,
      MAX_SEARCH_RESULTS
    );

  };


  /*
   * =========================================================
   * LIVE SEARCH
   * =========================================================
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
   * =========================================================
   * CLOSE DROPDOWN ON OUTSIDE CLICK
   * =========================================================
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
   * =========================================================
   * SELECT RECENT / TRENDING
   * =========================================================
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
   * =========================================================
   * REMOVE RECENT SEARCH
   * =========================================================
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
   * =========================================================
   * CLEAR RECENT SEARCHES
   * =========================================================
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
   * =========================================================
   * PRODUCT CLICK
   * =========================================================
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
   * =========================================================
   * SEARCH / VIEW ALL
   * =========================================================
   *
   * IMPORTANT:
   *
   * View All now opens:
   *
   * /shop?search=Earrings
   *
   * instead of relying on the header's
   * generic onSearch callback.
   *
   * =========================================================
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


    /*
     * Keep the existing callback
     * for any parent-level behavior.
     */

    onSearch?.();

  };


  /*
   * =========================================================
   * CLEAR SEARCH
   * =========================================================
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
   * =========================================================
   * KEYBOARD
   * =========================================================
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
   * =========================================================
   * RENDER
   * =========================================================
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