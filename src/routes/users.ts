import { type FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { ZodError, z } from 'zod'
import { knex } from '../../knexfile'

export async function userRoutes (app: FastifyInstance): Promise<void> {
  app.post('/', async (req, reply) => {
    try {
      const bodySchema = z.object({
        name: z.string().min(3)
      })

      let sessionId = req.cookies.sessionId
      if (sessionId == null) {
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })

        const { name } = bodySchema.parse(req.body)
        await knex('users').insert({
          name,
          session_id: sessionId
        })
        return await reply.status(201).send()
      }

      return await reply.status(400).send()
    } catch (error) {
      if (error instanceof ZodError) {
        return await reply.status(400).send(error.message)
      }
      return await reply.send(error)
    }
  })

  app.get('/:id/summary', async (req, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid()
      })

      const { id } = paramsSchema.parse(req.params)

      const allUserMeals = await knex('meals').where('user_id', id).select('*')

      let sequence = 0 // 2
      let bestSequenceMelsInDiet = 0 //
      allUserMeals.forEach(meal => {
        if (meal.isIncluded === 1) {
          sequence = sequence + 1

          if (sequence > bestSequenceMelsInDiet) {
            bestSequenceMelsInDiet = sequence
          }
          return
        }
        sequence = 0
      })

      const summary = {
        total_meals: allUserMeals.length,
        mealsInDiet: allUserMeals.filter(meals => meals.isIncluded === 1).length,
        mealsOutDiet: allUserMeals.filter(meals => meals.isIncluded === 0).length,
        bestSequenceMelsInDiet
      }

      return summary
    } catch (error) {
      if (error instanceof ZodError) {
        return await reply.status(400).send(error.message)
      }
      return await reply.send(error)
    }
  })
}
