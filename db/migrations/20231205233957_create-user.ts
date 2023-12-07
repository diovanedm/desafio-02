import { type Knex } from 'knex'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').defaultTo(knex.fn.uuid()).primary()
    table.text('name')
  })
}

export async function down (knex: Knex): Promise<void> {
  knex.schema.dropTable('users')
}
