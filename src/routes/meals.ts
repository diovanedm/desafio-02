import { type FastifyInstance } from 'fastify'
import { ZodError, z } from 'zod'
import { knex } from '../../knexfile'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes (app: FastifyInstance): Promise<void> {
  app.post('/', { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    try {
      const bodySchema = z.object({
        name: z.string().min(3),
        description: z.string().min(10),
        isIncluded: z.boolean()
      })

      const sessionId = req.cookies.sessionId
      const { name, description, isIncluded } = bodySchema.parse(req.body)

      const users = await knex('users').where('session_id', sessionId).first()
      const meal = await knex('meals').insert({
        user_id: users.id,
        name,
        description,
        isIncluded,
        created_at: new Date().toISOString()
      }).returning('*')

      return await reply.status(201).send(meal)
    } catch (error) {
      if (error instanceof ZodError) {
        return await reply.status(400).send(error.message)
      }
      return await reply.send(error)
    }
  })

  app.put('/:id', { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid()
      })
      const { id } = paramsSchema.parse(req.params)

      const meal = await knex('meals').where('id', id).first()

      if (meal === undefined) {
        reply.status(400).send({
          error: 'Refeição não encontrada'
        })
      }

      const bodySchema = z.object({
        name: z.string().min(3),
        description: z.string().min(10),
        isIncluded: z.boolean(),
        created_at: z.string().datetime()
      })

      const result = bodySchema.partial().parse(req.body)

      const mergeMeal = { ...meal, ...result }

      const updatedMeal = await knex('meals').insert(mergeMeal).onConflict('id').merge().returning('*')

      return await reply.send(updatedMeal)
    } catch (error) {
      if (error instanceof ZodError) {
        return await reply.status(400).send(error.message)
      }
      return await reply.send(error)
    }
  })

  app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid()
      })

      const { id } = paramsSchema.parse(req.params)

      await knex('meals').where('id', id).del()
    } catch (error) {
      if (error instanceof ZodError) {
        return await reply.status(400).send(error.message)
      }
      return await reply.status(400).send(error)
    }
  })

  app.get('/user/:id', { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid()
      })

      const { id } = paramsSchema.parse(req.params)
      return await knex('meals').where('user_id', id).select('*').returning('*')
    } catch (error) {
      if (error instanceof ZodError) {
        return await reply.status(400).send(error.message)
      }
      return await reply.status(400).send(error)
    }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid()
      })

      const { id } = paramsSchema.parse(req.params)
      return await knex('meals').where('id', id).select('*').first()
    } catch (error) {
      if (error instanceof ZodError) {
        return await reply.status(400).send(error.message)
      }
      return await reply.status(400).send(error)
    }
  })
}
