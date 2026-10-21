import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	return {
		session: locals.session,
		userId: locals.user?.id ?? null,
		cookies: cookies.getAll()
	};
};
