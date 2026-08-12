import {
  ChevronDown,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";


interface ProductAccordionProps {

  product: any;

}


export default function ProductAccordion({

  product,

}: ProductAccordionProps) {


  const [
    open,
    setOpen,
  ] = useState<string | null>(
    null
  );


  /*
   * =========================================================
   * FORMAT SPECIFICATION LABEL
   * =========================================================
   *
   * Example:
   *
   * base_metal
   *      ↓
   * Base Metal
   *
   * bracelet_type
   *      ↓
   * Bracelet Type
   */

  const formatSpecificationLabel = (
    key: string
  ) => {

    return key

      .replace(
        /_/g,
        " "
      )

      .replace(
        /\b\w/g,
        char =>
          char.toUpperCase()
      );

  };


  /*
   * =========================================================
   * SPECIFICATIONS
   * =========================================================
   */

  const specifications =
    useMemo(() => {

      if (
        !product?.specifications ||
        typeof product.specifications !==
          "object" ||
        Array.isArray(
          product.specifications
        )
      ) {

        return [];

      }


      return Object.entries(
        product.specifications
      )

        .filter(
          ([, value]) =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        )

        .map(
          ([key, value]) => ({

            label:
              formatSpecificationLabel(
                key
              ),

            value:
              String(value),

          })
        );

    }, [
      product?.specifications,
    ]);


  /*
   * =========================================================
   * PRODUCT DETAILS
   * =========================================================
   */

  const productDetails =
    useMemo(() => {

      const details: {
        label: string;
        value: string;
      }[] = [];


      /*
       * Category
       */

      if (
        product?.category?.name
      ) {

        details.push({

          label:
            "Category",

          value:
            product.category.name,

        });

      }


      /*
       * Specifications
       */

      specifications.forEach(
        specification => {

          details.push(
            specification
          );

        }
      );


      return details;

    }, [
      product?.category?.name,
      specifications,
    ]);


  /*
   * =========================================================
   * DIMENSIONS & WEIGHT
   * =========================================================
   */

  const dimensions =
    useMemo(() => {

      const values: {
        label: string;
        value: string;
      }[] = [];


      /*
       * Weight
       *
       * Stored in KG
       */

      if (
        product?.weight !== null &&
        product?.weight !== undefined &&
        product?.weight !== ""
      ) {

        values.push({

          label:
            "Weight",

          value:
            `${product.weight} kg`,

        });

      }


      /*
       * Length
       *
       * Stored in CM
       */

      if (
        product?.length !== null &&
        product?.length !== undefined &&
        product?.length !== ""
      ) {

        values.push({

          label:
            "Length",

          value:
            `${product.length} cm`,

        });

      }


      /*
       * Width
       */

      if (
        product?.width !== null &&
        product?.width !== undefined &&
        product?.width !== ""
      ) {

        values.push({

          label:
            "Width",

          value:
            `${product.width} cm`,

        });

      }


      /*
       * Height
       */

      if (
        product?.height !== null &&
        product?.height !== undefined &&
        product?.height !== ""
      ) {

        values.push({

          label:
            "Height",

          value:
            `${product.height} cm`,

        });

      }


      return values;

    }, [

      product?.weight,

      product?.length,

      product?.width,

      product?.height,

    ]);


  /*
   * =========================================================
   * SECTIONS
   * =========================================================
   */

  const sections =
    useMemo(() => {

      const result: {
        id: string;
        title: string;
        content: React.ReactNode;
      }[] = [];


      /*
       * =====================================================
       * DESCRIPTION
       * =====================================================
       */

      if (
        product?.description &&
        product.description.trim()
      ) {

        result.push({

          id:
            "description",

          title:
            "Description",

          content:

            <p>

              {
                product.description
              }

            </p>,

        });

      }


      /*
       * =====================================================
       * PRODUCT DETAILS
       * =====================================================
       */

      if (
        productDetails.length > 0
      ) {

        result.push({

          id:
            "details",

          title:
            "Product Details",

          content:

            <div
              className="
                space-y-3
              "
            >

              {
                productDetails.map(
                  (
                    detail
                  ) => (

                    <div

                      key={
                        detail.label
                      }

                      className="
                        flex
                        items-start
                        justify-between
                        gap-6
                      "

                    >

                      <span
                        className="
                          text-neutral-500
                        "
                      >

                        {
                          detail.label
                        }

                      </span>


                      <span
                        className="
                          text-right
                          text-white
                        "
                      >

                        {
                          detail.value
                        }

                      </span>

                    </div>

                  )
                )
              }

            </div>,

        });

      }


      /*
       * =====================================================
       * WEIGHT & DIMENSIONS
       * =====================================================
       */

      if (
        dimensions.length > 0
      ) {

        result.push({

          id:
            "dimensions",

          title:
            "Weight & Dimensions",

          content:

            <div
              className="
                space-y-3
              "
            >

              {
                dimensions.map(
                  (
                    dimension
                  ) => (

                    <div

                      key={
                        dimension.label
                      }

                      className="
                        flex
                        items-start
                        justify-between
                        gap-6
                      "

                    >

                      <span
                        className="
                          text-neutral-500
                        "
                      >

                        {
                          dimension.label
                        }

                      </span>


                      <span
                        className="
                          text-right
                          text-white
                        "
                      >

                        {
                          dimension.value
                        }

                      </span>

                    </div>

                  )
                )
              }

            </div>,

        });

      }


      /*
       * =====================================================
       * CARE GUIDE
       * =====================================================
       */

      if (
        product?.care_instructions &&
        product.care_instructions.trim()
      ) {

        result.push({

          id:
            "care",

          title:
            "Care Guide",

          content:

            <p>

              {
                product.care_instructions
              }

            </p>,

        });

      }


      /*
       * =====================================================
       * SHIPPING & RETURNS
       * =====================================================
       *
       * This is currently store-level static content.
       * We can connect it to CMS/policies later.
       */

      result.push({

        id:
          "shipping",

        title:
          "Shipping & Returns",

        content:

          <p>

            Orders are carefully packed
            and shipped securely.
            Delivery timelines depend on
            your location. Please check our
            return policy for complete details.

          </p>,

      });


      return result;

    }, [

      product?.description,

      product?.care_instructions,

      productDetails,

      dimensions,

    ]);


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <div

      className="
        mt-8
        border-t
        border-[#D4AF37]/20
      "

    >

      {
        sections.map(
          (
            section
          ) => (

            <div

              key={
                section.id
              }

              className="
                border-b
                border-[#D4AF37]/20
              "

            >

              {/* =================================================
                  HEADER
              ================================================== */}

              <button

                type="button"

                onClick={() =>

                  setOpen(

                    open ===
                      section.id

                      ? null

                      : section.id

                  )

                }

                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  py-5
                  text-left
                "

              >

                <span

                  className="
                    text-sm
                    font-medium
                    tracking-wide
                    text-white
                    md:text-base
                  "

                >

                  {
                    section.title
                  }

                </span>


                <ChevronDown

                  size={
                    18
                  }

                  className={`

                    text-[#D4AF37]

                    transition-transform

                    duration-300

                    ease-out

                    ${
                      open ===
                      section.id

                        ? "rotate-180"

                        : ""
                    }

                  `}

                />

              </button>


              {/* =================================================
                  CONTENT
              ================================================== */}

              <div

                className={`

                  grid

                  transition-[grid-template-rows]

                  duration-300

                  ease-out

                  ${
                    open ===
                    section.id

                      ? "grid-rows-[1fr]"

                      : "grid-rows-[0fr]"
                  }

                `}

              >

                <div
                  className="
                    overflow-hidden
                  "
                >

                  <div

                    className="
                      pb-5
                      text-sm
                      leading-7
                      text-neutral-400
                    "

                  >

                    {
                      section.content
                    }

                  </div>

                </div>

              </div>

            </div>

          )
        )
      }

    </div>

  );

}