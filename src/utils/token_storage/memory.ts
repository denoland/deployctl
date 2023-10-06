let TOKEN: string | null;

export function get(): Promise<string | null> {
  return Promise.resolve(TOKEN);
}

export function store(token: string): Promise<void> {
  TOKEN = token;
  return Promise.resolve();
}

export function remove(): Promise<void> {
  TOKEN = null;
  return Promise.resolve();
}
