import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { authCookieOptions } from '$lib/supabase/cookies';

const supabaseHandle: Handle = async ({ event, resolve }) => {
	const secure = event.url.protocol === 'https:';

	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, authCookieOptions(options, secure));
				});
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) return { session: null, user: null };
		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const pathname = event.url.pathname;
	const isApi = pathname.startsWith('/api/');
	const isAuthRoute =
		pathname === '/login' ||
		pathname === '/api/auth/login' ||
		pathname === '/api/auth/register' ||
		pathname === '/api/auth/logout';
	const isProtected =
		pathname === '/' ||
		pathname === '/lesson' ||
		pathname === '/history' ||
		pathname.startsWith('/history/') ||
		pathname === '/settings';

	if (!session && !isAuthRoute && (isProtected || isApi)) {
		if (isApi) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw redirect(303, '/login');
	}

	if (session && pathname === '/login') {
		throw redirect(303, '/');
	}

	return resolve(event);
};

export const handle = sequence(supabaseHandle, authGuard);
