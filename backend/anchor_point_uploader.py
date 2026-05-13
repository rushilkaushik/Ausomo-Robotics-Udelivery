import argparse
import os
from typing import Dict, List

import yaml
from dotenv import load_dotenv
from supabase import Client, create_client

VALID_ANCHOR_TYPES = {
    "entrance",
    "reception",
    "elevator",
    "delivery_point",
    "charging_station",
    "waypoint",
    "obstacle",
    "emergency_exit",
}

def load_yaml_file(path: str) -> Dict:
    with open(path, 'r') as f:
        data = yaml.safe_load(f)
    
    if not data or "anchor_points" not in data:
        raise ValueError("YAML file must contain 'anchor_points' key")
    
    return data

def validate_anchor_points(point: Dict):
    required = ["name", "type", "x", "y"]

    for field in required:
        if field not in point:
            raise ValueError(f"Anchor point missing required field: {field}")   
        
    if point['type'] not in VALID_ANCHOR_TYPES:
        raise ValueError(
            f"Invalid anchor point type '{point['type']}'. "
            f"Allowed types: {sorted(list(VALID_ANCHOR_TYPES))}"
        )
    
def prepare_rows(floor_map_id: str, anchors: List[Dict]) -> List[Dict]:
    rows = []
    
    for p in anchors:
        validate_anchor_points(p)
        
        row = {
            "floor_map_id": floor_map_id,
            "name": p["name"],
            "type": p["type"],
            "x_position": p["x"],
            "y_position": p["y"],
            "z_position": p.get("z", 0.0)
        }
        rows.append(row)
    return rows

def upload_anchor_points(supabase: Client, floor_map_id: str, yaml_path: str):
    data = load_yaml_file(yaml_path)
    anchors = data["anchor_points"]
    
    if not isinstance(anchors, list) or len(anchors) == 0:
        raise ValueError("No anchor points found in YAML file")
    
    rows = prepare_rows(floor_map_id, anchors)

    resp = supabase.table("anchor_points").insert(rows).execute()
    return resp.data


def parse_args():
    parser = argparse.ArgumentParser(
        description="Upload anchor-point data from YAML into the Supabase anchor_points table."
    )
    parser.add_argument(
        "--floor-map-id",
        required=True,
        help="UUID of the floor_maps row these anchor points belong to.",
    )
    parser.add_argument(
        "--yaml",
        required=True,
        help="Path to a YAML file containing an anchor_points list.",
    )
    return parser.parse_args()


def create_supabase_client_from_env() -> Client:
    load_dotenv()

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE")

    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env")

    return create_client(url, key)


if __name__ == "__main__":
    args = parse_args()
    supabase = create_supabase_client_from_env()

    result = upload_anchor_points(
        supabase=supabase,
        floor_map_id=args.floor_map_id,
        yaml_path=args.yaml,
    )
    print("Inserted anchor points:", result)
