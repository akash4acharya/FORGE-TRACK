-- 25 Students
INSERT INTO public.students (name, usn, branch_code) VALUES
('Aarav Patel', '4SH24CS001', 'CS'),
('Vivaan Sharma', '4SH24CS002', 'CS'),
('Aditya Kumar', '4SH24CS003', 'AI'),
('Vihaan Singh', '4SH24CS004', 'IS'),
('Arjun Gupta', '4SH24CS005', 'CS'),
('Sai Reddy', '4SH24CS006', 'AI'),
('Ananya Joshi', '4SH24CS007', 'CS'),
('Diya Nair', '4SH24CS008', 'IS'),
('Isha Desai', '4SH24CS009', 'AI'),
('Aadya Mehta', '4SH24CS010', 'CS'),
('Nisha Rao', '4SH24CS011', 'CS'),
('Rohan Kapoor', '4SH24CS012', 'AI'),
('Kabir Verma', '4SH24CS013', 'IS'),
('Shaurya Bhat', '4SH24CS014', 'CS'),
('Riya Menon', '4SH24CS015', 'AI'),
('Meera Iyer', '4SH24CS016', 'CS'),
('Krish Pillai', '4SH24CS017', 'IS'),
('Aryan Choudhury', '4SH24CS018', 'AI'),
('Neha Jain', '4SH24CS019', 'CS'),
('Kavya Das', '4SH24CS020', 'IS'),
('Ishaan Thakur', '4SH24CS021', 'CS'),
('Dhruv Saini', '4SH24CS022', 'AI'),
('Sanya Agarwal', '4SH24CS023', 'IS'),
('Kiara Arora', '4SH24CS024', 'CS'),
('Priya Chatterjee', '4SH24CS025', 'AI')
ON CONFLICT (usn) DO NOTHING;

-- 15 Sessions
INSERT INTO public.sessions (date, topic, month_number, duration_hours, session_type) VALUES
('2025-08-05', '8-Layer AI Stack', 4, 2.0, 'offline'),
('2025-08-12', 'ReAct Agent Pattern', 4, 2.0, 'offline'),
('2025-08-19', 'Vector Embeddings', 4, 2.0, 'offline'),
('2025-08-26', 'pgvector RAG', 4, 2.0, 'offline'),
('2025-09-02', 'Tiered Autonomy Multi-Agent', 4, 2.0, 'offline'),
('2025-09-09', 'LLM Function Calling', 5, 2.0, 'offline'),
('2025-09-16', 'Fine-tuning Foundations', 5, 2.0, 'offline'),
('2025-09-23', 'LoRA and QLoRA', 5, 2.0, 'offline'),
('2025-09-30', 'Evaluation Metrics for AI', 5, 2.0, 'offline'),
('2025-10-07', 'Deploying on Edge', 5, 2.0, 'offline'),
('2025-10-14', 'ONNX Runtime', 6, 2.0, 'offline'),
('2025-10-21', 'Vision Models Introduction', 6, 2.0, 'offline'),
('2025-10-28', 'Multimodal Agents', 6, 2.0, 'offline'),
('2025-11-04', 'Reinforcement Learning Basics', 6, 2.0, 'offline'),
('2025-11-11', 'Future of AI Architecture', 6, 2.0, 'offline')
ON CONFLICT (date) DO NOTHING;

-- Attendance records
-- (Omitted full insert for brevity, would typically insert a matrix of student x session)

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
