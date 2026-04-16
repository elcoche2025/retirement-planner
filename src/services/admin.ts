import { supabase } from './supabase';

export interface UserApproval {
  user_id: string;
  email: string | null;
  approved: boolean;
  is_admin: boolean;
  created_at: string;
}

export async function getMyApproval(userId: string): Promise<UserApproval | null> {
  const { data, error } = await supabase
    .from('user_approvals')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function ensureApprovalRow(userId: string, email: string): Promise<UserApproval> {
  // Try to read first
  const existing = await getMyApproval(userId);
  if (existing) return existing;

  // No row — create one (trigger may not have fired for pre-existing users)
  const { data, error } = await supabase
    .from('user_approvals')
    .insert({ user_id: userId, email, approved: false, is_admin: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllApprovals(): Promise<UserApproval[]> {
  const { data, error } = await supabase
    .from('user_approvals')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function approveUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_approvals')
    .update({ approved: true })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function revokeUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_approvals')
    .update({ approved: false })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteUserApproval(userId: string): Promise<void> {
  // Use SECURITY DEFINER RPC — cascades through auth.users → approval row + state row
  const { error } = await supabase.rpc('delete_life_planner_user', {
    target_user_id: userId,
  });
  if (error) throw error;
}
