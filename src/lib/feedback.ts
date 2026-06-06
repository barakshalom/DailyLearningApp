export function feedbackFromEnjoyment(score: number): 'liked' | 'disliked' {
	return score <= 2 ? 'disliked' : 'liked';
}
