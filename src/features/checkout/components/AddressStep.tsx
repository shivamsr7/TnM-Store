import {
  useEffect,
  useState,
} from "react";


import {
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

}





export default function AddressStep({

  customer,

  onContinue,

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

                          ? "border-black bg-neutral-50 shadow-sm"

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
              onClick={() =>
                onContinue(
                  selected
                )
              }
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