type CookieOpts = {
	path?: string;
	secure?: boolean;
	sameSite?: boolean | 'lax' | 'strict' | 'none';
	[key: string]: unknown;
};

export function authCookieOptions(options: CookieOpts, secure: boolean) {
	return {
		...options,
		path: '/',
		secure,
		sameSite: 'lax' as const
	};
}
