'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Network,
  Users,
  Shield,
  Key,
  AlertTriangle,
  Settings,
  FileText,
  GitBranch,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Topology', href: '/topology', icon: GitBranch },
  { name: 'Peers', href: '/peers', icon: Network },
  { name: 'Networks', href: '/networks', icon: Users },
  { name: 'Users', href: '/users', icon: Shield },
  { name: 'Tokens', href: '/tokens', icon: Key },
  { name: 'Setup Keys', href: '/setup-keys', icon: Plus },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Audit', href: '/audit', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('space-y-2 px-3 py-4', className)}>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground">NetBird MGT</h1>
        <p className="text-sm text-muted-foreground">Management Platform</p>
      </div>

      {navigation.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                isActive && 'bg-secondary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
