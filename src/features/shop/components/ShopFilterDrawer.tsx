import {
  useEffect,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  X,
  SlidersHorizontal,
  Check,
  ChevronRight,
} from "lucide-react";


export interface ShopFilterValues {
  inStock: boolean;
  onSale: boolean;
  minDiscount: number;
  minRating: number;

  bestSeller: boolean;
  newArrival: boolean;
  trending: boolean;
  editorsPick: boolean;
  featured: boolean;

  minPrice: number;
  maxPrice: number | null;
}


interface ShopFilterDrawerProps {

  open: boolean;

  onClose: () => void;

  values: ShopFilterValues;

  onApply: (
    values: ShopFilterValues
  ) => void;

  onClear: () => void;
}


export default function ShopFilterDrawer({

  open,
  onClose,
  values,
  onApply,
  onClear,

}: ShopFilterDrawerProps) {


  /*
   * =========================================================
   * Draft state
   * =========================================================
   */

  const [
    draft,
    setDraft,
  ] = useState<ShopFilterValues>(
    values
  );


  /*
   * =========================================================
   * Sync only when drawer OPENS
   * =========================================================
   */

  useEffect(() => {

    if (!open) {
      return;
    }

    setDraft({
      ...values,
    });

  }, [open]);


  /*
   * =========================================================
   * Lock background scrolling
   * =========================================================
   */

  useEffect(() => {

    if (!open) {
      return;
    }


    const body =
      document.body;

    const html =
      document.documentElement;

    const scrollY =
      window.scrollY;


    const previous = {
      bodyOverflow:
        body.style.overflow,

      bodyPosition:
        body.style.position,

      bodyTop:
        body.style.top,

      bodyWidth:
        body.style.width,

      htmlOverflow:
        html.style.overflow,
    };


    body.style.overflow =
      "hidden";

    body.style.position =
      "fixed";

    body.style.top =
      `-${scrollY}px`;

    body.style.width =
      "100%";

    html.style.overflow =
      "hidden";


    return () => {

      body.style.overflow =
        previous.bodyOverflow;

      body.style.position =
        previous.bodyPosition;

      body.style.top =
        previous.bodyTop;

      body.style.width =
        previous.bodyWidth;

      html.style.overflow =
        previous.htmlOverflow;


      window.scrollTo(
        0,
        scrollY
      );

    };

  }, [open]);


  if (!open) {
    return null;
  }


  /*
   * =========================================================
   * Update one draft value
   * =========================================================
   */

  function updateDraft(
    updates: Partial<ShopFilterValues>
  ) {

    setDraft(
      (current) => ({
        ...current,
        ...updates,
      })
    );

  }


  /*
   * =========================================================
   * Price
   * =========================================================
   */

  function handlePriceRange(
    min: number,
    max: number | null
  ) {

    updateDraft({
      minPrice: min,
      maxPrice: max,
    });

  }


  /*
   * =========================================================
   * Apply
   * =========================================================
   */

  function handleApply() {

    onApply({
      ...draft,
    });

  }


  /*
   * =========================================================
   * Clear
   * =========================================================
   */

  function handleClear() {

    const empty: ShopFilterValues = {

      inStock: false,
      onSale: false,

      minDiscount: 0,
      minRating: 0,

      bestSeller: false,
      newArrival: false,
      trending: false,
      editorsPick: false,
      featured: false,

      minPrice: 0,
      maxPrice: null,
    };


    setDraft(
      empty
    );

    onClear();

  }


  return createPortal(

    <div
      className="
        fixed
        inset-0
        z-[9998]

        flex
        items-end
        justify-center

        bg-black/55
        backdrop-blur-[3px]

        sm:items-center
      "
      onClick={onClose}
    >

      {/* =====================================================
          Drawer

          Mobile:
          - Bottom sheet

          Desktop:
          - Truly centered in the viewport
          - No top/bottom/translate positioning conflict
      ====================================================== */}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"

        className="
          pointer-events-auto

          flex
          h-[90vh]
          max-h-[760px]
          w-full
          flex-col

          overflow-hidden

          rounded-t-[28px]

          border
          border-neutral-200

          bg-white

          shadow-[0_-20px_70px_rgba(0,0,0,0.25)]

          sm:h-[720px]
          sm:max-h-[86vh]
          sm:w-[460px]

          sm:rounded-[24px]

          sm:shadow-[0_25px_80px_rgba(0,0,0,0.25)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* =================================================
            Mobile Handle
        ================================================== */}

        <div
          className="
            absolute
            left-1/2
            top-2.5
            h-1
            w-10
            -translate-x-1/2
            rounded-full
            bg-neutral-200
            sm:hidden
          "
        />


        {/* =================================================
            Header
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between

            border-b
            border-neutral-200

            px-5
            pb-4
            pt-6

            sm:px-6
            sm:py-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-full

                bg-[#D4AF37]/10
                text-[#A77C1F]
              "
            >

              <SlidersHorizontal
                size={17}
              />

            </div>


            <div>

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#A77C1F]
                "
              >
                Refine
              </p>

              <h2
                className="
                  mt-0.5
                  text-base
                  font-semibold
                  text-neutral-900
                "
              >
                Filters
              </h2>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}

            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              border
              border-neutral-200

              bg-neutral-50

              text-neutral-500

              hover:bg-neutral-100

              active:scale-95
            "
          >

            <X
              size={17}
            />

          </button>

        </div>


        {/* =================================================
            CONTENT
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1

            overflow-y-auto
            overscroll-contain

            px-5
            py-2

            sm:px-6
          "
        >

          {/* PRICE */}

          <FilterSection
            title="Price"
            subtitle="Choose your budget"
          >

            <div
              className="
                grid
                grid-cols-2
                gap-2
              "
            >

              {[
                {
                  label: "Under ₹299",
                  min: 0,
                  max: 299,
                },

                {
                  label: "₹299 – ₹499",
                  min: 299,
                  max: 499,
                },

                {
                  label: "₹500 – ₹999",
                  min: 500,
                  max: 999,
                },

                {
                  label: "₹1,000 – ₹1,999",
                  min: 1000,
                  max: 1999,
                },

                {
                  label: "₹2,000+",
                  min: 2000,
                  max: null,
                },

              ].map(
                (range) => (

                  <FilterButton
                    key={
                      range.label
                    }

                    active={
                      draft.minPrice ===
                        range.min &&
                      draft.maxPrice ===
                        range.max
                    }

                    onClick={() =>
                      handlePriceRange(
                        range.min,
                        range.max
                      )
                    }
                  >
                    {range.label}
                  </FilterButton>

                )
              )}

            </div>

          </FilterSection>


          {/* AVAILABILITY */}

          <FilterSection
            title="Availability"
            subtitle="Show products ready to ship"
          >

            <Checkbox
              checked={
                draft.inStock
              }

              onChange={(value) =>
                updateDraft({
                  inStock: value,
                })
              }

              label="In Stock"
            />

          </FilterSection>


          {/* OFFERS */}

          <FilterSection
            title="Offers"
            subtitle="Find the best value"
          >

            <Checkbox
              checked={
                draft.onSale
              }

              onChange={(value) =>
                updateDraft({
                  onSale: value,
                })
              }

              label="On Sale"
            />


            <Checkbox
              checked={
                draft.minDiscount ===
                10
              }

              onChange={(value) =>
                updateDraft({
                  minDiscount:
                    value ? 10 : 0,
                })
              }

              label="10%+ Off"
            />


            <Checkbox
              checked={
                draft.minDiscount ===
                20
              }

              onChange={(value) =>
                updateDraft({
                  minDiscount:
                    value ? 20 : 0,
                })
              }

              label="20%+ Off"
            />


            <Checkbox
              checked={
                draft.minDiscount ===
                30
              }

              onChange={(value) =>
                updateDraft({
                  minDiscount:
                    value ? 30 : 0,
                })
              }

              label="30%+ Off"
            />

          </FilterSection>


          {/* RATING */}

          <FilterSection
            title="Rating"
            subtitle="Shop highly rated pieces"
          >

            <Checkbox
              checked={
                draft.minRating ===
                4
              }

              onChange={(value) =>
                updateDraft({
                  minRating:
                    value ? 4 : 0,
                })
              }

              label="4★ & above"
            />


            <Checkbox
              checked={
                draft.minRating ===
                3
              }

              onChange={(value) =>
                updateDraft({
                  minRating:
                    value ? 3 : 0,
                })
              }

              label="3★ & above"
            />

          </FilterSection>


          {/* COLLECTIONS */}

          <FilterSection
            title="Collections"
            subtitle="Discover what's trending"
          >

            <Checkbox
              checked={
                draft.bestSeller
              }

              onChange={(value) =>
                updateDraft({
                  bestSeller: value,
                })
              }

              label="Best Sellers"
            />


            <Checkbox
              checked={
                draft.newArrival
              }

              onChange={(value) =>
                updateDraft({
                  newArrival: value,
                })
              }

              label="New Arrivals"
            />


            <Checkbox
              checked={
                draft.trending
              }

              onChange={(value) =>
                updateDraft({
                  trending: value,
                })
              }

              label="Trending"
            />


            <Checkbox
              checked={
                draft.editorsPick
              }

              onChange={(value) =>
                updateDraft({
                  editorsPick: value,
                })
              }

              label="Editor's Pick"
            />


            <Checkbox
              checked={
                draft.featured
              }

              onChange={(value) =>
                updateDraft({
                  featured: value,
                })
              }

              label="Featured"
            />

          </FilterSection>

        </div>


        {/* =================================================
            FOOTER
        ================================================== */}

        <div
          className="
            shrink-0

            border-t
            border-neutral-200

            bg-white

            px-5
            pb-[calc(14px+env(safe-area-inset-bottom))]
            pt-4

            sm:px-6
            sm:pb-5
          "
        >

          <div
            className="
              flex
              gap-3
            "
          >

            <button
              type="button"
              onClick={
                handleClear
              }

              className="
                min-h-12
                flex-1

                rounded-full

                border
                border-neutral-200

                bg-white

                text-xs
                font-medium
                text-neutral-600

                hover:bg-neutral-50
              "
            >
              Clear All
            </button>


            <button
              type="button"
              onClick={
                handleApply
              }

              className="
                min-h-12
                flex-[1.25]

                rounded-full

                bg-[#D4AF37]

                text-xs
                font-semibold
                text-black

                shadow-[0_6px_18px_rgba(212,175,55,0.16)]

                hover:bg-[#E3C45F]

                active:scale-[0.98]
              "
            >

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                "
              >

                Apply Filters

                <ChevronRight
                  size={14}
                />

              </span>

            </button>

          </div>

        </div>

      </div>

    </div>,

    document.body

  );
}


/* ============================================================
   SECTION
============================================================ */

function FilterSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {

  return (

    <section
      className="
        border-b
        border-neutral-100
        py-5
      "
    >

      <div
        className="
          mb-3
        "
      >

        <h3
          className="
            text-sm
            font-semibold
            text-neutral-900
          "
        >
          {title}
        </h3>


        {subtitle && (

          <p
            className="
              mt-0.5
              text-[10px]
              text-neutral-400
            "
          >
            {subtitle}
          </p>

        )}

      </div>


      <div
        className="
          space-y-1
        "
      >
        {children}
      </div>

    </section>

  );
}


/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {

  return (

    <button
      type="button"
      onClick={onClick}

      className={`
        flex
        min-h-11
        items-center
        justify-between

        rounded-xl
        border

        px-3

        text-[11px]
        font-medium

        ${
          active
            ? `
              border-[#D4AF37]
              bg-[#FFF9E8]
              text-[#8B6817]
            `
            : `
              border-neutral-200
              bg-white
              text-neutral-600
            `
        }
      `}
    >

      <span>
        {children}
      </span>


      {active && (

        <span
          className="
            flex
            h-5
            w-5
            items-center
            justify-center

            rounded-full

            bg-[#D4AF37]

            text-black
          "
        >

          <Check
            size={12}
          />

        </span>

      )}

    </button>

  );
}


/* ============================================================
   CHECKBOX
============================================================ */

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
  label: string;
}) {

  return (

    <button
      type="button"

      aria-pressed={
        checked
      }

      onClick={() =>
        onChange(
          !checked
        )
      }

      className="
        group

        flex
        min-h-11
        w-full
        items-center
        justify-between

        rounded-xl

        px-3
        py-2

        text-left

        hover:bg-neutral-50
      "
    >

      <span
        className="
          flex
          items-center
          gap-3
        "
      >

        <span
          className={`
            flex
            h-5
            w-5
            shrink-0

            items-center
            justify-center

            rounded-md
            border

            ${
              checked
                ? `
                  border-[#D4AF37]
                  bg-[#D4AF37]
                  text-black
                `
                : `
                  border-neutral-300
                  bg-white
                `
            }
          `}
        >

          {checked && (

            <Check
              size={13}
              strokeWidth={2.5}
            />

          )}

        </span>


        <span
          className={`
            text-xs

            ${
              checked
                ? `
                  font-medium
                  text-neutral-900
                `
                : `
                  text-neutral-600
                `
            }
          `}
        >
          {label}
        </span>

      </span>

    </button>

  );
}