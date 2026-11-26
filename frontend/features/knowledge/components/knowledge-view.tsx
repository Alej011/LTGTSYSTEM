'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCan } from '@/shared/use-can';

import type { Article } from '../knowledge.schemas';
import { ArticleForm } from './article-form';
import { ArticleList } from './article-list';
import { ArticleViewer } from './article-viewer';

type Tab = 'browse' | 'manage';
type View = { mode: 'list' } | { mode: 'form'; article?: Article } | { mode: 'view'; articleId: string };

export function KnowledgeView() {
  const can = useCan();
  const [tab, setTab] = useState<Tab>('browse');
  const [view, setView] = useState<View>({ mode: 'list' });

  const showList = () => setView({ mode: 'list' });
  const showArticle = (articleId: string) => setView({ mode: 'view', articleId });
  const showForm = (article?: Article) => setView({ mode: 'form', article });
  const managesArticles = can('knowledge', 'create') || can('knowledge', 'edit');

  if (view.mode === 'form') {
    return (
      <div className="p-6">
        <ArticleForm key={view.article?.id ?? 'new'} article={view.article} onSuccess={showList} onCancel={showList} />
      </div>
    );
  }

  if (view.mode === 'view') {
    return (
      <div className="p-6">
        <ArticleViewer key={view.articleId} articleId={view.articleId} onBack={showList} />
      </div>
    );
  }

  if (!managesArticles) {
    return (
      <div className="p-6">
        <ArticleList onView={showArticle} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Explorar</TabsTrigger>
          <TabsTrigger value="manage">Gestionar</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <ArticleList onView={showArticle} onAdd={() => showForm()} />
        </TabsContent>
        <TabsContent value="manage">
          <ArticleList onView={showArticle} onEdit={showForm} onAdd={() => showForm()} showManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
