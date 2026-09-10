import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { X } from "lucide-react";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { toast } from "sonner";

import { useAuth } from "@/features/Auth/context/AuthContext";

import { useCustomerProfileMutation } from "@/features/customers/hooks/useCustomerProfileMutation";

import AvatarUpload from "./AvatarUpload";

/*
 * =========================================================
 * VALIDATION
 * =========================================================
 */

const schema = z.object({
  first_name: z
    .string()
    .min(2, "First name is required"),

  last_name: z
    .string()
    .optional(),

  date_of_birth: z
    .string()
    .optional(),
});

type FormData = z.infer<typeof schema>;

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
   */

  const { customer } = useAuth();

  /*
   * =======================================================
   * PROFILE MUTATION
   * =======================================================
   */

  const { updateMutation } =
    useCustomerProfileMutation(customer?.id);

  /*
   * =======================================================
   * AVATAR
   * =======================================================
   */

  const [avatar, setAvatar] =
    useState<string | null>(null);

  /*
   * =======================================================
   * DOB LIMIT
   * =======================================================
   */

  const dobUpdateCount =
    customer?.date_of_birth_update_count ?? 0;

  const dobUpdateLimit = 2;

  const dobLocked =
    dobUpdateCount >= dobUpdateLimit;

  /*
   * =======================================================
   * FORM
   * =======================================================
   */

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),

    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
    },
  });

  /*
   * =======================================================
   * SYNC CUSTOMER → FORM
   * =======================================================
   */

  useEffect(() => {
    if (!customer) {
      return;
    }

    reset({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      date_of_birth: customer.date_of_birth || "",
    });

    setAvatar(customer.avatar || null);
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

  function submit(data: FormData) {
    if (!customer?.id) {
      toast.error(
        "Customer information is not available."
      );

      return;
    }

    updateMutation.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        avatar,
        date_of_birth: dobLocked
          ? customer.date_of_birth ?? null
          : data.date_of_birth || null,
      },
      {
        onSuccess: () => {
          toast.success(
            "Profile updated successfully"
          );

          onClose();
        },

        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : "";

          if (
            message.includes(
              "DATE_OF_BIRTH_UPDATE_LIMIT_REACHED"
            )
          ) {
            toast.error(
              "Your date of birth can no longer be changed."
            );

            return;
          }

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
      open={open}
      onOpenChange={(value) => {
        if (!value) {
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
            onClick={onClose}
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
            aria-label="Close edit profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit(submit)}
          className="
            space-y-5
            p-6
          "
        >
          {/* =================================================
              AVATAR
          ================================================== */}

          <AvatarUpload
            customerId={customer?.id || ""}
            avatar={avatar}
            onUpload={(url) => {
              setAvatar(url);
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
              {...register("first_name")}
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
              {errors.first_name?.message}
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
              {...register("last_name")}
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
              DATE OF BIRTH
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
              Date of Birth
            </label>

            <input
              type="date"
              {...register("date_of_birth")}
              max={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              disabled={dobLocked}
              className={`
                w-full
                rounded-xl
                border
                border-neutral-200
                px-4
                py-3
                text-sm
                outline-none
                transition
                ${
                  dobLocked
                    ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                    : "bg-neutral-50 focus:border-[#C8A44D] focus:bg-white"
                }
              `}
            />

            <p
              className="
                mt-2
                text-xs
                leading-5
                text-neutral-500
              "
            >
              {dobLocked
                ? "Your date of birth can no longer be changed."
                : `You can update your date of birth up to 2 times. Changes used: ${dobUpdateCount}/2.`}
            </p>
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
              value={customer?.email || ""}
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
              value={customer?.phone || ""}
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
            {updateMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
