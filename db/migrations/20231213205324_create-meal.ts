import { type Knex } from 'knex'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').defaultTo(knex.fn.uuid()).primary()
    table.uuid('user_id').unsigned()
    table.foreign('user_id').references('users.id')
    table.text('name').index()
    table.text('description')
    table.boolean('isIncluded')
    table.datetime('created_at').notNullable()
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
