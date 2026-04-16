import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://misjzqiqihdzzajaoyro.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DuKCGqL5oP5xA9EWoH_wcA_3tCo4SKc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
