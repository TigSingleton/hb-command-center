import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fzdvaifpxsajhqwezxxs.supabase.co';
const supabaseKey = 'sb_publishable_aEGV_u4uqotj5_L-3ahwiA_c8F2ApFu';

export const supabase = createClient(supabaseUrl, supabaseKey);
