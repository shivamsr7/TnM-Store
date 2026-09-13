

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useAuthDialog,
} from "@/features/Auth/context/AuthDialogContext";

import {
  Gift,
  LockKeyhole,
} from "lucide-react";


interface Props {

  children: React.ReactNode;

}


export default function MemberOnlyRoute({
  children,
}: Props) {

  const {
    customer,
    loading,
  } = useAuth();

  const {
    openAuth,
  } = useAuthDialog();


  /*
   * =========================================================
   * AUTHENTICATION LOADING
   * =========================================================
   *
   * Do not redirect while AuthContext is still restoring
   * the existing customer session.
   *
   * =========================================================
   */

  if (loading) {

    return (

      <main className="min-h-[60vh] flex items-center justify-center px-4">

        <div className="text-center">

          <div
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-gray-200
              border-t-[#C8A44D]
            "
          />

          <p className="mt-3 text-sm text-gray-500">
            Checking your membership...
          </p>

        </div>

      </main>

    );

  }


  /*
   * =========================================================
   * NOT AUTHENTICATED
   * =========================================================
   *
   * Do not expose the game page to logged-out users.
   *
   * We show the member gate instead of silently redirecting,
   * so the customer understands why access is restricted.
   *
   * =========================================================
   */

  if (!customer) {

    return (

      <MemberGate
        onLogin={openAuth}
      />

    );

  }


  /*
   * =========================================================
   * MEMBER CHECK
   * =========================================================
   */

  const isMember =
    customer.customer_type === "member";


  if (!isMember) {

    return (

      <MemberGate
        onLogin={openAuth}
      />

    );

  }


  /*
   * =========================================================
   * MEMBER
   * =========================================================
   */

  return <>{children}</>;

}


/*
 * ============================================================
 * MEMBER GATE
 * ============================================================
 */

interface MemberGateProps {

  onLogin: () => void;

}


function MemberGate({
  onLogin,
}: MemberGateProps) {

  return (

    <main className="min-h-[65vh] bg-gradient-to-b from-[#fff8fb] via-white to-[#f8f5ff] px-4 py-16">

      <div className="mx-auto max-w-md text-center">

        {/* Icon */}

        <div
          className="
            mx-auto
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-3xl
            border
            border-[#e5c76b]
            bg-gradient-to-br
            from-[#fff4c9]
            to-[#f7d77b]
            shadow-sm
          "
        >

          <LockKeyhole
            size={32}
            strokeWidth={1.8}
            className="text-[#684617]"
          />

        </div>


        {/* Heading */}

        <h1 className="mt-7 text-3xl font-black tracking-tight text-gray-950">

          Members Only

        </h1>


        <p className="mt-3 text-sm leading-6 text-gray-500">

          Play & Earn is exclusively available to
          T&M Jewels members.

        </p>


        {/* Benefits */}

        <div
          className="
            mx-auto
            mt-7
            max-w-sm
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-5
            text-left
          "
        >

          <div className="flex items-start gap-3">

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#fff2f6]
                text-[#b21f55]
              "
            >

              <Gift
                size={18}
              />

            </div>


            <div>

              <p className="font-bold text-gray-950">

                Play & Earn rewards

              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">

                Play games and earn rewards in your
                separate Play & Earn Wallet.

              </p>

            </div>

          </div>

        </div>


        {/* CTA */}

        <button
          type="button"
          onClick={onLogin}
          className="
            mt-7
            min-h-12
            rounded-xl
            bg-gray-950
            px-7
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-gray-800
            active:translate-y-px
          "
        >

          Login / Become a Member

        </button>


        <p className="mt-4 text-[11px] text-gray-400">

          Already a member? Log in to access Play & Earn.

        </p>

      </div>

    </main>

  );

}