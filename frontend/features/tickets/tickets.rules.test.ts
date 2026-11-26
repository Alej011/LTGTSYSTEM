import { describe, expect, it } from 'vitest';

import { admin, agent, assignedTo, requester, ticket } from './tickets.fixtures';
import { autoCloseAt, availableActions, canSeeInternalNotes, type Viewer } from './tickets.rules';
import type { Ticket } from './tickets.schemas';

const actionsOf = (t: Ticket, viewer: Viewer) => [...availableActions(t, viewer)].sort();

describe('availableActions', () => {
  it('gives nothing without a session', () => {
    expect(availableActions(ticket(), null).size).toBe(0);
  });

  it.each([
    ['an open, unassigned ticket', ticket(), agent, ['take']],
    ['an open ticket for the admin', ticket(), admin, ['assign', 'close', 'take']],
    ['a ticket assigned to someone else', ticket({ status: 'IN_PROGRESS', assignee: assignedTo(admin) }), agent, []],
    [
      'a ticket assigned to the viewer',
      ticket({ status: 'IN_PROGRESS', assignee: assignedTo(agent) }),
      agent,
      ['resolve'],
    ],
    [
      'a resolved ticket for its requester',
      ticket({ status: 'RESOLVED', assignee: assignedTo(agent) }),
      requester,
      ['confirm', 'reopen'],
    ],
    ['a resolved ticket for its agent', ticket({ status: 'RESOLVED', assignee: assignedTo(agent) }), agent, []],
    ['a closed ticket for the admin', ticket({ status: 'CLOSED', closeReason: 'CONFIRMED' }), admin, []],
  ] as const)('%s', (_, t, viewer, expected) => {
    expect(actionsOf(t, viewer)).toEqual(expected);
  });
});

describe('autoCloseAt', () => {
  it('is three calendar days after the resolution', () => {
    const t = ticket({ status: 'RESOLVED', resolvedAt: '2026-11-20T10:00:00.000Z' });
    expect(autoCloseAt(t)?.toISOString()).toBe('2026-11-23T10:00:00.000Z');
  });

  it('is null for tickets that are not resolved', () => {
    expect(autoCloseAt(ticket({ status: 'IN_PROGRESS' }))).toBeNull();
  });
});

describe('canSeeInternalNotes', () => {
  it('is only for users who handle tickets', () => {
    expect(canSeeInternalNotes(agent)).toBe(true);
    expect(canSeeInternalNotes(null)).toBe(false);
  });
});
