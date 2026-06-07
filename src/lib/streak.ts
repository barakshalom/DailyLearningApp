export type StreakLesson = {
	created_at: string;
	enjoyment: number | null;
};

export interface StreakState {
	count: number;
	todayPending: boolean;
	todayEarned: boolean;
}

function toDateKey(iso: string | Date): string {
	const d = typeof iso === 'string' ? new Date(iso) : iso;
	return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
}

function addDays(date: Date, days: number): Date {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

/** Days with at least one finished (rated) lesson. */
function completedDayKeys(lessons: StreakLesson[]): Set<string> {
	const keys = new Set<string>();
	for (const lesson of lessons) {
		if (lesson.enjoyment !== null) {
			keys.add(toDateKey(lesson.created_at));
		}
	}
	return keys;
}

function countConsecutiveFrom(anchorKey: string, days: Set<string>): number {
	let count = 0;
	let cursor = new Date(anchorKey + 'T12:00:00');
	while (days.has(toDateKey(cursor))) {
		count++;
		cursor = addDays(cursor, -1);
	}
	return count;
}

export function computeStreak(lessons: StreakLesson[]): StreakState {
	const completedDays = completedDayKeys(lessons);
	const todayKey = toDateKey(new Date());
	const yesterdayKey = toDateKey(addDays(new Date(), -1));

	const todayEarned = completedDays.has(todayKey);

	if (todayEarned) {
		return {
			count: countConsecutiveFrom(todayKey, completedDays),
			todayPending: false,
			todayEarned: true
		};
	}

	if (completedDays.has(yesterdayKey)) {
		return {
			count: countConsecutiveFrom(yesterdayKey, completedDays),
			todayPending: true,
			todayEarned: false
		};
	}

	return { count: 0, todayPending: false, todayEarned: false };
}
