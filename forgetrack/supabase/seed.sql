-- Students data has been removed and saved to students_data_backup.txt

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
