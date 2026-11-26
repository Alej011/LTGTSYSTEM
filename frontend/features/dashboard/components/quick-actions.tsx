'use client';

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Headphones,
  MessageSquare,
  Package,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCan } from '@/shared/use-can';

export function QuickActions() {
  const can = useCan();
  const getIcon = (iconName: string) => {
    const icons: Partial<Record<string, typeof Package>> = {
      Package,
      Headphones,
      BookOpen,
      MessageSquare,
      Users,
      AlertCircle,
    };
    const IconComponent = icons[iconName] ?? Package;
    return <IconComponent className="h-5 w-5" />;
  };

  const actions = [
    {
      title: 'Crear Ticket',
      description: 'Reportar problema técnico',
      href: '/tickets',
      icon: 'Headphones',
      requires: ['tickets', 'create'] as const,
      action: 'create',
    },
    {
      title: 'Ver Productos',
      description: 'Consultar catálogo',
      href: '/products',
      icon: 'Package',
      requires: ['products', 'view'] as const,
      action: 'view',
    },
    {
      title: 'Base Conocimientos',
      description: 'Buscar soluciones',
      href: '/knowledge',
      icon: 'BookOpen',
      requires: ['knowledge', 'view'] as const,
      action: 'search',
    },
    {
      title: 'Comunicaciones',
      description: 'Ver novedades',
      href: '/communications',
      icon: 'MessageSquare',
      requires: ['communications', 'view'] as const,
      action: 'view',
    },
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar personal',
      href: '/users',
      icon: 'Users',
      requires: ['users', 'view'] as const,
      action: 'manage',
    },
    {
      title: 'Tickets Pendientes',
      description: 'Resolver incidencias',
      href: '/tickets',
      icon: 'AlertCircle',
      requires: ['tickets', 'handle'] as const,
      action: 'manage',
    },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-3 w-3" />;
      case 'search':
        return <Search className="h-3 w-3" />;
      case 'manage':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <ArrowRight className="h-3 w-3" />;
    }
  };

  const filteredActions = actions.filter((action) => {
    const [resource, permission] = action.requires;
    return can(resource, permission);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accesos Rápidos</CardTitle>
        <CardDescription>Funciones más utilizadas según tu rol</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {getIcon(action.icon)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                  <div className="shrink-0 text-muted-foreground">{getActionIcon(action.action)}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
