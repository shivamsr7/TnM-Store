import {
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  PlayCircle,
  Star,
  Trash2,
} from "lucide-react";

import {
  useReviewRequest,
  useSubmitReviewFromToken,
} from "../hooks/useReviewRequest";

import { supabase } from "@/shared/lib/supabase";


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function getErrorMessage(
  error: unknown
): string {

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {

    return String(
      (
        error as {
          message?: unknown;
        }
      ).message ?? ""
    );

  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error ?? "");
}


/*
 * =========================================================
 * STARS
 * =========================================================
 */

function RatingStars({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-center
        gap-2
      "
      role="radiogroup"
      aria-label="Product rating"
    >

      {Array.from({
        length: 5,
      }).map((_, index) => {

        const value =
          index + 1;

        const active =
          value <= rating;

        return (

          <button
            key={value}
            type="button"
            onClick={() =>
              onChange(value)
            }
            className="
              rounded-full
              p-1
              transition
              duration-200
              hover:scale-110
              focus:outline-none
              focus:ring-2
              focus:ring-[#C8A44D]/50
            "
            aria-label={`${value} star${
              value > 1 ? "s" : ""
            }`}
            aria-pressed={
              active
            }
          >

            <Star
              className={`
                h-8
                w-8
                transition
                duration-200

                ${
                  active
                    ? "fill-[#C8A44D] text-[#C8A44D]"
                    : "text-neutral-600"
                }
              `}
            />

          </button>

        );

      })}

    </div>

  );

}



/*
 * =========================================================
 * REVIEW MEDIA
 * =========================================================
 */

type SelectedReviewMedia = {
  id: string;
  file: File;
  previewUrl: string;
  mediaType: "image" | "video";
};

const MAX_REVIEW_IMAGES = 5;
const MAX_REVIEW_VIDEOS = 1;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const REVIEW_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const REVIEW_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function validateReviewMedia(
  file: File,
  selected: SelectedReviewMedia[]
): string | null {
  const isImage = REVIEW_IMAGE_TYPES.has(file.type);
  const isVideo = REVIEW_VIDEO_TYPES.has(file.type);

  if (!isImage && !isVideo) {
    return "Please choose a JPG, PNG, WEBP image or MP4, WEBM, MOV video.";
  }

  if (isImage) {
    const count = selected.filter(
      (item) => item.mediaType === "image"
    ).length;

    if (count >= MAX_REVIEW_IMAGES) {
      return `You can add up to ${MAX_REVIEW_IMAGES} photos.`;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Each photo must be 10 MB or smaller.";
    }
  }

  if (isVideo) {
    const count = selected.filter(
      (item) => item.mediaType === "video"
    ).length;

    if (count >= MAX_REVIEW_VIDEOS) {
      return "You can add only 1 video.";
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return "The video must be 50 MB or smaller.";
    }
  }

  return null;
}

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function ReviewProductPage() {

  const {
    productSlug,
  } = useParams();


  const [
    searchParams,
  ] = useSearchParams();


  const token =
    searchParams.get(
      "token"
    ) || "";


  /*
   * =======================================================
   * REVIEW REQUEST
   * =======================================================
   */

  const {
    data,
    isLoading,
    isError,
  } = useReviewRequest(
    token,
    productSlug || ""
  );


  /*
   * =======================================================
   * FORM
   * =======================================================
   */

  const [
    rating,
    setRating,
  ] = useState(0);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    review,
    setReview,
  ] = useState("");

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState<SelectedReviewMedia[]>([]);

  const [
    mediaError,
    setMediaError,
  ] = useState<string | null>(null);

  const [
    mediaUploading,
    setMediaUploading,
  ] = useState(false);

  const imageInputRef =
    useRef<HTMLInputElement | null>(null);

  const videoInputRef =
    useRef<HTMLInputElement | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const [
    success,
    setSuccess,
  ] = useState(false);


  const submitMutation =
    useSubmitReviewFromToken();


  /*
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (isLoading) {

    return (

      <PageShell>

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            py-24
          "
        >

          <Loader2
            className="
              h-8
              w-8
              animate-spin
              text-[#C8A44D]
            "
          />

          <p
            className="
              mt-5
              text-sm
              text-neutral-400
            "
          >
            Preparing your review...
          </p>

        </div>

      </PageShell>

    );

  }


  /*
   * =======================================================
   * INVALID / ERROR
   * =======================================================
   */

  if (
    isError ||
    !data
  ) {

    return (

      <PageShell>

        <StatusState
          title="This review link isn't available"
          message="We couldn't verify this review link. It may be invalid or no longer available."
        />

      </PageShell>

    );

  }


  /*
   * =======================================================
   * ALREADY REVIEWED
   * =======================================================
   */

  if (
    data.alreadyReviewed ||
    data.reason ===
      "already_reviewed"
  ) {

    return (

      <PageShell>

        <StatusState
          icon={
            <CheckCircle2
              className="
                h-7
                w-7
                text-[#C8A44D]
              "
            />
          }
          title="You've already reviewed this piece"
          message="Thank you for sharing your love for this jewellery. ♡"
        />

      </PageShell>

    );

  }


  /*
   * =======================================================
   * INVALID STATES
   * =======================================================
   */

  if (!data.valid) {

    let title =
      "This review link is no longer valid";

    let message =
      "We couldn't verify this review link.";

    if (
      data.reason ===
      "expired"
    ) {

      title =
        "This review link has expired";

      message =
        "This review link is no longer active. If you still want to share your experience, please contact us.";

    }

    if (
      data.reason ===
      "too_early"
    ) {

      title =
        "Your review will be available soon";

      message =
        data.availableAt
          ? `Your review link will become available after ${new Date(
              data.availableAt
            ).toLocaleString(
              "en-IN",
              {
                dateStyle:
                  "medium",
                timeStyle:
                  "short",
              }
            )}.`
          : "Your review will become available 24 hours after delivery.";

    }

    if (
      data.reason ===
      "order_not_delivered"
    ) {

      title =
        "Your order isn't eligible yet";

      message =
        "This review can only be submitted after your order has been delivered.";

    }

    return (

      <PageShell>

        <StatusState
          title={title}
          message={message}
        />

      </PageShell>

    );

  }


  const product =
    data.product;


  /*
   * =======================================================
   * MISSING PRODUCT
   * =======================================================
   */

  if (!product) {

    return (

      <PageShell>

        <StatusState
          title="Product unavailable"
          message="We couldn't load the product associated with this review."
        />

      </PageShell>

    );

  }


  /*
   * =======================================================
   * SUCCESS
   * =======================================================
   */

  if (success) {

    return (

      <PageShell>

        <div
          className="
            mx-auto
            max-w-xl
            px-5
            py-16
            text-center
            sm:py-24
          "
        >

          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-[#C8A44D]/10
              ring-1
              ring-[#C8A44D]/20
            "
          >

            <CheckCircle2
              className="
                h-9
                w-9
                text-[#C8A44D]
              "
            />

          </div>


          <p
            className="
              mt-7
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-[#C8A44D]
            "
          >
            Thank You
          </p>


          <h1
            className="
              mt-3
              font-serif
              text-3xl
              font-medium
              text-white
              sm:text-4xl
            "
          >
            Your review means a lot. ♡
          </h1>


          <p
            className="
              mx-auto
              mt-4
              max-w-md
              text-sm
              leading-6
              text-neutral-400
            "
          >
            Thank you for taking a moment to
            share your experience with T&amp;M
            Jewels. Your review has been submitted
            for approval.
          </p>


          <Link
            to={`/product/${product.slug}`}
            className="
              mt-8
              inline-flex
              items-center
              justify-center
              rounded-full
              bg-[#C8A44D]
              px-6
              py-3
              text-sm
              font-semibold
              text-black
              transition
              hover:bg-[#D6B65C]
            "
          >
            View Product
          </Link>

        </div>

      </PageShell>

    );

  }



  const handleMediaSelection = (
    files: FileList | null
  ) => {
    if (!files || files.length === 0) {
      return;
    }

    setMediaError(null);

    const next = [...selectedMedia];

    for (const file of Array.from(files)) {
      const validationError =
        validateReviewMedia(file, next);

      if (validationError) {
        setMediaError(validationError);
        continue;
      }

      const mediaType =
        REVIEW_IMAGE_TYPES.has(file.type)
          ? "image"
          : "video";

      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        mediaType,
      });
    }

    setSelectedMedia(next);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const removeMedia = (id: string) => {
    setSelectedMedia((current) => {
      const item = current.find(
        (media) => media.id === id
      );

      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }

      return current.filter(
        (media) => media.id !== id
      );
    });

    setMediaError(null);
  };

  const uploadReviewMedia = async (
    reviewId: string
  ) => {
    if (selectedMedia.length === 0) {
      return;
    }

    setMediaUploading(true);

    try {
      const uploadedMedia: Array<{
        media_type: "image" | "video";
        media_url: string;
        storage_path: string;
        thumbnail_url: string | null;
        sort_order: number;
      }> = [];

      for (const media of selectedMedia) {
        /*
         * The Edge Function validates the email-review token
         * before returning temporary ImageKit credentials.
         */
        const {
          data: authData,
          error: authError,
        } = await supabase.functions.invoke(
          "review-media-upload",
          {
            body: {
              mode: "authorize",
              token,
              productSlug: product.slug,
              reviewId,
              mediaType: media.mediaType,
              fileName: media.file.name,
              contentType: media.file.type,
            },
          }
        );

        if (authError) {
          throw authError;
        }

        if (
          !authData?.token ||
          !authData?.signature ||
          !authData?.expire ||
          !authData?.publicKey ||
          !authData?.folder
        ) {
          throw new Error(
            "Unable to prepare the media upload."
          );
        }

        const formData = new FormData();

        formData.append(
          "file",
          media.file
        );

        formData.append(
          "fileName",
          `${media.mediaType}-${crypto.randomUUID()}-${media.file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`
        );

        formData.append(
          "publicKey",
          authData.publicKey
        );

        formData.append(
          "signature",
          authData.signature
        );

        formData.append(
          "expire",
          String(authData.expire)
        );

        formData.append(
          "token",
          authData.token
        );

        formData.append(
          "useUniqueFileName",
          "true"
        );

        formData.append(
          "folder",
          authData.folder
        );

        const uploadResponse =
          await fetch(
            "https://upload.imagekit.io/api/v1/files/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        let uploadResult: any = null;

        try {
          uploadResult =
            await uploadResponse.json();
        } catch {
          uploadResult = null;
        }

        if (
          !uploadResponse.ok ||
          !uploadResult?.fileId ||
          !uploadResult?.url
        ) {
          throw new Error(
            uploadResult?.message ||
              "Media upload failed."
          );
        }

        uploadedMedia.push({
          media_type:
            media.mediaType,

          media_url:
            uploadResult.url,

          storage_path:
            `imagekit:${uploadResult.fileId}`,

          thumbnail_url:
            uploadResult.thumbnailUrl ||
            null,

          sort_order:
            uploadedMedia.length,
        });
      }

      /*
       * The same Edge Function performs the token-authorized
       * attachment using its service-role client.
       */
      const {
        data: attachData,
        error: attachError,
      } = await supabase.functions.invoke(
        "review-media-upload",
        {
          body: {
            mode: "attach",
            token,
            productSlug: product.slug,
            reviewId,
            media: uploadedMedia,
          },
        }
      );

      if (attachError) {
        throw attachError;
      }

      if (
        attachData?.success !== true
      ) {
        throw new Error(
          "Uploaded media could not be attached to the review."
        );
      }
    } finally {
      setMediaUploading(false);
    }
  };

  /*
   * =======================================================
   * SUBMIT
   * =======================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError(null);


    if (
      rating < 1 ||
      rating > 5
    ) {

      setError(
        "Please select a rating."
      );

      return;

    }


    const trimmedReview =
      review.trim();

    if (
      trimmedReview.length < 10
    ) {

      setError(
        "Please write at least 10 characters."
      );

      return;

    }


    if (
      trimmedReview.length > 2000
    ) {

      setError(
        "Review cannot exceed 2000 characters."
      );

      return;

    }


    const trimmedTitle =
      title.trim();


    if (
      trimmedTitle.length > 100
    ) {

      setError(
        "Title cannot exceed 100 characters."
      );

      return;

    }


    try {

      const result =
        await submitMutation.mutateAsync({

          token,

          productSlug:
            product.slug,

          rating,

          title:
            trimmedTitle ||
            null,

          review:
            trimmedReview,

        });

      if (
        selectedMedia.length > 0 &&
        result?.reviewId
      ) {
        await uploadReviewMedia(
          result.reviewId
        );
      }

      selectedMedia.forEach(
        (media) => {
          URL.revokeObjectURL(
            media.previewUrl
          );
        }
      );

      setSelectedMedia([]);

      setSuccess(true);

    } catch (
      submitError
    ) {

      console.error(
        "Review submission error:",
        submitError
      );


      const message =
        getErrorMessage(
          submitError
        ).toLowerCase();


      if (
        message.includes(
          "already reviewed"
        )
      ) {

        setError(
          "You've already shared your love for this piece. ♡"
        );

        return;

      }


      if (
        message.includes(
          "expired"
        )
      ) {

        setError(
          "This review link has expired."
        );

        return;

      }


      if (
        message.includes(
          "invalid review token"
        )
      ) {

        setError(
          "This review link is no longer valid."
        );

        return;

      }


      if (
        message.includes(
          "10 characters"
        )
      ) {

        setError(
          "Please write at least 10 characters."
        );

        return;

      }


      if (
        message.includes(
          "2000 characters"
        )
      ) {

        setError(
          "Review cannot exceed 2000 characters."
        );

        return;

      }


      setError(
        "We're having a little trouble submitting your review. Please try again."
      );

    }

  };


  /*
   * =======================================================
   * FORM UI
   * =======================================================
   */

  return (

    <PageShell>

      <div
        className="
          mx-auto
          max-w-2xl
          px-5
          py-10
          sm:py-16
        "
      >

        {/* Back */}

        <Link
          to={`/product/${product.slug}`}
          className="
            inline-flex
            items-center
            gap-2
            text-xs
            font-medium
            text-neutral-500
            transition
            hover:text-white
          "
        >

          <ArrowLeft
            className="
              h-4
              w-4
            "
          />

          Back to product

        </Link>


        {/* Header */}

        <div
          className="
            mt-10
            text-center
          "
        >

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-[#C8A44D]
            "
          >
            Customer Love
          </p>


          <h1
            className="
              mt-3
              font-serif
              text-3xl
              font-medium
              text-white
              sm:text-4xl
            "
          >
            Share your experience
          </h1>


          <p
            className="
              mx-auto
              mt-3
              max-w-md
              text-sm
              leading-6
              text-neutral-400
            "
          >
            Your honest review helps us and
            other jewellery lovers.
          </p>

        </div>


        {/* Product */}

        <div
          className="
            mt-10
            rounded-3xl
            border
            border-white/[0.08]
            bg-white/[0.025]
            p-5
            sm:p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                h-20
                w-20
                shrink-0
                overflow-hidden
                rounded-2xl
                bg-neutral-900
              "
            >

              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  text-[10px]
                  text-neutral-600
                "
              >
                T&amp;M
              </div>

            </div>


            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-neutral-500
                "
              >
                Your purchase
              </p>


              <h2
                className="
                  mt-1
                  truncate
                  text-base
                  font-semibold
                  text-white
                "
              >
                {product.name}
              </h2>


              {product.price !== null && (
                <p
                  className="
                    mt-1
                    text-sm
                    text-[#C8A44D]
                  "
                >
                  ₹
                  {Number(
                    product.price
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              )}

            </div>

          </div>

        </div>


        {/* Form */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-5
            rounded-3xl
            border
            border-white/[0.08]
            bg-white/[0.025]
            p-5
            sm:p-7
          "
        >

          {/* Rating */}

          <div
            className="
              text-center
            "
          >

            <label
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              How would you rate it?
            </label>


            <RatingStars
              rating={rating}
              onChange={
                setRating
              }
            />


            <p
              className="
                mt-2
                min-h-5
                text-xs
                text-neutral-500
              "
            >
              {rating === 1 &&
                "Not quite what you expected"}

              {rating === 2 &&
                "Could be better"}

              {rating === 3 &&
                "It's nice"}

              {rating === 4 &&
                "Really lovely"}

              {rating === 5 &&
                "Absolutely love it ♡"}
            </p>

          </div>


          {/* Title */}

          <div
            className="
              mt-8
            "
          >

            <label
              htmlFor="review-title"
              className="
                text-sm
                font-medium
                text-white
              "
            >
              Review title
              <span
                className="
                  ml-1
                  text-neutral-600
                "
              >
                (optional)
              </span>
            </label>


            <input
              id="review-title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              maxLength={100}
              placeholder="Give your review a title"
              className="
                mt-2
                w-full
                rounded-2xl
                border
                border-white/[0.08]
                bg-black/30
                px-4
                py-3
                text-sm
                text-white
                outline-none
                placeholder:text-neutral-600
                focus:border-[#C8A44D]/50
              "
            />

          </div>


          {/* Review */}

          <div
            className="
              mt-5
            "
          >

            <label
              htmlFor="review-body"
              className="
                text-sm
                font-medium
                text-white
              "
            >
              Your review
            </label>


            <textarea
              id="review-body"
              value={review}
              onChange={(event) =>
                setReview(
                  event.target.value
                )
              }
              minLength={10}
              maxLength={2000}
              rows={6}
              placeholder="Tell us what you loved about your jewellery..."
              className="
                mt-2
                w-full
                resize-none
                rounded-2xl
                border
                border-white/[0.08]
                bg-black/30
                px-4
                py-3
                text-sm
                leading-6
                text-white
                outline-none
                placeholder:text-neutral-600
                focus:border-[#C8A44D]/50
              "
            />


            <div
              className="
                mt-2
                flex
                justify-end
                text-[11px]
                text-neutral-600
              "
            >
              {review.length}/2000
            </div>

          </div>


          {/* Review Media */}

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-white/[0.08]
              bg-black/20
              p-4
              sm:p-5
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Add photos or a video
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-neutral-500
                  "
                >
                  Show us how you styled your
                  T&amp;M jewellery and earn a
                  higher review reward.
                </p>
              </div>

              <UploadMediaIcon />

            </div>


            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-3
              "
            >

              <button
                type="button"
                onClick={() =>
                  imageInputRef.current?.click()
                }
                disabled={
                  selectedMedia.filter(
                    (item) =>
                      item.mediaType === "image"
                  ).length >=
                  MAX_REVIEW_IMAGES
                }
                className="
                  flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/[0.1]
                  bg-white/[0.025]
                  px-3
                  py-3
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:border-[#C8A44D]/40
                  hover:text-[#C8A44D]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <ImagePlus className="h-4 w-4" />
                Add Photos
              </button>


              <button
                type="button"
                onClick={() =>
                  videoInputRef.current?.click()
                }
                disabled={
                  selectedMedia.some(
                    (item) =>
                      item.mediaType === "video"
                  )
                }
                className="
                  flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/[0.1]
                  bg-white/[0.025]
                  px-3
                  py-3
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:border-[#C8A44D]/40
                  hover:text-[#C8A44D]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <PlayCircle className="h-4 w-4" />
                Add Video
              </button>

            </div>


            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(event) =>
                handleMediaSelection(
                  event.target.files
                )
              }
            />


            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(event) =>
                handleMediaSelection(
                  event.target.files
                )
              }
            />


            {mediaError && (
              <p
                className="
                  mt-3
                  text-xs
                  leading-5
                  text-red-300
                "
              >
                {mediaError}
              </p>
            )}


            {selectedMedia.length > 0 && (
              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                "
              >

                {selectedMedia.map(
                  (media) => (
                    <div
                      key={media.id}
                      className="
                        group
                        relative
                        aspect-square
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/[0.08]
                        bg-neutral-900
                      "
                    >

                      {media.mediaType === "image" ? (
                        <img
                          src={
                            media.previewUrl
                          }
                          alt="Selected review photo"
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <video
                          src={
                            media.previewUrl
                          }
                          controls
                          muted
                          playsInline
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      )}


                      <button
                        type="button"
                        onClick={() =>
                          removeMedia(
                            media.id
                          )
                        }
                        className="
                          absolute
                          right-2
                          top-2
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          bg-black/75
                          text-white
                          backdrop-blur
                          transition
                          hover:bg-red-500
                        "
                        aria-label="Remove selected media"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  )
                )}

              </div>
            )}


            <p
              className="
                mt-3
                text-[10px]
                leading-4
                text-neutral-600
              "
            >
              Up to 5 photos (10 MB each) and
              1 video (50 MB). JPG, PNG, WEBP,
              MP4, WEBM or MOV.
            </p>

          </div>


          {/* Error */}

          {error && (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/5
                px-4
                py-3
                text-sm
                leading-5
                text-red-300
              "
            >
              {error}
            </div>

          )}


          {/* Submit */}

          <button
            type="submit"
            disabled={
              submitMutation.isPending ||
              mediaUploading
            }
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#C8A44D]
              px-5
              py-3.5
              text-sm
              font-semibold
              text-black
              transition
              hover:bg-[#D6B65C]
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            {submitMutation.isPending ||
            mediaUploading ? (

              <>

                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />

                {mediaUploading
                  ? "Uploading your media..."
                  : "Submitting..."}

              </>

            ) : (

              "Submit Review"

            )}

          </button>


          <p
            className="
              mt-4
              text-center
              text-[11px]
              leading-5
              text-neutral-600
            "
          >
            Your review will be checked before
            appearing publicly.
          </p>

        </form>

      </div>

    </PageShell>

  );

}



function UploadMediaIcon() {
  return (
    <div
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-[#C8A44D]/10
      "
    >
      <ImagePlus
        className="
          h-4
          w-4
          text-[#C8A44D]
        "
      />
    </div>
  );
}

/*
 * =========================================================
 * PAGE SHELL
 * =========================================================
 */

function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <main
      className="
        min-h-screen
        bg-black
        text-white
      "
    >

      {/* Header */}

      <header
        className="
          border-b
          border-white/[0.06]
          bg-black
        "
      >

        <div
          className="
            mx-auto
            flex
            h-20
            max-w-6xl
            items-center
            justify-center
            px-5
          "
        >

          <div
            className="
              text-center
            "
          >

            <div
              className="
                font-serif
                text-xl
                font-semibold
                tracking-[0.08em]
                text-[#C8A44D]
              "
            >
              T&amp;M JEWELS
            </div>


            <div
              className="
                mt-1
                text-[9px]
                tracking-[0.3em]
                text-neutral-600
              "
            >
              JEWELLERY MADE TO BE LOVED
            </div>

          </div>

        </div>

      </header>


      {children}


      {/* Footer */}

      <footer
        className="
          border-t
          border-white/[0.06]
          px-5
          py-8
          text-center
        "
      >

        <p
          className="
            text-[11px]
            text-neutral-600
          "
        >
          © T&amp;M Jewels
        </p>

      </footer>

    </main>

  );

}


/*
 * =========================================================
 * STATUS STATE
 * =========================================================
 */

function StatusState({
  icon,
  title,
  message,
}: {
  icon?: React.ReactNode;
  title: string;
  message: string;
}) {

  return (

    <div
      className="
        mx-auto
        flex
        min-h-[70vh]
        max-w-xl
        flex-col
        items-center
        justify-center
        px-5
        py-16
        text-center
      "
    >

      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          border
          border-[#C8A44D]/20
          bg-[#C8A44D]/5
        "
      >

        {icon || (

          <Star
            className="
              h-6
              w-6
              text-[#C8A44D]
            "
          />

        )}

      </div>


      <h1
        className="
          mt-6
          font-serif
          text-2xl
          font-medium
          text-white
          sm:text-3xl
        "
      >
        {title}
      </h1>


      <p
        className="
          mt-3
          max-w-md
          text-sm
          leading-6
          text-neutral-400
        "
      >
        {message}
      </p>


      <Link
        to="/"
        className="
          mt-7
          inline-flex
          items-center
          justify-center
          rounded-full
          border
          border-white/[0.1]
          px-6
          py-3
          text-sm
          font-medium
          text-white
          transition
          hover:border-[#C8A44D]/40
          hover:text-[#C8A44D]
        "
      >
        Continue Shopping
      </Link>

    </div>

  );

}