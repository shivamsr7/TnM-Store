import {
  Sparkles,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


interface FeaturedColumnProps {

  onClose?: () => void;

}


const featured = [

  {
    label:
      "New Arrivals",

    href:
      "/shop?newArrival=true",
  },

  {
    label:
      "Best Sellers",

    href:
      "/shop?bestSeller=true",
  },

  {
    label:
      "Trending",

    href:
      "/shop?trending=true",
  },

  {
    label:
      "Gift Collection",

    href:
      "/shop?featured=true",
  },

];


export default function FeaturedColumn({

  onClose,

}: FeaturedColumnProps) {

  return (

    <div>

      {/* =================================================
          TITLE
      ================================================== */}

      <div
        className="
          mb-5
          flex
          items-center
          gap-2
        "
      >

        <Sparkles
          className="
            h-5
            w-5
            text-[#C8A44D]
          "
        />


        <h3
          className="
            text-lg
            font-semibold
          "
        >

          Featured

        </h3>

      </div>


      {/* =================================================
          FEATURED LINKS
      ================================================== */}

      <div
        className="
          space-y-1
        "
      >

        {featured.map(
          (item) => (

            <Link

              key={
                item.label
              }

              to={
                item.href
              }

              onClick={
                onClose
              }

              className="
                block
                rounded-xl
                px-3
                py-2
                text-neutral-700
                transition
                hover:bg-[#F8F6F1]
                hover:text-[#C8A44D]
              "

            >

              {item.label}

            </Link>

          )
        )}

      </div>

    </div>

  );

}