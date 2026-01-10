import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityEvent } from '@/types/dashboard.types';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, Server } from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityEvent[];
}

const ActivityIcon = ({ type, severity }: { type: ActivityEvent['type'], severity: ActivityEvent['severity'] }) => {
  const colorClass = 
    severity === 'critical' ? 'text-red-500' :
    severity === 'high' ? 'text-orange-500' :
    severity === 'medium' ? 'text-yellow-500' :
    'text-blue-500';

  switch (type) {
    case 'alert_triggered':
      return <AlertTriangle className={cn("h-4 w-4", colorClass)} />;
    case 'alert_resolved':
      return <CheckCircle className={cn("h-4 w-4", "text-green-500")} />;
    case 'peer_join':
    case 'peer_leave':
      return <Server className={cn("h-4 w-4", colorClass)} />;
    default:
      return <Info className={cn("h-4 w-4", colorClass)} />;
  }
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card className="col-span-4 lg:col-span-2 h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="mt-1">
                    <ActivityIcon type={activity.type} severity={activity.severity} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
