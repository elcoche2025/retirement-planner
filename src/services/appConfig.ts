import { supabase } from './supabase';

export async function getSignupsEnabled(): Promise<boolean> {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'signups_enabled')
    .single();
  if (error) return true; // fail open — assume enabled if read fails
  return data?.value === true;
}

export async function setSignupsEnabled(enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('app_config')
    .update({ value: enabled, updated_at: new Date().toISOString() })
    .eq('key', 'signups_enabled');
  if (error) throw error;
}
