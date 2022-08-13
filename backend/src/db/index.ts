import type { List, Item, User, Roll } from '@velit/protocol';
import { JSONFile, Low } from 'lowdb';

export type ItemRecord = {
	textChangeTime: number;
} & Item;

export type ListRecord = {
	titleChangeTime: number;
} & List;

export type KeyRecord = {
	id: string;
	spki: string;
	alg: string;
};

export type RollRecord = Roll;

export type UserRecord = User & {
	hash: string;
};

type Data = {
	items: Record<string, ItemRecord>;
	keys: Record<string, KeyRecord>;
	lists: Record<string, ListRecord>;
	rolls: Record<string, RollRecord>;
	users: Record<string, UserRecord>;
};

const openDB = (filepath: string) => {
	const adapter = new JSONFile<Data>(filepath);
	const db = new Low(adapter);
	const initDB = async () => {
		await db.read();
		db.data ||= { items: {}, lists: {}, rolls: {}, users: {}, keys: {} };
	};
	return {
		create: async <K extends keyof Data>(key: K, value: Data[K][keyof Data[K]]) => {
			await initDB();
			if (!db.data) throw new Error('db.data is null');
			db.data[key][value.id] = value;
			await db.write();
			return value;
		},
		find: async <K extends keyof Data>(key: K, filter: Partial<Data[K][keyof Data[K]]>) => {
			await initDB();
			if (!db.data) throw new Error('db.data is null');
			// shortcut for finding by id
			if (Object.keys(filter).length === 1 && filter.id !== undefined)
				return db.data[key][filter.id];
			return Object.values(db.data[key]).find((value) =>
				Object.entries(filter).every(([k, v]) => value[k] === v)
			);
		},
		filter: async <K extends keyof Data>(
			key: K,
			filter: Partial<Omit<Data[K][keyof Data[K]], 'id'>> = {}
		) => {
			await initDB();
			if (!db.data) throw new Error('db.data is null');
			return Object.values(db.data[key]).filter((value) =>
				Object.entries(filter).every(([k, v]) => value[k] === v)
			);
		},
		delete: async <K extends keyof Data>(key: K, id: string) => {
			await initDB();
			if (!db.data) throw new Error('db.data is null');
			delete db.data[key][id];
			await db.write();
		},
		update: async <K extends keyof Data>(
			key: K,
			id: string,
			value: Partial<Data[K][keyof Data[K]]>
		) => {
			await initDB();
			if (!db.data) throw new Error('db.data is null');
			db.data[key][id] = { ...db.data[key][id], ...value };
			await db.write();
			return db.data[key][id];
		}
	};
};

const createDB = (filepath: string) => {
	const db = openDB(filepath);
	// todo: generate this
	return {
		items: {
			create: (item: ItemRecord) => db.create('items', item),
			update: (id: string, value: Partial<ItemRecord>) => db.update('items', id, value),
			find: (filter: Partial<ItemRecord>) => db.find('items', filter),
			filter: (filter: Partial<Omit<ItemRecord, 'id'>> = {}) => db.filter('items', filter),
			delete: (id: string) => db.delete('items', id)
		},
		lists: {
			create: (list: ListRecord) => db.create('lists', list),
			update: (id: string, value: Partial<ListRecord>) => db.update('lists', id, value),
			find: (filter: Partial<ListRecord>) => db.find('lists', filter),
			filter: (filter: Partial<Omit<ListRecord, 'id'>> = {}) => db.filter('lists', filter),
			delete: (id: string) => db.delete('lists', id)
		},
		rolls: {
			create: (roll: RollRecord) => db.create('rolls', roll),
			update: (id: string, value: Partial<RollRecord>) => db.update('rolls', id, value),
			find: (filter: Partial<RollRecord>) => db.find('rolls', filter),
			filter: (filter: Partial<Omit<RollRecord, 'id'>> = {}) => db.filter('rolls', filter),
			delete: (id: string) => db.delete('rolls', id)
		},
		users: {
			create: (user: UserRecord) => db.create('users', user),
			update: (id: string, value: Partial<UserRecord>) => db.update('users', id, value),
			find: (filter: Partial<UserRecord>) => db.find('users', filter),
			filter: (filter: Partial<Omit<UserRecord, 'id'>> = {}) => db.filter('users', filter),
			delete: (id: string) => db.delete('users', id)
		},
		keys: {
			create: (key: KeyRecord) => db.create('keys', key),
			update: (id: string, value: Partial<KeyRecord>) => db.update('keys', id, value),
			find: (filter: Partial<KeyRecord>) => db.find('keys', filter),
			filter: (filter: Partial<Omit<KeyRecord, 'id'>> = {}) => db.filter('keys', filter),
			delete: (id: string) => db.delete('keys', id)
		}
	};
};

export type Items = ReturnType<typeof createDB>['items'];
export type Lists = ReturnType<typeof createDB>['lists'];
export type Rolls = ReturnType<typeof createDB>['rolls'];
export type Users = ReturnType<typeof createDB>['users'];
export type Keys = ReturnType<typeof createDB>['keys'];

export default createDB;
