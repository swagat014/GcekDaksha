# Supabase Setup for Registration Form

## Database Table Schema

To use the registration form, you need to create a table named `registrations` in your Supabase database with the following schema:

```sql
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  college_name TEXT NOT NULL,
  captain_name TEXT NOT NULL,
  captain_mobile TEXT,
  players JSONB, -- Stores array of player objects [{name, aadhaar, id_card}]
  captain_aadhaar_url TEXT,
  captain_college_id_url TEXT,
  players_docs JSONB, -- Stores array of document objects [{type, name, url, fileName}]
  payment_screenshot_url TEXT,
  payment_status TEXT DEFAULT 'Paid',
  registration_status TEXT DEFAULT 'Pending', -- Options: 'Pending', 'Approved', 'Rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts for anon users (public)
CREATE POLICY "Allow insert for all users" ON registrations
FOR INSERT TO anon
WITH CHECK (true);

-- Create policy to allow selects for anon users (public)
CREATE POLICY "Allow read for all users" ON registrations
FOR SELECT TO anon
USING (true);

-- Create policy to allow updates for authenticated users (admin)
CREATE POLICY "Allow update for authenticated users" ON registrations
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow deletes for authenticated users (admin)
CREATE POLICY "Allow delete for authenticated users" ON registrations
FOR DELETE TO authenticated
USING (true);
```

## Adding Columns to Existing Table

If you already have the `registrations` table, run these SQL commands to add the missing columns:

```sql
-- Add missing columns
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS captain_mobile TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Paid';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'Pending';

-- Add update policy for authenticated users (admin)
DROP POLICY IF EXISTS "Allow update for authenticated users" ON registrations;
CREATE POLICY "Allow update for authenticated users" ON registrations
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Add delete policy for authenticated users (admin)
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON registrations;
CREATE POLICY "Allow delete for authenticated users" ON registrations
FOR DELETE TO authenticated
USING (true);
```

## Storage Buckets

You also need to create two storage buckets in Supabase:

1. `captain-docs` - for storing captain's documents (Aadhaar, College ID)
2. `player-docs` - for storing player documents

Make sure to configure the bucket policies to allow uploads from your application.

## Environment Configuration

Ensure your `supabaseClient.js` file has the correct Supabase URL and API key:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
```

## Storage Policies

For the storage buckets to work properly, you need to add policies that allow users to upload files. Here's an example policy for the `captain-docs` bucket:

```sql
-- Enable row level security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for captain-docs bucket
CREATE POLICY "Allow upload to captain-docs" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'captain-docs');

CREATE POLICY "Allow select from captain-docs" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'captain-docs');

-- Policy for player-docs bucket
CREATE POLICY "Allow upload to player-docs" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'player-docs');

CREATE POLICY "Allow select from player-docs" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'player-docs');
```