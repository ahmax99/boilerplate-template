export const getEnv = () => {
  const DATABASE_URL = process.env.DATABASE_URL

  if (!DATABASE_URL)
    throw new Error('DATABASE_URL environment variable is required')

  return { DATABASE_URL }
}
