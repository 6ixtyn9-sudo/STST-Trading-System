import os
import sys
from supabase import create_client

def run_migration():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)
        
    # We can't directly execute DDL via the supabase-py client (REST API)
    # The user must apply the migration via Supabase SQL editor or psql.
    # I will output the SQL required.
    print("MIGRATION SQL REQUIRED:")
    print("ALTER TABLE public.paper_positions ADD COLUMN IF NOT EXISTS stop_loss numeric;")
    print("ALTER TABLE public.paper_positions ADD COLUMN IF NOT EXISTS take_profit numeric;")

if __name__ == "__main__":
    run_migration()
