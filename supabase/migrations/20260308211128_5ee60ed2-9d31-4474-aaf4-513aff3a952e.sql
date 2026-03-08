
DELETE FROM public.chat_message WHERE chat_session_id = '351fce37-6c68-45fc-a732-cd6804df51c7';
DELETE FROM public.chat_session WHERE id = '351fce37-6c68-45fc-a732-cd6804df51c7';
UPDATE public."user" SET first_name = NULL, last_name = NULL, profile_summary = NULL, phone_number = NULL, years_of_experience = NULL WHERE id = '309d7317-efad-44a0-b893-f0a0848c0828';
