import { supabase } from './client';

// Calls a SkillDirectory Edge Function and returns its JSON body, throwing on errors.
// The signed-in user's session token is attached automatically by supabase-js.
export async function callEdge<T = any>(fn: 'payments' | 'admin-api', action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body: { action, ...payload } });
  if (error) {
    let message = error.message;
    try {
      const ctx = await (error as any).context?.json?.();
      if (ctx?.error) message = ctx.error;
    } catch { /* keep default message */ }
    throw new Error(message);
  }
  return data as T;
}
