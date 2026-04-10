import { useState } from "react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import type { Delivery } from "../lib/types";

interface AdminDispatchRobotButtonProps {
  delivery: Delivery;
  recipientName: string;
}

export function AdminDispatchRobotButton({
  delivery,
  recipientName,
}: AdminDispatchRobotButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        className="bg-green-600 text-white hover:bg-green-500 active:bg-green-700 focus-visible:ring-green-400"
        onClick={() => setOpen(true)}
      >
        Dispatch robot
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dispatch robot?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Is delivery ${delivery.delivery_code || delivery.id} for ${recipientName} packed yet?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction
            className="bg-green-600 text-white hover:bg-green-500 active:bg-green-700"
            onClick={() => {
              console.log("Dispatch robot confirmed", {
                deliveryId: delivery.id,
                deliveryCode: delivery.delivery_code,
                recipientName,
              });
              setOpen(false);
            }}
          >
            Yes, dispatch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
