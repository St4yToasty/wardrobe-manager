import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/supabase/database.types.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
/** Who is signed in, taken from the verified access token. */
type AuthUser = { id: string; email: string | null };

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{ session: Session | null; user: AuthUser | null }>;
			session: Session | null;
			user: AuthUser | null;
		}
		interface PageData {
			session: Session | null;
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
