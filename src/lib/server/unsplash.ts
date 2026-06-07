import { env } from '$env/dynamic/private';

export interface LessonImage {
	url: string;
	attribution: string;
}

const CACHE_MAX = 100;
const imageCache = new Map<string, LessonImage | null>();

function normalizeQuery(query: string): string {
	return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function cacheSet(key: string, value: LessonImage | null): void {
	if (imageCache.size >= CACHE_MAX) {
		const firstKey = imageCache.keys().next().value;
		if (firstKey) imageCache.delete(firstKey);
	}
	imageCache.set(key, value);
}

export async function fetchLessonImage(query: string): Promise<LessonImage | null> {
	const cacheKey = normalizeQuery(query);
	if (imageCache.has(cacheKey)) {
		return imageCache.get(cacheKey) ?? null;
	}

	const accessKey = env.UNSPLASH_ACCESS_KEY;
	if (!accessKey || accessKey === 'your-unsplash-access-key-here') {
		cacheSet(cacheKey, null);
		return null;
	}

	try {
		const params = new URLSearchParams({
			query: query.trim(),
			per_page: '1',
			orientation: 'landscape'
		});

		const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
			headers: { Authorization: `Client-ID ${accessKey}` }
		});

		if (!res.ok) {
			cacheSet(cacheKey, null);
			return null;
		}

		const data = await res.json();
		const photo = data.results?.[0];
		if (!photo?.urls?.regular) {
			cacheSet(cacheKey, null);
			return null;
		}

		const photographer = photo.user?.name ?? 'Unsplash';
		const result: LessonImage = {
			url: photo.urls.regular,
			attribution: photographer
		};
		cacheSet(cacheKey, result);
		return result;
	} catch {
		cacheSet(cacheKey, null);
		return null;
	}
}
