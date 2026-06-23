-- Enable Row Level Security on the profile table
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Allow public read access (SELECT) for everyone (anonymous and authenticated users)
DROP POLICY IF EXISTS "Allow public read access" ON profile;
CREATE POLICY "Allow public read access" ON profile FOR SELECT USING (true);

-- Note: No INSERT, UPDATE, or DELETE policies are defined.
-- This restricts profile mutation operations exclusively to the service role (secret key),
-- which bypasses RLS. Consequently, all writes are securely mediated through the NestJS backend.
