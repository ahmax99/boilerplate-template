export async function checkBackendHealth(
  backendUrl: string
): Promise<'up' | 'down'> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

  try {
    const response = await fetch(`${backendUrl}/health`, {
      signal: controller.signal,
      cache: 'no-store'
    })

    clearTimeout(timeoutId)
    return response.ok ? 'up' : 'down'
  } catch {
    return 'down'
  }
}
