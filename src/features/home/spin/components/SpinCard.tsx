import SpinWheel from "@/features/spin-wheel/components/SpinWheel";

export default function SpinCard() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">

      {/* Header */}
      <div className="pt-5 text-center">

        <p className="text-[11px] uppercase tracking-[5px] text-[#B68D2A]">
          EXCLUSIVE REWARDS
        </p>

        <h2 className="mt-1 text-3xl font-bold">
          Spin & Win
        </h2>

        <p className="mt-2 text-sm text-neutral-600">
          Unlock exciting rewards instantly
        </p>

      </div>

      {/* Wheel */}
      <div className="flex flex-1 items-center justify-center">
        <SpinWheel />
      </div>

    </div>
  );
}