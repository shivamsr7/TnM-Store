import {
  useEffect,
  useState
} from "react";

import {
  Check,
  Home,
  Briefcase,
  Loader2,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";


import {
  createCustomerAddress
} from "@/features/customers/services/address.service";



interface Props {

  customerId:string;

  onSaved:(address:any)=>void;

  onCancel:()=>void;

}





export default function AddAddressForm({

  customerId,

  onSaved,

  onCancel

}:Props){



const [loading,setLoading]=useState(false);
const [pincodeLoading,setPincodeLoading]=useState(false);
const [pincodeError,setPincodeError]=useState("");
const [pincodeVerified,setPincodeVerified]=useState(false);
const [errors,setErrors]=useState<Record<string,string>>({});
const [saveError,setSaveError]=useState("");



const [form,setForm]=useState({

full_name:"",

phone:"",

address_line_1:"",

address_line_2:"",

city:"",

state:"",

postal_code:"",

type:"home",

});






function updateField(

key:string,

value:string

){


setForm(prev=>({

...prev,

[key]:value

}));

setErrors(prev => {
  if (!prev[key]) return prev;
  const next = { ...prev };
  delete next[key];
  return next;
});

setSaveError("");


}


useEffect(() => {

  const pincode = form.postal_code.replace(/\D/g, "").slice(0, 6);

  if (pincode !== form.postal_code) {
    setForm(prev => ({
      ...prev,
      postal_code: pincode
    }));
  }

  if (pincode.length !== 6) {
    setPincodeError("");
    setPincodeVerified(false);
    setPincodeLoading(false);

    setForm(prev => ({
      ...prev,
      city: "",
      state: ""
    }));

    return;
  }

  let cancelled = false;

  async function fetchPincodeDetails() {

    try {

      setPincodeLoading(true);
      setPincodeError("");
      setPincodeVerified(false);

      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      if (!response.ok) {
        throw new Error("Pincode lookup failed");
      }

      const data = await response.json();
      const postOffice = data?.[0]?.PostOffice?.[0];

      if (!postOffice) {
        throw new Error("Invalid pincode");
      }

      if (!cancelled) {
        setForm(prev => ({
          ...prev,
          city: postOffice.District || "",
          state: postOffice.State || ""
        }));

        setPincodeVerified(
          Boolean(postOffice.District && postOffice.State)
        );
      }

    } catch (error) {

      if (!cancelled) {
        setPincodeError("Could not find city and state for this pincode.");
      }

      console.error("Pincode lookup failed", error);

    } finally {

      if (!cancelled) {
        setPincodeLoading(false);
      }

    }
  }

  fetchPincodeDetails();

  return () => {
    cancelled = true;
  };

}, [form.postal_code]);







function validateForm(){

  const nextErrors:Record<string,string> = {};

  const fullName = form.full_name.trim();
  const phone = form.phone.replace(/\D/g, "");
  const address1 = form.address_line_1.trim();
  const address2 = form.address_line_2.trim();
  const city = form.city.trim();
  const state = form.state.trim();
  const pincode = form.postal_code.trim();

  if (!fullName) {
    nextErrors.full_name = "Full name is required.";
  } else if (fullName.length < 2) {
    nextErrors.full_name = "Please enter your full name.";
  } else if (fullName.length > 80) {
    nextErrors.full_name = "Full name is too long.";
  } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ .'-]*$/.test(fullName)) {
    nextErrors.full_name = "Please enter a valid name.";
  }

  if (!phone) {
    nextErrors.phone = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(phone)) {
    nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!address1) {
    nextErrors.address_line_1 = "Address Line 1 is required.";
  } else if (address1.length < 5) {
    nextErrors.address_line_1 = "Please enter a more complete address.";
  } else if (address1.length > 200) {
    nextErrors.address_line_1 = "Address Line 1 is too long.";
  }

  if (address2.length > 200) {
    nextErrors.address_line_2 = "Address Line 2 is too long.";
  }

  if (!city) {
    nextErrors.city = "City is required.";
  } else if (city.length < 2) {
    nextErrors.city = "Please enter a valid city.";
  } else if (city.length > 80) {
    nextErrors.city = "City name is too long.";
  } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ .'-]*$/.test(city)) {
    nextErrors.city = "Please enter a valid city.";
  }

  if (!state) {
    nextErrors.state = "State is required.";
  } else if (state.length < 2) {
    nextErrors.state = "Please enter a valid state.";
  } else if (state.length > 80) {
    nextErrors.state = "State name is too long.";
  } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ .'-]*$/.test(state)) {
    nextErrors.state = "Please enter a valid state.";
  }

  if (!/^\d{6}$/.test(pincode)) {
    nextErrors.postal_code = "Enter a valid 6-digit pincode.";
  }

  if (pincodeError) {
    nextErrors.postal_code = pincodeError;
  }

  if (pincodeLoading) {
    nextErrors.postal_code = "Please wait while we verify the pincode.";
  }

  if (!form.type || !["home","work"].includes(form.type)) {
    nextErrors.type = "Please select a valid address type.";
  }

  setErrors(nextErrors);
  return nextErrors;
}


async function saveAddress(){

  setSaveError("");

  const validationErrors = validateForm();

  if (Object.keys(validationErrors).length > 0) {
    return;
  }

  try{

    setLoading(true);



const address = await createCustomerAddress({

customer_id:customerId,

...form,

full_name:form.full_name.trim(),
phone:form.phone.replace(/\D/g, ""),
address_line_1:form.address_line_1.trim(),
address_line_2:form.address_line_2.trim(),
city:form.city.trim(),
state:form.state.trim(),
postal_code:form.postal_code.trim(),

});





onSaved(address);



}

catch(error){


console.error(

"Address save failed",

error

);

setSaveError(
  error instanceof Error
    ? error.message
    : "Could not save the address. Please try again."
);


}

finally{


setLoading(false);


}


}








const inputClass = `

w-full

rounded-xl

border

border-neutral-200

bg-neutral-50/60

px-4

py-3.5

text-[15px]

text-neutral-900

outline-none

transition-all

duration-200

placeholder:text-neutral-400

focus:border-[#C8A44D]

focus:bg-white

focus:ring-4

focus:ring-[#C8A44D]/10

`;








return (

  <div
    className="
      w-full
      overflow-hidden
      rounded-3xl
      border
      border-neutral-200
      bg-white
      shadow-[0_20px_70px_rgba(0,0,0,0.10)]
    "
  >

    {/* Header */}
    <div
      className="
        border-b
        border-neutral-100
        bg-gradient-to-b
        from-white
        to-neutral-50/70
        px-5
        pb-5
        pt-5
        sm:px-6
      "
    >
      <div className="flex items-start justify-between gap-4">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-[#C8A44D]/10
                text-[#9A7A22]
              "
            >
              <MapPin size={18} strokeWidth={2} />
            </div>

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#9A7A22]
              "
            >
              Delivery details
            </span>
          </div>

          <h3 className="text-xl font-semibold tracking-[-0.025em] text-neutral-950">
            Add New Address
          </h3>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Enter your pincode first and we’ll automatically find your city and state.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-neutral-200
            bg-white
            text-neutral-600
            transition
            hover:border-neutral-300
            hover:bg-neutral-50
            active:scale-95
          "
          aria-label="Close"
        >
          ×
        </button>

      </div>
    </div>

    {/* Form */}
    <div className="space-y-5 px-5 py-6 sm:px-6">

      {/* Pincode first */}
      <div
        className="
          rounded-2xl
          border
          border-[#C8A44D]/30
          bg-gradient-to-br
          from-[#FFFDF7]
          to-[#FFF8E7]/60
          p-4
        "
      >
        <div className="mb-2.5 flex items-center justify-between gap-3">

          <div>
            <label className="text-sm font-semibold text-neutral-900">
              Postal Code <span className="text-red-500">*</span>
            </label>

            <p className="mt-0.5 text-[11px] text-neutral-500">
              We’ll use this to fetch your city & state
            </p>
          </div>

          {pincodeVerified && (
            <span
              className="
                inline-flex
                shrink-0
                items-center
                gap-1
                rounded-full
                bg-green-50
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-green-700
              "
            >
              <Check size={12} strokeWidth={2.5} />
              Verified
            </span>
          )}

        </div>

        <div className="relative">

          <input
            className={`
              ${inputClass}
              pr-12
              text-center
              text-base
              font-semibold
              tracking-[0.18em]
              ${
                errors.postal_code || pincodeError
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : pincodeVerified
                    ? "border-green-300 bg-green-50/40"
                    : ""
              }
            `}
            placeholder="Enter 6-digit PIN code"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={form.postal_code}
            onChange={(e) =>
              updateField(
                "postal_code",
                e.target.value.replace(/\D/g, "").slice(0, 6)
              )
            }
          />

          {pincodeLoading && (
            <Loader2
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#9A7A22]"
            />
          )}

          {pincodeVerified && !pincodeLoading && (
            <div
              className="
                absolute
                right-3
                top-1/2
                flex
                h-7
                w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-green-600
                text-white
              "
            >
              <Check size={15} strokeWidth={2.7} />
            </div>
          )}

        </div>

        {pincodeLoading && (
          <p className="mt-2 text-[11px] font-medium text-[#9A7A22]">
            Finding your city and state…
          </p>
        )}

        {pincodeError && (
          <p className="mt-2 text-[11px] font-medium text-red-500">
            {pincodeError}
          </p>
        )}

        {errors.postal_code && !pincodeError && (
          <p className="mt-2 text-[11px] font-medium text-red-500">
            {errors.postal_code}
          </p>
        )}

      </div>

      {/* Personal details */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <UserRound size={15} className="text-neutral-500" />
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
            Personal details
          </p>
        </div>

        <div className="space-y-4">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800">
              Full Name <span className="text-red-500">*</span>
            </label>

            <input
              className={`
                ${inputClass}
                ${errors.full_name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}
              `}
              placeholder="Enter your full name"
              autoComplete="name"
              value={form.full_name}
              onChange={(e) =>
                updateField("full_name", e.target.value)
              }
            />

            {errors.full_name && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.full_name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800">
              Phone Number <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Phone
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                className={`
                  ${inputClass}
                  pl-11
                  ${errors.phone ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}
                `}
                placeholder="Enter phone number"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
              />
            </div>

            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.phone}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Address */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <MapPin size={15} className="text-neutral-500" />
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
            Address
          </p>
        </div>

        <div className="space-y-4">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800">
              Address Line 1 <span className="text-red-500">*</span>
            </label>

            <input
              className={`
                ${inputClass}
                ${errors.address_line_1 ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}
              `}
              placeholder="House no, Street, Area"
              autoComplete="street-address"
              value={form.address_line_1}
              onChange={(e) =>
                updateField("address_line_1", e.target.value)
              }
            />

            {errors.address_line_1 && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.address_line_1}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800">
              Address Line 2
              <span className="ml-1 font-normal text-neutral-400">
                (optional)
              </span>
            </label>

            <input
              className={`
                ${inputClass}
                ${errors.address_line_2 ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}
              `}
              placeholder="Apartment, Landmark"
              value={form.address_line_2}
              onChange={(e) =>
                updateField("address_line_2", e.target.value)
              }
            />

            {errors.address_line_2 && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.address_line_2}
              </p>
            )}
          </div>

          {/* Auto-filled location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                City <span className="text-red-500">*</span>
              </label>

              <input
                className={`
                  ${inputClass}
                  ${
                    form.city
                      ? "border-green-200 bg-green-50/30 text-neutral-800"
                      : "text-neutral-400"
                  }
                `}
                placeholder="Enter pincode first"
                value={form.city}
                readOnly
                aria-readonly="true"
              />

              {errors.city && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                State <span className="text-red-500">*</span>
              </label>

              <input
                className={`
                  ${inputClass}
                  ${
                    form.state
                      ? "border-green-200 bg-green-50/30 text-neutral-800"
                      : "text-neutral-400"
                  }
                `}
                placeholder="Enter pincode first"
                value={form.state}
                readOnly
                aria-readonly="true"
              />

              {errors.state && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.state}
                </p>
              )}
            </div>

          </div>

          {pincodeVerified && (
            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-green-100
                bg-green-50/70
                px-3
                py-2.5
                text-[11px]
                font-medium
                text-green-700
              "
            >
              <Check size={14} strokeWidth={2.5} />
              City and state were automatically filled from your pincode.
            </div>
          )}

        </div>
      </div>

      {/* Address type */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Home size={15} className="text-neutral-500" />
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
            Save address as
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">

          {[
            {
              value: "home",
              label: "Home",
              icon: Home,
            },
            {
              value: "work",
              label: "Work",
              icon: Briefcase,
            },
          ].map(({ value, label, icon: Icon }) => {

            const selected = form.type === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => updateField("type", value)}
                className={`
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  px-4
                  py-3.5
                  text-left
                  transition-all
                  duration-200
                  ${
                    selected
                      ? "border-[#C8A44D] bg-[#FFF9EA] shadow-sm"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                  }
                `}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    size={17}
                    className={
                      selected
                        ? "text-[#9A7A22]"
                        : "text-neutral-400"
                    }
                  />
                  <span
                    className={`
                      text-sm font-medium
                      ${
                        selected
                          ? "text-neutral-900"
                          : "text-neutral-600"
                      }
                    `}
                  >
                    {label}
                  </span>
                </span>

                {selected && (
                  <span
                    className="
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-[#C8A44D]
                      text-black
                    "
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}

        </div>

        {errors.type && (
          <p className="mt-1.5 text-xs text-red-500">
            {errors.type}
          </p>
        )}
      </div>

      {saveError && (
        <div
          className="
            rounded-2xl
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-xs
            leading-5
            text-red-600
          "
        >
          {saveError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 border-t border-neutral-100 pt-5">

        <button
          type="button"
          onClick={onCancel}
          className="
            flex-1
            rounded-2xl
            border
            border-neutral-200
            bg-white
            px-4
            py-3.5
            text-sm
            font-semibold
            text-neutral-700
            transition
            hover:bg-neutral-50
            active:scale-[0.98]
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={saveAddress}
          disabled={loading || pincodeLoading}
          className="
            flex-1
            rounded-2xl
            bg-black
            px-4
            py-3.5
            text-sm
            font-semibold
            text-white
            shadow-[0_8px_24px_rgba(0,0,0,0.14)]
            transition
            hover:bg-neutral-800
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </span>
          ) : (
            "Save Address"
          )}
        </button>

      </div>

    </div>

  </div>

);
}