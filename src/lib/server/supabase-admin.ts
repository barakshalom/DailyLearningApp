import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

let adminClient: SupabaseClient | null = null;

export function getServiceRoleKey(): string | undefined {
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!key || key.includes('your-service-role')) return undefined;
	return key;
}

export function getSupabaseAdmin(): SupabaseClient | null {
	const serviceRoleKey = getServiceRoleKey();
	if (!serviceRoleKey) return null;

	if (!adminClient) {
		adminClient = createClient(PUBLIC_SUPABASE_URL, serviceRoleKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
	}

	return adminClient;
}
