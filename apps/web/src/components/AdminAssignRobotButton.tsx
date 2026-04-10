import { useState } from "react";
import { Bot } from "lucide-react";
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
import type { Delivery, Robot } from "../lib/types";

interface AdminAssignRobotButtonProps {
  delivery: Delivery;
  robots: Robot[];
}

export function AdminAssignRobotButton({
  delivery,
  robots,
}: AdminAssignRobotButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        className="bg-sky-600 text-white hover:bg-sky-500 active:bg-sky-700 focus-visible:ring-sky-400"
        onClick={() => setOpen(true)}
      >
        Assign robot
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Assign robot</AlertDialogTitle>
          <AlertDialogDescription>
            {`Choose a robot for delivery ${delivery.delivery_code || delivery.id}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {robots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No robots are currently available for this building.
            </p>
          ) : (
            robots.map((robot) => (
              <button
                key={robot.robot_id}
                type="button"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                onClick={() => {
                  console.log("Assign robot selected", {
                    deliveryId: delivery.id,
                    deliveryCode: delivery.delivery_code,
                    robotId: robot.robot_id,
                    robotName: robot.name,
                  });
                  setOpen(false);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-sky-600" />
                      <span className="font-medium">
                        {robot.name || robot.robot_id}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {robot.current_location || "Unknown location"}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {robot.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
