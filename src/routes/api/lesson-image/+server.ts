import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchLessonImage } from '$lib/server/unsplash';

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	const query = url.searchParams.get('query')?.trim();
	if (!query || query.length < 2 || query.length > 120) {
		error(400, 'Invalid image query');
	}

	const image = await fetchLessonImage(query);
	if (!image) {
		return json({ image: null });
	}

	return json({ image: { url: image.url, attribution: image.attribution } });
};
