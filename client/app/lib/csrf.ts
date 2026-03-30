export function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]*)/);
  return match ? match[1] : null;
}
