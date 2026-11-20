'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Building2, Calendar } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { TONE_CLASSES } from '@/shared/lib/tones';
import { type Role, ROLE_LABELS } from '@/shared/roles';

import { getDashboardStats, getRecentActivity } from '../dashboard.data';
import { QuickActions } from './quick-actions';
import { RecentActivityComponent } from './recent-activity';
import { StatsCards } from './stats-cards';

const ROLE_TONES: Record<Role, string> = { ADMIN: TONE_CLASSES.primary, SUPPORT: TONE_CLASSES.info };

export function DashboardView() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard LTGT S.A.</h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <p>Bienvenido, {user.name}</p>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </div>
          </div>
        </div>
        <div className="sm:text-right">
          <Badge variant="outline" className={ROLE_TONES[user.role]}>
            {ROLE_LABELS[user.role]}
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">{user.department}</p>
        </div>
      </div>

      <StatsCards stats={getDashboardStats(user)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityComponent activities={getRecentActivity(user)} />
        <QuickActions />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true"></div>
            <div>
              <p className="font-medium">Servicios Principales</p>
              <p className="text-sm text-muted-foreground">Operativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true"></div>
            <div>
              <p className="font-medium">Base de Datos</p>
              <p className="text-sm text-muted-foreground">Conectado</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true"></div>
            <div>
              <p className="font-medium">Red Interna</p>
              <p className="text-sm text-muted-foreground">Estable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
