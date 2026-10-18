const TOKEN_KEY = 'software_site_token';

let memoryToken: string | null = null;

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const ls = localStorage.getItem(TOKEN_KEY);
    if (ls) {
      memoryToken = ls;
      return ls;
    }
  } catch {
    // localStorage 不可用时忽略
  }
  try {
    const ss = sessionStorage.getItem(TOKEN_KEY);
    if (ss) {
      memoryToken = ss;
      return ss;
    }
  } catch {
    // sessionStorage 不可用时忽略
  }
  return null;
}

export function setToken(token: string): void {
  memoryToken = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // 忽略
  }
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // 忽略
  }
}

export function clearToken(): void {
  memoryToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // 忽略
  }
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // 忽略
  }
}
