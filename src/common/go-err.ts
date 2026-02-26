export async function ea<T>(fn: () => Promise<T>): Promise<[T?, any?]> {
  try {
    return [await fn(), undefined];
  } catch (e) {
    return [undefined, e];
  }
}

export function es<T>(fn: () => T): [T?, any?] {
  try {
    return [fn(), undefined];
  } catch (e) {
    return [undefined, e];
  }
}
