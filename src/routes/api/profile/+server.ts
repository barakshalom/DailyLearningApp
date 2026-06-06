import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { normalizeAge } from '$lib/server/auth';
import { isMissingProfilesError, profilesMigrationMessage } from '$lib/server/errors';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const { data, error: dbError } = await locals.supabase
		.from('profiles')
		.select('age')
		.eq('user_id', locals.user.id)
		.maybeSingle();

	if (dbError) {
		if (isMissingProfilesError(dbError.message)) {
			return json({ age: null, setupRequired: true });
		}
		error(500, 'שגיאה בטעינת הפרופיל');
	}

	return json({
		age: data?.age ?? null,
		setupRequired: false
	});
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();

	if (body?.age === undefined) {
		error(400, 'לא סופקו שדות לעדכון');
	}

	const age = normalizeAge(body.age);
	if (age === null) {
		error(400, 'גיל לא תקין (8–120)');
	}

	const { data, error: dbError } = await locals.supabase
		.from('profiles')
		.upsert(
			{
				user_id: locals.user.id,
				age,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'user_id' }
		)
		.select('age')
		.single();

	if (dbError) {
		if (isMissingProfilesError(dbError.message)) {
			error(503, profilesMigrationMessage());
		}
		error(500, 'שגיאה בשמירת הפרופיל');
	}

	return json({
		age: data.age,
		setupRequired: false
	});
};
