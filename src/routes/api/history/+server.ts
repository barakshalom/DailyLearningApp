import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	const { data, error: dbError } = await locals.supabase
		.from('lessons')
		.select('*')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(50);

	if (dbError) error(500, dbError.message);

	return json({ lessons: data ?? [] });
};
