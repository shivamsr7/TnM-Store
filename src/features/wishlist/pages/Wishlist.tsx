import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Check,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useWishlist,
} from "../hooks/useWishlist";

import {
  useWishlistActions,
} from "../hooks/useWishlistActions";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";

import type {
  WishlistWithProduct,
} from "../types/wishlist.types";


export default function Wishlist() {

  const {
    data: wishlist = [],
    isLoading,
    isError,
  } = useWishlist();


  /*
   * =========================================================
   * Loading
   * =========================================================
   */

  if (isLoading) {

    return (

      <main
        className="
          min-h-screen
          bg-black
          px-4
          pb-16
          pt-8
          sm:px-6
          sm:pb-20
          sm:pt-12
          lg:px-8
          lg:pt-14
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          <WishlistHeader
            count={0}
          />


          <div
            className="
              mt-7
              grid
              grid-cols-2
              gap-3
              sm:mt-9
              sm:grid-cols-3
              sm:gap-5
              lg:grid-cols-4
              lg:gap-6
            "
          >

            {[
              1,
              2,
              3,
              4,
            ].map((item) => (

              <div
                key={item}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-[#0a0a0a]
                "
              >

                <div
                  className="
                    aspect-[4/5]
                    animate-pulse
                    bg-neutral-900
                  "
                />

                <div
                  className="
                    space-y-3
                    p-3.5
                    sm:p-4
                  "
                >

                  <div
                    className="
                      h-4
                      w-3/4
                      animate-pulse
                      rounded
                      bg-neutral-900
                    "
                  />

                  <div
                    className="
                      h-4
                      w-1/2
                      animate-pulse
                      rounded
                      bg-neutral-900
                    "
                  />

                  <div
                    className="
                      h-10
                      w-full
                      animate-pulse
                      rounded-full
                      bg-neutral-900
                    "
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

      </main>

    );
  }


  /*
   * =========================================================
   * Error
   * =========================================================
   */

  if (isError) {

    return (

      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-black
          px-4
        "
      >

        <div
          className="
            text-center
          "
        >

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              border
              border-red-500/20
              bg-red-500/5
            "
          >

            <Heart
              size={22}
              className="
                text-red-400
              "
            />

          </div>


          <h2
            className="
              mt-5
              text-lg
              font-semibold
              text-white
            "
          >
            Couldn't load your wishlist
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-neutral-500
            "
          >
            Something went wrong while loading
            your saved items.
          </p>


          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="
              mt-5
              rounded-full
              border
              border-white/10
              px-6
              py-2.5
              text-xs
              font-medium
              text-white
              transition
              hover:border-[#D4AF37]/40
              hover:text-[#D4AF37]
            "
          >
            Try Again
          </button>

        </div>

      </main>

    );
  }


  /*
   * =========================================================
   * Empty State
   * =========================================================
   */

  if (!wishlist.length) {

    return (

      <main
        className="
          min-h-screen
          bg-black
          px-4
          pb-16
          pt-8
          sm:px-6
          sm:pb-20
          sm:pt-12
          lg:px-8
          lg:pt-14
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          <WishlistHeader
            count={0}
          />


          <div
            className="
              flex
              min-h-[430px]
              flex-col
              items-center
              justify-center
              px-4
              text-center
            "
          >

            <div
              className="
                relative
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                border
                border-[#D4AF37]/20
                bg-gradient-to-br
                from-[#D4AF37]/10
                to-transparent
              "
            >

              <Heart
                size={29}
                strokeWidth={1.4}
                className="
                  text-[#D4AF37]
                "
              />

            </div>


            <p
              className="
                mt-6
                text-[10px]
                font-medium
                uppercase
                tracking-[0.25em]
                text-[#C8A44D]
              "
            >
              Save your favourites
            </p>


            <h2
              className="
                mt-2
                text-xl
                font-semibold
                text-white
                sm:text-2xl
              "
            >
              Your wishlist is empty
            </h2>


            <p
              className="
                mt-2
                max-w-md
                text-xs
                leading-relaxed
                text-neutral-500
                sm:text-sm
              "
            >
              Found something you love?
              Tap the heart and keep it saved
              for later.
            </p>


            <Link
              to="/shop"
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#D4AF37]
                px-7
                py-3
                text-xs
                font-semibold
                text-black
                shadow-[0_8px_30px_rgba(212,175,55,0.12)]
                transition
                hover:bg-[#E3C45F]
                hover:shadow-[0_10px_35px_rgba(212,175,55,0.18)]
                active:scale-[0.98]
                sm:py-3.5
                sm:text-sm
              "
            >

              Explore Collection

              <ArrowRight
                size={15}
              />

            </Link>

          </div>

        </div>

      </main>

    );
  }


  /*
   * =========================================================
   * Wishlist
   * =========================================================
   */

  return (

    <main
      className="
        min-h-screen
        bg-black
        px-4
        pb-16
        pt-8
        sm:px-6
        sm:pb-20
        sm:pt-12
        lg:px-8
        lg:pt-14
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
        "
      >

        <WishlistHeader
          count={
            wishlist.length
          }
        />


        <div
          className="
            mt-7
            grid
            grid-cols-2
            gap-x-3
            gap-y-6
            sm:mt-9
            sm:grid-cols-3
            sm:gap-x-5
            sm:gap-y-9
            lg:grid-cols-4
            lg:gap-x-6
            lg:gap-y-10
          "
        >

          {wishlist.map(
            (item) => (

              <WishlistCard
                key={item.id}
                item={item}
              />

            )
          )}

        </div>


        {/* ===================================================
            Bottom Shopping CTA
        =================================================== */}

        <div
          className="
            mt-12
            flex
            justify-center
            sm:mt-16
          "
        >

          <Link
            to="/shop"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#D4AF37]/25
              px-6
              py-3
              text-xs
              font-medium
              text-[#D4AF37]
              transition
              hover:border-[#D4AF37]/50
              hover:bg-[#D4AF37]/5
              sm:px-7
              sm:py-3.5
              sm:text-sm
            "
          >

            Continue Shopping

            <ArrowRight
              size={14}
            />

          </Link>

        </div>

      </div>

    </main>

  );
}


/* ============================================================
   Wishlist Header
============================================================ */

function WishlistHeader({
  count,
}: {
  count: number;
}) {

  return (

    <div
      className="
        border-b
        border-white/[0.07]
        pb-5
        sm:pb-6
      "
    >

      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >

        <div>

          <p
            className="
              mb-1.5
              text-[9px]
              font-medium
              uppercase
              tracking-[0.3em]
              text-[#C8A44D]
              sm:text-[10px]
            "
          >
            T&M Jewels
          </p>


          <h1
            className="
              bg-gradient-to-r
              from-[#B8862E]
              via-[#F7E3A3]
              to-[#B8862E]
              bg-clip-text
              text-3xl
              font-semibold
              tracking-tight
              text-transparent
              sm:text-4xl
            "
          >
            My Wishlist
          </h1>


          <p
            className="
              mt-1.5
              text-xs
              text-neutral-500
              sm:text-sm
            "
          >
            Pieces you've saved for later.
          </p>

        </div>


        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            sm:justify-end
          "
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#D4AF37]/15
              bg-[#D4AF37]/[0.04]
              px-3.5
              py-2
            "
          >

            <Heart
              size={14}
              className="
                fill-[#D4AF37]
                text-[#D4AF37]
              "
            />

            <span
              className="
                text-xs
                font-medium
                text-[#E6C96A]
              "
            >
              {count}
              {" "}
              {count === 1
                ? "saved item"
                : "saved items"}
            </span>

          </div>


          <Link
            to="/shop"
            className="
              hidden
              items-center
              gap-1.5
              text-xs
              font-medium
              text-neutral-400
              transition
              hover:text-[#D4AF37]
              sm:inline-flex
            "
          >

            Continue Shopping

            <ArrowRight
              size={13}
            />

          </Link>

        </div>

      </div>

    </div>

  );
}


/* ============================================================
   Wishlist Card
============================================================ */

function WishlistCard({
  item,
}: {
  item: WishlistWithProduct;
}) {

  const {
    removeFromWishlist,
    isRemoving,
  } = useWishlistActions();


  const {
    addToCart,
  } = useCartActions();


  /*
   * =========================================================
   * Product
   * =========================================================
   */

  const product =
    item.products;


  if (!product) {
    return null;
  }


  /*
   * =========================================================
   * Images
   * =========================================================
   */

  const images =
    [
      ...(product.product_images ?? []),
    ].sort(
      (a, b) =>
        a.sort_order -
        b.sort_order
    );


  const image =
    images.find(
      (item) =>
        item.is_primary
    )?.image_url ??
    images[0]?.image_url;


  /*
   * =========================================================
   * Discount
   * =========================================================
   */

  const discount =
    product.compare_price &&
    product.compare_price >
      product.price
      ? Math.round(
          (
            (
              product.compare_price -
              product.price
            ) /
            product.compare_price
          ) * 100
        )
      : 0;


  /*
   * =========================================================
   * Stock
   * =========================================================
   */

  const isOutOfStock =
    Boolean(
      product.track_inventory &&
      product.stock <= 0 &&
      !product.allow_backorders
    );


  /*
   * =========================================================
   * Remove
   * =========================================================
   */

  async function handleRemove() {

    try {

      await removeFromWishlist(
        item.product_id
      );

    } catch (error) {

      console.error(
        "Failed to remove wishlist item:",
        error
      );

    }

  }


  /*
   * =========================================================
   * Add To Cart
   * =========================================================
   */

  async function handleAddToCart() {

    if (isOutOfStock) {
      return;
    }


    try {

      await addToCart(
        product
      );

    } catch (error) {

      console.error(
        "Failed to add wishlist product to cart:",
        error
      );

    }

  }


  /*
   * =========================================================
   * Render
   * =========================================================
   */

  return (

    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#0a0a0a]
        shadow-[0_8px_30px_rgba(0,0,0,0.18)]
        transition-all
        duration-300
        sm:hover:-translate-y-1
        sm:hover:border-[#D4AF37]/30
        sm:hover:shadow-[0_15px_45px_rgba(0,0,0,0.3)]
      "
    >

      {/* =====================================================
          Image
      ====================================================== */}

      <div
        className="
          relative
          aspect-[4/5]
          overflow-hidden
          bg-neutral-900
        "
      >

        {image ? (

          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              sm:group-hover:scale-[1.035]
            "
          />

        ) : (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-neutral-700
            "
          >

            <ShoppingBag
              size={28}
            />

          </div>

        )}


        {/* Soft image overlay */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-24
            bg-gradient-to-t
            from-black/35
            to-transparent
          "
        />


        {/* Discount */}

        {discount > 0 && (

          <span
            className="
              absolute
              left-3
              top-3
              rounded-full
              bg-[#D4AF37]
              px-2.5
              py-1
              text-[9px]
              font-bold
              tracking-wide
              text-black
              shadow-sm
              sm:text-[10px]
            "
          >
            {discount}% OFF
          </span>

        )}


        {/* Saved badge */}

        <div
          className="
            absolute
            bottom-3
            left-3
            inline-flex
            items-center
            gap-1
            rounded-full
            border
            border-white/10
            bg-black/55
            px-2.5
            py-1.5
            text-[9px]
            font-medium
            text-white/90
            backdrop-blur-md
          "
        >

          <Check
            size={11}
            className="
              text-[#D4AF37]
            "
          />

          Saved

        </div>


        {/* Remove */}

        <button
          type="button"
          onClick={
            handleRemove
          }
          disabled={
            isRemoving
          }
          aria-label="Remove from wishlist"
          className="
            absolute
            right-3
            top-3
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-black/60
            text-white/90
            shadow-lg
            backdrop-blur-md
            transition-all
            hover:border-red-400/30
            hover:bg-red-500
            hover:text-white
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          <Trash2
            size={14}
          />

        </button>

      </div>


      {/* =====================================================
          Details
      ====================================================== */}

      <div
        className="
          p-3.5
          sm:p-4
        "
      >

        <Link
          to={`/product/${product.slug}`}
          className="
            block
          "
        >

          <h2
            className="
              line-clamp-2
              min-h-[40px]
              text-[13px]
              font-medium
              leading-5
              text-[#F3DFA0]
              transition-colors
              hover:text-[#D4AF37]
              sm:text-sm
              sm:text-base
            "
          >
            {product.name}
          </h2>

        </Link>


        {/* Rating */}

        {product.rating > 0 && (

          <div
            className="
              mt-2
              flex
              items-center
              gap-1.5
              text-[10px]
              sm:text-[11px]
            "
          >

            <span
              className="
                text-[#D4AF37]
              "
            >
              ★ {product.rating}
            </span>


            {product.review_count > 0 && (

              <span
                className="
                  text-neutral-600
                "
              >
                ({product.review_count})
              </span>

            )}

          </div>

        )}


        {/* Stock */}

        <div
          className="
            mt-2
            text-[10px]
            font-medium
          "
        >

          {isOutOfStock ? (

            <span
              className="
                text-red-400
              "
            >
              Currently unavailable
            </span>

          ) : (

            <span
              className="
                text-emerald-400/80
              "
            >
              In stock
            </span>

          )}

        </div>


        {/* Price */}

        <div
          className="
            mt-2.5
            flex
            flex-wrap
            items-baseline
            gap-2
          "
        >

          <span
            className="
              text-lg
              font-semibold
              tracking-tight
              text-white
              sm:text-xl
            "
          >
            ₹{product.price}
          </span>


          {product.compare_price && (

            <span
              className="
                text-[11px]
                text-neutral-600
                line-through
                sm:text-xs
              "
            >
              ₹{product.compare_price}
            </span>

          )}

        </div>


        {/* =================================================
            Actions
        ================================================== */}

        <div
          className="
            mt-4
            grid
            grid-cols-[0.8fr_1.2fr]
            gap-2
          "
        >

          {/* View */}

          <Link
            to={`/product/${product.slug}`}
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-1
              rounded-full
              border
              border-white/10
              px-2
              text-[10px]
              font-medium
              text-neutral-300
              transition-all
              hover:border-[#D4AF37]/35
              hover:bg-[#D4AF37]/[0.04]
              hover:text-[#D4AF37]
              sm:text-xs
            "
          >

            View

            <ArrowRight
              size={12}
            />

          </Link>


          {/* Add To Cart */}

          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              isOutOfStock
            }
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-1.5
              rounded-full
              bg-[#D4AF37]
              px-2
              text-[10px]
              font-semibold
              text-black
              shadow-[0_5px_18px_rgba(212,175,55,0.08)]
              transition-all
              hover:bg-[#E3C45F]
              hover:shadow-[0_7px_22px_rgba(212,175,55,0.14)]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:bg-neutral-800
              disabled:text-neutral-500
              disabled:shadow-none
              sm:text-xs
            "
          >

            <ShoppingBag
              size={13}
            />

            {isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}

          </button>

        </div>

      </div>

    </article>

  );
}