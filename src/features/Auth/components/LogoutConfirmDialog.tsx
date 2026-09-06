import {
  useEffect,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  createPortal,
} from "react-dom";


interface LogoutConfirmDialogProps {

  open: boolean;

  loading?: boolean;

  onCancel: () => void;

  onConfirm: () => void | Promise<void>;

}


export default function LogoutConfirmDialog({

  open,

  loading = false,

  onCancel,

  onConfirm,

}: LogoutConfirmDialogProps) {


  useEffect(() => {

    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";


    function handleKeyDown(
      event: KeyboardEvent
    ) {

      if (
        event.key === "Escape" &&
        !loading
      ) {

        onCancel();

      }

    }


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [open, loading, onCancel]);


  return createPortal(

    <AnimatePresence>

      {open && (

        <motion.div
          className="
            fixed
            inset-0
            z-[1400]
            flex
            items-center
            justify-center
            p-4
            sm:p-6
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="presentation"
        >

          {/* Backdrop */}

          <motion.button
            type="button"
            aria-label="Close logout confirmation"
            className="
              absolute
              inset-0
              cursor-default
              bg-black/75
              backdrop-blur-md
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!loading) {
                onCancel();
              }
            }}
          />


          {/* Dialog */}

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
            className="
              relative
              w-full
              max-w-[390px]
              overflow-hidden
              rounded-[26px]
              border
              border-[#C8A44D]/30
              bg-[#090909]
              shadow-[0_30px_100px_rgba(0,0,0,0.7)]
            "
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 14,
              scale: 0.97,
            }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 28,
              mass: 0.8,
            }}
          >

            {/* Gold accent */}

            <motion.div
              className="
                absolute
                left-0
                right-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-[#C8A44D]
                to-transparent
              "
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                delay: 0.08,
                duration: 0.55,
              }}
            />


            {/* Close */}

            <button
              type="button"
              aria-label="Close"
              disabled={loading}
              onClick={onCancel}
              className="
                absolute
                right-4
                top-4
                z-10
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-neutral-800
                bg-neutral-900/80
                text-neutral-400
                transition
                hover:border-neutral-700
                hover:bg-neutral-800
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              <X size={17} />

            </button>


            <div className="px-6 pb-6 pt-8 sm:px-7 sm:pb-7">

              {/* Icon */}

              <div className="mb-5 flex justify-center">

                <motion.div
                  className="
                    relative
                    flex
                    h-[72px]
                    w-[72px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#C8A44D]/35
                    bg-[#C8A44D]/10
                  "
                  initial={{
                    opacity: 0,
                    scale: 0.6,
                    rotate: -8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    delay: 0.08,
                    type: "spring",
                    stiffness: 420,
                    damping: 22,
                  }}
                >

                  <motion.div
                    className="
                      absolute
                      inset-[-7px]
                      rounded-full
                      border
                      border-[#C8A44D]/10
                    "
                    animate={{
                      scale: [1, 1.08, 1],
                      opacity: [0.45, 0.15, 0.45],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <LogOut
                    size={29}
                    strokeWidth={1.7}
                    className="text-[#C8A44D]"
                  />

                </motion.div>

              </div>


              <div className="text-center">

                <h2
                  id="logout-dialog-title"
                  className="
                    text-xl
                    font-semibold
                    tracking-[-0.02em]
                    text-white
                  "
                >
                  Ready to leave?
                </h2>


                <p
                  id="logout-dialog-description"
                  className="
                    mx-auto
                    mt-2
                    max-w-[290px]
                    text-sm
                    leading-6
                    text-neutral-400
                  "
                >
                  Are you sure you want to logout
                  from your T&amp;M Jewels account?
                </p>

              </div>


              {/* Security note */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-neutral-800
                  bg-neutral-950
                  px-3
                  py-2.5
                  text-xs
                  text-neutral-500
                "
              >

                <ShieldCheck
                  size={15}
                  className="text-[#C8A44D]"
                />

                Your account remains safe and secure.

              </div>


              {/* Actions */}

              <div className="mt-5 grid grid-cols-2 gap-3">

                <button
                  type="button"
                  disabled={loading}
                  onClick={onCancel}
                  className="
                    h-11
                    rounded-xl
                    border
                    border-neutral-700
                    bg-transparent
                    px-4
                    text-sm
                    font-medium
                    text-neutral-300
                    transition-all
                    duration-200
                    hover:border-neutral-500
                    hover:bg-neutral-900
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Stay Logged In
                </button>


                <motion.button
                  type="button"
                  disabled={loading}
                  onClick={onConfirm}
                  whileHover={loading ? undefined : { scale: 1.015 }}
                  whileTap={loading ? undefined : { scale: 0.98 }}
                  className="
                    relative
                    flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    overflow-hidden
                    rounded-xl
                    bg-[#C8A44D]
                    px-4
                    text-sm
                    font-semibold
                    text-black
                    shadow-[0_8px_25px_rgba(200,164,77,0.18)]
                    transition-all
                    duration-200
                    hover:bg-[#d6b65f]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading ? (

                    <>
                      <motion.span
                        className="
                          h-4
                          w-4
                          rounded-full
                          border-2
                          border-black/25
                          border-t-black
                        "
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />

                      Logging out...

                    </>

                  ) : (

                    <>
                      <LogOut size={16} />
                      Logout
                    </>

                  )}

                </motion.button>

              </div>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>,

    document.body

  );

}
