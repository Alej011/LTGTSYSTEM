import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/shared/api/api-client';
import { useSession } from '@/shared/session/session.client';
import { renderHookWithQuery } from '@/test/render';

import {
  useAddComment,
  useAssignableUsers,
  useCreateTicket,
  useTicket,
  useTicketAction,
  useTicketComments,
  useTickets,
  useTicketSummary,
} from './tickets.client';
import { agent, requester } from './tickets.fixtures';
import { resetTicketsMock } from './tickets.mock';
import type { Viewer } from './tickets.rules';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

const input = {
  title: 'Monitor sin imagen',
  description: 'No enciende',
  category: 'HARDWARE',
  priority: 'LOW',
} as const;

function signIn(viewer: Viewer) {
  vi.mocked(useSession).mockReturnValue({
    user: { ...viewer, email: `${viewer.id}@ltgt.com` },
    isLoading: false,
  });
}

async function settled<T extends { isSuccess: boolean; isError: boolean }>(result: { current: T }) {
  await waitFor(() => {
    expect(result.current.isSuccess || result.current.isError).toBe(true);
  });
  return result.current;
}

beforeEach(() => {
  resetTicketsMock();
  signIn(agent);
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe('useTickets', () => {
  it('lists the newest tickets first', async () => {
    const { result } = renderHookWithQuery(() => useTickets());
    const ids = (await settled(result)).data?.map((t) => t.id);
    expect(ids).toEqual(['1004', '1003', '1002', '1001']);
  });

  it('filters by status, search and assignment', async () => {
    const { result } = renderHookWithQuery(() => ({
      open: useTickets({ status: 'OPEN' }),
      search: useTickets({ search: 'impresora' }),
      unassigned: useTickets({ assignment: 'unassigned' }),
    }));
    await waitFor(() => {
      expect(result.current.unassigned.isSuccess && result.current.search.isSuccess).toBe(true);
    });
    expect(result.current.open.data?.map((t) => t.id)).toEqual(['1004']);
    expect(result.current.search.data?.map((t) => t.id)).toEqual(['1003']);
    expect(result.current.unassigned.data?.map((t) => t.id)).toEqual(['1004']);
  });

  it('does not request anything without a session', () => {
    vi.mocked(useSession).mockReturnValue({ user: null, isLoading: false });
    const { result } = renderHookWithQuery(() => useTickets());
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useTicket', () => {
  it('returns null when the ticket does not exist', async () => {
    const { result } = renderHookWithQuery(() => useTicket('missing'));
    expect((await settled(result)).data).toBeNull();
  });
});

describe('useCreateTicket', () => {
  it('opens the ticket in the name of the session user', async () => {
    signIn(requester);
    const { result } = renderHookWithQuery(() => useCreateTicket());

    const created = await act(() => result.current.mutateAsync(input));

    expect(created).toMatchObject({ status: 'OPEN', assignee: null, requester: { id: requester.id } });
  });
});

describe('useTicketAction', () => {
  it('takes, resolves and lets the requester confirm a ticket', async () => {
    signIn(requester);
    const create = renderHookWithQuery(() => useCreateTicket());
    const { id } = await act(() => create.result.current.mutateAsync(input));

    signIn(agent);
    const asAgent = renderHookWithQuery(() => useTicketAction());
    const taken = await act(() => asAgent.result.current.mutateAsync({ id, action: { type: 'take' } }));
    expect(taken).toMatchObject({ status: 'IN_PROGRESS', assignee: { id: agent.id } });

    const resolved = await act(() =>
      asAgent.result.current.mutateAsync({ id, action: { type: 'resolve', solution: 'Cable de video cambiado' } }),
    );
    expect(resolved).toMatchObject({ status: 'RESOLVED', solution: 'Cable de video cambiado' });
    expect(resolved.resolvedAt).not.toBeNull();

    signIn(requester);
    const asRequester = renderHookWithQuery(() => useTicketAction());
    const closed = await act(() => asRequester.result.current.mutateAsync({ id, action: { type: 'confirm' } }));
    expect(closed).toMatchObject({ status: 'CLOSED', closeReason: 'CONFIRMED' });
  });

  it('rejects an action that is not available as ApiClientError', async () => {
    const { result } = renderHookWithQuery(() => useTicketAction());

    // 1003 está asignado a otro agente
    await expect(
      act(() => result.current.mutateAsync({ id: '1003', action: { type: 'resolve', solution: 'Listo' } })),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('requires the solution to resolve', async () => {
    const { result } = renderHookWithQuery(() => useTicketAction());
    await act(() => result.current.mutateAsync({ id: '1004', action: { type: 'take' } }));

    const attempt = act(() => result.current.mutateAsync({ id: '1004', action: { type: 'resolve', solution: '  ' } }));

    await expect(attempt).rejects.toBeInstanceOf(ApiClientError);
    await expect(attempt).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('automatic close', () => {
  it('closes a resolved ticket after three calendar days without an answer', async () => {
    // 1002 se resolvió hace 30 horas; faltan 42 para los 3 días
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() + 43 * 60 * 60 * 1000);

    const { result } = renderHookWithQuery(() => useTicket('1002'));

    expect((await settled(result)).data).toMatchObject({ status: 'CLOSED', closeReason: 'AUTO' });
  });
});

describe('comments', () => {
  it('lists comments and internal notes for agents and adds a new one', async () => {
    const { result } = renderHookWithQuery(() => ({ list: useTicketComments('1003'), add: useAddComment('1003') }));
    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true);
    });
    expect(result.current.list.data?.map((c) => c.isInternal)).toEqual([false, true]);

    await act(() => result.current.add.mutateAsync({ content: 'Cambié el cable', isInternal: false }));

    await waitFor(() => {
      expect(result.current.list.data).toHaveLength(3);
    });
    expect(result.current.list.data?.at(-1)).toMatchObject({ author: { id: agent.id }, content: 'Cambié el cable' });
  });
});

describe('useAssignableUsers', () => {
  it('includes the session user when they handle tickets', async () => {
    const { result } = renderHookWithQuery(() => useAssignableUsers());
    const names = (await settled(result)).data?.map((p) => p.name);
    expect(names).toEqual(['Juan Pérez', 'Luis Soporte', 'María García']);
  });
});

describe('useTicketSummary', () => {
  it('counts active tickets and those assigned to the user', async () => {
    const take = renderHookWithQuery(() => useTicketAction());
    await act(() => take.result.current.mutateAsync({ id: '1004', action: { type: 'take' } }));

    const { result } = renderHookWithQuery(() => useTicketSummary());

    expect((await settled(result)).data).toEqual({ active: 2, assignedToMe: 1 });
  });
});
