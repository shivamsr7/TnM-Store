import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface SpinCooldownDialogProps {
  open: boolean;
  remainingTime: string;
  onClose: () => void;
}

export default function SpinCooldownDialog({
  open,
  remainingTime,
  onClose,
}: SpinCooldownDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">

        <DialogHeader className="text-center">

          <div className="text-6xl">
            ⏳
          </div>

          <DialogTitle className="mt-4 text-3xl font-bold">
            Come Back Tomorrow
          </DialogTitle>

          <DialogDescription className="mt-3 text-base">
            You've already claimed today's Spin & Win reward.
          </DialogDescription>

        </DialogHeader>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center mt-4">

          <p className="text-sm text-gray-600">
            Next Spin In
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {remainingTime}
          </p>

        </div>

        <Button
          className="mt-6 w-full"
          onClick={onClose}
        >
          Got It
        </Button>

      </DialogContent>
    </Dialog>
  );
}