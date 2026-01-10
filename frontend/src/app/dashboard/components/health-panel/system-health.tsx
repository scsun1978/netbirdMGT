import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency?: string;
  uptime?: string;
}

const statuses: HealthStatus[] = [
  { name: 'NetBird API', status: 'operational', latency: '45ms', uptime: '99.99%' },
  { name: 'Database', status: 'operational', latency: '12ms', uptime: '100%' },
  { name: 'Redis Cache', status: 'operational', latency: '2ms', uptime: '100%' },
  { name: 'Background Jobs', status: 'operational', uptime: '99.95%' },
  { name: 'WebSockets', status: 'operational', uptime: '99.98%' },
];

const StatusIcon = ({ status }: { status: HealthStatus['status'] }) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'outage':
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
};

export function SystemHealth() {
  return (
    <Card className="col-span-4 lg:col-span-2 h-full">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((item) => (
            <div key={item.name} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <StatusIcon status={item.status} />
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-sm text-muted-foreground flex space-x-4">
                {item.latency && <span>{item.latency}</span>}
                {item.uptime && <span>{item.uptime} uptime</span>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
