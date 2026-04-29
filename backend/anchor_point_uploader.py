import yaml
from typing import List, Dict
from supabase import create_client, Client

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


if __name__ == "__main__":
    import os
    from pathlib import Path
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).with_name(".env"))

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE")

    supabase = create_client(url, key)

    floor_map_id = "PUT-YOUR-FLOOR-MAP-ID-HERE"

    result = upload_anchor_points(
       supabase=supabase,
       floor_map_id='7b9a6a09-ba54-4b15-a930-6742e8f1a544',
       yaml_path="C:\\Users\\dhirp\\robot_backend\\AnchorP.yaml",
    )
    '''
    resp = supabase.table("anchor_points").select("*").eq("id", "195e86f1-210f-4602-a412-7d0ba9d2ef1a").limit(1).execute()
    if resp.data and len(resp.data) > 0:
        row = resp.data[0]
        print("Row:", row)
    else:
        print("No row found for id")
    '''
    print("Inserted anchor points:", result)
