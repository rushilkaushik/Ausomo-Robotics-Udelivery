import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { Robot } from "./types";

const LIVE_TIMEOUT_MS = 10000;

type RealtimeRobotPosition = {
  robot: Robot | null;
  x: number | null;
  y: number | null;
  z: number | null;
  isLive: boolean;
  localizationUnavailable: boolean;
  connected: boolean;
  configured: boolean;
  lastUpdatedAt: number | null;
};

type RealtimeRobotsState = {
  robots: Robot[];
  loading: boolean;
  connected: boolean;
};

function updatedAtToTime(updatedAt: string | null | undefined): number | null {
  if (!updatedAt) return null;

  const parsed = Date.parse(updatedAt);
  return Number.isNaN(parsed) ? null : parsed;
}

function sortRobots(robots: Robot[]): Robot[] {
  return [...robots].sort((a, b) => a.name.localeCompare(b.name));
}

export function useRealtimeRobotPosition(robotId: string | null | undefined): RealtimeRobotPosition {
  const [robot, setRobot] = useState<Robot | null>(null);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!robotId) {
      setRobot(null);
      setConnected(false);
      return;
    }

    let isCancelled = false;

    const loadInitialRobot = async () => {
      const { data, error } = await supabase
        .from("robots")
        .select("*")
        .eq("robot_id", robotId)
        .single();

      if (isCancelled) return;

      if (error) {
        console.error("Failed to load robot position:", error);
        setRobot(null);
        return;
      }

      setRobot(data as Robot);
    };

    void loadInitialRobot();

    const channel = supabase
      .channel(`robot-position:${robotId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "robots",
          filter: `robot_id=eq.${robotId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setRobot(null);
            return;
          }

          setRobot(payload.new as Robot);
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      isCancelled = true;
      setConnected(false);
      void supabase.removeChannel(channel);
    };
  }, [robotId]);

  const lastUpdatedAt = updatedAtToTime(robot?.updated_at);
  const hasPosition = robot?.position_x !== null && robot?.position_y !== null;
  const localizationUnavailable = robot?.status === "error";
  const isLive =
    Boolean(robotId) &&
    hasPosition &&
    !localizationUnavailable &&
    lastUpdatedAt !== null &&
    now - lastUpdatedAt <= LIVE_TIMEOUT_MS;

  return {
    robot,
    x: robot?.position_x ?? null,
    y: robot?.position_y ?? null,
    z: robot?.position_z ?? null,
    isLive,
    localizationUnavailable,
    connected,
    configured: Boolean(robotId),
    lastUpdatedAt,
  };
}

export function useRealtimeRobotsForBuilding(buildingId: string | null | undefined): RealtimeRobotsState {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!buildingId) {
      setRobots([]);
      setLoading(false);
      setConnected(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    const loadRobots = async () => {
      const { data, error } = await supabase
        .from("robots")
        .select("*")
        .eq("building_id", buildingId);

      if (isCancelled) return;

      if (error) {
        console.error("Failed to load building robots:", error);
        setRobots([]);
      } else {
        setRobots(sortRobots((data || []) as Robot[]));
      }

      setLoading(false);
    };

    void loadRobots();

    const channel = supabase
      .channel(`building-robots:${buildingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "robots",
          filter: `building_id=eq.${buildingId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldRobot = payload.old as Partial<Robot>;
            setRobots((current) =>
              current.filter((robot) => robot.robot_id !== oldRobot.robot_id),
            );
            return;
          }

          const nextRobot = payload.new as Robot;
          setRobots((current) => {
            const existingIndex = current.findIndex(
              (robot) => robot.robot_id === nextRobot.robot_id,
            );

            if (existingIndex === -1) {
              return sortRobots([...current, nextRobot]);
            }

            const nextRobots = [...current];
            nextRobots[existingIndex] = nextRobot;
            return sortRobots(nextRobots);
          });
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      isCancelled = true;
      setConnected(false);
      void supabase.removeChannel(channel);
    };
  }, [buildingId]);

  return { robots, loading, connected };
}
