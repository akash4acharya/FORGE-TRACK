-- Students data has been removed and saved to students_data_backup.txt

-- Seed file cleared of dummy data for Phase 4.
-- Keeping only the necessary mentor accounts.

-- Create mentors in auth.users first so the foreign key constraint passes
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nischay@theboringpeople.in', crypt('admin', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'varun@theboringpeople.in', crypt('admin', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'akash@forge.local', crypt('admin', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert the corresponding rows in public.users
INSERT INTO public.users (id, email, role, display_name) VALUES 
('00000000-0000-0000-0000-000000000001', 'nischay@theboringpeople.in', 'mentor', 'Nischay B K'),
('00000000-0000-0000-0000-000000000002', 'varun@theboringpeople.in', 'mentor', 'Varun'),
('00000000-0000-0000-0000-000000000003', 'akash@forge.local', 'mentor', 'Akash Acharya')
ON CONFLICT (id) DO NOTHING;
