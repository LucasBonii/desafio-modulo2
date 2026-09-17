import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      session_id: string
      created_at: string
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      date: string | number
      is_on_diet: boolean
      created_at: string
      updated_at: string
    }
  }
}