export const subprotocol = '1.0.0';

export type List = {
	id: string;
	title: string;
};

export type Item = {
	id: string;
	text: string;
	listId: string;
};

export type Roll = {
	id: string;
	itemId: string;
	listId: string;
};
