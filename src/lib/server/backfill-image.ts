import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchLessonImage } from '$lib/server/unsplash';

export async function backfillLessonImage(
	supabase: SupabaseClient,
	lessonId: string,
	userId: string,
	imageQuery: string
): Promise<void> {
	const image = await fetchLessonImage(imageQuery);
	if (!image?.url) return;

	await supabase
		.from('lessons')
		.update({ image_url: image.url })
		.eq('id', lessonId)
		.eq('user_id', userId);
}
