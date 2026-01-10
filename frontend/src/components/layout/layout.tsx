'use client';

import { Header } from './header';
import { Sidebar } from './sidebar';
import { useUIStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          'w-64 border-r border-border bg-background transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'fixed lg:relative h-full z-40 lg:z-0'
        )}
      >
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
