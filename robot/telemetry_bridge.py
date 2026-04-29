#!/usr/bin/env python3
"""
ROS2 -> Supabase robot telemetry bridge.

Runs on the robot, reads the latest map-frame pose, and updates the matching
row in the Supabase `robots` table so web clients can subscribe through
Supabase Realtime.
"""

import math
import os
from pathlib import Path
from typing import Optional, Tuple
from datetime import datetime, timezone

from dotenv import load_dotenv
from nav_msgs.msg import Odometry
import rclpy
from rclpy.duration import Duration
from rclpy.node import Node
from rclpy.time import Time
from supabase import create_client
import tf2_ros


PoseTuple = Tuple[float, float, float]


def load_robot_env() -> None:
    robot_env = Path(__file__).with_name(".env")
    if robot_env.exists():
        load_dotenv(robot_env)
    else:
        load_dotenv()


def required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


class SupabaseTelemetryBridge(Node):
    def __init__(self) -> None:
        super().__init__("supabase_telemetry_bridge")

        load_robot_env()

        self.robot_id = required_env("ROBOT_ID")
        self.map_frame = os.getenv("ROS_MAP_FRAME", "map")
        self.base_frame = os.getenv("ROS_BASE_FRAME", "base_link")
        self.floor_map_id = os.getenv("CURRENT_FLOOR_MAP_ID")
        self.telemetry_rate_hz = float(os.getenv("TELEMETRY_RATE_HZ", "2"))

        supabase_url = required_env("SUPABASE_URL")
        supabase_service_role = required_env("SUPABASE_SERVICE_ROLE")
        self.supabase = create_client(supabase_url, supabase_service_role)

        self.tf_buffer = tf2_ros.Buffer()
        self.tf_listener = tf2_ros.TransformListener(self.tf_buffer, self)
        self.odom_pose: Optional[PoseTuple] = None
        self.last_sent_pose: Optional[PoseTuple] = None
        self.last_sent_time: Optional[float] = None

        self.create_subscription(Odometry, "/odom", self.odom_callback, 10)
        self.create_timer(1.0 / self.telemetry_rate_hz, self.publish_telemetry)

        self.get_logger().info(
            "Supabase telemetry bridge started "
            f"(robot_id={self.robot_id}, frame={self.map_frame}->{self.base_frame})"
        )

    def odom_callback(self, msg: Odometry) -> None:
        position = msg.pose.pose.position
        self.odom_pose = (position.x, position.y, position.z)

    def get_map_pose(self) -> Optional[PoseTuple]:
        try:
            transform = self.tf_buffer.lookup_transform(
                self.map_frame,
                self.base_frame,
                Time(),
                timeout=Duration(seconds=0.25),
            )
            translation = transform.transform.translation
            return (translation.x, translation.y, translation.z)
        except Exception as exc:
            if self.odom_pose is None:
                self.get_logger().warn(
                    f"Could not read TF or odom pose yet: {exc}",
                    throttle_duration_sec=5.0,
                )
                return None

            self.get_logger().warn(
                f"TF unavailable, falling back to /odom: {exc}",
                throttle_duration_sec=10.0,
            )
            return self.odom_pose

    def calculate_speed_cm_s(self, pose: PoseTuple, now_seconds: float) -> float:
        if self.last_sent_pose is None or self.last_sent_time is None:
            return 0.0

        elapsed = now_seconds - self.last_sent_time
        if elapsed <= 0:
            return 0.0

        distance_m = math.dist(pose[:2], self.last_sent_pose[:2])
        return round((distance_m / elapsed) * 100.0, 3)

    def publish_telemetry(self) -> None:
        pose = self.get_map_pose()
        if pose is None:
            return

        now = self.get_clock().now()
        now_seconds = now.nanoseconds / 1_000_000_000
        speed_cm_s = self.calculate_speed_cm_s(pose, now_seconds)

        payload = {
            "position_x": round(pose[0], 4),
            "position_y": round(pose[1], 4),
            "position_z": round(pose[2], 4),
            "speed": speed_cm_s,
            "status": "moving" if speed_cm_s > 1.0 else "idle",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        if self.floor_map_id:
            payload["current_floor_map_id"] = self.floor_map_id

        try:
            self.supabase.table("robots").update(payload).eq(
                "robot_id", self.robot_id
            ).execute()
            self.last_sent_pose = pose
            self.last_sent_time = now_seconds
        except Exception as exc:
            self.get_logger().error(f"Failed to update Supabase robot row: {exc}")


def main() -> None:
    rclpy.init()
    node = SupabaseTelemetryBridge()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
