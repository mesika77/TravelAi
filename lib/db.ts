import 'server-only'

import { neon } from '@neondatabase/serverless'

function createClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL_MISSING')
  }
  return neon(databaseUrl)
}

let client: ReturnType<typeof createClient> | null = null

export function getSql() {
  if (!client) {
    client = createClient()
  }
  return client
}
