import {
  Check,
  CheckCircle2,
  Copy,
  Mail,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { useState } from "react";

import OrderTrackingDialog
  from "@/features/orders/components/OrderTrackingDialog";

import { saveOrderEmail }
  from "@/features/orders/services/order.service";



interface Props {

  orderNumber:string;

  onClose:()=>void;

  /**
   * Whether the order already has an email address that can receive
   * transactional order updates. This should be true for both guests
   * and logged-in customers when an email is already available.
   */
  hasOrderEmail?: boolean;

  /**
   * Phone number associated with the order.
   * Required by the secure save_order_email RPC for guest verification.
   */
  customerPhone?: string | null;

}





export default function OrderSuccess({

  orderNumber,

  onClose,

  hasOrderEmail = false,

  customerPhone = null,

}:Props){

  const [trackingOpen, setTrackingOpen] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [guestEmail, setGuestEmail] =
    useState("");

  const [emailSaving, setEmailSaving] =
    useState(false);

  const [emailSaved, setEmailSaved] =
    useState(false);

  const [emailError, setEmailError] =
    useState("");

  const [emailEditorOpen, setEmailEditorOpen] =
    useState(false);

  const [keepAsPermanentEmail, setKeepAsPermanentEmail] =
    useState(false);

  const handleGuestEmailSubmit =
    async () => {

      const email =
        guestEmail.trim();

      if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        setEmailError(
          "Please enter a valid email address."
        );
        return;
      }

      setEmailSaving(true);
      setEmailError("");

      try {

        await saveOrderEmail({
          orderNumber,
          email,
          phone: customerPhone,
          updateCustomerEmail: keepAsPermanentEmail,
        });

        setEmailSaved(true);
        setEmailEditorOpen(false);
        setGuestEmail("");

      } catch (error) {

        console.error(
          "Failed to save order email:",
          error
        );

        setEmailError(
          error instanceof Error
            ? error.message
            : "We couldn't save your email. Please try again."
        );

      } finally {

        setEmailSaving(false);

      }

    };

  const handleCopyOrderNumber =
    async () => {

      try {

        await navigator.clipboard.writeText(
          orderNumber
        );

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 1800);

      } catch (error) {

        console.error(
          "Failed to copy order number:",
          error
        );

      }

    };



return (

<>

<style>{`
@keyframes orderSuccessEmailIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes orderSuccessPop {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  70% {
    opacity: 1;
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}
`}</style>

<div className="
py-8
text-center
">





<div className="

mx-auto

flex

h-24

w-24

items-center

justify-center

rounded-full

bg-green-100

"
style={{ animation: "orderSuccessPop 550ms cubic-bezier(.2,.8,.2,1) both" }}
>

<CheckCircle2

size={52}

className="text-green-600"

/>

</div>








<h2
className="

mt-6

text-2xl

font-semibold

">

Order Placed Successfully 🎉

</h2>







<p className="

mt-2

text-sm

leading-relaxed

text-neutral-500

">

Thank you for shopping with T&M Jewels.

Your order has been received and our team is getting it ready with care.

</p>









<div className="

mt-6

rounded-2xl

border

bg-neutral-50

p-5

">




<p className="

text-xs

uppercase

tracking-wide

text-neutral-400

">

Order Number

</p>







<div className="

mt-2

flex

items-center

justify-center

gap-3

">

<p className="

text-xl

font-semibold

break-all

"

>

#{orderNumber}

</p>







<button

type="button"

onClick={handleCopyOrderNumber}

aria-label={
  copied
    ? "Order number copied"
    : "Copy order number"
}

title={
  copied
    ? "Copied"
    : "Copy order number"
}

className="

inline-flex

h-9

w-9

shrink-0

items-center

justify-center

rounded-full

border

border-neutral-200

bg-white

text-neutral-500

transition

hover:bg-neutral-100

hover:text-neutral-900

"

>

{copied ? (

<Check

size={17}

className="text-green-600"

/>

) : (

<Copy

size={17}

/>

)}

</button>

</div>






</div>









{(!hasOrderEmail || emailEditorOpen) && !emailSaved && (

<div
className="
mt-5
rounded-2xl
border
border-[#C8A44D]/25
bg-[#fffaf0]
p-4
text-left
transition-all
duration-500
ease-out
"
style={{ animation: "orderSuccessEmailIn 450ms ease-out both" }}
>

<div className="flex items-start gap-3">

<div className="
flex
h-9
w-9
shrink-0
items-center
justify-center
rounded-full
bg-[#C8A44D]/10
text-[#9B7625]
transition-transform
duration-500
hover:scale-110
">

<Mail size={17}/>

</div>

<div className="min-w-0 flex-1">

<p className="text-sm font-medium text-neutral-900">

{hasOrderEmail
  ? "Update your order email"
  : "Stay updated on your order"}

</p>

<p className="mt-1 text-xs leading-relaxed text-neutral-500">

{hasOrderEmail
  ? "Enter the email address you’d like us to use for your order updates."
  : "Add your email to receive important updates about your order, including confirmation, shipping and delivery."}

</p>

</div>

{hasOrderEmail && (

<button
type="button"
onClick={() => {
  setEmailEditorOpen(false);
  setGuestEmail("");
  setEmailError("");
}}
disabled={emailSaving}
className="
text-xs
font-medium
text-neutral-500
transition
hover:text-neutral-900
disabled:opacity-50
"
>

Cancel

</button>

)}

</div>

<div className="mt-3 flex flex-col gap-2 sm:flex-row">

<input

type="email"

value={guestEmail}

onChange={(event) => {

setGuestEmail(event.target.value);

if (emailError) setEmailError("");

}}

placeholder="Enter your email address"

autoComplete="email"

disabled={emailSaving}

className="
h-11
min-w-0
flex-1
rounded-xl
border
border-neutral-200
bg-white
px-3
text-sm
text-neutral-900
outline-none
transition-all
duration-300
placeholder:text-neutral-400
focus:border-[#C8A44D]
focus:ring-2
focus:ring-[#C8A44D]/15
disabled:cursor-not-allowed
disabled:bg-neutral-100
"

/>

<button

type="button"

onClick={handleGuestEmailSubmit}

disabled={emailSaving}

className="
h-11
shrink-0
rounded-xl
bg-[#C8A44D]
px-4
text-sm
font-medium
text-black
transition-all
duration-300
hover:-translate-y-0.5
hover:bg-[#d8b45e]
hover:shadow-md
active:translate-y-0
disabled:cursor-not-allowed
disabled:opacity-60
"

>

{emailSaving
  ? "Saving..."
  : hasOrderEmail
    ? "Save Updates"
    : "Get Order Updates"}

</button>

</div>

<div className="
mt-3
rounded-xl
border
border-neutral-200/80
bg-white/70
p-3
transition-all
duration-300
">

<p className="text-xs font-medium text-neutral-800">

How should we use this email?

</p>

<div className="mt-2 grid gap-2 sm:grid-cols-2">

<label
className="
flex
cursor-pointer
items-start
gap-2
rounded-lg
border
border-neutral-200
bg-white
p-2.5
transition-all
duration-300
hover:-translate-y-0.5
hover:border-[#C8A44D]/50
"
>

<input
type="radio"
name="order-success-email-scope"
checked={!keepAsPermanentEmail}
onChange={() => setKeepAsPermanentEmail(false)}
disabled={emailSaving}
className="mt-0.5 accent-[#C8A44D]"
/>

<span>

<span className="block text-xs font-medium text-neutral-900">
This order only
</span>

<span className="mt-0.5 block text-[10px] leading-relaxed text-neutral-400">
Use this email for updates about this order.
</span>

</span>

</label>

<label
className="
flex
cursor-pointer
items-start
gap-2
rounded-lg
border
border-neutral-200
bg-white
p-2.5
transition-all
duration-300
hover:-translate-y-0.5
hover:border-[#C8A44D]/50
"
>

<input
type="radio"
name="order-success-email-scope"
checked={keepAsPermanentEmail}
onChange={() => setKeepAsPermanentEmail(true)}
disabled={emailSaving}
className="mt-0.5 accent-[#C8A44D]"
/>

<span>

<span className="block text-xs font-medium text-neutral-900">
Use for future orders
</span>

<span className="mt-0.5 block text-[10px] leading-relaxed text-neutral-400">
Save this email to receive updates on future orders too.
</span>

</span>

</label>

</div>

</div>

{emailError && (

<p className="mt-2 text-xs text-red-600">

{emailError}

</p>

)}

<p className="mt-2 text-[10px] leading-relaxed text-neutral-400">

We'll only use this email for order-related updates.

</p>

</div>

)}

{hasOrderEmail && !emailEditorOpen && !emailSaved && (

<div
className="
mt-5
rounded-2xl
border
border-green-200
bg-green-50
p-4
text-left
transition-all
duration-500
"
style={{ animation: "orderSuccessEmailIn 450ms ease-out both" }}
>

<div className="flex items-center gap-3">

<div className="
flex
h-9
w-9
shrink-0
items-center
justify-center
rounded-full
bg-green-100
transition-transform
duration-500
hover:scale-110
">

<Mail size={17} className="text-green-600"/>

</div>

<div className="min-w-0 flex-1">

<p className="text-sm font-medium text-neutral-900">
Order updates enabled
</p>

<p className="mt-1 text-xs text-neutral-500">
We’ll send your order updates to your registered email address.
</p>

</div>

<button
type="button"
onClick={() => {
  setEmailEditorOpen(true);
  setGuestEmail("");
  setKeepAsPermanentEmail(false);
  setEmailError("");
  setEmailSaved(false);
}}
className="
shrink-0
rounded-lg
border
border-green-200
bg-white
px-3
py-2
text-xs
font-medium
text-neutral-700
transition-all
duration-300
hover:-translate-y-0.5
hover:border-[#C8A44D]
hover:text-neutral-900
hover:shadow-sm
"
>

Update email

</button>

</div>

</div>

)}

{emailSaved && (

<div className="

mt-5

rounded-2xl

border

border-green-200

bg-green-50

p-4

text-left

"
style={{ animation: "orderSuccessEmailIn 450ms ease-out both" }}
>

<div className="flex items-center gap-3">

<div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">

<Check size={17} className="text-green-600"/>

</div>

<div>

<p className="text-sm font-medium text-neutral-900">

Email updates enabled

</p>

<p className="mt-1 text-xs text-neutral-500">

You’re all set. We’ll send important order updates to this email address.

</p>

</div>

</div>

</div>

)}









<div className="

mt-5

rounded-2xl

bg-neutral-50

p-4

text-left

">




<div className="

flex

items-center

gap-3

">

<Sparkles

size={18}

className="text-[#C8A44D]"

/>



<p className="

text-sm

font-medium

">

We’re getting your order ready

</p>



</div>







<p className="

mt-2

text-xs

text-neutral-500

">

Your order has been successfully placed. We’ll keep you updated at every important step, from confirmation to delivery.

</p>







</div>









<div className="

mt-6

space-y-3

">





<button

type="button"

onClick={() =>
  setTrackingOpen(true)
}

className="

flex

w-full

items-center

justify-center

gap-2

rounded-xl

bg-black

py-3

font-medium

text-white

transition

hover:bg-neutral-800

"

>

<Package size={18}/>

Track Order

</button>








<button

onClick={onClose}

className="

flex

w-full

items-center

justify-center

gap-2

rounded-xl

border

py-3

font-medium

transition

hover:bg-neutral-50

"

>

<ShoppingBag size={18}/>

Continue Shopping

</button>





</div>







<p className="

mt-6

text-xs

text-neutral-400

">

Need help with your order? We’re here for you.

</p>





</div>





<OrderTrackingDialog

open={trackingOpen}

onClose={() =>
  setTrackingOpen(false)
}

/>

</>

);

}