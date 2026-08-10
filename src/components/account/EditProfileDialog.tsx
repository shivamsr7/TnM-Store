import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  z,
} from "zod";

import {
  toast,
} from "sonner";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useCustomerProfileMutation,
} from "@/features/customers/hooks/useCustomerProfileMutation";

import AvatarUpload from "./AvatarUpload";


/*
 * =========================================================
 * VALIDATION
 * =========================================================
 */

const schema = z.object({

  first_name:
    z.string()
      .min(
        2,
        "First name is required"
      ),

  last_name:
    z.string()
      .optional(),

});


type FormData =
  z.infer<typeof schema>;


/*
 * =========================================================
 * PROPS
 * =========================================================
 */

interface Props {

  open: boolean;

  onClose: () => void;

}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function EditProfileDialog({

  open,

  onClose,

}: Props) {


  /*
   * =======================================================
   * AUTH CUSTOMER
   * =======================================================
   *
   * IMPORTANT:
   *
   * Use the same AuthContext customer that powers the
   * login/account system.
   *
   * This avoids the mobile issue where useCurrentCustomer()
   * was not immediately providing the complete customer
   * object.
   *
   * =======================================================
   */

  const {
    customer,
  } = useAuth();


  /*
   * =======================================================
   * PROFILE MUTATION
   * =======================================================
   */

  const {
    updateMutation,
  } =
    useCustomerProfileMutation(
      customer?.id
    );


  /*
   * =======================================================
   * AVATAR
   * =======================================================
   */

  const [
    avatar,
    setAvatar,
  ] = useState<
    string | null
  >(null);


  /*
   * =======================================================
   * FORM
   * =======================================================
   */

  const {

    register,

    handleSubmit,

    reset,

    formState: {
      errors,
    },

  } =
    useForm<FormData>({

      resolver:
        zodResolver(
          schema
        ),

      defaultValues: {

        first_name:
          "",

        last_name:
          "",

      },

    });


  /*
   * =======================================================
   * SYNC CUSTOMER → FORM
   * =======================================================
   *
   * Whenever the dialog opens or the AuthContext customer
   * becomes available, populate the form.
   *
   * This is especially important on mobile because the
   * customer can hydrate after the component has mounted.
   *
   * =======================================================
   */

  useEffect(() => {

    if (
      !customer
    ) {

      return;

    }


    reset({

      first_name:
        customer.first_name ||
        "",

      last_name:
        customer.last_name ||
        "",

    });


    setAvatar(
      customer.avatar ||
      null
    );


  }, [
    customer,
    open,
    reset,
  ]);


  /*
   * =======================================================
   * SUBMIT
   * =======================================================
   */

  function submit(
    data: FormData
  ) {

    if (
      !customer?.id
    ) {

      toast.error(
        "Customer information is not available."
      );

      return;

    }


    updateMutation.mutate(

      {

        first_name:
          data.first_name,

        last_name:
          data.last_name,

        avatar,

      },

      {

        onSuccess: () => {

          toast.success(
            "Profile updated successfully"
          );


          onClose();

        },


        onError: () => {

          toast.error(
            "Unable to update profile"
          );

        },

      }

    );

  }


  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (

    <Dialog

      open={
        open
      }

      onOpenChange={(value) => {

        if (
          !value
        ) {

          onClose();

        }

      }}

    >

      <DialogContent

        className="
          max-h-[90vh]
          w-[95vw]
          overflow-y-auto
          rounded-3xl
          border-neutral-200
          bg-white
          p-0
          text-black
          shadow-xl
          sm:max-w-xl
          [&>button]:hidden
        "

      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div

          className="
            flex
            items-center
            justify-between
            border-b
            border-neutral-200
            px-6
            py-5
          "

        >

          <DialogHeader>

            <DialogTitle

              className="
                text-xl
                font-semibold
              "

            >

              Edit Profile

            </DialogTitle>

          </DialogHeader>


          <button

            type="button"

            onClick={
              onClose
            }

            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-neutral-300
              transition
              hover:bg-neutral-100
            "

          >

            <X
              size={18}
            />

          </button>

        </div>


        {/* =================================================
            FORM
        ================================================== */}

        <form

          onSubmit={
            handleSubmit(
              submit
            )
          }

          className="
            space-y-5
            p-6
          "

        >

          {/* =================================================
              AVATAR
          ================================================== */}

          <AvatarUpload

            customerId={
              customer?.id ||
              ""
            }

            avatar={
              avatar
            }

            onUpload={(url) => {

              setAvatar(
                url
              );

            }}

          />


          {/* =================================================
              FIRST NAME
          ================================================== */}

          <div>

            <label

              className="
                mb-2
                block
                text-sm
                font-medium
                text-neutral-700
              "

            >

              First Name

            </label>


            <input

              {...register(
                "first_name"
              )}

              placeholder="First name"

              className="
                w-full
                rounded-xl
                border
                border-neutral-200
                bg-neutral-50
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-[#C8A44D]
                focus:bg-white
              "

            />


            <p

              className="
                mt-1
                text-xs
                text-red-500
              "

            >

              {
                errors
                  .first_name
                  ?.message
              }

            </p>

          </div>


          {/* =================================================
              LAST NAME
          ================================================== */}

          <div>

            <label

              className="
                mb-2
                block
                text-sm
                font-medium
                text-neutral-700
              "

            >

              Last Name

            </label>


            <input

              {...register(
                "last_name"
              )}

              placeholder="Last name"

              className="
                w-full
                rounded-xl
                border
                border-neutral-200
                bg-neutral-50
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-[#C8A44D]
                focus:bg-white
              "

            />

          </div>


          {/* =================================================
              EMAIL
          ================================================== */}

          <div>

            <label

              className="
                mb-2
                block
                text-sm
                font-medium
                text-neutral-700
              "

            >

              Email

            </label>


            <input

              value={
                customer?.email ||
                ""
              }

              readOnly

              className="
                w-full
                rounded-xl
                border
                border-neutral-200
                bg-neutral-100
                px-4
                py-3
                text-sm
                text-neutral-500
                outline-none
              "

            />

          </div>


          {/* =================================================
              PHONE
          ================================================== */}

          <div>

            <label

              className="
                mb-2
                block
                text-sm
                font-medium
                text-neutral-700
              "

            >

              Phone Number

            </label>


            <input

              value={
                customer?.phone ||
                ""
              }

              readOnly

              className="
                w-full
                rounded-xl
                border
                border-neutral-200
                bg-neutral-100
                px-4
                py-3
                text-sm
                text-neutral-500
                outline-none
              "

            />

          </div>


          {/* =================================================
              SAVE
          ================================================== */}

          <button

            type="submit"

            disabled={
              updateMutation.isPending ||
              !customer?.id
            }

            className="
              w-full
              rounded-xl
              bg-[#C8A44D]
              py-3.5
              font-semibold
              text-black
              transition
              hover:bg-[#b8943f]
              disabled:cursor-not-allowed
              disabled:opacity-70
            "

          >

            {

              updateMutation.isPending

                ? "Saving..."

                : "Save Changes"

            }

          </button>

        </form>

      </DialogContent>

    </Dialog>

  );

}