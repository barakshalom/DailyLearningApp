export function buildYouTubeSearchUrl(query: string): string {
	return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
