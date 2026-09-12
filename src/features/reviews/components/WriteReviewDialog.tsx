import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  ImagePlus,
  Info,
  Loader2,
  Star,
  Video,
  X,
} from "lucide-react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  supabase,
} from "@/shared/lib/supabase";

import {
  reviewService,
} from "../services/review.service";

import {
  reviewMediaService,
  type CreateReviewMediaInput,
} from "../services/reviewMedia.service";

import {
  storageService,
} from "@/shared/services/storage.service";


interface WriteReviewDialogProps {
  productId: string;
  open: boolean;
  onClose: () => void;
}


interface SelectedReviewMedia {
  id: string;
  file: File;
  previewUrl: string;
  mediaType: "image" | "video";
}


interface ReviewWalletRewardSettings {
  enabled: boolean;
  text_reward_paise: number;
  image_reward_paise: number;
  video_reward_paise: number;
}


/*
 * =========================================================
 * MEDIA LIMITS
 * =========================================================
 */

const MAX_IMAGES = 5;

const MAX_VIDEOS = 1;

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const MAX_VIDEO_SIZE =
  50 * 1024 * 1024;


const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
];


/*
 * =========================================================
 * REVIEW EMOJIS
 * =========================================================
 */

const REVIEW_EMOJIS = [
  "😍",
  "🥰",
  "✨",
  "❤️",
  "💕",
  "😊",
  "🤩",
  "👌",
  "💎",
  "🔥",
  "🌸",
  "💖",
];


export default function WriteReviewDialog({
  productId,
  open,
  onClose,
}: WriteReviewDialogProps) {

  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  const {
    customer,
  } = useAuth();


  /*
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [rating, setRating] =
    useState(0);

  const [title, setTitle] =
    useState("");

  const [review, setReview] =
    useState("");

  const [selectedMedia, setSelectedMedia] =
    useState<SelectedReviewMedia[]>([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isDuplicate, setIsDuplicate] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [showWalletInfo, setShowWalletInfo] =
    useState(false);


  /*
   * =========================================================
   * DYNAMIC WALLET REWARD SETTINGS
   * =========================================================
   */

  const [
    rewardSettings,
    setRewardSettings,
  ] = useState<ReviewWalletRewardSettings | null>(
    null
  );


  const [
    rewardSettingsLoading,
    setRewardSettingsLoading,
  ] = useState(true);


  /*
   * =========================================================
   * REVIEW TEXTAREA REF
   * =========================================================
   */

  const reviewTextareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );


  /*
   * =========================================================
   * LOAD WALLET REWARD SETTINGS
   * =========================================================
   *
   * These values come from the customer-safe Supabase RPC.
   *
   * The admin settings remain the authoritative source.
   *
   * =========================================================
   */

  useEffect(() => {

    if (!open) {
      return;
    }


    let mounted = true;


    const loadRewardSettings =
      async () => {

        try {

          setRewardSettingsLoading(
            true
          );


          const {
            data,
            error,
          } = await supabase.rpc(
            "get_customer_review_wallet_reward_settings"
          );


          if (error) {

            throw error;

          }


          if (!mounted) {
            return;
          }


          const settings =
            Array.isArray(data)
              ? data[0]
              : data;


          if (!settings) {

            setRewardSettings(
              null
            );

            return;

          }


          setRewardSettings({
            enabled:
              Boolean(
                settings.enabled
              ),

            text_reward_paise:
              Number(
                settings.text_reward_paise ??
                0
              ),

            image_reward_paise:
              Number(
                settings.image_reward_paise ??
                0
              ),

            video_reward_paise:
              Number(
                settings.video_reward_paise ??
                0
              ),
          });

        } catch (error) {

          console.error(
            "Failed to load review wallet rewards:",
            error
          );


          if (mounted) {

            setRewardSettings(
              null
            );

          }

        } finally {

          if (mounted) {

            setRewardSettingsLoading(
              false
            );

          }

        }

      };


    loadRewardSettings();


    return () => {

      mounted = false;

    };

  }, [open]);


  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */

  const resetForm = () => {

    selectedMedia.forEach(
      (media) => {

        URL.revokeObjectURL(
          media.previewUrl
        );

      }
    );


    setRating(0);

    setTitle("");

    setReview("");

    setSelectedMedia([]);

    setError(null);

    setIsDuplicate(false);

    setSuccess(false);

    setShowWalletInfo(false);

  };


  /*
   * =========================================================
   * CLOSE
   * =========================================================
   */

  const handleClose = () => {

    if (isSubmitting) {
      return;
    }


    resetForm();

    onClose();

  };


  /*
   * =========================================================
   * ADD MEDIA
   * =========================================================
   */

  const handleMediaChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    setError(null);


    const files =
      Array.from(
        event.target.files ?? []
      );


    if (
      files.length === 0
    ) {

      return;

    }


    const currentImages =
      selectedMedia.filter(
        (media) =>
          media.mediaType ===
          "image"
      ).length;


    const currentVideos =
      selectedMedia.filter(
        (media) =>
          media.mediaType ===
          "video"
      ).length;


    let imageCount =
      currentImages;


    let videoCount =
      currentVideos;


    const newMedia:
      SelectedReviewMedia[] = [];


    for (
      const file of files
    ) {

      /*
       * =====================================================
       * IMAGE
       * =====================================================
       */

      if (
        ACCEPTED_IMAGE_TYPES.includes(
          file.type
        )
      ) {

        if (
          imageCount >=
          MAX_IMAGES
        ) {

          setError(
            `You can upload up to ${MAX_IMAGES} photos.`
          );

          continue;

        }


        if (
          file.size >
          MAX_IMAGE_SIZE
        ) {

          setError(
            `"${file.name}" is larger than 5 MB.`
          );

          continue;

        }


        imageCount += 1;


        newMedia.push({

          id:
            crypto.randomUUID(),

          file,

          previewUrl:
            URL.createObjectURL(
              file
            ),

          mediaType:
            "image",

        });


        continue;

      }


      /*
       * =====================================================
       * VIDEO
       * =====================================================
       */

      if (
        ACCEPTED_VIDEO_TYPES.includes(
          file.type
        )
      ) {

        if (
          videoCount >=
          MAX_VIDEOS
        ) {

          setError(
            "You can upload only one video."
          );

          continue;

        }


        if (
          file.size >
          MAX_VIDEO_SIZE
        ) {

          setError(
            `"${file.name}" is larger than 50 MB.`
          );

          continue;

        }


        videoCount += 1;


        newMedia.push({

          id:
            crypto.randomUUID(),

          file,

          previewUrl:
            URL.createObjectURL(
              file
            ),

          mediaType:
            "video",

        });


        continue;

      }


      /*
       * =====================================================
       * INVALID FILE
       * =====================================================
       */

      setError(
        `"${file.name}" is not a supported image or video.`
      );

    }


    if (
      newMedia.length > 0
    ) {

      setSelectedMedia(
        (current) => [
          ...current,
          ...newMedia,
        ]
      );

    }


    /*
     * Allow selecting the same file
     * again after removing it.
     */

    event.target.value = "";

  };


  /*
   * =========================================================
   * REMOVE MEDIA
   * =========================================================
   */

  const handleRemoveMedia = (
    mediaId: string
  ) => {

    setSelectedMedia(
      (current) => {

        const media =
          current.find(
            (item) =>
              item.id === mediaId
          );


        if (media) {

          URL.revokeObjectURL(
            media.previewUrl
          );

        }


        return current.filter(
          (item) =>
            item.id !== mediaId
        );

      }
    );

  };


  /*
   * =========================================================
   * INSERT EMOJI
   * =========================================================
   */

  const insertEmoji = (
    emoji: string
  ) => {

    const textarea =
      reviewTextareaRef.current;


    /*
     * Fallback if textarea isn't available.
     */

    if (!textarea) {

      setReview(
        (current) =>
          `${current}${emoji}`
      );

      return;

    }


    const start =
      textarea.selectionStart;


    const end =
      textarea.selectionEnd;


    const currentText =
      review;


    const updatedText =
      currentText.slice(
        0,
        start
      ) +
      emoji +
      currentText.slice(
        end
      );


    setReview(
      updatedText
    );


    /*
     * Restore cursor position after React
     * updates the textarea.
     */

    requestAnimationFrame(() => {

      textarea.focus();


      const cursorPosition =
        start +
        emoji.length;


      textarea.setSelectionRange(
        cursorPosition,
        cursorPosition
      );

    });

  };


  /*
   * =========================================================
   * UPLOAD REVIEW MEDIA
   * =========================================================
   */

  const uploadReviewMedia = async (
    reviewId: string
  ) => {

    if (
      selectedMedia.length === 0
    ) {

      return;

    }


    const uploadedFiles: {
      path: string;
      publicUrl: string;
      mediaType:
        | "image"
        | "video";
      thumbnailUrl:
        string | null;
    }[] = [];


    try {

      /*
       * =====================================================
       * UPLOAD TO IMAGEKIT
       * =====================================================
       */

      for (
        const media of selectedMedia
      ) {

        const uploaded =
          await storageService.upload(
            media.file,
            "reviews"
          );


        uploadedFiles.push({

          path:
            uploaded.path,

          publicUrl:
            uploaded.publicUrl,

          mediaType:
            media.mediaType,

          thumbnailUrl:
            null,

        });

      }


      /*
       * =====================================================
       * CREATE MEDIA RECORDS
       * =====================================================
       */

      const mediaRecords:
        CreateReviewMediaInput[] =
        uploadedFiles.map(
          (
            uploaded,
            index
          ) => ({

            review_id:
              reviewId,

            media_type:
              uploaded.mediaType,

            media_url:
              uploaded.publicUrl,

            storage_path:
              uploaded.path,

            thumbnail_url:
              uploaded.thumbnailUrl,

            sort_order:
              index,

          })
        );


      await reviewMediaService.createMany(
        mediaRecords
      );


    } catch (
      mediaError
    ) {

      /*
       * =====================================================
       * CLEAN UP IMAGEKIT FILES
       * =====================================================
       */

      await Promise.allSettled(
        uploadedFiles.map(
          async (
            uploaded
          ) => {

            try {

              await storageService.remove(
                uploaded.path
              );

            } catch (
              cleanupError
            ) {

              console.error(
                "Review media cleanup failed:",
                cleanupError
              );

            }

          }
        )
      );


      throw mediaError;

    }

  };


  /*
   * =========================================================
   * SUBMIT REVIEW
   * =========================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();


    setError(null);

    setIsDuplicate(false);


    /*
     * =======================================================
     * CUSTOMER CHECK
     * =======================================================
     */

    if (!customer) {

      setError(
        "Please log in to write a review."
      );

      return;

    }


    /*
     * =======================================================
     * CUSTOMER ID CHECK
     * =======================================================
     */

    if (!customer.id) {

      setError(
        "We couldn't identify your customer account."
      );

      return;

    }


    /*
     * =======================================================
     * RATING VALIDATION
     * =======================================================
 */

    if (
      rating < 1 ||
      rating > 5
    ) {

      setError(
        "Please select a rating."
      );

      return;

    }


    /*
     * =======================================================
     * REVIEW VALIDATION
     * =======================================================
     */

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


    /*
     * =======================================================
     * TITLE VALIDATION
     * =======================================================
     */

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


    /*
     * =======================================================
     * SUBMIT
     * =======================================================
     */

    try {

      setIsSubmitting(true);


      /*
       * =====================================================
       * CREATE REVIEW
       * =====================================================
       */

      const createdReview =
        await reviewService.createReview({

          product_id:
            productId,

          customer_id:
            customer.id,

          rating:
            rating,

          title:
            trimmedTitle ||
            null,

          review:
            trimmedReview,

        });


      /*
       * =====================================================
       * UPLOAD MEDIA
       * =====================================================
       */

      if (
        selectedMedia.length > 0
      ) {

        await uploadReviewMedia(
          createdReview.id
        );

      }


      /*
       * =====================================================
       * SUCCESS
       * =====================================================
       */

      setSuccess(true);


    } catch (
      submitError
    ) {

      console.error(
        "Review submission error:",
        submitError
      );


      /*
       * =====================================================
       * ERROR MESSAGE
       * =====================================================
       */

      const errorMessage =
        typeof submitError === "object" &&
        submitError !== null &&
        "message" in submitError

          ? String(
              (
                submitError as {
                  message?: unknown;
                }
              ).message ?? ""
            )

          : submitError instanceof Error

            ? submitError.message

            : String(
                submitError ?? ""
              );


      const normalizedError =
        errorMessage.toLowerCase();


      /*
       * =====================================================
       * DUPLICATE REVIEW
       * =====================================================
       */

      if (
        normalizedError.includes(
          "already reviewed"
        )
      ) {

        setIsDuplicate(true);

        setError(
          "You've already shared your love for this piece. ♡"
        );

        return;

      }


      /*
       * =====================================================
       * CUSTOMER ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "customer account"
        )
      ) {

        setError(
          "We couldn't find your customer account."
        );

        return;

      }


      /*
       * =====================================================
       * PRODUCT ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "product"
        )
      ) {

        setError(
          "This product could not be found."
        );

        return;

      }


      /*
       * =====================================================
       * RATING ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "rating"
        )
      ) {

        setError(
          "Please select a valid rating."
        );

        return;

      }


      /*
       * =====================================================
       * REVIEW LENGTH ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "10 characters"
        )
      ) {

        setError(
          "Please write at least 10 characters."
        );

        return;

      }


      if (
        normalizedError.includes(
          "2000 characters"
        )
      ) {

        setError(
          "Review cannot exceed 2000 characters."
        );

        return;

      }


      /*
       * =====================================================
       * TITLE ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "100 characters"
        )
      ) {

        setError(
          "Review title cannot exceed 100 characters."
        );

        return;

      }


      /*
       * =====================================================
       * MEDIA ERROR
       * =====================================================
       */

      if (
        selectedMedia.length > 0
      ) {

        setError(
          "We couldn't finish uploading your photos or video. Please try again."
        );

        return;

      }


      /*
       * =====================================================
       * GENERIC ERROR
       * =====================================================
       */

      setError(
        "We're having a little trouble submitting your review right now. Please try again in a moment. ♡"
      );


    } finally {

      setIsSubmitting(false);

    }

  };


  /*
   * =========================================================
   * DON'T RENDER
   * =========================================================
   */

  if (!open) {

    return null;

  }


  /*
   * =========================================================
   * MEDIA COUNTS
   * =========================================================
   */

  const imageCount =
    selectedMedia.filter(
      (media) =>
        media.mediaType ===
        "image"
    ).length;


  const videoCount =
    selectedMedia.filter(
      (media) =>
        media.mediaType ===
        "video"
    ).length;


  /*
   * =========================================================
   * REWARD DISPLAY HELPERS
   * =========================================================
   */

  const formatReward =
    (
      amountPaise: number
    ) => {

      const rupees =
        amountPaise / 100;


      return new Intl.NumberFormat(
        "en-IN",
        {
          minimumFractionDigits:
            rupees % 1 === 0
              ? 0
              : 2,

          maximumFractionDigits:
            2,
        }
      ).format(
        rupees
      );

    };


  /*
   * =========================================================
   * DIALOG
   * =========================================================
   */

  const dialog = (

    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-black/80
        px-4
        py-6
        backdrop-blur-sm

        sm:px-6
        sm:py-8
      "
      role="presentation"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {

          handleClose();

        }

      }}
    >

      {/* =====================================================
          DIALOG
      ====================================================== */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
        className="
          relative
          my-auto
          flex
          max-h-[90vh]
          w-full
          max-w-lg
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-neutral-200
          bg-white
          shadow-[0_25px_100px_rgba(0,0,0,.65)]
        "
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >

        {/* ===================================================
            STATIC HEADER
        ==================================================== */}

        <div
          className="
            relative
            shrink-0
            border-b
            border-neutral-100
            bg-white
            px-5
            py-5

            sm:px-7
            sm:py-6
          "
        >

          {/* ===============================================
              CLOSE BUTTON
          ================================================ */}

          <button
            type="button"
            onClick={
              handleClose
            }
            disabled={
              isSubmitting
            }
            aria-label="Close review dialog"
            className="
              absolute
              right-4
              top-4
              z-20
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-neutral-200
              bg-neutral-100
              text-neutral-700
              transition

              hover:bg-neutral-200
              hover:text-black

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#C8A44D]

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            <X
              className="
                h-4
                w-4
              "
            />

          </button>


          {/* ===============================================
              HEADER TEXT
          ================================================ */}

          <div
            className="
              pr-12
            "
          >

            <span
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.3em]
                text-[#C8A44D]
              "
            >
              Customer Love
            </span>


            <h2
              id="write-review-title"
              className="
                mt-2
                text-2xl
                font-semibold
                text-neutral-900
              "
            >
              Write a Review
            </h2>


            <p
              className="
                mt-1
                text-sm
                leading-6
                text-neutral-500
              "
            >
              We'd love to hear about
              your experience.
            </p>


            {/* =============================================
                WALLET REWARDS
            ============================================== */}

            <div
              className="
                mt-4
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowWalletInfo(
                    (current) =>
                      !current
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#C8A44D]/30
                  bg-[#C8A44D]/5
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-[#8F7128]
                  transition

                  hover:border-[#C8A44D]/50
                  hover:bg-[#C8A44D]/10

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#C8A44D]
                "
              >

                <Info
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                Wallet Rewards

                <span
                  className="
                    ml-0.5
                    text-[10px]
                  "
                >
                  {showWalletInfo
                    ? "Hide"
                    : "ⓘ"}
                </span>

              </button>


              {showWalletInfo && (

                <div
                  className="
                    mt-2
                    rounded-xl
                    border
                    border-[#C8A44D]/20
                    bg-[#C8A44D]/5
                    px-4
                    py-3
                    text-xs
                    leading-5
                    text-neutral-600
                  "
                >

                  <p
                    className="
                      font-medium
                      text-neutral-800
                    "
                  >
                    Earn wallet rewards with your review
                  </p>


                  {rewardSettingsLoading ? (

                    <p
                      className="
                        mt-1.5
                        text-xs
                        text-neutral-400
                      "
                    >
                      Loading current rewards...
                    </p>

                  ) : rewardSettings?.enabled ? (

                    <>

                      <div
                        className="
                          mt-1.5
                          flex
                          flex-wrap
                          gap-x-4
                          gap-y-1
                        "
                      >

                        <span>
                          Text ·{" "}
                          <strong>
                            ₹
                            {formatReward(
                              rewardSettings.text_reward_paise
                            )}
                          </strong>
                        </span>


                        <span>
                          Photo ·{" "}
                          <strong>
                            ₹
                            {formatReward(
                              rewardSettings.image_reward_paise
                            )}
                          </strong>
                        </span>


                        <span>
                          Video ·{" "}
                          <strong>
                            ₹
                            {formatReward(
                              rewardSettings.video_reward_paise
                            )}
                          </strong>
                        </span>

                      </div>


                      <p
                        className="
                          mt-1.5
                          text-[11px]
                          text-neutral-500
                        "
                      >
                        Wallet rewards are credited
                        after your review is approved.
                      </p>

                    </>

                  ) : (

                    <p
                      className="
                        mt-1.5
                        text-[11px]
                        text-neutral-500
                      "
                    >
                      Review rewards are currently unavailable.
                    </p>

                  )}

                </div>

              )}

            </div>

          </div>

        </div>


        {/* ===================================================
            SUCCESS STATE
        ==================================================== */}

        {success ? (

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-5
              py-6

              sm:px-7
              sm:py-7
            "
          >

            <div
              className="
                flex
                min-h-[360px]
                flex-col
                items-center
                justify-center
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
                  bg-[#C8A44D]/10
                "
              >

                <Star
                  className="
                    h-7
                    w-7
                    fill-[#C8A44D]
                    text-[#C8A44D]
                  "
                />

              </div>


              <h2
                className="
                  mt-5
                  text-2xl
                  font-semibold
                  text-neutral-900
                "
              >
                Thank you! ♡
              </h2>


              <p
                className="
                  mt-2
                  max-w-sm
                  text-sm
                  leading-6
                  text-neutral-500
                "
              >
                Your review has been
                submitted and is waiting
                for approval.
              </p>


              <button
                type="button"
                onClick={
                  handleClose
                }
                className="
                  mt-6
                  rounded-full
                  border
                  border-[#C8A44D]/50
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-[#A78632]
                  transition

                  hover:bg-[#C8A44D]
                  hover:text-black

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#C8A44D]
                "
              >
                Done
              </button>

            </div>

          </div>

        ) : (

          /* =================================================
             NORMAL REVIEW
          ================================================== */

          <>

            {/* ===============================================
                SCROLLABLE CONTENT
            ================================================ */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                px-5
                py-5

                sm:px-7
                sm:py-6
              "
            >

              <form
                id="write-review-form"
                onSubmit={
                  handleSubmit
                }
                className="
                  space-y-5
                "
              >

                {/* =========================================
                    RATING
                ========================================== */}

                <div>

                  <label
                    className="
                      text-sm
                      font-medium
                      text-neutral-900
                    "
                  >
                    Your rating
                  </label>


                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-1
                    "
                  >

                    {Array.from({
                      length: 5,
                    }).map(
                      (_, index) => {

                        const star =
                          index + 1;


                        return (

                          <button
                            key={
                              star
                            }
                            type="button"
                            onClick={() =>
                              setRating(
                                star
                              )
                            }
                            aria-label={`Rate ${star} out of 5`}
                            className="
                              rounded-md
                              p-1
                              transition
                              hover:scale-110
                              focus:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-[#C8A44D]
                            "
                          >

                            <Star
                              className={`
                                h-7
                                w-7
                                transition-colors

                                ${
                                  star <=
                                  rating
                                    ? "fill-[#C8A44D] text-[#C8A44D]"
                                    : "text-neutral-300"
                                }
                              `}
                            />

                          </button>

                        );

                      }
                    )}

                  </div>

                </div>


                {/* =========================================
                    TITLE
                ========================================== */}

                <div>

                  <label
                    htmlFor="review-title"
                    className="
                      text-sm
                      font-medium
                      text-neutral-900
                    "
                  >

                    Review title

                    <span
                      className="
                        ml-1
                        font-normal
                        text-neutral-400
                      "
                    >
                      (optional)
                    </span>

                  </label>


                  <input
                    id="review-title"
                    type="text"
                    value={
                      title
                    }
                    onChange={(event) =>
                      setTitle(
                        event.target.value
                      )
                    }
                    maxLength={100}
                    placeholder="e.g. Absolutely beautiful!"
                    className="
                      mt-2
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-neutral-200
                      bg-neutral-50
                      px-4
                      text-sm
                      text-neutral-900
                      outline-none

                      placeholder:text-neutral-400

                      focus:border-[#C8A44D]
                      focus:ring-1
                      focus:ring-[#C8A44D]/20
                    "
                  />

                </div>


                {/* =========================================
                    REVIEW
                ========================================== */}

                <div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <label
                      htmlFor="review-text"
                      className="
                        text-sm
                        font-medium
                        text-neutral-900
                      "
                    >
                      Your review
                    </label>


                    <span
                      className="
                        text-[11px]
                        text-neutral-400
                      "
                    >
                      {review.length}/2000
                    </span>

                  </div>


                  <textarea
                    ref={
                      reviewTextareaRef
                    }
                    id="review-text"
                    value={
                      review
                    }
                    onChange={(event) =>
                      setReview(
                        event.target.value
                      )
                    }
                    maxLength={2000}
                    rows={5}
                    placeholder="Tell us what you loved about this piece..."
                    className="
                      mt-2
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-neutral-200
                      bg-neutral-50
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-neutral-900
                      outline-none

                      placeholder:text-neutral-400

                      focus:border-[#C8A44D]
                      focus:ring-1
                      focus:ring-[#C8A44D]/20
                    "
                  />


                  {/* =======================================
                      EMOJI SECTION
                  ======================================== */}

                  <div
                    className="
                      mt-2
                      rounded-xl
                      border
                      border-neutral-200
                      bg-neutral-50
                      px-3
                      py-2.5
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <span
                        className="
                          text-[11px]
                          font-medium
                          text-neutral-500
                        "
                      >
                        Add a little expression
                      </span>


                      <span
                        className="
                          text-[10px]
                          text-neutral-400
                        "
                      >
                        Tap an emoji
                      </span>

                    </div>


                    <div
                      className="
                        mt-2
                        flex
                        flex-wrap
                        gap-1.5
                      "
                    >

                      {REVIEW_EMOJIS.map(
                        (emoji) => (

                          <button
                            key={
                              emoji
                            }
                            type="button"
                            onClick={() =>
                              insertEmoji(
                                emoji
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            aria-label={`Add ${emoji}`}
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-neutral-200
                              bg-white
                              text-base
                              transition

                              hover:scale-105
                              hover:border-[#C8A44D]/50
                              hover:bg-[#C8A44D]/5

                              focus:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-[#C8A44D]

                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {emoji}
                          </button>

                        )
                      )}

                    </div>

                  </div>

                </div>


                {/* =========================================
                    MEDIA UPLOAD
                ========================================== */}

                <div>

                  <div
                    className="
                      flex
                      items-end
                      justify-between
                      gap-3
                    "
                  >

                    <div>

                      <label
                        className="
                          text-sm
                          font-medium
                          text-neutral-900
                        "
                      >
                        Add photos or video
                      </label>


                      <p
                        className="
                          mt-1
                          text-xs
                          text-neutral-400
                        "
                      >
                        Up to 5 photos and 1 video
                      </p>

                    </div>


                    <span
                      className="
                        shrink-0
                        text-[11px]
                        text-neutral-400
                      "
                    >
                      {imageCount}/{MAX_IMAGES}
                      {" "}
                      photos
                      {" · "}
                      {videoCount}/{MAX_VIDEOS}
                      {" "}
                      video
                    </span>

                  </div>


                  {/* =======================================
                      UPLOAD BUTTON
                  ======================================== */}

                  <label
                    className={`
                      mt-3
                      flex
                      min-h-24
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-dashed
                      border-neutral-300
                      bg-neutral-50
                      px-4
                      py-4
                      text-center
                      transition

                      hover:border-[#C8A44D]
                      hover:bg-[#C8A44D]/5

                      ${
                        imageCount >=
                          MAX_IMAGES &&
                        videoCount >=
                          MAX_VIDEOS
                          ? `
                            pointer-events-none
                            cursor-not-allowed
                            opacity-50
                          `
                          : ""
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-[#C8A44D]/10
                        text-[#A78632]
                      "
                    >

                      <ImagePlus
                        className="
                          h-5
                          w-5
                        "
                      />

                    </div>


                    <span
                      className="
                        mt-2
                        text-sm
                        font-medium
                        text-neutral-700
                      "
                    >
                      Add Photos / Video
                    </span>


                    <span
                      className="
                        mt-1
                        text-[11px]
                        text-neutral-400
                      "
                    >
                      JPG, PNG, WebP up to 5 MB
                      {" · "}
                      MP4/WebM up to 50 MB
                    </span>


                    <input
                      type="file"
                      accept="
                        image/jpeg,
                        image/png,
                        image/webp,
                        video/mp4,
                        video/webm
                      "
                      multiple
                      disabled={
                        isSubmitting ||
                        (
                          imageCount >=
                            MAX_IMAGES &&
                          videoCount >=
                            MAX_VIDEOS
                        )
                      }
                      onChange={
                        handleMediaChange
                      }
                      className="
                        hidden
                      "
                    />

                  </label>


                  {/* =======================================
                      PREVIEWS
                  ======================================== */}

                  {selectedMedia.length >
                    0 && (

                    <div
                      className="
                        mt-3
                        grid
                        grid-cols-3
                        gap-2
                      "
                    >

                      {selectedMedia.map(
                        (media) => (

                          <div
                            key={
                              media.id
                            }
                            className="
                              group
                              relative
                              aspect-square
                              overflow-hidden
                              rounded-xl
                              border
                              border-neutral-200
                              bg-neutral-100
                            "
                          >

                            {media.mediaType ===
                            "image" ? (

                              <img
                                src={
                                  media.previewUrl
                                }
                                alt="Review upload preview"
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
                                playsInline
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                              />

                            )}


                            {media.mediaType ===
                              "video" && (

                              <div
                                className="
                                  absolute
                                  left-2
                                  top-2
                                  flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  bg-black/70
                                  px-2
                                  py-1
                                  text-[10px]
                                  font-medium
                                  text-white
                                "
                              >

                                <Video
                                  className="
                                    h-3
                                    w-3
                                  "
                                />

                                Video

                              </div>

                            )}


                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveMedia(
                                  media.id
                                )
                              }
                              disabled={
                                isSubmitting
                              }
                              aria-label="Remove media"
                              className="
                                absolute
                                right-2
                                top-2
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-full
                                bg-black/70
                                text-white
                                transition

                                hover:bg-black

                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >

                              <X
                                className="
                                  h-3.5
                                  w-3.5
                                "
                              />

                            </button>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>


                {/* =========================================
                    ERROR
                ========================================== */}

                {error && (

                  <div
                    className={`
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      leading-5

                      ${
                        isDuplicate
                          ? `
                            border
                            border-[#C8A44D]/25
                            bg-[#C8A44D]/[0.06]
                            text-neutral-700
                          `
                          : `
                            border
                            border-red-200
                            bg-red-50
                            text-red-600
                          `
                      }
                    `}
                  >

                    {error}


                    {isDuplicate && (

                      <p
                        className="
                          mt-1
                          text-xs
                          text-neutral-500
                        "
                      >
                        Each product can be reviewed
                        only once.
                      </p>

                    )}

                  </div>

                )}


                {/* =========================================
                    APPROVAL INFO
                ========================================== */}

                {!isDuplicate && (

                  <div
                    className="
                      rounded-xl
                      border
                      border-[#C8A44D]/20
                      bg-[#C8A44D]/5
                      px-4
                      py-3
                      text-xs
                      leading-5
                      text-neutral-600
                    "
                  >
                    Your review will be published
                    after our team reviews it.
                  </div>

                )}

              </form>

            </div>


            {/* ===============================================
                STATIC FOOTER
            ================================================ */}

            <div
              className="
                shrink-0
                border-t
                border-neutral-100
                bg-white
                px-5
                py-4

                sm:px-7
                sm:py-5
              "
            >

              <button
                type="submit"
                form="write-review-form"
                disabled={
                  isSubmitting ||
                  isDuplicate
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#C8A44D]
                  px-5
                  text-sm
                  font-semibold
                  text-black
                  transition

                  hover:bg-[#D6B65C]

                  active:scale-[0.99]

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#C8A44D]
                  focus-visible:ring-offset-2

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {isSubmitting ? (

                  <>

                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />

                    Submitting...

                  </>

                ) : isDuplicate ? (

                  "Already Reviewed"

                ) : (

                  "Submit Review"

                )}

              </button>

            </div>

          </>

        )}

      </div>

    </div>

  );


  /*
   * =========================================================
   * PORTAL
   * =========================================================
   */

  return createPortal(
    dialog,
    document.body
  );

}