import {
  ArrowRight,
  Gem,
  Gift,
  Heart,
  Sparkles,
  Star,
} from "lucide-react";

import CollaboratorApplicationForm
  from "../components/CollaboratorApplicationForm";


const benefits = [

  {
    icon: Gift,
    title: "Beautiful Pieces",
    text: "Discover and style selected T&M jewellery pieces.",
  },

  {
    icon: Sparkles,
    title: "Creative Freedom",
    text: "Create content that feels authentic to your personal style.",
  },

  {
    icon: Star,
    title: "Get Featured",
    text: "Stand a chance to be featured across T&M's platforms.",
  },

  {
    icon: Gem,
    title: "Exclusive Access",
    text: "Get opportunities around new launches and special campaigns.",
  },

];


const collaborationTypes = [

  {
    number: "01",
    title: "Gifted",
    text: "Receive selected jewellery pieces and create content around them.",
  },

  {
    number: "02",
    title: "Affiliate",
    text: "Share T&M with your audience and earn through qualifying sales.",
  },

  {
    number: "03",
    title: "Paid",
    text: "Collaborate with us on selected campaigns and launches.",
  },

  {
    number: "04",
    title: "UGC",
    text: "Create premium jewellery content that T&M can use across its channels.",
  },

];


const steps = [

  {
    number: "01",
    title: "Apply",
    text: "Tell us about yourself, your content and your audience.",
  },

  {
    number: "02",
    title: "Get Reviewed",
    text: "Our team reviews your profile and content.",
  },

  {
    number: "03",
    title: "Create",
    text: "If selected, we'll share the collaboration details with you.",
  },

  {
    number: "04",
    title: "Grow Together",
    text: "Create, inspire and build something beautiful with T&M.",
  },

];


export default function CollaboratePage() {

  function scrollToApplication() {

    document
      .getElementById(
        "apply"
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }


  return (

    <main
      className="
        overflow-hidden
        bg-[#F8F6F1]
        text-neutral-900
      "
    >

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          min-h-[680px]
          overflow-hidden
          bg-black
          text-white
        "
      >

        {/* Decorative glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-40
            -top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#C8A44D]/10
            blur-3xl
          "
        />


        <div
          className="
            pointer-events-none
            absolute
            -bottom-40
            -left-40
            h-[400px]
            w-[400px]
            rounded-full
            bg-[#C8A44D]/5
            blur-3xl
          "
        />


        <div
          className="
            relative
            mx-auto
            flex
            min-h-[680px]
            max-w-7xl
            items-center
            px-6
            py-20
            sm:px-8
            lg:px-12
          "
        >

          <div
            className="
              max-w-3xl
            "
          >

            <div
              className="
                mb-7
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#C8A44D]/30
                bg-[#C8A44D]/5
                px-4
                py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#D8B96A]
              "
            >

              <Sparkles
                size={13}
              />

              T&M Creator Community

            </div>


            <h1
              className="
                max-w-3xl
                text-5xl
                font-semibold
                leading-[0.98]
                tracking-[-0.04em]
                sm:text-6xl
                lg:text-8xl
              "
            >

              Create.
              <br />

              <span
                className="
                  text-[#C8A44D]
                "
              >
                Style.
              </span>

              <br />

              Inspire.

            </h1>


            <p
              className="
                mt-7
                max-w-2xl
                text-base
                leading-7
                text-neutral-300
                sm:text-lg
              "
            >
              Partner with T&M Jewels and turn your
              creativity into beautiful jewellery stories.
              Whether you're a creator, UGC artist or
              fashion lover, we'd love to hear from you.
            </p>


            <div
              className="
                mt-9
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >

              <button
                type="button"

                onClick={
                  scrollToApplication
                }

                className="
                  inline-flex
                  h-13
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#C8A44D]
                  px-7
                  text-sm
                  font-semibold
                  text-black
                  transition
                  hover:bg-[#D8B96A]
                "
              >

                Become a T&M Creator

                <ArrowRight
                  size={17}
                />

              </button>


              <a
                href="#how-it-works"

                className="
                  inline-flex
                  h-13
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/20
                  px-7
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:border-white/40
                "
              >
                How it works
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTRO
      ====================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-6
          py-20
          sm:px-8
          lg:px-12
          lg:py-28
        "
      >

        <div
          className="
            grid
            gap-12
            lg:grid-cols-[0.9fr_1.1fr]
            lg:items-end
          "
        >

          <div>

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#B18A2E]
              "
            >
              More Than A Collaboration
            </p>


            <h2
              className="
                mt-4
                max-w-xl
                text-4xl
                font-semibold
                leading-tight
                tracking-tight
                sm:text-5xl
              "
            >
              Your creativity.
              <br />
              Our jewellery.
              <br />
              One beautiful story.
            </h2>

          </div>


          <p
            className="
              max-w-2xl
              text-base
              leading-8
              text-neutral-500
              lg:text-lg
            "
          >
            We believe the best jewellery content doesn't
            feel like an advertisement. It feels personal,
            expressive and real. That's why we're building
            a creator community around people who genuinely
            love fashion, styling and jewellery.
          </p>

        </div>

      </section>


      {/* =====================================================
          BENEFITS
      ====================================================== */}

      <section
        className="
          border-y
          border-neutral-200
          bg-white
        "
      >

        <div
          className="
            mx-auto
            grid
            max-w-7xl
            divide-y
            divide-neutral-200
            px-6
            sm:grid-cols-2
            sm:divide-x
            sm:divide-y-0
            sm:px-8
            lg:grid-cols-4
            lg:px-12
          "
        >

          {benefits.map(
            (benefit) => {

              const Icon =
                benefit.icon;


              return (

                <div
                  key={
                    benefit.title
                  }

                  className="
                    px-0
                    py-10
                    sm:px-7
                    lg:px-8
                    lg:py-14
                  "
                >

                  <Icon
                    size={25}
                    strokeWidth={1.5}
                    className="
                      text-[#B18A2E]
                    "
                  />


                  <h3
                    className="
                      mt-5
                      text-lg
                      font-semibold
                    "
                  >
                    {benefit.title}
                  </h3>


                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-neutral-500
                    "
                  >
                    {benefit.text}
                  </p>

                </div>

              );

            }
          )}

        </div>

      </section>


      {/* =====================================================
          COLLABORATION TYPES
      ====================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-6
          py-20
          sm:px-8
          lg:px-12
          lg:py-28
        "
      >

        <div
          className="
            max-w-2xl
          "
        >

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.3em]
              text-[#B18A2E]
            "
          >
            Ways To Work Together
          </p>


          <h2
            className="
              mt-4
              text-4xl
              font-semibold
              tracking-tight
              sm:text-5xl
            "
          >
            Find your kind of collaboration.
          </h2>

        </div>


        <div
          className="
            mt-12
            grid
            gap-px
            overflow-hidden
            rounded-[28px]
            border
            border-neutral-200
            bg-neutral-200
            sm:grid-cols-2
          "
        >

          {collaborationTypes.map(
            (item) => (

              <div
                key={
                  item.number
                }

                className="
                  bg-[#F8F6F1]
                  p-7
                  sm:p-9
                "
              >

                <span
                  className="
                    text-xs
                    font-semibold
                    tracking-[0.2em]
                    text-[#B18A2E]
                  "
                >
                  {item.number}
                </span>


                <h3
                  className="
                    mt-8
                    text-2xl
                    font-semibold
                  "
                >
                  {item.title}
                </h3>


                <p
                  className="
                    mt-3
                    max-w-md
                    text-sm
                    leading-7
                    text-neutral-500
                  "
                >
                  {item.text}
                </p>

              </div>

            )
          )}

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"

        className="
          bg-black
          text-white
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            py-20
            sm:px-8
            lg:px-12
            lg:py-28
          "
        >

          <div
            className="
              max-w-2xl
            "
          >

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#C8A44D]
              "
            >
              Simple & Personal
            </p>


            <h2
              className="
                mt-4
                text-4xl
                font-semibold
                tracking-tight
                sm:text-5xl
              "
            >
              How it works
            </h2>

          </div>


          <div
            className="
              mt-14
              grid
              gap-8
              md:grid-cols-2
              lg:grid-cols-4
            "
          >

            {steps.map(
              (step) => (

                <div
                  key={
                    step.number
                  }

                  className="
                    border-t
                    border-white/15
                    pt-6
                  "
                >

                  <span
                    className="
                      text-xs
                      font-semibold
                      tracking-[0.25em]
                      text-[#C8A44D]
                    "
                  >
                    {step.number}
                  </span>


                  <h3
                    className="
                      mt-7
                      text-xl
                      font-semibold
                    "
                  >
                    {step.title}
                  </h3>


                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-neutral-400
                    "
                  >
                    {step.text}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          CREATOR PHILOSOPHY
      ====================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-6
          py-20
          sm:px-8
          lg:px-12
          lg:py-28
        "
      >

        <div
          className="
            overflow-hidden
            rounded-[32px]
            bg-[#EDE7DA]
            p-8
            sm:p-12
            lg:p-16
          "
        >

          <div
            className="
              grid
              gap-10
              lg:grid-cols-[1fr_auto]
              lg:items-center
            "
          >

            <div>

              <Heart
                size={28}
                strokeWidth={1.5}
                className="
                  text-[#B18A2E]
                "
              />


              <h2
                className="
                  mt-6
                  max-w-3xl
                  text-3xl
                  font-semibold
                  leading-tight
                  tracking-tight
                  sm:text-4xl
                "
              >
                We care more about
                authentic creativity than
                follower count.
              </h2>


              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-neutral-600
                  sm:text-base
                "
              >
                Whether you have a growing community or
                a large audience, what matters to us is
                how naturally you connect with your audience
                and how beautifully you tell a story.
              </p>

            </div>


            <div
              className="
                hidden
                h-28
                w-28
                items-center
                justify-center
                rounded-full
                border
                border-[#B18A2E]/30
                lg:flex
              "
            >

              <Gem
                size={36}
                strokeWidth={1}
                className="
                  text-[#B18A2E]
                "
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          APPLICATION
      ====================================================== */}

      <section
        id="apply"

        className="
          bg-white
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            py-20
            sm:px-8
            lg:px-12
            lg:py-28
          "
        >

          <div
            className="
              mb-12
              max-w-2xl
            "
          >

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#B18A2E]
              "
            >
              Let's Create Together
            </p>


            <h2
              className="
                mt-4
                text-4xl
                font-semibold
                tracking-tight
                sm:text-5xl
              "
            >
              Ready to collaborate?
            </h2>


            <p
              className="
                mt-4
                text-base
                leading-7
                text-neutral-500
              "
            >
              Fill in your details and tell us a little
              about your creative world.
            </p>

          </div>


          <CollaboratorApplicationForm />

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section
        className="
          bg-[#F8F6F1]
        "
      >

        <div
          className="
            mx-auto
            max-w-4xl
            px-6
            py-20
            text-center
            sm:px-8
            lg:py-28
          "
        >

          <Sparkles
            className="
              mx-auto
              text-[#B18A2E]
            "
            size={28}
          />


          <h2
            className="
              mt-6
              text-3xl
              font-semibold
              tracking-tight
              sm:text-4xl
            "
          >
            Your style deserves to be seen.
          </h2>


          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              text-sm
              leading-7
              text-neutral-500
            "
          >
            Join the T&M creator community and let's
            create jewellery content people remember.
          </p>


          <button
            type="button"

            onClick={
              scrollToApplication
            }

            className="
              mt-7
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-black
              px-7
              py-3.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-neutral-800
            "
          >

            Apply Now

            <ArrowRight
              size={17}
            />

          </button>

        </div>

      </section>

    </main>

  );

}