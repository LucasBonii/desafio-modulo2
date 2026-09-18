import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Lucas Henrique' })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Café da manhã',
        description: 'Ovos mexidos e café puro',
        isOnDiet: true,
        date: new Date().toISOString(),
      })
      .expect(201)
  })

  it('should be able to list all meals of a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Lucas Henrique' })

    const cookies = userResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Frango e salada',
        isOnDiet: true,
        date: new Date().toISOString(),
      })

    const listResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listResponse.body.meals).toHaveLength(1)
    expect(listResponse.body.meals[0]).toEqual(
      expect.objectContaining({
        name: 'Almoço',
        description: 'Frango e salada',
      }),
    )
  })

  it('should be able to get metrics of a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Lucas Henrique' })

    const cookies = userResponse.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Refeição 1',
      description: 'Dieta',
      isOnDiet: true,
      date: '2026-01-01T10:00:00.000Z',
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Refeição 2',
      description: 'Dieta',
      isOnDiet: true,
      date: '2026-01-01T13:00:00.000Z',
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Refeição 3',
      description: 'Fora da dieta',
      isOnDiet: false,
      date: '2026-01-01T19:00:00.000Z',
    })

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 3,
      totalMealsOnDiet: 2,
      totalMealsOffDiet: 1,
      bestOnDietSequence: 2,
    })
  })
})