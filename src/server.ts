import fastify from 'fastify'
import { ZodError, z } from 'zod'
import { knex } from '../knexfile'
const server = fastify()

server.post('/create-user', async (req, reply) => {
  try {
    const bodySchema = z.object({
      name: z.string().min(3)
    })

    const { name } = bodySchema.parse(req.body)

    await knex('users').insert({
      name
    })
    return await reply.status(201).send()
  } catch (error) {
    if (error instanceof ZodError) {
      return await reply.status(400).send(error.message)
    }
    return await reply.send(error)
  }
})

server.get('/list-users', async (req, reply) => {

})

server.listen({
  port: 3333
}).then(() => { console.log('Server running!') })
  .catch(e => { console.log(e) })
