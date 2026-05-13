import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { supabase } from "../lib/supabaseClient";
import type { Delivery, Robot } from "../lib/types";

interface AdminAssignRobotButtonProps {
  delivery: Delivery;
  onAssigned?: () => void | Promise<void>;
}

export function AdminAssignRobotButton({
  delivery,
  onAssigned,
}: AdminAssignRobotButtonProps) {
  const [open, setOpen] = useState(false);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [selectedRobotId, setSelectedRobotId] = useState("");
  const [isLoadingRobots, setIsLoadingRobots] = useState(false);
  const [assigningRobotId, setAssigningRobotId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isCancelled = false;
    setErrorMessage(null);
    setSelectedRobotId("");
    setIsLoadingRobots(true);

    const loadRobotsForBuilding = async () => {
      const { data, error } = await supabase
        .from("robots")
        .select("*")
        .eq("building_id", delivery.building_id)
        .order("name", { ascending: true });

      if (isCancelled) return;

      if (error) {
        console.error("Failed to load robots for assignment:", error);
        setErrorMessage(error.message);
        setRobots([]);
      } else {
        const nextRobots = (data || []) as Robot[];
        setRobots(nextRobots);
        setSelectedRobotId(
          nextRobots.some((robot) => robot.robot_id === delivery.robot_id)
            ? delivery.robot_id || ""
            : "",
        );
      }

      setIsLoadingRobots(false);
    };

    void loadRobotsForBuilding();

    return () => {
      isCancelled = true;
    };
  }, [delivery.building_id, delivery.robot_id, open]);

  const assignSelectedRobot = async () => {
    const selectedRobot = robots.find((robot) => robot.robot_id === selectedRobotId);

    if (!selectedRobot) {
      setErrorMessage("Choose a robot before assigning.");
      return;
    }

    setAssigningRobotId(selectedRobot.robot_id);
    setErrorMessage(null);

    const nextStatus = delivery.status === "pending" ? "assigned" : delivery.status;

    const { error } = await supabase
      .from("deliveries")
      .update({
        robot_id: selectedRobot.robot_id,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", delivery.id);

    if (error) {
      console.error("Failed to assign robot:", error);
      setErrorMessage(error.message);
      setAssigningRobotId(null);
      return;
    }

    await onAssigned?.();
    setAssigningRobotId(null);
    setOpen(false);
  };

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

        <div className="space-y-3">
          {isLoadingRobots ? (
            <p className="text-sm text-muted-foreground">
              Loading robots for this building...
            </p>
          ) : robots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No robots are currently available for this building.
            </p>
          ) : (
            <Select
              value={selectedRobotId}
              onValueChange={setSelectedRobotId}
              disabled={assigningRobotId !== null}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a robot" />
              </SelectTrigger>
              <SelectContent>
                {robots.map((robot) => (
                  <SelectItem key={robot.robot_id} value={robot.robot_id}>
                    <Bot className="h-4 w-4 text-sky-600" />
                    <span>
                      {robot.name || robot.robot_id} · {robot.status}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-600">
            Could not assign robot: {errorMessage}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <Button
            type="button"
            disabled={
              isLoadingRobots ||
              robots.length === 0 ||
              !selectedRobotId ||
              assigningRobotId !== null
            }
            onClick={() => void assignSelectedRobot()}
          >
            {assigningRobotId ? "Assigning..." : "Assign"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
