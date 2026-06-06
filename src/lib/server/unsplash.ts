import { env } from '$env/dynamic/private';

export interface LessonImage {
	url: string;
	attribution: string;
}

export async function fetchLessonImage(query: string): Promise<LessonImage | null> {
	const accessKey = env.UNSPLASH_ACCESS_KEY;
	if (!accessKey || accessKey === 'your-unsplash-access-key-here') {
		return null;
	}

	try {
		const params = new URLSearchParams({
			query,
			per_page: '1',
			orientation: 'landscape'
		});

		const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
			headers: { Authorization: `Client-ID ${accessKey}` }
		});

		if (!res.ok) return null;

		const data = await res.json();
		const photo = data.results?.[0];
		if (!photo?.urls?.regular) return null;

		const photographer = photo.user?.name ?? 'Unsplash';
		return {
			url: photo.urls.regular,
			attribution: photographer
		};
	} catch {
		return null;
	}
}
