export { default as Context } from './Context.svelte';

import context from './context';
import { get, readable, type Readable } from 'svelte/store';
export const useClient = () => {
	const clientStore = context.get();
	if (!clientStore) throw new Error('Client is not set');
	const client = get(clientStore);
	if (!client) throw new Error('Client is not set');
	return client;
};

import { createFilter, type SyncMapValue } from '@logux/client';
import type { SyncMapTemplate, Filter, FilterOptions } from '@logux/client';
import type { SyncMapValues } from '@logux/actions';

export const useFilter = <Value extends SyncMapValues>(
	Template: SyncMapTemplate<Value>,
	filter?: Filter<Value>,
	opts?: FilterOptions
) => {
	const instance = createFilter<Value>(useClient(), Template, filter, opts);
	return readable(instance.get(), (set) => instance.listen(set));
};

export const useSync = <Value extends SyncMapValues>(
	Template: SyncMapTemplate<Value>,
	id: string
): Readable<SyncMapValue<Value>> => {
	const store = Template(id, useClient());
	return readable(store.get(), (set) => store.listen(set));
};
