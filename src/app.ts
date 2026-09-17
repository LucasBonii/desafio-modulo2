import fastify from 'fastify'
import { usersRoutes } from './routes/users.js'
import cookie from '@fastify/cookie'
import { mealsRoutes } from './routes/meals.js'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
	prefix: 'users'
})

app.register(mealsRoutes, {
  prefix: 'meals',
})