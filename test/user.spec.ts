import supertest from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

import { execSync } from 'child_process'
import { app } from '../src/app'

describe('user', async () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('yarn knex migrate:rollback --all')
    execSync('yarn knex migrate:latest')
  })

  it('should be able to create a user', async () => {
    await supertest(app.server).post('/users').send({
      name: 'Diovane'
    }).expect(201)
  })

  it.todo('should be able to identify the user between requests', () => {})
})
