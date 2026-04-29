import os
import sys
import argparse
import tempfile
from pathlib import Path
from dotenv import load_dotenv
from Supabase_client import create_client
import mimetypes
from PIL import Image

load_dotenv(Path(__file__).with_name(".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "maps")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

def build_storage_path(building_id: str, floor_number: int, version: str, filename: str) -> str:
    return f"Building/{building_id}/{floor_number}/{version}/{filename}" 

def build_preview_storage_path(building_id: str, floor_number: int, version: str, filename: str) -> str:
    return f"Building/{building_id}/{floor_number}/{version}/previews/{filename}"

def local_file_size(path: str) -> int:
    return os.path.getsize(path)

def convert_pgm_to_png(local_path: str) -> tuple[str, str]:
    if not os.path.isfile(local_path):
        raise FileNotFoundError(f"Preview source file does not exist: {local_path}")

    base_name = os.path.splitext(os.path.basename(local_path))[0]

    with Image.open(local_path) as image:
        converted = image.convert("L")

        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
            png_path = temp_file.name

        converted.save(png_path, format="PNG")

    return png_path, f"{base_name}.png"

def upload_file_to_bucket(bucket: str, storage_path: str, local_path: str, replace: bool = True):
    with open(local_path, "rb") as fh:
        data = fh.read()
    
    try:
        resp = supabase.storage.from_(bucket).upload(storage_path, data)
        return resp
    except Exception as e:
        if replace:
            try: 
                resp = supabase.storage.from_(bucket).update(storage_path, data)
                return resp
            except Exception as ue:
                raise RuntimeError(f"Failed to upload and update file: {ue}") from ue
        else:
            raise RuntimeError(f"Failed to upload file: {e}") from e
        
def get_file_url(bucket: str, storage_path: str, expire: int | None = 3600) -> dict:
    try:
        public_resp = supabase.storage.from_(bucket).get_public_url(storage_path)

        public_url = None
        if isinstance(public_resp, dict):
            public_url = public_resp.get("publicUrl") or public_resp.get("public_url") or public_resp.get("publicURL")
        
        if public_url:
            return {"url": public_url,"signed": False, "expires_in": None}
    except Exception:
        pass

    if expire is None:
        expire = 3600    
    
    try:
        signed_resp = supabase.storage.from_(bucket).create_signed_url(storage_path, expire)
        if isinstance(signed_resp, dict):
            url = signed_resp.get("signedUrl") or signed_resp.get("signed_url") or signed_resp.get("signedURL")
            if url:
                return {"url": url, "signed": True, "expires_in": expire}
    except Exception as e:
        raise RuntimeError(f"Failed to generate file URL: {e}") from e
    
    raise RuntimeError("Could not retrieve public or signed URL for the file.")

def upsert_floor_map(building_id: str,
                     floor_number: int,
                     version: str,
                     storage_path: str,
                     filename: str,
                     file_size: int,
                     floor_name: str | None = None,
                     map_preview_path: str | None = None,
                     map_preview_name: str | None = None,
                     map_preview_size: int | None = None,
                     map_preview_url: str | None = None):
    
    existing = (supabase.table("floor_maps")
                .select("*")
                .eq("building_id", building_id)
                .eq("floor_number", floor_number)
                .limit(1)
                .execute()
                )
    
    rows = existing.data or []
    payload = {
        "building_id": building_id,
        "floor_number": floor_number,
        "pcd_file_path": storage_path,
        "pcd_file_name": filename,
        "pcd_file_size": file_size,
        "version": version
    }

    if floor_name is not None:
        payload["floor_name"] = floor_name
    if map_preview_path is not None:
        payload["map_preview_path"] = map_preview_path
    if map_preview_name is not None:
        payload["map_preview_name"] = map_preview_name
    if map_preview_size is not None:
        payload["map_preview_size"] = map_preview_size
    if map_preview_url is not None:
        payload["map_preview_url"] = map_preview_url

    if len(rows) == 0:
        insert_resp = supabase.table("floor_maps").insert(payload).execute()
        return {"action": "inserted", "data": insert_resp.data}
    else:
        update_payload = {
            "pcd_file_path": storage_path,
            "pcd_file_name": filename,
            "pcd_file_size": file_size,
            "version": version,
        }

        if floor_name is not None:
            update_payload["floor_name"] = floor_name
        if map_preview_path is not None:
            update_payload["map_preview_path"] = map_preview_path
        if map_preview_name is not None:
            update_payload["map_preview_name"] = map_preview_name
        if map_preview_size is not None:
            update_payload["map_preview_size"] = map_preview_size
        if map_preview_url is not None:
            update_payload["map_preview_url"] = map_preview_url

        update_resp = supabase.table("floor_maps") \
            .update(update_payload) \
            .eq("building_id", building_id) \
            .eq("floor_number", floor_number) \
            .execute()
        
        return {"action": "updated", "data": update_resp.data}
    
def upload_pcd(building_id: str,
               floor_number: int,
               local_path: str,
               version: str = "1.0.0",
               floor_name: str | None = None,
               bucket: str | None = None,
               expires: int | None = 3600,
               preview_pgm_path: str | None = None,):
    
    if bucket is None:
        bucket = SUPABASE_BUCKET
    
    if not os.path.isfile(local_path):
        raise FileNotFoundError(f"Local file does not exist: {local_path}")
    
    filename = os.path.basename(local_path)
    storage_path = build_storage_path(building_id, floor_number, version, filename)

    content_type, _ = mimetypes.guess_type(local_path)

    file_size = local_file_size(local_path)

    print(f"[upload_pcd] Uploading local file {local_path} ({file_size} bytes)")
    print(f"[upload_pcd] Target storage_path: {storage_path} in bucket {bucket}")

    upload_resp = upload_file_to_bucket(bucket, storage_path, local_path, replace=True)

    print(f"[upload_pcd] Upload. Now generating URL (public or signed)...")
    url_info = get_file_url(bucket, storage_path, expires)

    preview_storage_path = None
    preview_filename = None
    preview_size = None
    preview_url = None

    if preview_pgm_path:
        print(f"[upload_pcd] Generating PNG preview from {preview_pgm_path}")
        preview_png_path, preview_filename = convert_pgm_to_png(preview_pgm_path)

        try:
            preview_storage_path = build_preview_storage_path(
                building_id, floor_number, version, preview_filename
            )
            preview_size = local_file_size(preview_png_path)

            upload_file_to_bucket(bucket, preview_storage_path, preview_png_path, replace=True)
            preview_url_info = get_file_url(bucket, preview_storage_path, expires)
            preview_url = preview_url_info["url"]
        finally:
            if os.path.exists(preview_png_path):
                os.remove(preview_png_path)

    print(f"[upload_pcd] Inserting/updating DB record in floor_maps...")
    db_resp = upsert_floor_map(
        building_id,
        floor_number,
        version,
        storage_path,
        filename,
        file_size,
        floor_name,
        preview_storage_path,
        preview_filename,
        preview_size,
        preview_url,
    )

    summary = {
        "storage_path": storage_path,
        "bucket": bucket,
        "file_name": filename,
        "file_size": file_size,
        "url": url_info["url"],
        "signed": url_info["signed"],
        "expires_in": url_info["expires_in"],
        "map_preview_path": preview_storage_path,
        "map_preview_name": preview_filename,
        "map_preview_size": preview_size,
        "map_preview_url": preview_url,
        "db_action": db_resp["action"],
        "db_data": db_resp["data"],
    }
    return summary

def add_anchor_point(supabase, floor_map_id: str, name: str, x: float, y: float, z: float, type: str):
    data = {
        "floor_map_id": floor_map_id,
        "name": name,
        "x_position": x,
        "y_position": y,
        "z_position": z,
        "type": type
    }
    
    resp = supabase.table("anchor_points").insert(data).execute()
    return resp.data

def parse_args():
    p = argparse.ArgumentParser(
        description="Upload a floor map artifact to Supabase and optionally generate a PNG preview from a ROS .pgm file."
    )
    p.add_argument("--building-id", required=True, help="UUID of building (matches buildings.id)")
    p.add_argument("--floor-number", required=True, type=int, help="Floor number (integer)")
    p.add_argument("--file", required=True, help="Local path to the main floor map file")
    p.add_argument(
        "--preview-pgm",
        default=None,
        help="Optional local path to a ROS .pgm map to convert and upload as a PNG preview",
    )
    p.add_argument("--version", default="1.0.0", help="Map version (folder name). Default: 1.0.0")
    p.add_argument("--floor-name", default=None, help="Optional human-readable floor name")
    p.add_argument("--bucket", default=None, help="Bucket name (defaults to SUPABASE_BUCKET env var)")
    p.add_argument("--signed-url-ttl", default=3600, type=int, help="Signed URL TTL in seconds if bucket is private")
    return p.parse_args()

if __name__ == "__main__":
    args = parse_args()
    try:
        result = upload_pcd(
            building_id=args.building_id,
            floor_number=args.floor_number,
            local_path=args.file,
            version=args.version,
            floor_name=args.floor_name,
            bucket=args.bucket or SUPABASE_BUCKET,
            expires=args.signed_url_ttl,
            preview_pgm_path=args.preview_pgm,
        )
        print("Upload summary:")
        for k, v in result.items():
            print(f"  {k}: {v}")
    except Exception as e:
        print("Error:", e)
        sys.exit(1)
    """
    resp = supabase.table("floor_maps").select("*").eq("id", "7b9a6a09-ba54-4b15-a930-6742e8f1a544").limit(1).execute()
    if resp.data and len(resp.data) > 0:
        row = resp.data[0]
        print("Row:", row)
    else:
        print("No row found for id")
    """
