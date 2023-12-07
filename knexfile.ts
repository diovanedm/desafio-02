// Update with your config settings.

import setupKnex, { type Knex } from 'knex'

const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: './db/app.db'
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations'
  }
}

export const knex = setupKnex(config)
export default config
