import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import type { Database } from '#lib/supabase/database.types.ts';

/** A Supabase client per request, reading and writing the auth cookies. */
const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet, headers) => {
					for (const { name, value, options } of cookiesToSet) {
						event.cookies.set(name, value, { ...options, path: '/' });
					}
					// Responses that refresh the session must never be cached.
					try {
						event.setHeaders(headers);
					} catch {
						// headers were already set for this response
					}
				}
			}
		}
	);

	/**
	 * getSession() alone reads the cookie without checking it, so the JWT is verified
	 * with getClaims() before the session is trusted.
	 */
	event.locals.safeGetSession = async () => {
		const { data: claimsData, error } = await event.locals.supabase.auth.getClaims();
		if (error || !claimsData) return { session: null, user: null };
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return { session, user: session?.user ?? null };
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

const PUBLIC_PATHS = ['/login'];

/** Everything except the login page needs a signed-in user. */
const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const isPublic = PUBLIC_PATHS.some((p) => event.url.pathname.startsWith(p));
	if (!session && !isPublic) redirect(303, '/login');
	if (session && event.url.pathname === '/login') redirect(303, '/');

	return resolve(event);
};

export const handle = sequence(supabase, authGuard);
