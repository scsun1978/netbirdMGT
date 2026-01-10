"use client";

import React, { useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { EChartsOption } from 'echarts';

interface ChartContainerProps {
  title: string;
  options: EChartsOption;
  height?: string | number;
  className?: string;
  loading?: boolean;
}

export function ChartContainer({ 
  title, 
  options, 
  height = '300px', 
  className,
  loading = false 
}: ChartContainerProps) {
  const chartRef = useRef<ReactECharts>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.getEchartsInstance().resize();
    }
  }, [options]);

  if (!mounted) return null;

  return (
    <Card className={cn("col-span-1", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-full items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ReactECharts
            ref={chartRef}
            option={options}
            style={{ height, width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        )}
      </CardContent>
    </Card>
  );
}
