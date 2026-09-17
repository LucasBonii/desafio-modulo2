import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { db } from '../database.js'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists.js'

export async function mealsRoutes(app: FastifyInstance) {

    app.addHook('preHandler', checkSessionIdExists)

    app.post('/', async (request, reply) => {
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
    })

    app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const user = await db('users')
      .where('session_id', sessionId)
      .first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const meals = await db('meals')
      .where('user_id', user.id)
      .orderBy('date', 'desc')

    return reply.send({ meals })
  })


  app.get('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    })

    const { id } = getMealParamsSchema.parse(request.params)
    const sessionId = request.cookies.sessionId

    const user = await db('users')
      .where('session_id', sessionId)
      .first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const meal = await db('meals')
      .where({
        id,
        user_id: user.id,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({ error: 'Meal not found' })
    }

    return reply.send({ meal })
  })

  app.put('/:id', async (request, reply) => {
    const updateMealParamsSchema = z.object({
      id: z.uuid('ID inválido'),
    })

    const updateMealBodySchema = z.object({
      name: z.string().min(1, 'Nome é obrigatório'),
      description: z.string().min(1, 'Descrição é obrigatória'),
      isOnDiet: z.boolean(),
      date: z.coerce.date(),
    })

    const { id } = updateMealParamsSchema.parse(request.params)
    const { name, description, isOnDiet, date } = updateMealBodySchema.parse(request.body)

    const sessionId = request.cookies.sessionId

    const user = await db('users')
      .where('session_id', sessionId)
      .first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const meal = await db('meals')
      .where({
        id,
        user_id: user.id,
      }).first()

    if (!meal) {
      return reply.status(404).send({ error: 'Meal not found' })
    }

    await db('meals')
      .where({
        id,
        user_id: user.id,
      })
      .update({
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.toISOString(),
        updated_at: new Date().toISOString(),
      })

    return reply.status(204).send()
  })


  app.delete('/:id', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.uuid('ID inválido'),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)
    const sessionId = request.cookies.sessionId

    const user = await db('users')
      .where('session_id', sessionId)
      .first()

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const meal = await db('meals')
      .where({
        id,
        user_id: user.id,
      }).first()

    if (!meal) {
      return reply.status(404).send({ error: 'Meal not found' })
    }

    await db('meals')
      .where({
        id,
        user_id: user.id,
      })
      .delete()

    return reply.status(204).send()
  })

}