import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env")

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

try:
    resp = client.storage.list_buckets()
    print("Successfully connected to Supabase Storage. Available buckets:")
    for bucket in resp:
        print("-", bucket.name)
except Exception as e:
    print("Failed to connect to Supabase Storage:", e)
    exit(1)