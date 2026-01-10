'use client';

import { Button } from '@/components/ui/button';
import { Bell, Menu, Search, Settings, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/stores/ui-store';
import { Input } from '@/components/ui/input';

export function Header() {
  const { user } = useAuth();
  const { toggleSidebar, theme, setTheme } = useUIStore();

  return (
    <header className="h-16 border-b border-border bg-background px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search peers, networks..."
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
          <div className="text-right">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.role}</div>
          </div>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
