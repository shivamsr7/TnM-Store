import {
  useParams,
} from "react-router-dom";

import MobileStickyCart from "@/features/products/components/MobileStickyCart";

import ProductReviews from "@/features/reviews/components/ProductReviews";

import ProductGallery from "../components/ProductGallery";

import {
  useProductDetails,
} from "../hooks/useProductDetails";

import ProductInfo from "../components/ProductInfo";

import ProductAccordion from "../components/ProductAccordion";

import ProductActions from "../components/ProductActions";

import ProductRelatedProducts from "../components/ProductRelatedProducts";


export default function ProductDetails() {


  /*
   * =========================================================
   * PRODUCT SLUG
   * =========================================================
   */

  const {
    slug,
  } = useParams();


  /*
   * =========================================================
   * PRODUCT DETAILS
   * =========================================================
   */

  const {
    data: product,

    isLoading,

    isError,

  } = useProductDetails(
    slug || ""
  );


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    isLoading
  ) {

    return (

      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-black
          text-white
        "
      >

        Loading product...

      </div>

    );

  }


  /*
   * =========================================================
   * ERROR / NOT FOUND
   * =========================================================
   */

  if (
    isError ||
    !product
  ) {

    return (

      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-black
          text-red-400
        "
      >

        Product not found.

      </div>

    );

  }


  /*
   * =========================================================
   * PRODUCT DETAILS PAGE
   * =========================================================
   */

  return (

    <main
      className="
        min-h-screen
        bg-black
        px-4
        py-6
        text-white

        sm:px-6
        sm:py-10

        lg:px-8
        lg:py-12
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
        "
      >

        {/* =================================================
            PRODUCT
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-8

            lg:grid-cols-2
            lg:gap-12
          "
        >

          {/* =================================================
              PRODUCT GALLERY
          ================================================== */}

          <div
            className="
              min-w-0
            "
          >

            <ProductGallery
              productId={
                product.id
              }

              images={
                product.product_images ||
                []
              }

              productName={
                product.name
              }
            />

          </div>


          {/* =================================================
              PRODUCT INFORMATION
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-5

              sm:gap-6
            "
          >

            <ProductInfo
              product={
                product
              }
            />


            <ProductActions
              product={
                product
              }
            />


            <ProductAccordion
              product={
                product
              }
            />

          </div>

        </div>


        {/* =================================================
            RELATED PRODUCTS
        ================================================== */}

        <ProductRelatedProducts
          productId={
            product.id
          }

          categoryId={
            product.category_id
          }

          subcategoryId={
            product.subcategory_id
          }
        />


        {/* =================================================
            PRODUCT REVIEWS
        ================================================== */}

        <ProductReviews
          productId={
            product.id
          }
        />

      </div>


      {/* =====================================================
          MOBILE STICKY CART
      ====================================================== */}

      <MobileStickyCart
        product={
          product
        }
      />

    </main>

  );

}