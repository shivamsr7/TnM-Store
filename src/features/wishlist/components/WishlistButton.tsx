import {
  Heart,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useAuthDialog,
} from "@/features/Auth/context/AuthDialogContext";

import {
  useWishlist,
} from "../hooks/useWishlist";

import {
  useWishlistActions,
} from "../hooks/useWishlistActions";


interface WishlistButtonProps {

  productId: string;

  className?: string;

  iconSize?: number;

  showLabel?: boolean;

}


export default function WishlistButton({

  productId,

  className = "",

  iconSize = 18,

  showLabel = false,

}: WishlistButtonProps) {


  const {
    customer,
  } = useAuth();


  const {
    openAuth,
  } = useAuthDialog();


  const {
    data: wishlist = [],
    isLoading,
  } = useWishlist();


  const {
    addToWishlist,
    removeFromWishlist,
    isAdding,
    isRemoving,
  } = useWishlistActions();


  const [
    localWishlisted,
    setLocalWishlisted,
  ] = useState(false);


  /*
   * =========================================================
   * Check current wishlist state
   * =========================================================
   */

  useEffect(() => {

    if (!customer) {

      setLocalWishlisted(false);

      return;

    }


    const exists =
      wishlist.some(
        (item) =>
          item.product_id ===
          productId
      );


    setLocalWishlisted(
      exists
    );

  }, [
    wishlist,
    productId,
    customer,
  ]);


  /*
   * =========================================================
   * Toggle Wishlist
   * =========================================================
   */

  async function handleToggle(
    event: React.MouseEvent
  ) {

    event.preventDefault();

    event.stopPropagation();


    /*
     * Logged out
     */

    if (!customer) {

      openAuth();

      return;

    }


    /*
     * Prevent duplicate requests
     */

    if (
      isAdding ||
      isRemoving ||
      isLoading
    ) {

      return;

    }


    try {

      if (
        localWishlisted
      ) {

        setLocalWishlisted(
          false
        );


        await removeFromWishlist(
          productId
        );

      } else {

        setLocalWishlisted(
          true
        );


        await addToWishlist(
          productId
        );

      }

    } catch (error) {

      /*
       * Roll back optimistic state
       */

      setLocalWishlisted(
        (current) =>
          !current
      );


      console.error(
        "Wishlist action failed:",
        error
      );

    }

  }


  const isBusy =
    isAdding ||
    isRemoving ||
    isLoading;


  /*
   * =========================================================
   * Render
   * =========================================================
   */

  return (

    <button

      type="button"

      onClick={
        handleToggle
      }

      disabled={
        isBusy
      }

      aria-label={
        localWishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }

      aria-pressed={
        localWishlisted
      }

      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        transition-all
        duration-200

        disabled:cursor-not-allowed
        disabled:opacity-60

        ${className}
      `}

    >

      <Heart

        size={
          iconSize
        }

        strokeWidth={
          localWishlisted
            ? 2.4
            : 1.8
        }

        className={`
          transition-all
          duration-200

          ${
            localWishlisted
              ? `
                fill-[#D4AF37]
                text-[#D4AF37]
              `
              : `
                text-current
              `
          }
        `}

      />


      {showLabel && (

        <span>

          {localWishlisted
            ? "Saved"
            : "Wishlist"}

        </span>

      )}

    </button>

  );

}