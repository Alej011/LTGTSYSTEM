'use client';

import { useState } from 'react';

import { TicketDetail } from './ticket-detail';
import { TicketForm } from './ticket-form';
import { TicketList } from './ticket-list';

type View = { mode: 'list' } | { mode: 'form' } | { mode: 'detail'; ticketId: string };

export function TicketsView() {
  const [view, setView] = useState<View>({ mode: 'list' });
  const showList = () => setView({ mode: 'list' });
  const showDetail = (ticketId: string) => setView({ mode: 'detail', ticketId });

  return (
    <div className="p-6">
      {view.mode === 'list' && <TicketList onView={showDetail} onAdd={() => setView({ mode: 'form' })} />}
      {view.mode === 'form' && <TicketForm onSuccess={showDetail} onCancel={showList} />}
      {view.mode === 'detail' && <TicketDetail key={view.ticketId} ticketId={view.ticketId} onBack={showList} />}
    </div>
  );
}
