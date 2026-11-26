import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/shared/session/session.client';
import { renderHookWithQuery } from '@/test/render';

import { useArticle, useArticles, usePublishedArticleCount, useRateArticle, useSaveArticle } from './knowledge.client';
import { admin, agent, input } from './knowledge.fixtures';
import { resetKnowledgeMock } from './knowledge.mock';
import type { Viewer } from './knowledge.rules';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

function signIn(viewer: Viewer) {
  vi.mocked(useSession).mockReturnValue({ user: { ...viewer, email: `${viewer.id}@ltgt.com` }, isLoading: false });
}

async function settled<T extends { isSuccess: boolean; isError: boolean }>(result: { current: T }) {
  await waitFor(() => {
    expect(result.current.isSuccess || result.current.isError).toBe(true);
  });
  return result.current;
}

beforeEach(() => {
  resetKnowledgeMock();
  signIn(agent);
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('useArticles', () => {
  it('lists published articles, most viewed first', async () => {
    const { result } = renderHookWithQuery(() => useArticles());
    expect((await settled(result)).data?.map((a) => a.id)).toEqual(['kb-2', 'kb-1', 'kb-3']);
  });

  it('searches titles, content and tags, and filters by category', async () => {
    const { result } = renderHookWithQuery(() => ({
      byTag: useArticles({ search: 'outlook' }),
      byContent: useArticles({ search: 'cola de impresión' }),
      byCategory: useArticles({ category: 'NETWORK' }),
    }));
    await waitFor(() => {
      expect(result.current.byTag.isSuccess && result.current.byCategory.isSuccess).toBe(true);
    });
    expect(result.current.byTag.data?.map((a) => a.id)).toEqual(['kb-2']);
    expect(result.current.byContent.data?.map((a) => a.id)).toEqual(['kb-3']);
    expect(result.current.byCategory.data?.map((a) => a.id)).toEqual(['kb-1']);
  });

  it('lists drafts only for whoever manages articles', async () => {
    const asAgent = renderHookWithQuery(() => useArticles({ scope: 'all' }));
    expect((await settled(asAgent.result)).error).toMatchObject({ statusCode: 403 });

    signIn(admin);
    const asAdmin = renderHookWithQuery(() => useArticles({ scope: 'all' }));
    expect((await settled(asAdmin.result)).data?.map((a) => a.status)).toContain('DRAFT');
  });
});

describe('useArticle', () => {
  it('counts one view per user', async () => {
    const first = renderHookWithQuery(() => useArticle('kb-1'));
    expect((await settled(first.result)).data?.views).toBe(46);

    const again = renderHookWithQuery(() => useArticle('kb-1'));
    expect((await settled(again.result)).data?.views).toBe(46);
  });

  it('hides drafts of other people as if they did not exist', async () => {
    const { result } = renderHookWithQuery(() => useArticle('kb-4'));
    expect((await settled(result)).data).toBeNull();
  });
});

describe('useSaveArticle', () => {
  it('creates a published article with the session user as author', async () => {
    signIn(admin);
    const { result } = renderHookWithQuery(() => useSaveArticle());

    const created = await act(() => result.current.mutateAsync({ input }));

    expect(created).toMatchObject({ author: { id: admin.id }, status: 'PUBLISHED', isCompanyWide: true });
    expect(created.publishedAt).not.toBeNull();
  });

  it('records the first publication date when a draft is published', async () => {
    signIn(admin);
    const { result } = renderHookWithQuery(() => useSaveArticle());
    const draft = await act(() => result.current.mutateAsync({ input: { ...input, status: 'DRAFT' } }));
    expect(draft.publishedAt).toBeNull();

    const published = await act(() => result.current.mutateAsync({ id: draft.id, input }));

    expect(published.publishedAt).not.toBeNull();
  });

  it('rejects users without the permission', async () => {
    const { result } = renderHookWithQuery(() => useSaveArticle());
    await expect(act(() => result.current.mutateAsync({ input }))).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('useRateArticle', () => {
  it('keeps one rating per user and replaces it', async () => {
    const { result } = renderHookWithQuery(() => useRateArticle('kb-1'));

    const helpful = await act(() => result.current.mutateAsync('HELPFUL'));
    expect(helpful).toMatchObject({ helpful: 13, notHelpful: 1, myRating: 'HELPFUL' });

    const changed = await act(() => result.current.mutateAsync('NOT_HELPFUL'));
    expect(changed).toMatchObject({ helpful: 12, notHelpful: 2, myRating: 'NOT_HELPFUL' });
  });
});

describe('usePublishedArticleCount', () => {
  it('counts only the published articles the user can see', async () => {
    const { result } = renderHookWithQuery(() => usePublishedArticleCount());
    expect((await settled(result)).data).toBe(3);
  });
});
