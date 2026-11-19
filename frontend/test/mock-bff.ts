import { vi } from 'vitest';

export type BffReply = { status: number; body?: unknown };
type Handler = (request: { url: URL; body: unknown }) => BffReply;

/**
 * Reemplaza fetch por un BFF simulado. Las claves son "MÉTODO /ruta"; ":id" coincide con un segmento.
 * Una ruta sin handler responde 500 para que el test falle de forma visible.
 */
export function mockBff(routes: Record<string, Handler>) {
  const compiled = Object.entries(routes).map(([key, handler]) => {
    const [method, path] = key.split(' ');
    const pattern = new RegExp(`^${path.replace(/:[^/]+/g, '[^/]+')}$`);
    return { method, pattern, handler };
  });

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input.toString(), 'http://localhost');
    const method = init?.method ?? 'GET';
    const route = compiled.find((r) => r.method === method && r.pattern.test(url.pathname));
    const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    const reply = route
      ? route.handler({ url, body })
      : { status: 500, body: { message: `Sin mock: ${method} ${url.pathname}` } };
    await Promise.resolve();
    return reply.body === undefined
      ? new Response(null, { status: reply.status })
      : new Response(JSON.stringify(reply.body), {
          status: reply.status,
          headers: { 'content-type': 'application/json' },
        });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Peticiones hechas al BFF simulado, como "MÉTODO /ruta?query". */
export function bffCalls(fetchMock: ReturnType<typeof mockBff>): string[] {
  return fetchMock.mock.calls.map(([input, init]) => {
    const url = new URL(input instanceof Request ? input.url : input.toString(), 'http://localhost');
    return `${init?.method ?? 'GET'} ${url.pathname}${url.search}`;
  });
}
