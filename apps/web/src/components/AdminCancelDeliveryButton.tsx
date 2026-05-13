import { useState } from "react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { supabase } from "../lib/supabaseClient";
import type { Delivery } from "../lib/types";

interface AdminCancelDeliveryButtonProps {
  delivery: Delivery;
  recipientName: string;
  onCancelled?: () => void | Promise<void>;
}

export function AdminCancelDeliveryButton({
  delivery,
  recipientName,
  onCancelled,
}: AdminCancelDeliveryButtonProps) {
  const [open, setOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cancelDelivery = async () => {
    setIsCancelling(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("deliveries")
      .delete()
      .eq("id", delivery.id);

    if (error) {
      console.error("Failed to delete delivery:", error);
      setErrorMessage(error.message);
      setIsCancelling(false);
      return;
    }

    await onCancelled?.();
    setIsCancelling(false);
    setOpen(false);
  };

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

        {errorMessage ? (
          <p className="text-sm text-red-600">
            Could not cancel delivery: {errorMessage}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>Keep delivery</AlertDialogCancel>
          <Button
            type="button"
            disabled={isCancelling}
            className="bg-red-600 text-white hover:bg-red-500 active:bg-red-700"
            onClick={() => void cancelDelivery()}
          >
            {isCancelling ? "Cancelling..." : "Yes, cancel delivery"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
