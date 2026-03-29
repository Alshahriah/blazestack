// Tiny ID generator — no extra dependency needed
export function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
