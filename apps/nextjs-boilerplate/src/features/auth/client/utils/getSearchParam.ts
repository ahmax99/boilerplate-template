// make the page static
export const getSearchParam = (key: string) => {
  if (globalThis.window === undefined) return null

  return new URLSearchParams(globalThis.location.search).get(key)
}
