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

      document.body.style.overflow = "hidden";

    } else {

      document.body.style.overflow = "";

    }


    return () => {

      document.body.style.overflow = "";

    };


  }, [open]);




  return (

    <AnimatePresence>


      {open && (

        <>


          {/* Overlay */}

          <motion.div

            onClick={onClose}

            className="
              fixed
              inset-0
              z-40
              bg-black/50
              backdrop-blur-sm
            "

            initial={{
              opacity:0,
            }}

            animate={{
              opacity:1,
            }}

            exit={{
              opacity:0,
            }}

          />





          {/* Drawer */}

          <motion.div

            initial={{
              x:"-100%",
            }}

            animate={{
              x:0,
            }}

            exit={{
              x:"-100%",
            }}

            transition={{
              duration:0.3,
              ease:"easeInOut",
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



            {/* Header */}

            <div className="
              flex
              h-16
              shrink-0
              items-center
              justify-between
              border-b
              px-5
            ">

              <h2 className="
                text-lg
                font-semibold
                text-neutral-900
              ">

                Menu

              </h2>



              <button

                onClick={onClose}

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





            {/* Only Drawer Scrolls */}

            <div

              className="
                flex-1
                overflow-y-auto
                overscroll-contain
              "

              style={{
                WebkitOverflowScrolling:"touch",
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