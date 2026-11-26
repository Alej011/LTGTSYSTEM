'use client';

import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Headphones,
  type LucideIcon,
  MessageSquare,
  Package,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStockSummary } from '@/features/products/products.client';
import { useTicketSummary } from '@/features/tickets/tickets.client';

import type { DashboardStats } from '../dashboard.data';

interface StatCardProps {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  marker?: ReactNode;
}

function StatCard({ title, value, detail, icon: Icon, marker }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {marker}
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Carga sus propios datos: si el backend falla, solo esta tarjeta lo muestra
function ProductsCard() {
  const stock = useStockSummary();

  if (stock.isPending) {
    return <StatCard title="Productos Totales" value="..." detail="Cargando" icon={Package} />;
  }
  if (stock.isError) {
    return <StatCard title="Productos Totales" value="-" detail="No disponible" icon={Package} />;
  }

  const { total, lowStock } = stock.data;
  return (
    <StatCard
      title="Productos Totales"
      value={total.toString()}
      detail={lowStock > 0 ? `${lowStock} con stock bajo` : 'Stock normal'}
      icon={Package}
      marker={lowStock > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
    />
  );
}

function TicketsCard() {
  const summary = useTicketSummary();

  if (summary.isPending) {
    return <StatCard title="Tickets Activos" value="..." detail="Cargando" icon={Headphones} />;
  }
  if (summary.isError) {
    return <StatCard title="Tickets Activos" value="-" detail="No disponible" icon={Headphones} />;
  }

  const { active, assignedToMe } = summary.data;
  return (
    <StatCard
      title="Tickets Activos"
      value={active.toString()}
      detail={assignedToMe > 0 ? `${assignedToMe} asignados a ti` : 'Sin tickets asignados'}
      icon={Headphones}
    />
  );
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProductsCard />
      <TicketsCard />
      <StatCard
        title="Artículos KB"
        value={stats.knowledgeArticles.toString()}
        detail="Soluciones disponibles"
        icon={BookOpen}
      />
      <StatCard
        title="Comunicaciones"
        value={stats.unreadCommunications.toString()}
        detail={stats.unreadCommunications > 0 ? 'Sin leer' : 'Todo leído'}
        icon={MessageSquare}
        marker={stats.unreadCommunications === 0 && <CheckCircle className="h-3 w-3 text-success" />}
      />
    </div>
  );
}
