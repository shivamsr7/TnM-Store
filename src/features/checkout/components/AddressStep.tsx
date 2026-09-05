import {
  useEffect,
  useState,
} from "react";


import {
  Check,
  Pencil,
} from "lucide-react";


import {
  getCustomerAddresses,
} from "@/features/customers/services/address.service";


import AddAddressForm from "./AddAddressForm";


import EditAddressDialog from "@/components/account/EditAddressDialog";



interface Props {

  customer: any;

  onContinue: (
    address: any
  ) => void;

  onAddingAddressChange?: (
    isAdding: boolean
  ) => void;

}





export default function AddressStep({

  customer,

  onContinue,

  onAddingAddressChange,

}: Props) {


  /*
   * =========================================================
   * ADDRESSES
   * =========================================================
   */

  const [
    addresses,
    setAddresses,
  ] = useState<any[]>([]);


  const [
    selected,
    setSelected,
  ] = useState<any>(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
   * =========================================================
   * ADD ADDRESS
   * =========================================================
   */

  const [
    showAddForm,
    setShowAddForm,
  ] = useState(false);


  useEffect(() => {

    onAddingAddressChange?.(
      showAddForm
    );

    return () => {
      onAddingAddressChange?.(
        false
      );
    };

  }, [
    showAddForm,
    onAddingAddressChange,
  ]);


  /*
   * =========================================================
   * EDIT ADDRESS
   * =========================================================
   */

  const [
    showEditDialog,
    setShowEditDialog,
  ] = useState(false);


  const [
    editingAddress,
    setEditingAddress,
  ] = useState<any>(null);


  /*
   * =========================================================
   * CONFIRM SELECTED ADDRESS
   * =========================================================
   */

  const [
    showConfirmAddressDialog,
    setShowConfirmAddressDialog,
  ] = useState(false);


  /*
   * =========================================================
   * LOAD ADDRESSES
   * =========================================================
   */

  async function loadAddresses() {

    if (!customer?.id) {

      setAddresses([]);

      setSelected(null);

      setLoading(false);

      return;

    }


    try {

      setLoading(true);


      console.log(
        "Customer passed to AddressStep:",
        customer
      );


      const data =
        await getCustomerAddresses(
          customer.id
        );


      setAddresses(
        data
      );


      /*
       * Keep the currently selected address
       * if it still exists after refresh.
       */

      const currentSelected =
        data.find(
          (
            item
          ) =>
            item.id ===
            selected?.id
        );


      if (currentSelected) {

        setSelected(
          currentSelected
        );

      }

      else {

        const defaultAddress =
          data.find(
            (
              item
            ) =>
              item.is_default
          );


        setSelected(
          defaultAddress ??
          data[0] ??
          null
        );

      }

    }

    catch (error) {

      console.error(
        "Address loading failed:",
        error
      );

      setAddresses([]);

      setSelected(null);

    }

    finally {

      setLoading(false);

    }

  }


  /*
   * =========================================================
   * LOAD ON CUSTOMER CHANGE
   * =========================================================
   */

  useEffect(() => {

    loadAddresses();

  }, [
    customer,
  ]);





  /*
   * =========================================================
   * OPEN EDIT
   * =========================================================
   */

  function handleEdit(
    event: React.MouseEvent,
    address: any
  ) {

    /*
     * Prevent the edit button from also
     * selecting the address card.
     */

    event.stopPropagation();


    setEditingAddress(
      address
    );


    setShowEditDialog(
      true
    );

  }



  function handleEditSelectedAddress() {

    if (!selected) {
      return;
    }

    setShowConfirmAddressDialog(false);
    setEditingAddress(selected);
    setShowEditDialog(true);

  }





  /*
   * =========================================================
   * EDIT SUCCESS
   * =========================================================
   */

  async function handleEditSuccess() {

    /*
     * Close first so the transition feels
     * natural on mobile.
     */

    setShowEditDialog(
      false
    );


    /*
     * Refresh the addresses from Supabase.
     */

    await loadAddresses();

  }





  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading)

    return (

      <div
        className="
          py-10
          text-center
          text-sm
          text-neutral-500
        "
      >

        Loading addresses...

      </div>

    );





  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <div
      className="
        space-y-5
      "
    >


      {/* ===================================================
          TITLE
      ==================================================== */}

      <h3
        className="
          text-lg
          font-semibold
        "
      >

        Select Delivery Address

      </h3>




      {/* ===================================================
          ADD ADDRESS FORM
      ==================================================== */}

      {
        showAddForm && (

          <AddAddressForm

            customerId={
              customer.id
            }

            onCancel={() =>
              setShowAddForm(
                false
              )
            }

            onSaved={(
              address
            ) => {

              setAddresses(
                prev => [
                  address,
                  ...prev,
                ]
              );


              setSelected(
                address
              );


              setShowAddForm(
                false
              );

            }}

          />

        )
      }





      {
        !showAddForm && (

          <>


            {/* =============================================
                EMPTY STATE
            ============================================== */}

            {
              addresses.length === 0 && (

                <div
                  className="
                    rounded-2xl
                    border
                    border-dashed
                    p-5
                    text-center
                    text-sm
                    text-neutral-500
                  "
                >

                  No saved address found.

                  <br />

                  Add your delivery address.

                </div>

              )
            }





            {/* =============================================
                ADDRESS LIST
            ============================================== */}

            {
              addresses.map(
                (
                  address
                ) => (

                  <div
                    key={
                      address.id
                    }
                    onClick={() =>
                      setSelected(
                        address
                      )
                    }
                    className={`
                      cursor-pointer
                      rounded-2xl
                      border
                      p-4
                      transition-all
                      duration-200

                      ${
                        selected?.id ===
                        address.id

                          ? "border-green-500 bg-green-50/60 shadow-sm"

                          : "border-neutral-200 bg-white"
                      }

                      hover:border-neutral-400
                    `}
                  >


                    {/* ===================================
                        ADDRESS HEADER
                    ==================================== */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <p
                          className="
                            font-medium
                            text-neutral-950
                          "
                        >

                          {
                            address.full_name
                          }

                        </p>

                      </div>


                      {/* =================================
                          ACTIONS
                      ================================== */}

                      <div
                        className="
                          flex
                          shrink-0
                          items-center
                          gap-2
                        "
                      >

                        {
                          selected?.id === address.id && (
                            <div
                              className="
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-green-600
                                text-white
                                shadow-sm
                                transition-all
                                duration-200
                              "
                              aria-label="Selected address"
                              title="Selected address"
                            >
                              <Check
                                size={15}
                                strokeWidth={2.5}
                              />
                            </div>
                          )
                        }


                        {
                          address.is_default && (

                            <span
                              className="
                                rounded-full
                                bg-neutral-100
                                px-2
                                py-1
                                text-xs
                                text-neutral-600
                              "
                            >

                              Default

                            </span>

                          )
                        }


                        <button
                          type="button"
                          onClick={(
                            event
                          ) =>
                            handleEdit(
                              event,
                              address
                            )
                          }
                          className="
                            inline-flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-neutral-200
                            bg-white
                            text-neutral-600
                            transition-all
                            duration-200

                            hover:border-[#C8A44D]
                            hover:bg-[#C8A44D]/10
                            hover:text-[#9A7A22]

                            active:scale-95
                          "
                          aria-label="Edit address"
                          title="Edit address"
                        >

                          <Pencil
                            size={14}
                            strokeWidth={2}
                          />

                        </button>


                      </div>

                    </div>




                    {/* ===================================
                        ADDRESS DETAILS
                    ==================================== */}

                    <p
                      className="
                        mt-2
                        text-sm
                        text-neutral-600
                      "
                    >

                      {
                        address.address_line_1
                      }

                    </p>


                    {
                      address.address_line_2 && (

                        <p
                          className="
                            text-sm
                            text-neutral-600
                          "
                        >

                          {
                            address.address_line_2
                          }

                        </p>

                      )
                    }


                    <p
                      className="
                        text-sm
                        text-neutral-600
                      "
                    >

                      {
                        address.city
                      }

                      ,

                      {" "}

                      {
                        address.state
                      }

                    </p>


                    <p
                      className="
                        text-sm
                        text-neutral-600
                      "
                    >

                      {
                        address.postal_code
                      }

                    </p>


                  </div>

                )
              )
            }





            {/* =============================================
                ADD NEW ADDRESS
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                setShowAddForm(
                  true
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-dashed
                border-neutral-300
                py-3
                text-sm
                font-medium
                text-neutral-700
                transition
                hover:border-[#C8A44D]
                hover:bg-[#C8A44D]/5
                hover:text-[#9A7A22]
                active:scale-[0.99]
              "
            >

              + Add New Address

            </button>




            {/* =============================================
                CONTINUE
            ============================================== */}

            <button
              type="button"
              disabled={
                !selected
              }
              onClick={() => {
                if (!selected) {
                  return;
                }

                setShowConfirmAddressDialog(true);
              }}
              className="
                w-full
                rounded-xl
                bg-black
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-neutral-800
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              Continue

            </button>


          </>

        )
      }





      {/* ===================================================
          CONFIRM SELECTED ADDRESS DIALOG
      ==================================================== */}

      {showConfirmAddressDialog && selected && (
        <>
          <div
            className="
              fixed
              inset-0
              z-[1200]
              bg-black/45
              backdrop-blur-[3px]
              motion-safe:animate-in
              motion-safe:fade-in
              motion-safe:duration-200
            "
            onClick={() =>
              setShowConfirmAddressDialog(false)
            }
          />

          <div
            className="
              fixed
              inset-x-4
              top-1/2
              z-[1210]
              -translate-y-1/2
              sm:left-1/2
              sm:right-auto
              sm:w-[min(440px,calc(100%-32px))]
              sm:-translate-x-1/2
              rounded-3xl
              border
              border-neutral-200
              bg-white
              p-5
              shadow-[0_24px_70px_rgba(0,0,0,0.22)]
              motion-safe:animate-in
              motion-safe:fade-in
              motion-safe:zoom-in-95
              motion-safe:duration-250
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-address-title"
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-full
                  bg-green-50
                  text-green-600
                  ring-1 ring-green-100
                  motion-safe:animate-in
                  motion-safe:zoom-in
                  motion-safe:duration-300
                "
              >
                <Check size={20} strokeWidth={2.7} />
              </div>

              <div className="min-w-0 flex-1">
                <h4
                  id="confirm-address-title"
                  className="text-base font-semibold text-neutral-950"
                >
                  Confirm delivery address
                </h4>
                <p className="mt-1 text-sm leading-5 text-neutral-500">
                  Please make sure this is the address you want your order
                  delivered to.
                </p>
              </div>
            </div>

            <div
              className="
                mt-4
                rounded-2xl
                border
                border-neutral-200
                bg-neutral-50
                p-4
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-950">
                    {selected.full_name}
                  </p>

                  <p className="mt-2 text-sm leading-5 text-neutral-600">
                    {selected.address_line_1}
                    {selected.address_line_2 && (
                      <>
                        <br />
                        {selected.address_line_2}
                      </>
                    )}
                    <br />
                    {selected.city}, {selected.state}
                    <br />
                    {selected.postal_code}
                  </p>
                </div>

                {selected.is_default && (
                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-white
                      px-2.5
                      py-1
                      text-[11px]
                      font-medium
                      text-neutral-600
                      shadow-sm
                      ring-1 ring-neutral-200
                    "
                  >
                    Default
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setShowConfirmAddressDialog(false)
                }
                className="
                  min-h-11
                  rounded-xl
                  border
                  border-neutral-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-neutral-700
                  transition-all
                  duration-200
                  hover:border-neutral-300
                  hover:bg-neutral-50
                  active:scale-[0.98]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleEditSelectedAddress}
                className="
                  min-h-11
                  rounded-xl
                  border
                  border-neutral-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-neutral-800
                  transition-all
                  duration-200
                  hover:border-[#C8A44D]
                  hover:bg-[#C8A44D]/5
                  hover:text-[#9A7A22]
                  active:scale-[0.98]
                "
              >
                Edit address
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowConfirmAddressDialog(false);
                onContinue(selected);
              }}
              className="
                mt-2.5
                flex
                min-h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-black
                px-4
                text-sm
                font-semibold
                text-white
                transition-all
                duration-200
                hover:bg-neutral-800
                active:scale-[0.99]
              "
            >
              <Check size={16} strokeWidth={2.5} />
              Confirm & Continue
            </button>
          </div>
        </>
      )}


      {/* ===================================================
          EDIT ADDRESS DIALOG
      ==================================================== */}

      <EditAddressDialog

        open={
          showEditDialog
        }

        address={
          editingAddress
        }

        onClose={() => {

          setShowEditDialog(
            false
          );

          setEditingAddress(
            null
          );

        }}

        onSuccess={
          handleEditSuccess
        }

      />


    </div>

  );

}