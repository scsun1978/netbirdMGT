import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, trend, icon, className }: KPICardProps) {
  return (
    <Card className={cn("overflow-hidden backdrop-blur-sm bg-card/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend.direction === 'up' && <ArrowUp className="mr-1 h-4 w-4 text-green-500" />}
            {trend.direction === 'down' && <ArrowDown className="mr-1 h-4 w-4 text-red-500" />}
            {trend.direction === 'neutral' && <Minus className="mr-1 h-4 w-4" />}
            <span className={cn(
              trend.direction === 'up' && "text-green-500",
              trend.direction === 'down' && "text-red-500"
            )}>
              {trend.value}%
            </span>
            <span className="ml-1">{trend.label || "from last period"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
