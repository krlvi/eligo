import { subprotocol } from '@eligo/protocol';
import { Server } from '@logux/server';
import yargs from 'yargs';

import openDB from './db/index.js';
import registerAuthModule from './modules/auth.js';
import registerItemsModule from './modules/items.js';
import registerListsModule from './modules/lists.js';
import registerPicksModule from './modules/picks.js';
import registerBoostsModule from './modules/boosts.js';
import registerUsersModule from './modules/users.js';
import registerMembershipsModule from './modules/memberships.js';
import { jsonStore } from './store/index.js';

const argv = yargs(process.argv.slice(2))
	.usage('Usage: $0 <command> [options]')
	.option('database', {
		alias: 'd',
		describe: 'Database path',
		default: './database.dev.json'
	})
	.option('log', {
		alias: 'l',
		describe: 'Log path',
		default: './log.dev.json'
	})
	.option('port', {
		alias: 'p',
		describe: 'Port to listen on',
		default: 31337
	})
	.option('host', {
		alias: 'h',
		describe: 'Host to listen on',
		default: '127.0.0.1'
	})
	.parseSync();

const server = new Server({
	subprotocol,
	port: argv.port,
	host: argv.host,
	supports: subprotocol,
	store: jsonStore(argv.log),
	logger: {
		type: process.env.NODE_ENV === 'production' ? 'json' : 'human'
	}
});

const { keys, users, items, lists, picks, memberships, boosts } = openDB(argv.database);

await registerAuthModule(server, keys, users);
registerItemsModule(server, items, lists, memberships);
registerListsModule(server, lists, memberships);
registerPicksModule(server, picks, items, boosts, memberships, lists);
registerBoostsModule(server, boosts, items, memberships, lists);
registerUsersModule(server, users, memberships, lists);
registerMembershipsModule(server, memberships, lists);

server.listen();
