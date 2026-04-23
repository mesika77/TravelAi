import 'server-only'

import { neon } from '@neondatabase/serverless'

function createClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL_MISSING')
  }
  return neon(databaseUrl)
}

export const sql = createClient()
