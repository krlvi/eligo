import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => ({
	listId: params.id
});
