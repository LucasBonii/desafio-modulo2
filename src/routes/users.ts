import { randomUUID } from "crypto";
import type { FastifyInstance } from "fastify";
import { db } from "../database.js"
import z from "zod";

export async function usersRoutes(app:FastifyInstance) {
    
    app.post('/', async (request, reply) =>{
        const createUserBodySchema = z.object({
        name: z.string().min(1, 'O nome é obrigatório'),
    })

    const { name } = createUserBodySchema.parse(request.body)
    let { sessionId } = request.cookies

    if (!sessionId){
        sessionId = randomUUID()

        reply.setCookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
        })
    }
    await db('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })
    return reply.status(201).send()

    })

    
}