import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AddAddressDialog from "./AddAddressDialog";
import EditAddressDialog from "./EditAddressDialog";
import DeleteAddressDialog from "./DeleteAddressDialog";

import {
  X,
  Plus,
  Star,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useCurrentCustomer,
} from "@/features/customers/hooks/useCurrentCustomer";

import {
  useCustomerAddresses,
} from "@/features/customers/hooks/useCustomerAddresses";

import {
  useCustomerAddressMutations,
} from "@/features/customers/hooks/useCustomerAddressMutations";

import {
  toast,
} from "sonner";


interface Props {

  open: boolean;

  onClose: () => void;

}


export default function SavedAddressesDialog({

  open,

  onClose,

}: Props) {


  /*
   * =========================================================
   * CURRENT CUSTOMER
   * =========================================================
   */

  const {
    data: customer,
  } = useCurrentCustomer();


  /*
   * =========================================================
   * CUSTOMER ID
   * =========================================================
   *
   * Keep the ID in one place.
   *
   * When Zustand hydration finishes and the customer becomes
   * available, React Query receives the ID and automatically
   * fetches the addresses.
   *
   * =========================================================
   */

  const customerId =
    customer?.id ?? null;


  /*
   * =========================================================
   * ADDRESSES
   * =========================================================
   */

  const {
    data: addresses = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useCustomerAddresses(
    customerId ?? undefined
  );


  /*
   * =========================================================
   * ADDRESS MUTATIONS
   * =========================================================
   */

  const {
    deleteMutation,
    defaultMutation,
  } =
    useCustomerAddressMutations(
      customerId ?? undefined
    );


  /*
   * =========================================================
   * DIALOG STATE
   * =========================================================
   */

  const [
    showAddAddress,
    setShowAddAddress,
  ] = useState(false);


  const [
    showEditAddress,
    setShowEditAddress,
  ] = useState(false);


  const [
    selectedAddress,
    setSelectedAddress,
  ] = useState<any>(null);


  const [
    showDeleteDialog,
    setShowDeleteDialog,
  ] = useState(false);


  const [
    deleteAddressId,
    setDeleteAddressId,
  ] = useState<string | null>(null);


  /*
   * =========================================================
   * DEFAULT ADDRESS
   * =========================================================
   */

  function handleDefault(
    id: string
  ) {

    if (!customerId) {

      toast.error(
        "Customer information is not available yet."
      );

      return;

    }


    defaultMutation.mutate(

      {
        addressId: id,
      },

      {

        onSuccess: async () => {

          toast.success(
            "Default address updated"
          );


          /*
           * Refresh addresses immediately so the
           * new default state is visible.
           */

          await refetch();

        },

        onError: () => {

          toast.error(
            "Unable to update default address"
          );

        },

      }

    );

  }


  /*
   * =========================================================
   * DELETE ADDRESS
   * =========================================================
   */

  function handleDelete() {

    if (!deleteAddressId) {

      return;

    }


    if (!customerId) {

      toast.error(
        "Customer information is not available yet."
      );

      return;

    }


    deleteMutation.mutate(

      deleteAddressId,

      {

        onSuccess: async () => {

          toast.success(
            "Address deleted successfully"
          );


          setShowDeleteDialog(
            false
          );

          setDeleteAddressId(
            null
          );


          /*
           * Refresh the address list.
           */

          await refetch();

        },

        onError: () => {

          toast.error(
            "Unable to delete address"
          );

        },

      }

    );

  }


  /*
   * =========================================================
   * ADD ADDRESS SUCCESS
   * =========================================================
   */

  function handleAddressAdded() {

    toast.success(
      "Address added successfully"
    );


    setShowAddAddress(
      false
    );


    /*
     * Fetch the newly added address.
     */

    refetch();

  }


  /*
   * =========================================================
   * UPDATE ADDRESS SUCCESS
   * =========================================================
   */

  function handleAddressUpdated() {

    toast.success(
      "Address updated successfully"
    );


    setShowEditAddress(
      false
    );

    setSelectedAddress(
      null
    );


    /*
     * Refresh the list.
     */

    refetch();

  }


  /*
   * =========================================================
   * CLOSE EDIT
   * =========================================================
   */

  function handleCloseEdit() {

    setShowEditAddress(
      false
    );

    setSelectedAddress(
      null
    );

  }


  /*
   * =========================================================
   * CLOSE DELETE
   * =========================================================
   */

  function handleCloseDelete() {

    setShowDeleteDialog(
      false
    );

    setDeleteAddressId(
      null
    );

  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      {/* =====================================================
          SAVED ADDRESSES
      ====================================================== */}

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

                Saved Addresses

              </DialogTitle>

            </DialogHeader>


            <button

              type="button"

              onClick={
                onClose
              }

              aria-label="Close saved addresses"

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
              CONTENT
          ================================================== */}

          <div

            className="
              space-y-4
              p-6
            "

          >

            {/* =================================================
                CUSTOMER NOT READY
            ================================================== */}

            {!customerId && (

              <div

                className="
                  rounded-2xl
                  border
                  border-neutral-200
                  bg-neutral-50
                  p-8
                  text-center
                "

              >

                <MapPin

                  size={38}

                  className="
                    mx-auto
                    mb-3
                    text-[#C8A44D]
                  "

                />


                <p
                  className="
                    font-medium
                    text-neutral-900
                  "
                >

                  Loading your account...

                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    text-neutral-500
                  "
                >

                  Please wait while we load your saved addresses.

                </p>

              </div>

            )}


            {/* =================================================
                LOADING
            ================================================== */}

            {customerId &&
              (loading ||
                isFetching) && (

              <p

                className="
                  py-6
                  text-center
                  text-sm
                  text-neutral-500
                "

              >

                Loading addresses...

              </p>

            )}


            {/* =================================================
                EMPTY
            ================================================== */}

            {customerId &&
              !loading &&
              !isFetching &&
              addresses.length === 0 && (

              <div

                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-neutral-300
                  p-8
                  text-center
                "

              >

                <MapPin

                  size={38}

                  className="
                    mx-auto
                    mb-3
                    text-[#C8A44D]
                  "

                />


                <p
                  className="
                    font-medium
                    text-neutral-900
                  "
                >

                  No saved addresses

                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    text-neutral-500
                  "
                >

                  Save your address for faster checkout

                </p>

              </div>

            )}


            {/* =================================================
                ADDRESS LIST
            ================================================== */}

            {customerId &&
              !loading &&
              addresses.length > 0 && (

              <div
                className="
                  space-y-4
                "
              >

                {addresses.map(
                  (address: any) => (

                    <div

                      key={
                        address.id
                      }

                      className="
                        rounded-2xl
                        border
                        border-neutral-200
                        bg-white
                        p-5
                        shadow-sm
                      "

                    >

                      {/* =======================================
                          ADDRESS HEADER
                      ======================================== */}

                      <div

                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "

                      >

                        <div>

                          <div

                            className="
                              flex
                              items-center
                              gap-2
                            "

                          >

                            <h3

                              className="
                                font-semibold
                                capitalize
                                text-neutral-900
                              "

                            >

                              {address.type}

                            </h3>


                            {address.is_default && (

                              <span

                                className="
                                  flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  bg-[#C8A44D]/10
                                  px-2.5
                                  py-1
                                  text-xs
                                  text-[#9A7A22]
                                "

                              >

                                <Star
                                  size={12}
                                />

                                Default

                              </span>

                            )}

                          </div>


                          {/* =================================
                              NAME
                          ================================== */}

                          <p

                            className="
                              mt-3
                              font-medium
                              text-neutral-900
                            "

                          >

                            {address.full_name}

                          </p>


                          {/* =================================
                              PHONE
                          ================================== */}

                          <p

                            className="
                              mt-1
                              text-sm
                              text-neutral-600
                            "

                          >

                            {address.phone}

                          </p>


                          {/* =================================
                              ADDRESS
                          ================================== */}

                          <p

                            className="
                              mt-3
                              text-sm
                              leading-relaxed
                              text-neutral-600
                            "

                          >

                            {address.address_line_1}

                            <br />

                            {address.address_line_2 && (

                              <>

                                {address.address_line_2}

                                <br />

                              </>

                            )}


                            {address.city},{" "}

                            {address.state}

                            <br />

                            {address.postal_code},{" "}

                            {address.country}

                          </p>

                        </div>

                      </div>


                      {/* =======================================
                          ACTIONS
                      ======================================== */}

                      <div

                        className="
                          mt-5
                          flex
                          items-center
                          justify-between
                          border-t
                          border-neutral-200
                          pt-4
                        "

                      >

                        <div
                          className="
                            flex
                            gap-4
                          "
                        >

                          {/* Edit */}

                          <button

                            type="button"

                            onClick={() => {

                              setSelectedAddress(
                                address
                              );

                              setShowEditAddress(
                                true
                              );

                            }}

                            className="
                              flex
                              items-center
                              gap-1
                              text-sm
                              text-neutral-600
                              hover:text-black
                            "

                          >

                            <Pencil
                              size={15}
                            />

                            Edit

                          </button>


                          {/* Delete */}

                          <button

                            type="button"

                            onClick={() => {

                              setDeleteAddressId(
                                address.id
                              );

                              setShowDeleteDialog(
                                true
                              );

                            }}

                            className="
                              flex
                              items-center
                              gap-1
                              text-sm
                              text-red-500
                              hover:text-red-700
                            "

                          >

                            <Trash2
                              size={15}
                            />

                            Delete

                          </button>

                        </div>


                        {/* Set Default */}

                        {!address.is_default && (

                          <button

                            type="button"

                            onClick={() =>
                              handleDefault(
                                address.id
                              )
                            }

                            disabled={
                              defaultMutation.isPending
                            }

                            className="
                              text-sm
                              text-[#9A7A22]
                              hover:underline
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "

                          >

                            Set Default

                          </button>

                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}


            {/* =================================================
                ADD ADDRESS
            ================================================== */}

            <button

              type="button"

              onClick={() =>
                setShowAddAddress(
                  true
                )
              }

              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#C8A44D]
                py-3.5
                font-semibold
                text-black
                transition
                hover:bg-[#b8943f]
              "

            >

              <Plus
                size={18}
              />

              Add New Address

            </button>

          </div>

        </DialogContent>

      </Dialog>


      {/* =====================================================
          ADD ADDRESS DIALOG
      ====================================================== */}

      <AddAddressDialog

        open={
          showAddAddress
        }

        onClose={() =>
          setShowAddAddress(
            false
          )
        }

        onSuccess={
          handleAddressAdded
        }

      />


      {/* =====================================================
          EDIT ADDRESS DIALOG
      ====================================================== */}

      <EditAddressDialog

        open={
          showEditAddress
        }

        address={
          selectedAddress
        }

        onClose={
          handleCloseEdit
        }

        onSuccess={
          handleAddressUpdated
        }

      />


      {/* =====================================================
          DELETE ADDRESS DIALOG
      ====================================================== */}

      <DeleteAddressDialog

        open={
          showDeleteDialog
        }

        onClose={
          handleCloseDelete
        }

        onConfirm={
          handleDelete
        }

      />

    </>

  );

}