import knex from "knex"
import type { Knex } from "knex"
import { env } from './env/index.js'

if (!process.env.DATABASE_URL){
	throw new Error("DATABASE_URL env not found")
}

export const config: Knex.Config = {
	client: env.DATABASE_CLIENT,
	connection: env.DATABASE_CLIENT === 'sqlite3' ? {
		filename: env.DATABASE_URL,
	} : env.DATABASE_URL,
	useNullAsDefault: true,
	migrations: {
		extension: 'ts',
		directory: './database/migrations'
	}
}

export const db = knex(config)