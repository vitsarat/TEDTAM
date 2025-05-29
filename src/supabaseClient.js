import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbiwvglgxkujypcxqfnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaXd2Z2xneGt1anlwY3hxZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDY4MDUsImV4cCI6MjA2NDA4MjgwNX0.NY_RIKDTrSi36hdNRdaXmT1h3baRZID6-Q_mKanPfDA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);