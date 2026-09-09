import {
  useState,
} from "react";

import {
  Check,
  Loader2,
} from "lucide-react";

import {
  useCollaboratorApplication,
} from "../hooks/useCollaboratorApplication";

import type {
  CollaborationType,
} from "../types/collaborator.types";


const collaborationOptions: {
  value: CollaborationType;
  title: string;
  description: string;
}[] = [

  {
    value: "gifted",
    title: "Gifted Collaboration",
    description:
      "Receive selected T&M pieces and create beautiful content.",
  },

  {
    value: "affiliate",
    title: "Affiliate",
    description:
      "Share T&M with your audience and earn from qualifying sales.",
  },

  {
    value: "paid",
    title: "Paid Collaboration",
    description:
      "Work with us on selected campaigns and launches.",
  },

  {
    value: "ugc",
    title: "UGC Creator",
    description:
      "Create high-quality jewellery content for T&M.",
  },

];


const initialForm = {

  full_name: "",
  email: "",
  phone: "",

  instagram_username: "",
  instagram_url: "",

  youtube_url: "",
  other_social_url: "",

  follower_count: "",
  average_reel_views: "",

  content_category: "",

  collaboration_type:
    "gifted" as CollaborationType,

  why_collaborate: "",
  portfolio_url: "",

};


export default function CollaboratorApplicationForm() {

  const [
    form,
    setForm,
  ] = useState(initialForm);


  const [
    submitted,
    setSubmitted,
  ] = useState(false);


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const application =
    useCollaboratorApplication();


  function updateField(
    field: string,
    value: string
  ) {

    setForm(
      previous => ({
        ...previous,
        [field]: value,
      })
    );

  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setErrorMessage("");


    if (!form.full_name.trim()) {

      setErrorMessage(
        "Please enter your full name."
      );

      return;

    }


    if (!form.email.trim()) {

      setErrorMessage(
        "Please enter your email address."
      );

      return;

    }


    if (!form.instagram_username.trim()) {

      setErrorMessage(
        "Please enter your Instagram username."
      );

      return;

    }


    if (!form.content_category) {

      setErrorMessage(
        "Please select your content category."
      );

      return;

    }


    try {

      await application.mutateAsync({

        full_name:
          form.full_name.trim(),

        email:
          form.email.trim(),

        phone:
          form.phone.trim(),

        instagram_username:
          form.instagram_username
            .trim()
            .replace(/^@/, ""),

        instagram_url:
          form.instagram_url.trim(),

        youtube_url:
          form.youtube_url.trim(),

        other_social_url:
          form.other_social_url.trim(),

        follower_count:
          form.follower_count
            ? Number(form.follower_count)
            : null,

        average_reel_views:
          form.average_reel_views
            ? Number(form.average_reel_views)
            : null,

        content_category:
          form.content_category,

        collaboration_type:
          form.collaboration_type,

        why_collaborate:
          form.why_collaborate.trim(),

        portfolio_url:
          form.portfolio_url.trim(),

      });


      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {

      console.error(error);

      setErrorMessage(
        "Something went wrong while submitting your application. Please try again."
      );

    }

  }


  if (submitted) {

    return (

      <div
        className="
          rounded-[32px]
          border
          border-[#C8A44D]/30
          bg-white
          p-8
          text-center
          shadow-[0_20px_70px_rgba(0,0,0,0.08)]
          sm:p-12
        "
      >

        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[#C8A44D]/15
            text-[#B18A2E]
          "
        >

          <Check
            size={30}
          />

        </div>


        <p
          className="
            mt-6
            text-xs
            font-semibold
            uppercase
            tracking-[0.3em]
            text-[#B18A2E]
          "
        >
          Application Received
        </p>


        <h3
          className="
            mt-3
            text-2xl
            font-semibold
            tracking-tight
            text-neutral-900
            sm:text-3xl
          "
        >
          Welcome to the T&M creator journey.
        </h3>


        <p
          className="
            mx-auto
            mt-4
            max-w-xl
            text-sm
            leading-7
            text-neutral-500
            sm:text-base
          "
        >
          Thank you for your interest in collaborating
          with T&M Jewels. Our team will review your
          profile and reach out if your content is a
          match for an upcoming collaboration.
        </p>

      </div>

    );

  }


  return (

    <form
      onSubmit={
        handleSubmit
      }

      className="
        rounded-[32px]
        border
        border-neutral-200
        bg-white
        p-6
        shadow-[0_20px_70px_rgba(0,0,0,0.06)]
        sm:p-8
        lg:p-10
      "
    >

      <div
        className="
          mb-8
        "
      >

        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.28em]
            text-[#B18A2E]
          "
        >
          Creator Application
        </p>


        <h2
          className="
            mt-2
            text-2xl
            font-semibold
            tracking-tight
            text-neutral-900
            sm:text-3xl
          "
        >
          Tell us about yourself
        </h2>


        <p
          className="
            mt-2
            text-sm
            leading-6
            text-neutral-500
          "
        >
          Share a few details about your content and
          we'll take it from there.
        </p>

      </div>


      {/* BASIC INFORMATION */}

      <div
        className="
          grid
          gap-5
          sm:grid-cols-2
        "
      >

        <Field
          label="Full Name"
          required
          value={form.full_name}
          onChange={(value) =>
            updateField(
              "full_name",
              value
            )
          }
          placeholder="Your full name"
        />


        <Field
          label="Email Address"
          required
          type="email"
          value={form.email}
          onChange={(value) =>
            updateField(
              "email",
              value
            )
          }
          placeholder="you@example.com"
        />


        <Field
          label="Phone / WhatsApp"
          value={form.phone}
          onChange={(value) =>
            updateField(
              "phone",
              value
            )
          }
          placeholder="+91 XXXXX XXXXX"
        />


        <Field
          label="Instagram Username"
          required
          value={form.instagram_username}
          onChange={(value) =>
            updateField(
              "instagram_username",
              value
            )
          }
          placeholder="@yourusername"
        />


        <Field
          label="Instagram Profile URL"
          value={form.instagram_url}
          onChange={(value) =>
            updateField(
              "instagram_url",
              value
            )
          }
          placeholder="https://instagram.com/..."
        />


        <Field
          label="YouTube URL"
          value={form.youtube_url}
          onChange={(value) =>
            updateField(
              "youtube_url",
              value
            )
          }
          placeholder="Optional"
        />


        <Field
          label="Other Social Profile"
          value={form.other_social_url}
          onChange={(value) =>
            updateField(
              "other_social_url",
              value
            )
          }
          placeholder="Optional"
        />


        <Field
          label="Portfolio / Previous Work"
          value={form.portfolio_url}
          onChange={(value) =>
            updateField(
              "portfolio_url",
              value
            )
          }
          placeholder="Optional"
        />

      </div>


      {/* CREATOR STATS */}

      <div
        className="
          mt-8
          grid
          gap-5
          sm:grid-cols-2
        "
      >

        <Field
          label="Followers"
          type="number"
          value={form.follower_count}
          onChange={(value) =>
            updateField(
              "follower_count",
              value
            )
          }
          placeholder="e.g. 12500"
        />


        <Field
          label="Average Reel Views"
          type="number"
          value={form.average_reel_views}
          onChange={(value) =>
            updateField(
              "average_reel_views",
              value
            )
          }
          placeholder="e.g. 8000"
        />


        <div
          className="
            sm:col-span-2
          "
        >

          <label
            className="
              mb-2
              block
              text-sm
              font-medium
              text-neutral-800
            "
          >
            Content Category
            <span className="ml-1 text-[#B18A2E]">
              *
            </span>
          </label>


          <select
            value={
              form.content_category
            }

            onChange={(event) =>
              updateField(
                "content_category",
                event.target.value
              )
            }

            className="
              h-12
              w-full
              rounded-xl
              border
              border-neutral-200
              bg-white
              px-4
              text-sm
              text-neutral-900
              outline-none
              transition
              focus:border-[#C8A44D]
              focus:ring-2
              focus:ring-[#C8A44D]/10
            "
          >

            <option value="">
              Select category
            </option>

            <option value="fashion">
              Fashion
            </option>

            <option value="beauty">
              Beauty
            </option>

            <option value="lifestyle">
              Lifestyle
            </option>

            <option value="jewellery">
              Jewellery
            </option>

            <option value="ugc">
              UGC
            </option>

            <option value="other">
              Other
            </option>

          </select>

        </div>

      </div>


      {/* COLLABORATION TYPE */}

      <div
        className="
          mt-8
        "
      >

        <label
          className="
            mb-3
            block
            text-sm
            font-medium
            text-neutral-800
          "
        >
          What would you like to collaborate on?
        </label>


        <div
          className="
            grid
            gap-3
            sm:grid-cols-2
          "
        >

          {collaborationOptions.map(
            (option) => {

              const selected =
                form.collaboration_type ===
                option.value;


              return (

                <button
                  key={
                    option.value
                  }

                  type="button"

                  onClick={() =>
                    updateField(
                      "collaboration_type",
                      option.value
                    )
                  }

                  className={`
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition-all
                    ${
                      selected
                        ? "border-[#C8A44D] bg-[#C8A44D]/8 ring-1 ring-[#C8A44D]"
                        : "border-neutral-200 hover:border-neutral-300"
                    }
                  `}
                >

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >

                    <span
                      className="
                        text-sm
                        font-semibold
                        text-neutral-900
                      "
                    >
                      {option.title}
                    </span>


                    {selected && (

                      <Check
                        size={18}
                        className="
                          shrink-0
                          text-[#B18A2E]
                        "
                      />

                    )}

                  </div>


                  <p
                    className="
                      mt-2
                      text-xs
                      leading-5
                      text-neutral-500
                    "
                  >
                    {option.description}
                  </p>

                </button>

              );

            }
          )}

        </div>

      </div>


      {/* MESSAGE */}

      <div
        className="
          mt-8
        "
      >

        <label
          className="
            mb-2
            block
            text-sm
            font-medium
            text-neutral-800
          "
        >
          Why would you like to collaborate with T&M?
        </label>


        <textarea
          value={
            form.why_collaborate
          }

          onChange={(event) =>
            updateField(
              "why_collaborate",
              event.target.value
            )
          }

          rows={5}

          placeholder="
Tell us about your content, audience and what you could create with T&M...
          "

          className="
            w-full
            resize-none
            rounded-2xl
            border
            border-neutral-200
            bg-white
            px-4
            py-3
            text-sm
            leading-6
            text-neutral-900
            outline-none
            transition
            placeholder:text-neutral-400
            focus:border-[#C8A44D]
            focus:ring-2
            focus:ring-[#C8A44D]/10
          "
        />

      </div>


      {/* ERROR */}

      {errorMessage && (

        <div
          className="
            mt-5
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          {errorMessage}
        </div>

      )}


      {/* SUBMIT */}

      <button
        type="submit"

        disabled={
          application.isPending
        }

        className="
          mt-7
          flex
          h-13
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-black
          px-6
          text-sm
          font-semibold
          text-white
          transition-all
          hover:bg-neutral-800
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >

        {application.isPending ? (

          <>
            <Loader2
              size={18}
              className="animate-spin"
            />

            Sending Application...
          </>

        ) : (

          <>
            <button
  type="submit"
  disabled={application.isPending}
  className="w-full min-h-[52px] rounded-2xl bg-black px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
>
  {application.isPending ? (
    <>
      <Loader2
        size={18}
        className="animate-spin"
      />
      Sending Application...
    </>
  ) : (
    "Apply to Collaborate"
  )}
</button>
          </>

        )}

      </button>


      <p
        className="
          mt-4
          text-center
          text-[11px]
          leading-5
          text-neutral-400
        "
      >
        By submitting this application, you agree that
        T&M Jewels may contact you regarding collaboration
        opportunities.
      </p>

    </form>

  );

}


interface FieldProps {

  label: string;
  required?: boolean;

  type?: string;

  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder?: string;

}


function Field({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
}: FieldProps) {

  return (

    <div>

      <label
        className="
          mb-2
          block
          text-sm
          font-medium
          text-neutral-800
        "
      >

        {label}

        {required && (

          <span className="ml-1 text-[#B18A2E]">
            *
          </span>

        )}

      </label>


      <input
        type={type}

        value={value}

        onChange={(event) =>
          onChange(
            event.target.value
          )
        }

        placeholder={placeholder}

        min={
          type === "number"
            ? "0"
            : undefined
        }

        className="
          h-12
          w-full
          rounded-xl
          border
          border-neutral-200
          bg-white
          px-4
          text-sm
          text-neutral-900
          outline-none
          transition
          placeholder:text-neutral-400
          focus:border-[#C8A44D]
          focus:ring-2
          focus:ring-[#C8A44D]/10
        "
      />

    </div>

  );

}