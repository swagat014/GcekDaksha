# Supabase Storage Setup Guide (Updated)

## Current Bucket Configuration
You have two buckets configured:
1. **`captain-docs`** - For captain documents
2. **`player-docs`** - For player documents

## File Naming Convention (Updated)
Files will now be named with descriptive patterns including college name, sport, and person names:

### Captain Documents (in `captain-docs` bucket):
- **Aadhaar**: `{college_name}_captain_aadhaar_{timestamp}_{original_filename}`
- **College ID**: `{college_name}_captain_college_id_{timestamp}_{original_filename}`
- **Payment Screenshot**: `{college_name}_{sport}_payment_{timestamp}_{original_filename}`

### Player Documents (in `player-docs` bucket):
- **Player Aadhaar**: `{college_name}_{player_name}_aadhaar_{timestamp}_{original_filename}`
- **Player College ID**: `{college_name}_{player_name}_college_id_{timestamp}_{original_filename}`

### Examples:
- `iit_delhi_captain_aadhaar_1703123456789_front.jpg`
- `iit_delhi_captain_college_id_1703123456790_id_card.pdf`
- `iit_delhi_volleyball_payment_1703123456791_screenshot.jpg`
- `iit_delhi_john_doe_aadhaar_1703123456792_document.jpg`
- `iit_delhi_jane_smith_college_id_1703123456793_student_id.png`

## Storage Policies
Make sure these policies exist for both buckets:

### For `captain-docs` bucket:
```sql
-- Allow uploads
CREATE POLICY "Allow upload to captain-docs" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'captain-docs');

-- Allow reads
CREATE POLICY "Allow read from captain-docs" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'captain-docs');
```

### For `player-docs` bucket:
```sql
-- Allow uploads
CREATE POLICY "Allow upload to player-docs" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'player-docs');

-- Allow reads
CREATE POLICY "Allow read from player-docs" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'player-docs');
```

## Document Type Mapping
The system uses these identifiers:
- `captain_aadhaar` → stored in `captain-docs` bucket
- `captain_id` → stored in `captain-docs` bucket
- `player_aadhaar` → stored in `player-docs` bucket
- `player_id` → stored in `player-docs` bucket

## How It Works
1. When a captain uploads documents, they go to `captain-docs` bucket with filenames including "captain"
2. When players upload documents, they go to `player-docs` bucket with filenames including the player's name
3. Each document type is clearly identified in the filename (aadhaar vs college_id)
4. Timestamps ensure unique filenames
5. Original filenames are preserved at the end

## Benefits of This Approach
- **Clear organization**: Captain and player documents separated by bucket
- **Easy identification**: Filenames include person names and document types
- **No duplicates**: Timestamps ensure unique filenames
- **Searchable**: Easy to find documents by name or type
- **Maintainable**: Clear structure for future management

## Troubleshooting
If you still get "Bucket not found" errors:
1. Verify both buckets exist in your Supabase Storage
2. Check bucket names are exactly: `captain-docs` and `player-docs`
3. Ensure storage policies are applied to both buckets
4. Confirm your Supabase credentials are correct

This setup provides organized storage while using your existing bucket structure.