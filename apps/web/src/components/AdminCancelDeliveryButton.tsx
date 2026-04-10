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

interface AdminCancelDeliveryButtonProps {
  delivery: Delivery;
  recipientName: string;
}

export function AdminCancelDeliveryButton({
  delivery,
  recipientName,
}: AdminCancelDeliveryButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        className="bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-400"
        onClick={() => setOpen(true)}
      >
        Cancel delivery
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel delivery?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Are you sure you want to cancel delivery ${delivery.delivery_code || delivery.id} for ${recipientName}?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep delivery</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-500 active:bg-red-700"
            onClick={() => {
              console.log("Cancel delivery confirmed", {
                deliveryId: delivery.id,
                deliveryCode: delivery.delivery_code,
                recipientName,
              });
              setOpen(false);
            }}
          >
            Yes, cancel delivery
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
