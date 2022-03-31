import { Knex } from 'knex';
import axios from 'axios';
import { sleep } from './sleep';

export async function awaitDatabaseConnection(database: Knex, checkSQL: string): Promise<void | null> {
	for (let attempt = 0; attempt <= 20; attempt++) {
		try {
			await database.raw(checkSQL);
			return null; // success
		} catch (error) {
			await sleep(5000);
			continue;
		}
	}
	throw new Error(`Couldn't connect to DB`);
}

export async function awaitDirectusConnection(port: number): Promise<void | null> {
	for (let attempt = 0; attempt <= 20; attempt++) {
		try {
			await axios.get(`http://localhost:${port}/server/ping`);
			return null; // success
		} catch {
			await sleep(5000);
			continue;
		}
	}
	throw new Error(`Couldn't connect to Directus`);
}
