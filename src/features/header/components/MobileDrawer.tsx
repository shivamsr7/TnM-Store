import { X } from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  useEffect,
} from "react";


interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}


export default function MobileDrawer({
  open,
  onClose,
  children,
}: MobileDrawerProps) {


  // Lock background scroll
  useEffect(() => {

    if (open) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "";

    }


    return () => {

      document.body.style.overflow =
        "";

    };

  }, [open]);


  return (

    <AnimatePresence>

      {open && (

        <>

          {/* =================================================
              OVERLAY
          ================================================= */}

          <motion.div

            onClick={
              onClose
            }

            className="
              fixed
              inset-0
              z-40
              bg-black/50
              backdrop-blur-sm
            "

            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: 1,
            }}

            exit={{
              opacity: 0,
            }}

          />


          {/* =================================================
              DRAWER
          ================================================= */}

          <motion.div

            initial={{
              x: "-100%",
            }}

            animate={{
              x: 0,
            }}

            exit={{
              x: "-100%",
            }}

            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}

            className="
              fixed
              left-0
              top-0
              z-50
              flex
              h-dvh
              w-80
              flex-col
              overflow-hidden
              bg-white
              shadow-2xl
            "

          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                flex
                h-16
                shrink-0
                items-center
                justify-between
                border-b
                px-5
              "
            >

              <h2
                className="
                  text-lg
                  font-semibold
                  text-neutral-900
                "
              >

                Menu

              </h2>


              <button

                type="button"

                onClick={
                  onClose
                }

                aria-label="Close menu"

                className="
                  rounded-md
                  p-2
                  text-neutral-900
                  hover:bg-neutral-100
                "

              >

                <X />

              </button>

            </div>


            {/* =================================================
                SCROLLABLE MENU CONTENT
            =================================================
            
            Extra bottom padding is intentional.

            The mobile bottom navigation is fixed at the
            bottom of the viewport, so without this space
            the last category can remain underneath it.

            The safe-area value also helps on iPhones.
            ================================================= */}

            <div

              className="
                flex-1
                overflow-y-auto
                overscroll-contain
              "

              style={{
                WebkitOverflowScrolling:
                  "touch",

                paddingBottom:
                  "calc(120px + env(safe-area-inset-bottom))",
              }}

            >

              {children}

            </div>

          </motion.div>

        </>

      )}

    </AnimatePresence>

  );

}