import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { db } from '../database.js'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists.js'

export async function mealsRoutes(app: FastifyInstance) {

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        description: z.string().min(1, 'Descrição é obrigatória'),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      )

      const sessionId = request.cookies.sessionId

      const user = await db('users')
        .where('session_id', sessionId)
        .first()

      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      await db('meals').insert({
        id: randomUUID(),
        user_id: user.id,
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.toISOString(),
      })

      return reply.status(201).send()
    },
  )
}