import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClaimRewardDialogProps {
  open: boolean;
  reward: string;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
  }) => void;
}

export default function ClaimRewardDialog({
  open,
  reward,
  onClose,
  onSubmit,
}: ClaimRewardDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">

        <DialogHeader>
          <DialogTitle>Claim Your Reward</DialogTitle>

          <DialogDescription>
            Congratulations! 🎉
            <br />
            Reward: <strong>{reward}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="WhatsApp Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={() =>
              onSubmit({
                name,
                phone,
              })
            }
          >
            Submit
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}