import fastify from 'fastify'
import { usersRoutes } from './routes/users.js'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
	prefix: 'users'
})