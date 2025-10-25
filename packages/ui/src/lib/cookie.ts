export interface CookieOptions {
  maxAge: number
  expires?: Date
  path: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

export const setCookie = (
  name: string,
  state: boolean,
  options: CookieOptions
): void => {
  if (typeof document === 'undefined') return

  const { maxAge, expires, path, domain, secure, sameSite = 'lax' } = options

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(String(state))}`

  if (maxAge !== undefined) cookieString += `; max-age=${maxAge}`
  if (expires) cookieString += `; expires=${expires.toUTCString()}`
  if (path) cookieString += `; path=${path}`
  if (domain) cookieString += `; domain=${domain}`
  if (secure) cookieString += '; secure'
  if (sameSite) cookieString += `; samesite=${sameSite}`

  // biome-ignore lint/suspicious/noDocumentCookie: cookie utility function
  document.cookie = cookieString
}
