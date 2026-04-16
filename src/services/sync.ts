import { supabase } from './supabase';
import type { AppState } from '@/types';

const TABLE = 'life_planner_state';

/** AppState with the optional localUpdatedAt field (added in state v5). */
type SyncableState = AppState & { localUpdatedAt?: string };

export interface SyncResult {
  action: 'pulled' | 'pushed' | 'created' | 'no-change';
  timestamp: string;
}

export async function pullState(userId: string): Promise<{ state: AppState; updatedAt: string } | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('state, updated_at')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No row found
    throw error;
  }

  return { state: data.state as AppState, updatedAt: data.updated_at };
}

export async function pushState(userId: string, state: AppState): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        state: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;
}

export async function syncState(
  userId: string,
  localState: SyncableState,
): Promise<SyncResult> {
  const remote = await pullState(userId);
  const now = new Date().toISOString();

  if (!remote) {
    // No cloud row — push local state
    await pushState(userId, localState);
    return { action: 'created', timestamp: now };
  }

  const localTime = localState.localUpdatedAt ?? '1970-01-01T00:00:00Z';
  const remoteTime = remote.updatedAt;

  if (remoteTime > localTime) {
    // Cloud is newer — caller should fetch via pullState and apply
    return { action: 'pulled', timestamp: remoteTime };
  }

  if (localTime > remoteTime) {
    // Local is newer — push to cloud
    await pushState(userId, localState);
    return { action: 'pushed', timestamp: now };
  }

  return { action: 'no-change', timestamp: localTime };
}

// Debounce helper
export function createDebouncedSync(delayMs: number = 2000) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function debouncedPush(userId: string, state: AppState) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await pushState(userId, state);
      } catch (err) {
        console.error('Sync push failed:', err);
      }
    }, delayMs);
  };
}
