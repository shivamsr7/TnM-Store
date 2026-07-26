import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface WinnerDialogProps {
  open: boolean;
  reward: string;
  onClose: () => void;
  onClaim: () => void;
}

export default function WinnerDialog({
  open,
  reward,
  onClose,
  onClaim,
}: WinnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">

        <DialogHeader className="text-center">

          <div className="text-6xl">
            🎉
          </div>

          <DialogTitle className="mt-4 text-3xl font-bold">
            Congratulations!
          </DialogTitle>

          <DialogDescription className="mt-2 text-base">
            You have won
          </DialogDescription>

        </DialogHeader>

        <div className="my-6 text-center">

          <div className="rounded-2xl border border-[#E7D8B4] bg-[#FFFDF8] p-6">

            <p className="text-3xl font-bold text-[#B68D2A]">
              {reward}
            </p>

          </div>

        </div>

        <Button
          onClick={onClaim}
          className="h-12 w-full rounded-xl"
        >
          Claim Reward
        </Button>

      </DialogContent>
    </Dialog>
  );
}