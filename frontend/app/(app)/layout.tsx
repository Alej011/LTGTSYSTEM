'use client';

import { Building2, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSession } from '@/shared/session/session.client';

const COLLAPSED_KEY = 'ltgt_sidebar_collapsed';

// La preferencia se guarda en el navegador; si el almacenamiento no está disponible, se ignora
function readCollapsed(): boolean {
  try {
    return typeof window !== 'undefined' && localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

// Layout común de las secciones: el sidebar queda fijo y solo cambia el contenido.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();
  const isAuthenticated = user !== null;
  const router = useRouter();
  const pathname = usePathname();
  // El sidebar se muestra recién con la sesión cargada, nunca en el render del servidor: leer aquí no desajusta la hidratación
  const [collapsed, setCollapsed] = useState(readCollapsed);
  // El menú móvil queda abierto solo en la ruta donde se abrió: navegar lo cierra
  const [mobileMenu, setMobileMenu] = useState({ open: false, pathname });
  const mobileOpen = mobileMenu.open && mobileMenu.pathname === pathname;
  const setMobileOpen = (open: boolean) => setMobileMenu({ open, pathname });

  const toggleSidebar = useCallback(() => {
    setCollapsed((current) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, current ? '0' : '1');
      } catch {}
      return !current;
    });
  }, []);

  // Ctrl+B (Cmd+B en macOS) abre y cierra el sidebar
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'b' && (event.ctrlKey || event.metaKey) && !event.altKey) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSidebar]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-label="Cargando"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden shrink-0 md:block">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
          <Building2 className="h-5 w-5 text-primary" />
          <span className="font-semibold">LTGT S.A.</span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
